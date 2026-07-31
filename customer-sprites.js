(() => {
  "use strict";

  const CHARACTER_ROWS = { jun: 0, mei: 1, chen: 2 };
  const SLOT_X = [54, 314, 574];
  const EXIT_LEFT = -96;
  const EXIT_RIGHT = 874;
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

  function moveActor(record, x, phase, duration) {
    clearActorTimer(record);
    const direction = x < record.currentX ? "left" : "right";
    record.phase = phase;
    record.currentX = x;
    record.element.dataset.direction = direction;
    record.element.style.setProperty("--travel-duration", `${duration}ms`);
    setState(record, "walk");
    requestAnimationFrame(() => record.element.style.setProperty("--actor-x", `${x}px`));
    record.timer = window.setTimeout(() => {
      if (record.phase !== phase) return;
      if (phase === "exit") {
        record.element.remove();
        actors.delete(record.id);
        return;
      }
      arriveAtCounter(record);
    }, duration + 40);
  }

  function schedulePace(record) {
    clearActorTimer(record);
    const delay = 2500 + Math.random() * 1800;
    record.timer = window.setTimeout(() => {
      if (!actors.has(record.id) || record.phase === "exit") return;
      const offset = record.paceOffset === 0 ? (record.paceDirection * 18) : 0;
      record.paceOffset = offset;
      record.paceDirection *= -1;
      moveActor(record, record.targetX + offset, "pace", 520);
    }, delay);
  }

  function arriveAtCounter(record) {
    record.phase = "counter";
    setState(record, "counter");
    clearActorTimer(record);
    record.timer = window.setTimeout(() => {
      if (record.phase !== "counter") return;
      record.phase = "idle";
      setState(record, "idle");
      schedulePace(record);
    }, 1150);
  }

  function updateActor(record, card, slot) {
    const targetX = SLOT_X[slot] ?? SLOT_X[SLOT_X.length - 1];
    record.element.classList.toggle("is-impatient", card.classList.contains("impatient"));
    if (targetX === record.targetX) return;
    record.targetX = targetX;
    record.paceOffset = 0;
    moveActor(record, targetX, "reposition", 620);
  }

  function createActor(card, slot) {
    const id = card.dataset.order;
    const variant = card.dataset.customerVariant;
    const row = CHARACTER_ROWS[variant] ?? spawnCount % 3;
    const entersFromLeft = spawnCount++ % 2 === 0;
    const startX = entersFromLeft ? EXIT_LEFT : EXIT_RIGHT;
    const targetX = SLOT_X[slot] ?? SLOT_X[0];
    const element = document.createElement("span");
    element.className = "customer-actor";
    element.dataset.customerId = id;
    element.dataset.character = variant || `guest-${row + 1}`;
    element.dataset.direction = entersFromLeft ? "right" : "left";
    element.dataset.state = "walk";
    element.style.setProperty("--sprite-y", `${row * 50}%`);
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
      timer: 0,
    };
    actors.set(id, record);
    requestAnimationFrame(() => requestAnimationFrame(() => moveActor(record, targetX, "enter", 1050)));
  }

  function exitActor(record) {
    if (record.phase === "exit") return;
    const exitX = record.currentX < 426 ? EXIT_LEFT : EXIT_RIGHT;
    moveActor(record, exitX, "exit", 900);
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
    queueReconcile();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
