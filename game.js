(() => {
  "use strict";

  const STORAGE_KEY = "moonlight-diner-v2";
  const VERSION = 2;
  const GAME_WIDTH = 1280;
  const GAME_HEIGHT = 720;

  const RESTAURANTS = {
    ramen: {
      id: "ramen",
      chapter: "章節一 · CHAPTER 01",
      name: "照顧疲憊的上班族",
      subtitle: "日式深夜拉麵車",
      icon: "☾",
      color: "#ef7657",
      description: "車站旁的辦公街區總有人晚歸。今晚，讓月光拉麵車成為他們回家前的一盞暖燈。",
      recipes: {
        salt: { name: "月白鹽味", icon: "☾", time: 2600, color: "#62d3bd" },
        miso: { name: "緋紅味噌", icon: "◆", time: 3300, color: "#ff7352" },
        pork: { name: "星雲豚骨", icon: "✦", time: 4100, color: "#9c91ff" },
      },
      toppings: {
        egg: { name: "月見蛋", icon: "●" },
        nori: { name: "星海苔", icon: "▰" },
        chili: { name: "火焰椒", icon: "♨" },
      },
      levels: [
        { id: 1, mode: "serve", target: 6, time: 90, reward: 90, title: "開始營業的第一天", description: "車站旁第一次亮起餐車燈。先熟悉選麵、熬煮、盛盤與加料。", story: "剛下班的年輕職員停下腳步，他看起來已經很久沒有好好吃飯。", maxDishes: 1, atmosphere: "first-night" },
        { id: 2, mode: "likes", target: 6, time: 90, reward: 120, title: "下班後的一碗暖湯", description: "在客人仍有笑容時完成料理，收集 6 個讚。", story: "疲憊不只需要填飽肚子，一碗及時端上的熱湯也能讓人安心。", maxDishes: 1, atmosphere: "warm-soup" },
        { id: 3, mode: "serve", target: 10, time: 88, reward: 165, title: "突如其來的加班潮", description: "辦公大樓同時熄燈，大批客人湧向餐車。完成 10 道料理。", story: "專案終於告一段落，但所有人都在同一時間餓著肚子下班。", maxDishes: 2, failBurn: true, atmosphere: "rush-hour" },
        { id: 4, mode: "score", target: 1050, time: 95, reward: 210, title: "深夜最後一班車", description: "利用快速出餐與 Combo，在末班車前取得 1050 分。", story: "月台廣播響起。這一餐必須又快又準，不能讓任何人空著肚子趕車。", maxDishes: 2, atmosphere: "last-train" },
        { id: 5, mode: "course", target: 12, moves: 18, time: 115, reward: 300, title: "上班族的感謝祭", description: "在 18 次出餐機會內完成三波訂單，為第一章畫下句點。", story: "曾經被拉麵溫暖的人們再次回來，這次他們帶來了笑容與一封感謝信。", maxDishes: 2, waves: [3, 3, 3], atmosphere: "thank-you-night" },
      ],
    },
  };

  const BUDDIES = {
    lumi: { name: "露米", icon: "☁", color: "#83c9d9", passive: "出餐分數 +5%", skill: "恢復所有客人 35% 耐心", cost: 0 },
    moka: { name: "摩卡", icon: "♨", color: "#c98761", passive: "料理速度 +6%", skill: "8 秒內料理不會燒焦", cost: 4 },
    piko: { name: "皮可", icon: "✦", color: "#a193f5", passive: "金幣收入 +8%", skill: "立即獲得 +3 Combo", cost: 6 },
  };

  const BOOSTERS = {
    antiBurn: { name: "防焦塗層", icon: "◉", description: "整關料理不會燒焦" },
    speed: { name: "高速爐火", icon: "»", description: "烹調速度提升 25%" },
    score: { name: "分數紅利", icon: "★", description: "出餐分數提升 20%" },
  };

  const UPGRADE_META = {
    cookers: { name: "烹調設備", icon: "♨", description: "增加可同時烹調的料理數", max: 3, costs: [0, 120, 280] },
    plates: { name: "備餐盤", icon: "▱", description: "增加可預先準備的餐點數", max: 3, costs: [0, 100, 240] },
    speed: { name: "備餐速度", icon: "»", description: "每級縮短 8% 烹調時間", max: 3, costs: [90, 180, 320] },
    value: { name: "料理價值", icon: "★", description: "每級增加 12% 分數與金幣", max: 3, costs: [110, 220, 380] },
  };

  const ACHIEVEMENTS = {
    firstClear: { name: "第一次營業", description: "完成任意關卡", target: 1, reward: 2, stat: "clears" },
    serve30: { name: "熟練主廚", description: "累積提供 30 道料理", target: 30, reward: 3, stat: "served" },
    combo8: { name: "節奏大師", description: "達成 8 Combo", target: 8, reward: 3, stat: "bestCombo" },
    allRamen: { name: "上班族的暖燈", description: "完成章節一全部 5 個關卡", target: 5, reward: 5, stat: "ramenClears" },
  };

  const CUSTOMER_FACES = [
    { face: "•ᴗ•", color: "#a193f5" },
    { face: "ᵔᴥᵔ", color: "#c98761" },
    { face: "•ﻌ•", color: "#6dbdca" },
    { face: "•ө•", color: "#e7b94f" },
    { face: "˶ᵔᵕᵔ˶", color: "#ed8297" },
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const els = {
    loading: $("#loadingView"), loadingBar: $("#loadingBar"), loadingText: $("#loadingText"),
    lobby: $("#lobbyView"), game: $("#gameView"), profileCoins: $("#profileCoins"), profileGems: $("#profileGems"),
    restaurantTabs: $("#restaurantTabs"), preview: $("#restaurantPreview"), levelGrid: $("#levelGrid"),
    restaurantChapter: $("#restaurantChapter"), restaurantName: $("#restaurantName"), restaurantCompletion: $("#restaurantCompletion"),
    journeySummary: $("#journeySummary"), dailyProgress: $("#dailyProgress"), dailyBar: $("#dailyBar"), claimDaily: $("#claimDailyButton"),
    gameLevelLabel: $("#gameLevelLabel"), missionLabel: $("#missionLabel"), missionCurrent: $("#missionCurrent"),
    missionTarget: $("#missionTarget"), missionBar: $("#missionBar"), gameTime: $("#gameTime"), gameScore: $("#gameScore"),
    gameCoins: $("#gameCoins"), conditionBadges: $("#conditionBadges"), waveBanner: $("#waveBanner"), orders: $("#orders"),
    recipePanel: $("#recipePanel"), cookers: $("#cookers"), plates: $("#plates"), toppingPanel: $("#toppingPanel"),
    comboCount: $("#comboCount"), comboTimer: $("#comboTimer"), gameMessage: $("#gameMessage p"),
    skillButton: $("#buddySkillButton"), skillCooldown: $("#skillCooldown"),
    briefingModal: $("#briefingModal"), briefingMode: $("#briefingMode"), briefingTitle: $("#briefingTitle"),
    briefingDescription: $("#briefingDescription"), briefingGoal: $("#briefingGoal"), boosterGrid: $("#boosterGrid"),
    upgradeModal: $("#upgradeModal"), upgradeTabs: $("#upgradeRestaurantTabs"), upgradeList: $("#upgradeList"),
    buddyModal: $("#buddyModal"), buddyList: $("#buddyList"), achievementModal: $("#achievementModal"),
    achievementList: $("#achievementList"), resultModal: $("#resultModal"), resultStatus: $("#resultStatus"),
    resultStars: $("#resultStars"), resultTitle: $("#resultTitle"), resultDescription: $("#resultDescription"),
    resultScore: $("#resultScore"), resultCombo: $("#resultCombo"), resultServed: $("#resultServed"), resultCoins: $("#resultCoins"),
    toast: $("#toast"), soundButton: $("#soundButton"),
  };

  let profile = loadProfile();
  let selectedRestaurant = "ramen";
  let selectedLevel = 1;
  let upgradeRestaurant = "ramen";
  let selectedBoosters = [];
  let game = null;
  let frameHandle = null;
  let toastHandle = null;
  let audioContext = null;

  function defaultProfile() {
    return {
      version: VERSION, coins: 180, gems: 8, sound: true, selectedBuddy: "lumi",
      buddies: { lumi: { owned: true, level: 1 }, moka: { owned: false, level: 1 }, piko: { owned: false, level: 1 } },
      upgrades: {
        ramen: { cookers: 1, plates: 1, speed: 0, value: 0 },
        sweets: { cookers: 1, plates: 1, speed: 0, value: 0 },
      },
      completed: {}, stars: {},
      inventory: { antiBurn: 1, speed: 1, score: 1 },
      stats: { clears: 0, served: 0, bestCombo: 0, ramenClears: 0 },
      achievements: {},
      daily: { date: todayKey(), plays: 0, claimed: false },
    };
  }

  function loadProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || saved.version !== VERSION) return defaultProfile();
      return saved;
    } catch {
      return defaultProfile();
    }
  }

  function saveProfile() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    renderResources();
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function ensureDaily() {
    if (profile.daily.date !== todayKey()) profile.daily = { date: todayKey(), plays: 0, claimed: false };
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function stageKey(restaurantId, levelId) {
    return `${restaurantId}-${levelId}`;
  }

  function isRestaurantUnlocked(id) {
    return id === "ramen" || Boolean(profile.completed["ramen-4"]);
  }

  function isLevelUnlocked(restaurantId, levelId) {
    if (!isRestaurantUnlocked(restaurantId)) return false;
    return levelId === 1 || Boolean(profile.completed[stageKey(restaurantId, levelId - 1)]);
  }

  function modeName(mode) {
    return { serve: "提供模式", likes: "得讚模式", score: "分數模式", course: "套餐模式", customer: "人數限制" }[mode];
  }

  function modeIcon(mode) {
    return { serve: "▱", likes: "♥", score: "★", course: "≡", customer: "♟" }[mode];
  }

  function missionText(level) {
    if (level.mode === "serve") return `提供 ${level.target} 道料理`;
    if (level.mode === "likes") return `取得 ${level.target} 個讚`;
    if (level.mode === "score") return `獲得 ${level.target} 分`;
    if (level.mode === "course") return `完成 ${level.target} 道套餐`;
    return `${level.customers} 位客人內提供 ${level.target} 道料理`;
  }

  function renderResources() {
    els.profileCoins.textContent = profile.coins;
    els.profileGems.textContent = profile.gems;
    els.soundButton.classList.toggle("muted", !profile.sound);
  }

  function renderLobby() {
    ensureDaily();
    renderResources();
    const restaurant = RESTAURANTS[selectedRestaurant];
    els.restaurantTabs.innerHTML = `<button class="restaurant-tab active" data-restaurant="ramen" type="button">
      <span style="background:${restaurant.color}">${restaurant.icon}</span>
      <div><small>本章餐車</small><strong>${restaurant.subtitle}</strong></div>
    </button>`;
    $$(".restaurant-tab").forEach((button) => button.addEventListener("click", () => {
      selectedRestaurant = button.dataset.restaurant;
      renderLobby();
      playTone(430, .06);
    }));

    els.preview.innerHTML = `<span class="story-kicker">本章故事</span><strong>${restaurant.subtitle}</strong><p>${restaurant.description}</p>`;
    els.restaurantChapter.textContent = restaurant.chapter;
    els.restaurantName.textContent = restaurant.name;
    const completedCount = restaurant.levels.filter((level) => profile.completed[stageKey(restaurant.id, level.id)]).length;
    els.restaurantCompletion.textContent = `${completedCount} / ${restaurant.levels.length}`;
    els.levelGrid.innerHTML = restaurant.levels.map((level) => {
      const key = stageKey(restaurant.id, level.id);
      const unlocked = isLevelUnlocked(restaurant.id, level.id);
      const stars = profile.stars[key] || 0;
      return `<button class="level-card chapter-node ${unlocked ? "" : "locked"} ${profile.completed[key] ? "cleared" : ""}" data-level="${level.id}" type="button" aria-label="1-${level.id} ${level.title}">
        <span class="node-glow"></span>
        <span class="level-number">${unlocked ? `1-${level.id}` : "⌕"}</span>
        <span class="level-stars">${[1,2,3].map((n) => n <= stars ? "★" : "☆").join("")}</span>
        <span class="level-tooltip"><small>${modeIcon(level.mode)} ${modeName(level.mode)}</small><strong>${level.title}</strong><i>${missionText(level)}</i></span>
      </button>`;
    }).join("");
    $$(".level-card").forEach((button) => button.addEventListener("click", () => {
      const levelId = Number(button.dataset.level);
      if (!isLevelUnlocked(selectedRestaurant, levelId)) return showToast("請先完成上一關");
      selectedLevel = levelId;
      openBriefing();
    }));

    const totalCompleted = restaurant.levels.filter((level) => profile.completed[stageKey(restaurant.id, level.id)]).length;
    els.journeySummary.textContent = `${totalCompleted} / ${restaurant.levels.length} 關完成`;
    const plays = Math.min(2, profile.daily.plays);
    els.dailyProgress.textContent = `${plays} / 2`;
    els.dailyBar.style.width = `${plays / 2 * 100}%`;
    els.claimDaily.disabled = plays < 2 || profile.daily.claimed;
    els.claimDaily.textContent = profile.daily.claimed ? "今日已領取" : "領取 120 ●";
  }

  function openBriefing() {
    const restaurant = RESTAURANTS[selectedRestaurant];
    const level = restaurant.levels[selectedLevel - 1];
    selectedBoosters = [];
    els.briefingMode.textContent = modeName(level.mode);
    els.briefingTitle.textContent = `1-${level.id} ${level.title}`;
    els.briefingDescription.textContent = `${level.story} ${level.description}`;
    const constraints = [
      `<div><span>${modeIcon(level.mode)}</span><small>關卡目標</small><strong>${missionText(level)}</strong></div>`,
      `<div><span>◷</span><small>限制時間</small><strong>${level.time} 秒</strong></div>`,
    ];
    if (level.moves) constraints.push(`<div><span>↟</span><small>提供次數</small><strong>${level.moves} 次</strong></div>`);
    if (level.customers) constraints.push(`<div><span>♟</span><small>客人人數</small><strong>${level.customers} 位</strong></div>`);
    els.briefingGoal.innerHTML = constraints.join("");
    els.boosterGrid.innerHTML = Object.entries(BOOSTERS).map(([id, item]) => `
      <button class="booster-card" data-booster="${id}" type="button" ${profile.inventory[id] ? "" : "disabled"}>
        <span>${item.icon}</span><div><strong>${item.name}</strong><small>${item.description}</small></div><i>×${profile.inventory[id] || 0}</i>
      </button>`).join("");
    $$(".booster-card").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.booster;
      button.classList.toggle("selected");
      selectedBoosters = button.classList.contains("selected") ? [...selectedBoosters, id] : selectedBoosters.filter((item) => item !== id);
      playTone(520, .05);
    }));
    openModal(els.briefingModal);
  }

  function renderUpgradeModal() {
    els.upgradeTabs.innerHTML = Object.values(RESTAURANTS).map((restaurant) =>
      `<button class="${upgradeRestaurant === restaurant.id ? "active" : ""}" data-upgrade-restaurant="${restaurant.id}" type="button" ${isRestaurantUnlocked(restaurant.id) ? "" : "disabled"}>${restaurant.icon} ${restaurant.name}</button>`
    ).join("");
    $$("[data-upgrade-restaurant]").forEach((button) => button.addEventListener("click", () => {
      upgradeRestaurant = button.dataset.upgradeRestaurant;
      renderUpgradeModal();
    }));
    const levels = profile.upgrades[upgradeRestaurant];
    els.upgradeList.innerHTML = Object.entries(UPGRADE_META).map(([id, meta]) => {
      const level = levels[id];
      const full = level >= meta.max;
      const cost = full ? 0 : meta.costs[level];
      return `<div class="upgrade-row">
        <span class="upgrade-icon">${meta.icon}</span><div class="upgrade-info"><strong>${meta.name}</strong><small>${meta.description}</small>
          <span>${[1,2,3].map((n) => `<i class="${n <= level ? "filled" : ""}"></i>`).join("")}</span></div>
        <button data-upgrade="${id}" type="button" ${full || profile.coins < cost ? "disabled" : ""}>${full ? "最高等級" : `${cost} ●`}</button>
      </div>`;
    }).join("");
    $$("[data-upgrade]").forEach((button) => button.addEventListener("click", () => buyUpgrade(button.dataset.upgrade)));
  }

  function buyUpgrade(id) {
    const current = profile.upgrades[upgradeRestaurant][id];
    const cost = UPGRADE_META[id].costs[current];
    if (profile.coins < cost || current >= UPGRADE_META[id].max) return;
    profile.coins -= cost;
    profile.upgrades[upgradeRestaurant][id] += 1;
    saveProfile();
    renderUpgradeModal();
    showToast(`${UPGRADE_META[id].name}升級完成！`);
    playSuccess();
  }

  function renderBuddyModal() {
    els.buddyList.innerHTML = Object.entries(BUDDIES).map(([id, buddy]) => {
      const owned = profile.buddies[id].owned;
      const selected = profile.selectedBuddy === id;
      return `<article class="buddy-card ${selected ? "selected" : ""}">
        <span class="buddy-avatar" style="background:${buddy.color}">${buddy.icon}</span>
        <div><small>${owned ? `LEVEL ${profile.buddies[id].level}` : "尚未解鎖"}</small><h3>${buddy.name}</h3>
          <p><b>被動：</b>${buddy.passive}</p><p><b>技能：</b>${buddy.skill}</p></div>
        <button data-buddy="${id}" type="button" ${owned ? "" : profile.gems < buddy.cost ? "disabled" : ""}>${selected ? "使用中" : owned ? "裝備" : `${buddy.cost} ◆ 解鎖`}</button>
      </article>`;
    }).join("");
    $$("[data-buddy]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.buddy;
      if (!profile.buddies[id].owned) {
        const cost = BUDDIES[id].cost;
        if (profile.gems < cost) return;
        profile.gems -= cost;
        profile.buddies[id].owned = true;
      }
      profile.selectedBuddy = id;
      saveProfile();
      renderBuddyModal();
      showToast(`${BUDDIES[id].name}已加入隊伍`);
    }));
  }

  function renderAchievements() {
    els.achievementList.innerHTML = Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
      const current = Math.min(achievement.target, profile.stats[achievement.stat] || 0);
      const claimed = profile.achievements[id];
      const ready = current >= achievement.target;
      return `<div class="achievement-row ${claimed ? "claimed" : ""}">
        <span>★</span><div><strong>${achievement.name}</strong><small>${achievement.description}</small>
          <i><b style="width:${current / achievement.target * 100}%"></b></i><em>${current} / ${achievement.target}</em></div>
        <button data-achievement="${id}" type="button" ${!ready || claimed ? "disabled" : ""}>${claimed ? "已領取" : `+${achievement.reward} ◆`}</button>
      </div>`;
    }).join("");
    $$("[data-achievement]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.achievement;
      const achievement = ACHIEVEMENTS[id];
      if ((profile.stats[achievement.stat] || 0) < achievement.target || profile.achievements[id]) return;
      profile.achievements[id] = true;
      profile.gems += achievement.reward;
      saveProfile();
      renderAchievements();
      showToast(`獲得 ${achievement.reward} 顆星石`);
      playSuccess();
    }));
  }

  function startLevel() {
    const restaurant = RESTAURANTS[selectedRestaurant];
    const level = restaurant.levels[selectedLevel - 1];
    selectedBoosters.forEach((id) => profile.inventory[id] = Math.max(0, profile.inventory[id] - 1));
    saveProfile();
    closeModal(els.briefingModal);
    const upgrades = profile.upgrades[selectedRestaurant];
    game = {
      restaurant, level, upgrades, playing: true, selectedBase: Object.keys(restaurant.recipes)[0],
      activePlate: 0, timeLeft: level.time, score: 0, coins: 0, served: 0, likes: 0,
      customersUsed: 0, customersCompleted: 0, misses: 0, combo: 0, bestCombo: 0, comboExpiresAt: 0,
      cookers: Array.from({ length: upgrades.cookers }, () => ({ status: "idle", base: null, startedAt: 0, readyAt: 0 })),
      plates: Array.from({ length: upgrades.plates }, () => null), orders: [], selectedBoosters: [...selectedBoosters],
      buddy: profile.selectedBuddy, skillReadyAt: 0, antiBurnUntil: 0, movesLeft: level.moves || null,
      wave: 1, waveCompleted: 0, lastFrame: performance.now(), ended: false,
    };
    if (level.mode === "course") spawnCourseWave();
    else fillOrders();
    els.lobby.classList.add("hidden");
    els.game.classList.remove("hidden");
    els.game.dataset.stage = level.atmosphere;
    document.body.classList.add("playing");
    fitGameCanvas();
    renderGameStatic();
    updateAllGameUI();
    setMessage("選擇主食，再點空的設備開始料理。");
    cancelAnimationFrame(frameHandle);
    frameHandle = requestAnimationFrame(gameLoop);
    playSuccess();
  }

  function makeCustomer(forceDishes = null) {
    const recipeKeys = Object.keys(game.restaurant.recipes);
    const toppingKeys = Object.keys(game.restaurant.toppings);
    const dishCount = forceDishes || (game.level.maxDishes > 1 && Math.random() > .52 ? game.level.maxDishes : 1);
    const patience = 34 + Math.random() * 13;
    game.customersUsed += 1;
    return {
      id: `${Date.now()}-${Math.random()}`, face: randomItem(CUSTOMER_FACES), patience, maxPatience: patience,
      dishes: Array.from({ length: dishCount }, () => ({ base: randomItem(recipeKeys), topping: randomItem(toppingKeys), served: false })),
    };
  }

  function fillOrders() {
    const maxAllowed = game.level.customers || Infinity;
    while (game.orders.length < 3 && game.customersUsed < maxAllowed) {
      game.orders.push(makeCustomer(game.level.mode === "customer" ? 2 : null));
    }
  }

  function spawnCourseWave() {
    const count = game.level.waves[game.wave - 1];
    game.orders = Array.from({ length: count }, () => makeCustomer(game.wave === 1 ? 1 : 2));
  }

  function renderGameStatic() {
    const { restaurant, level, upgrades } = game;
    els.gameLevelLabel.textContent = `章節一 · 1-${level.id} ${level.title}`;
    els.missionLabel.textContent = missionText(level);
    els.missionTarget.textContent = level.target;
    els.conditionBadges.innerHTML = [
      `<span>◷ ${level.time} 秒</span>`,
      level.moves ? `<span>↟ ${game.movesLeft} 次</span>` : "",
      level.customers ? `<span>♟ ${level.customers} 位</span>` : "",
      level.failBurn ? "<span class=\"danger\">燒焦即失敗</span>" : "",
      level.failLeave ? "<span class=\"danger\">客人離開即失敗</span>" : "",
      level.failDiscard ? "<span class=\"danger\">丟棄即失敗</span>" : "",
    ].join("");
    els.waveBanner.classList.toggle("hidden", level.mode !== "course");
    els.recipePanel.innerHTML = Object.entries(restaurant.recipes).map(([id, recipe], index) => `
      <button class="recipe-button ${index === 0 ? "selected" : ""}" data-recipe="${id}" type="button">
        <span style="background:${recipe.color}">${recipe.icon}</span><div><strong>${recipe.name}</strong><small>${(effectiveCookTime(recipe) / 1000).toFixed(1)} 秒</small></div><i></i>
      </button>`).join("");
    $$("[data-recipe]").forEach((button) => button.addEventListener("click", () => selectRecipe(button.dataset.recipe)));
    els.cookers.innerHTML = Array.from({ length: 3 }, (_, index) => `<button class="cooker ${index >= upgrades.cookers ? "locked" : ""}" data-cooker="${index}" type="button" ${index >= upgrades.cookers ? "disabled" : ""}>
      <small>設備 ${String.fromCharCode(65 + index)}</small><span class="cooker-pot"><i></i><b>⌁</b></span><strong>${index >= upgrades.cookers ? "尚未升級" : "點擊烹調"}</strong><em><i></i></em>
    </button>`).join("");
    $$("[data-cooker]").forEach((button) => button.addEventListener("click", () => handleCooker(Number(button.dataset.cooker))));
    els.plates.innerHTML = Array.from({ length: 3 }, (_, index) => `<button class="plate ${index >= upgrades.plates ? "locked" : "empty"} ${index === 0 ? "active" : ""}" data-plate="${index}" type="button" ${index >= upgrades.plates ? "disabled" : ""}>
      <small>餐盤 ${index + 1}</small><span class="plate-bowl"><i></i><b></b></span><strong>${index >= upgrades.plates ? "尚未升級" : "空餐盤"}</strong><em>雙擊丟棄</em>
    </button>`).join("");
    $$("[data-plate]").forEach((button) => {
      button.addEventListener("click", () => selectPlate(Number(button.dataset.plate)));
      button.addEventListener("dblclick", () => discardPlate(Number(button.dataset.plate)));
    });
    els.toppingPanel.innerHTML = Object.entries(restaurant.toppings).map(([id, topping]) => `
      <button data-topping="${id}" type="button"><span>${topping.icon}</span><strong>${topping.name}</strong></button>`).join("");
    $$("[data-topping]").forEach((button) => button.addEventListener("click", () => addTopping(button.dataset.topping)));
    const buddy = BUDDIES[game.buddy];
    els.skillButton.querySelector(".skill-avatar").textContent = buddy.icon;
    els.skillButton.querySelector(".skill-avatar").style.background = buddy.color;
    els.skillButton.querySelector("strong").textContent = game.buddy === "lumi" ? "星光鼓舞" : game.buddy === "moka" ? "防焦結界" : "連擊靈感";
  }

  function effectiveCookTime(recipe) {
    if (!game) return recipe.time;
    let multiplier = 1 - game.upgrades.speed * .08;
    if (game.selectedBoosters.includes("speed")) multiplier *= .75;
    if (game.buddy === "moka") multiplier *= .94;
    return recipe.time * multiplier;
  }

  function selectRecipe(id) {
    if (!game?.playing) return;
    game.selectedBase = id;
    $$("[data-recipe]").forEach((button) => button.classList.toggle("selected", button.dataset.recipe === id));
    setMessage(`已選擇${game.restaurant.recipes[id].name}，點空設備開始料理。`);
    playTone(430, .05);
  }

  function handleCooker(index) {
    if (!game?.playing) return;
    const cooker = game.cookers[index];
    if (!cooker) return;
    if (cooker.status === "idle") {
      cooker.status = "cooking"; cooker.base = game.selectedBase; cooker.startedAt = performance.now();
      setMessage(`${game.restaurant.recipes[cooker.base].name}開始烹調。`);
      playTone(310, .06);
    } else if (cooker.status === "ready") {
      const emptyIndex = game.plates.findIndex((plate) => plate === null);
      if (emptyIndex < 0) return showToast("備餐盤已滿");
      game.plates[emptyIndex] = { base: cooker.base, topping: null };
      game.activePlate = emptyIndex;
      resetCooker(index);
      renderPlates();
      setMessage("餐點已盛盤，加入客人指定的配料。");
      playTone(610, .08);
    } else if (cooker.status === "burnt") {
      resetCooker(index);
      game.combo = 0;
      updateComboUI();
      setMessage("已清理燒焦料理。");
    } else showToast("料理還在烹調");
  }

  function resetCooker(index) {
    game.cookers[index] = { status: "idle", base: null, startedAt: 0, readyAt: 0 };
    renderCookers(performance.now());
  }

  function selectPlate(index) {
    if (!game?.playing || index >= game.plates.length) return;
    game.activePlate = index;
    renderPlates();
  }

  function addTopping(id) {
    if (!game?.playing) return;
    const plate = game.plates[game.activePlate];
    if (!plate) return showToast("先從設備取出料理");
    plate.topping = id;
    renderPlates();
    setMessage(`已加入${game.restaurant.toppings[id].name}，點擊相符客人出餐。`);
    playTone(520, .06);
  }

  function discardPlate(index) {
    if (!game?.playing || !game.plates[index]) return;
    if (game.level.failDiscard) return finishLevel(false, "丟棄料理，觸發本關失敗條件。");
    game.plates[index] = null;
    game.combo = 0;
    renderPlates();
    updateComboUI();
    showToast("餐點已丟棄，Combo 中斷");
  }

  function serveCustomer(customerId) {
    if (!game?.playing) return;
    const customer = game.orders.find((item) => item.id === customerId);
    const plate = game.plates[game.activePlate];
    if (!plate?.topping) return showToast(plate ? "還沒有加入配料" : "目前餐盤沒有完成餐點");
    const dish = customer.dishes.find((item) => !item.served && item.base === plate.base && item.topping === plate.topping);
    if (!dish) {
      game.combo = 0;
      updateComboUI();
      playTone(125, .14, "square");
      return showToast("餐點與這位客人的訂單不符");
    }
    dish.served = true;
    game.plates[game.activePlate] = null;
    game.served += 1;
    if (game.movesLeft !== null) game.movesLeft -= 1;
    const patienceRatio = customer.patience / customer.maxPatience;
    if (patienceRatio >= .55) game.likes += 1;
    game.combo += 1;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    game.comboExpiresAt = performance.now() + 4400;
    const valueMultiplier = 1 + game.upgrades.value * .12;
    const scoreBoost = game.selectedBoosters.includes("score") ? 1.2 : 1;
    const buddyScore = game.buddy === "lumi" ? 1.05 : 1;
    const points = Math.round((65 + patienceRatio * 35 + Math.min(game.combo, 10) * 6) * valueMultiplier * scoreBoost * buddyScore);
    const buddyCoins = game.buddy === "piko" ? 1.08 : 1;
    const coins = Math.round((10 + game.combo) * valueMultiplier * buddyCoins);
    game.score += points; game.coins += coins;
    playSuccess();
    showToast(`完美上菜！+${points} 分 · +${coins} 金幣`);
    if (game.level.mode === "course") {
      game.orders.forEach((order) => order.patience -= 1.2);
    }
    if (customer.dishes.every((item) => item.served)) {
      game.customersCompleted += 1;
      game.orders = game.orders.filter((item) => item.id !== customerId);
      if (game.level.mode === "course") {
        if (!game.orders.length) advanceWave();
      } else fillOrders();
    }
    renderPlates();
    renderOrders();
    updateGameStats();
    updateComboUI();
    checkMission();
  }

  function advanceWave() {
    if (game.wave >= game.level.waves.length) return;
    game.wave += 1;
    spawnCourseWave();
    showToast(`WAVE ${game.wave} 開始！`);
    renderOrders();
  }

  function useBuddySkill() {
    if (!game?.playing || performance.now() < game.skillReadyAt) return;
    const cooldown = Math.max(16000, 25000 - (profile.buddies[game.buddy].level - 1) * 1000);
    game.skillReadyAt = performance.now() + cooldown;
    if (game.buddy === "lumi") {
      game.orders.forEach((order) => order.patience = Math.min(order.maxPatience, order.patience + order.maxPatience * .35));
      showToast("露米恢復了所有客人的耐心！");
    } else if (game.buddy === "moka") {
      game.antiBurnUntil = performance.now() + 8000;
      showToast("8 秒內料理不會燒焦！");
    } else {
      game.combo += 3;
      game.comboExpiresAt = performance.now() + 4400;
      showToast("Combo 立即增加 3！");
    }
    playSuccess();
    renderOrders();
    updateComboUI();
  }

  function gameLoop(now) {
    if (!game?.playing) return;
    const delta = Math.min((now - game.lastFrame) / 1000, .12);
    game.lastFrame = now;
    game.timeLeft = Math.max(0, game.timeLeft - delta);
    game.orders.forEach((customer) => customer.patience -= delta);
    const expired = game.orders.filter((customer) => customer.patience <= 0);
    expired.forEach((customer) => handleCustomerLeave(customer));
    updateCookers(now);
    if (game.combo && now >= game.comboExpiresAt) {
      game.combo = 0;
      updateComboUI();
    }
    updateRuntimeUI(now);
    if (game.timeLeft <= 0) return finishLevel(checkGoal(), checkGoal() ? "時間到，目標已完成！" : "時間用完了。");
    if (game.movesLeft !== null && game.movesLeft <= 0 && !checkGoal()) return finishLevel(false, "提供次數已用完。");
    if (game.level.customers && game.customersUsed >= game.level.customers && !game.orders.length && !checkGoal()) return finishLevel(false, "可接待的客人人數已用完。");
    frameHandle = requestAnimationFrame(gameLoop);
  }

  function handleCustomerLeave(customer) {
    if (!game?.playing) return;
    game.orders = game.orders.filter((item) => item.id !== customer.id);
    game.misses += 1;
    game.combo = 0;
    if (game.level.failLeave) return finishLevel(false, "客人未出餐便離開，觸發失敗條件。");
    if (game.level.mode !== "course") fillOrders();
    renderOrders();
    showToast("客人等太久離開了");
    playTone(120, .18, "sawtooth");
  }

  function updateCookers(now) {
    game.cookers.forEach((cooker, index) => {
      if (cooker.status === "cooking") {
        const duration = effectiveCookTime(game.restaurant.recipes[cooker.base]);
        if (now - cooker.startedAt >= duration) {
          cooker.status = "ready"; cooker.readyAt = now; playTone(760, .1);
        }
      } else if (cooker.status === "ready") {
        const protectedFromBurn = game.selectedBoosters.includes("antiBurn") || now < game.antiBurnUntil;
        if (!protectedFromBurn && now - cooker.readyAt >= 8500) {
          if (game.level.failBurn) return finishLevel(false, "料理燒焦，觸發本關失敗條件。");
          cooker.status = "burnt"; game.combo = 0; showToast("料理燒焦了！");
        }
      }
    });
    renderCookers(now);
  }

  function renderCookers(now) {
    game.cookers.forEach((cooker, index) => {
      const element = $(`[data-cooker="${index}"]`);
      if (!element) return;
      element.className = `cooker ${cooker.status}`;
      const label = element.querySelector("strong");
      const fill = element.querySelector("em i");
      element.removeAttribute("data-base");
      if (cooker.base) element.dataset.base = cooker.base;
      if (cooker.status === "idle") { label.textContent = "點擊烹調"; fill.style.width = "0%"; }
      if (cooker.status === "cooking") {
        const progress = clamp((now - cooker.startedAt) / effectiveCookTime(game.restaurant.recipes[cooker.base]), 0, 1);
        label.textContent = `烹調中 ${Math.round(progress * 100)}%`; fill.style.width = `${progress * 100}%`;
      }
      if (cooker.status === "ready") {
        const protectedFromBurn = game.selectedBoosters.includes("antiBurn") || now < game.antiBurnUntil;
        const remaining = protectedFromBurn ? 1 : 1 - clamp((now - cooker.readyAt) / 8500, 0, 1);
        label.textContent = protectedFromBurn ? "完成 · 防焦中" : "完成！點擊取餐"; fill.style.width = `${remaining * 100}%`;
      }
      if (cooker.status === "burnt") { label.textContent = "燒焦 · 點擊清理"; fill.style.width = "100%"; }
    });
  }

  function renderPlates() {
    Array.from({ length: 3 }, (_, index) => {
      const element = $(`[data-plate="${index}"]`);
      if (!element || index >= game.plates.length) return;
      const plate = game.plates[index];
      element.className = `plate ${plate ? "filled" : "empty"} ${game.activePlate === index ? "active" : ""}`;
      const symbol = element.querySelector(".plate-bowl i");
      const topping = element.querySelector(".plate-bowl b");
      const label = element.querySelector("strong");
      element.removeAttribute("data-base");
      if (plate) {
        const recipe = game.restaurant.recipes[plate.base];
        element.dataset.base = plate.base;
        element.style.setProperty("--dish-color", recipe.color);
        symbol.textContent = recipe.icon;
        topping.textContent = plate.topping ? game.restaurant.toppings[plate.topping].icon : "?";
        label.textContent = plate.topping ? `${recipe.name}完成` : "等待配料";
      } else {
        symbol.textContent = ""; topping.textContent = ""; label.textContent = "空餐盤";
      }
    });
  }

  function renderOrders() {
    if (!game) return;
    els.orders.innerHTML = game.orders.map((customer, index) => {
      const patienceRatio = clamp(customer.patience / customer.maxPatience, 0, 1);
      return `<button class="order-card ${patienceRatio < .28 ? "impatient" : ""}" data-order="${customer.id}" type="button">
        <span class="customer-face" style="background:${customer.face.color}">${customer.face.face}</span>
        <span class="order-content"><small>GUEST ${String(game.customersCompleted + index + 1).padStart(2, "0")}</small>
          <span class="dish-list">${customer.dishes.map((dish) => {
            const recipe = game.restaurant.recipes[dish.base], topping = game.restaurant.toppings[dish.topping];
            return `<span class="dish-ticket ${dish.served ? "served" : ""}" style="--dish:${recipe.color}"><i>${dish.served ? "✓" : recipe.icon}</i><b>${recipe.name}</b><em>${topping.icon}</em></span>`;
          }).join("")}</span>
        </span>
        <span class="like-line">♥ 讚</span><span class="patience"><i style="width:${patienceRatio * 100}%"></i></span>
      </button>`;
    }).join("") || `<div class="orders-empty">下一批客人即將抵達…</div>`;
    $$("[data-order]").forEach((button) => button.addEventListener("click", () => serveCustomer(button.dataset.order)));
  }

  function updateRuntimeUI(now) {
    els.gameTime.textContent = Math.ceil(game.timeLeft);
    els.gameTime.classList.toggle("danger", game.timeLeft <= 15);
    const ratio = game.combo ? clamp((game.comboExpiresAt - now) / 4400, 0, 1) : 0;
    els.comboTimer.style.width = `${ratio * 100}%`;
    const cooldown = Math.max(0, game.skillReadyAt - now);
    els.skillButton.disabled = cooldown > 0;
    els.skillCooldown.style.height = `${clamp(cooldown / 25000, 0, 1) * 100}%`;
    if (game.level.mode === "course") {
      els.waveBanner.classList.remove("hidden");
      els.waveBanner.innerHTML = `WAVE <b>${game.wave}</b> / ${game.level.waves.length}`;
    }
    els.conditionBadges.querySelectorAll("span").forEach((badge) => {
      if (badge.textContent.includes("次") && game.movesLeft !== null) badge.textContent = `↟ ${game.movesLeft} 次`;
    });
    game.orders.forEach((customer) => {
      const card = els.orders.querySelector(`[data-order="${customer.id}"]`);
      if (!card) return;
      const ratioNow = clamp(customer.patience / customer.maxPatience, 0, 1);
      card.querySelector(".patience i").style.width = `${ratioNow * 100}%`;
      card.classList.toggle("impatient", ratioNow < .28);
    });
  }

  function progressValue() {
    if (!game) return 0;
    if (game.level.mode === "likes") return game.likes;
    if (game.level.mode === "score") return game.score;
    return game.served;
  }

  function checkGoal() {
    return progressValue() >= game.level.target;
  }

  function checkMission() {
    updateGameStats();
    if (checkGoal()) finishLevel(true, "關卡目標達成！");
  }

  function updateGameStats() {
    const progress = progressValue();
    els.missionCurrent.textContent = Math.min(game.level.target, progress);
    els.missionBar.style.width = `${clamp(progress / game.level.target, 0, 1) * 100}%`;
    els.gameScore.textContent = game.score;
    els.gameCoins.textContent = game.coins;
  }

  function updateComboUI() {
    els.comboCount.textContent = `×${game?.combo || 0}`;
    els.comboCount.parentElement.classList.toggle("hot", (game?.combo || 0) >= 3);
  }

  function updateAllGameUI() {
    renderOrders();
    renderPlates();
    renderCookers(performance.now());
    updateGameStats();
    updateComboUI();
  }

  function finishLevel(success, reason) {
    if (!game?.playing || game.ended) return;
    game.playing = false; game.ended = true;
    cancelAnimationFrame(frameHandle);
    const level = game.level;
    const scoreRatio = game.score / Math.max(1, level.mode === "score" ? level.target : level.target * 105);
    const stars = success ? clamp(scoreRatio >= 1.35 ? 3 : scoreRatio >= .9 ? 2 : 1, 1, 3) : 0;
    let totalCoins = game.coins;
    if (success) {
      totalCoins += level.reward;
      const key = stageKey(game.restaurant.id, level.id);
      profile.completed[key] = true;
      profile.stars[key] = Math.max(profile.stars[key] || 0, stars);
      profile.coins += totalCoins;
      profile.stats.clears += 1;
      profile.stats.served += game.served;
      profile.stats.bestCombo = Math.max(profile.stats.bestCombo, game.bestCombo);
      profile.stats.ramenClears = RESTAURANTS.ramen.levels.filter((item) => profile.completed[stageKey("ramen", item.id)]).length;
      ensureDaily();
      profile.daily.plays += 1;
      saveProfile();
    }
    els.resultStatus.textContent = success ? "目標達成" : "挑戰失敗";
    els.resultStatus.classList.toggle("failure", !success);
    els.resultStars.textContent = [1,2,3].map((n) => n <= stars ? "★" : "☆").join(" ");
    els.resultTitle.textContent = success ? "今晚營業成功！" : "再調整一下節奏！";
    els.resultDescription.textContent = reason;
    els.resultScore.textContent = game.score;
    els.resultCombo.textContent = game.bestCombo;
    els.resultServed.textContent = game.served;
    els.resultCoins.textContent = success ? totalCoins : 0;
    openModal(els.resultModal);
    success ? playSuccess() : playTone(120, .25, "sawtooth");
  }

  function backToLobby() {
    if (game?.playing) {
      game.playing = false;
      cancelAnimationFrame(frameHandle);
    }
    closeAllModals();
    els.game.classList.add("hidden");
    els.lobby.classList.remove("hidden");
    delete els.game.dataset.stage;
    document.body.classList.remove("playing");
    els.game.style.removeProperty("height");
    renderLobby();
  }

  function fitGameCanvas() {
    const view = $("#gameView");
    const canvas = $("#gameCanvas");
    if (!view || !canvas || view.classList.contains("hidden")) return;
    const viewport = window.visualViewport;
    const availableWidth = viewport?.width || view.clientWidth || window.innerWidth;
    const availableHeight = viewport?.height || window.innerHeight;
    const scale = Math.min(availableWidth / GAME_WIDTH, availableHeight / GAME_HEIGHT);
    const showRotateHint = availableWidth < 700 && window.innerHeight > window.innerWidth;
    canvas.style.setProperty("--game-scale", String(scale));
    view.style.height = `${GAME_HEIGHT * scale + (showRotateHint ? 44 : 0)}px`;
    $("#rotateHint").classList.toggle("show", showRotateHint);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await $("#gameView").requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      showToast("目前瀏覽器不支援全螢幕，請將視窗橫向放大");
    }
    fitGameCanvas();
  }

  function retryLevel() {
    closeModal(els.resultModal);
    openBriefing();
  }

  function setMessage(text) {
    els.gameMessage.textContent = text;
  }

  function openModal(element) {
    element.classList.add("open");
  }

  function closeModal(element) {
    element.classList.remove("open");
  }

  function closeAllModals() {
    $$(".modal").forEach((modal) => modal.classList.remove("open"));
  }

  function showToast(text) {
    els.toast.textContent = text;
    els.toast.classList.add("show");
    clearTimeout(toastHandle);
    toastHandle = setTimeout(() => els.toast.classList.remove("show"), 1800);
  }

  function playTone(frequency, duration, type = "sine", volume = .04) {
    if (!profile.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = type; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch { /* Audio is optional. */ }
  }

  function playSuccess() {
    playTone(523, .12);
    setTimeout(() => playTone(659, .12), 65);
    setTimeout(() => playTone(784, .16), 125);
  }

  function startLoading() {
    const assets = [
      "assets/scenes/loading-night.webp",
      "assets/scenes/chapter-01-map.webp",
      "assets/scenes/ramen-truck-night.webp",
      "assets/scenes/office-workers.webp",
    ];
    let progress = 0;
    let assetsReady = false;
    Promise.all(assets.map((src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = image.onerror = resolve;
      image.src = src;
    }))).then(() => { assetsReady = true; });

    const tick = () => {
      const step = assetsReady ? 13 : Math.max(1, Math.round((92 - progress) * .12));
      progress = Math.min(assetsReady ? 100 : 92, progress + step);
      els.loadingBar.style.width = `${progress}%`;
      els.loadingText.textContent = progress < 35 ? `點亮餐車中… ${progress}%`
        : progress < 75 ? `熬煮今晚的湯頭… ${progress}%`
          : progress < 100 ? `等待晚歸的客人… ${progress}%` : "準備完成";
      if (progress < 100) return setTimeout(tick, 48);
      setTimeout(() => {
        els.loading.classList.add("leaving");
        document.body.classList.remove("loading-active");
        setTimeout(() => els.loading.classList.add("hidden"), 420);
      }, 260);
    };
    tick();
  }

  $("#homeButton").addEventListener("click", backToLobby);
  $("#leaveGameButton").addEventListener("click", backToLobby);
  $("#fullscreenButton").addEventListener("click", toggleFullscreen);
  $("#rotateHint").addEventListener("click", toggleFullscreen);
  $("#upgradeButton").addEventListener("click", () => { upgradeRestaurant = selectedRestaurant; renderUpgradeModal(); openModal(els.upgradeModal); });
  $("#buddyButton").addEventListener("click", () => { renderBuddyModal(); openModal(els.buddyModal); });
  $("#achievementButton").addEventListener("click", () => { renderAchievements(); openModal(els.achievementModal); });
  $("#startLevelButton").addEventListener("click", startLevel);
  $("#resultMapButton").addEventListener("click", backToLobby);
  $("#retryButton").addEventListener("click", retryLevel);
  els.skillButton.addEventListener("click", useBuddySkill);
  els.claimDaily.addEventListener("click", () => {
    if (profile.daily.plays < 2 || profile.daily.claimed) return;
    profile.daily.claimed = true; profile.coins += 120; saveProfile(); renderLobby(); showToast("每日獎勵：120 金幣");
  });
  els.soundButton.addEventListener("click", () => {
    profile.sound = !profile.sound; saveProfile();
    if (profile.sound) playTone(540, .08);
  });
  $$("[data-close]").forEach((button) => button.addEventListener("click", () => closeModal($(`#${button.dataset.close}`))));
  $$(".modal").forEach((modal) => modal.addEventListener("click", (event) => {
    if (event.target === modal && modal !== els.resultModal) closeModal(modal);
  }));
  window.addEventListener("resize", fitGameCanvas);
  window.visualViewport?.addEventListener("resize", fitGameCanvas);
  document.addEventListener("fullscreenchange", fitGameCanvas);

  renderLobby();
  startLoading();
})();
