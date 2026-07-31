(() => {
  "use strict";

  const CHARACTER_CONFIG = {
    jun: { fallbackRow: 0, atlas: "assets/sprites/customer-jun-v2.png" },
    mei: { fallbackRow: 1, atlas: "assets/sprites/customer-mei-v2.png" },
    chen: { fallbackRow: 2, atlas: "assets/sprites/customer-chen-v2.png" },
  };
  const SLOT_X = [123, 391, 659];
  const EXIT_LEFT = -96;
  const EXIT_RIGHT = 874;
  const WALK_SPEED = 126;
  const EXIT_SPEED = 240;
  const WALK_FRAME_MS = 1000 / 14;
  const REACTION_MS = { satisfied: 650, leave_angry: 950 };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const atlasLoads = new Map();
  const actors = new Map();
  let orders;
  let walkway;
  let reconcileQueued = false;
  let spawnCount = 0;

  function setState(record, state) {
    record.element.dataset.state = state;
  }

  function clearActorTimer(record) {
    window.clearTimeout(record.timer);
    record.timer = 0;
  }

  function getTravelDuration(fromX, toX, phase) {
    if (reducedMotion.matches) return 1;
    const distance = Math.abs(toX - fromX);
    if (phase === "enter") return Math.min(1000, 650 + (distance / 700) * 350);
    if (phase === "exit") return Math.max(650, Math.min(1600, (distance / EXIT_SPEED) * 1000));
    const strideAlignedDuration = (distance / WALK_SPEED) * 1000;
    return Math.max(WALK_FRAME_MS * 4, Math.min(5600, strideAlignedDuration));
  }

  function loadAtlas(config) {
    if (!config) return Promise.resolve(false);
    if (atlasLoads.has(config.atlas)) return atlasLoads.get(config.atlas);
    const load = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(
        image.naturalWidth > 0
        && image.naturalHeight > 0
        && image.naturalWidth % 8 === 0
        && image.naturalHeight % 6 === 0
        && image.naturalWidth / 8 < image.naturalHeight / 6
      );
      image.onerror = () => resolve(false);
      image.src = config.atlas;
    });
    atlasLoads.set(config.atlas, load);
    return load;
  }

  function useAtlasWhenReady(record, config) {
    loadAtlas(config).then((valid) => {
      if (!valid || !actors.has(record.id) || record.element.isConnected === false) return;
      record.element.style.setProperty("--atlas-url", `url("${config.atlas}")`);
      record.element.classList.add("has-v2-atlas");
    });
  }

  function finishMove(record, phase) {
    if (record.phase !== phase) return;
    if (phase === "exit") {
      record.element.remove();
      actors.delete(record.id);
      return;
    }
    if (phase === "pace") {
      record.phase = "idle";
      setState(record, "idle");
      setState(record, record.waitState);
      schedulePace(record);
      return;
    }
    arriveAtCounter(record);
  }

  function moveActor(record, x, phase, motionState = "walk") {
    clearActorTimer(record);
    const direction = x < record.currentX ? "left" : "right";
    const duration = getTravelDuration(record.currentX, x, phase);
    record.phase = phase;
    record.currentX = x;
    record.element.dataset.direction = direction;
    record.element.style.setProperty("--travel-duration", `${duration}ms`);
    setState(record, motionState);
    requestAnimationFrame(() => record.element.style.setProperty("--actor-x", `${x}px`));
    record.timer = window.setTimeout(() => {
      finishMove(record, phase);
    }, duration + 40);
  }

  function schedulePace(record) {
    clearActorTimer(record);
    if (reducedMotion.matches) return;
    const delay = 2500 + Math.random() * 1800;
    record.timer = window.setTimeout(() => {
      if (!actors.has(record.id) || record.phase === "exit") return;
      const offset = record.paceOffset === 0 ? (record.paceDirection * 18) : 0;
      record.paceOffset = offset;
      record.paceDirection *= -1;
      moveActor(record, record.targetX + offset, "pace");
    }, delay);
  }

  function arriveAtCounter(record) {
    record.phase = "waiting";
    setState(record, record.waitState);
    clearActorTimer(record);
    schedulePace(record);
  }

  function waitStateFor(card) {
    if (card.classList.contains("impatient")) return "impatient";
    if (card.classList.contains("concerned")) return "wait_concerned";
    return "idle";
  }

  function updateActor(record, card, slot) {
    const targetX = SLOT_X[slot] ?? SLOT_X[SLOT_X.length - 1];
    record.waitState = waitStateFor(card);
    record.element.classList.toggle("is-impatient", card.classList.contains("impatient"));
    if (record.phase === "waiting" || record.phase === "idle") setState(record, record.waitState);
    if (targetX === record.targetX) return;
    record.targetX = targetX;
    record.paceOffset = 0;
    moveActor(record, targetX, "reposition");
  }

  function createActor(card, slot) {
    const id = card.dataset.order;
    const variant = card.dataset.customerVariant;
    const config = CHARACTER_CONFIG[variant];
    const row = config?.fallbackRow ?? spawnCount % 3;
    const entersFromLeft = spawnCount++ % 2 === 0;
    const startX = entersFromLeft ? EXIT_LEFT : EXIT_RIGHT;
    const targetX = SLOT_X[slot] ?? SLOT_X[0];
    const element = document.createElement("span");
    element.className = "customer-actor";
    element.dataset.customerId = id;
    element.dataset.character = variant || `guest-${row + 1}`;
    element.dataset.direction = entersFromLeft ? "right" : "left";
    element.dataset.state = "walk";
    element.style.setProperty("--fallback-row-y", `${row * 50}%`);
    element.style.setProperty("--actor-x", `${startX}px`);
    element.innerHTML = '<i class="customer-sprite-frame"></i>';
    walkway.append(element);

    const record = {
      id,
      element,
      targetX,
      currentX: startX,
      paceOffset: 0,
      paceDirection: entersFromLeft ? -1 : 1,
      phase: "enter",
      waitState: waitStateFor(card),
      timer: 0,
    };
    actors.set(id, record);
    useAtlasWhenReady(record, config);
    const entryDelay = reducedMotion.matches ? 0 : slot * 140;
    record.timer = window.setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => moveActor(record, targetX, "enter")));
    }, entryDelay);
  }

  function exitActor(record) {
    if (record.phase === "exit" || record.phase === "reaction") return;
    const exitX = record.currentX < 426 ? EXIT_LEFT : EXIT_RIGHT;
    moveActor(record, exitX, "exit");
  }

  function beginDeparture(id, mood) {
    const record = actors.get(id);
    if (!record || record.phase === "exit" || record.phase === "reaction") return;
    clearActorTimer(record);
    record.phase = "reaction";
    setState(record, mood);
    const delay = reducedMotion.matches ? 120 : REACTION_MS[mood];
    record.timer = window.setTimeout(() => {
      if (record.phase !== "reaction") return;
      const exitX = record.currentX < 426 ? EXIT_LEFT : EXIT_RIGHT;
      moveActor(record, exitX, "exit", mood);
    }, delay);
  }

  function reconcile() {
    reconcileQueued = false;
    if (!orders || !walkway) return;
    const cards = [...orders.querySelectorAll("[data-order]")];
    const liveIds = new Set(cards.map((card) => card.dataset.order));

    cards.forEach((card, slot) => {
      const id = card.dataset.order;
      const record = actors.get(id);
      if (record) updateActor(record, card, slot);
      else createActor(card, slot);
    });

    actors.forEach((record, id) => {
      if (!liveIds.has(id)) exitActor(record);
    });
  }

  function queueReconcile() {
    if (reconcileQueued) return;
    reconcileQueued = true;
    queueMicrotask(reconcile);
  }

  function clearAllActors() {
    actors.forEach((record) => {
      clearActorTimer(record);
      record.element.remove();
    });
    actors.clear();
  }

  function init() {
    orders = document.querySelector("#orders");
    const zone = orders?.closest(".customer-zone");
    if (!orders || !zone || zone.querySelector(".customer-walkway")) return;

    walkway = document.createElement("div");
    walkway.className = "customer-walkway";
    walkway.setAttribute("aria-hidden", "true");
    zone.insertBefore(walkway, orders);

    new MutationObserver(queueReconcile).observe(orders, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });
    new MutationObserver(() => {
      if (!document.body.classList.contains("playing")) clearAllActors();
      else queueReconcile();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    orders.addEventListener("customerdeparture", (event) => {
      const { id, mood } = event.detail || {};
      if (id && REACTION_MS[mood]) beginDeparture(id, mood);
    });
    queueReconcile();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
