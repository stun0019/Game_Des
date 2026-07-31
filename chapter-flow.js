(() => {
  "use strict";

  const LEVELS_PER_CHAPTER = 5;
  const TEXT = {
    chapter: "\u7ae0\u7bc0",
    chapterSelectLabel: "\u7ae0\u7bc0\u9078\u64c7",
    chooseChapter: "\u9078\u64c7\u7ae0\u7bc0",
    chooseChapterHelp: "\u5148\u6c7a\u5b9a\u4eca\u665a\u8981\u7167\u9867\u54ea\u4e00\u7fa4\u5ba2\u4eba\uff0c\u518d\u9032\u5165\u8a72\u7ae0\u7684\u4e94\u500b\u5c0f\u95dc\u5361\u3002",
    chapterOneTitle: "\u7167\u9867\u75b2\u618a\u7684\u4e0a\u73ed\u65cf",
    ramenTruck: "\u6708\u5149\u62c9\u9eb5\u9910\u8eca",
    chapterOneDescription: "\u7528\u71b1\u6e6f\u548c\u6e96\u6642\u51fa\u9910\u7167\u4eae\u52a0\u73ed\u5f8c\u7684\u591c\u665a\u3002",
    defaultDescription: "\u7ae0\u7bc0\u5167\u5bb9\u5f85\u88dc\u3002",
    smallLevels: "\u5c0f\u95dc\u5361",
    backToChapters: "\u8fd4\u56de\u7ae0\u7bc0",
    enterable: "\u53ef\u9032\u5165",
    locked: "\u5f85\u89e3\u9396",
  };

  const DEFAULT_CHAPTERS = [
    {
      id: 1,
      code: "CHAPTER 01",
      title: TEXT.chapterOneTitle,
      restaurant: TEXT.ramenTruck,
      description: TEXT.chapterOneDescription,
      levels: [
        "\u6df1\u591c\u7b2c\u4e00\u7897",
        "\u8d95\u8eca\u524d\u7684\u6eab\u5ea6",
        "\u8fa6\u516c\u5ba4\u8a02\u55ae",
        "\u96e8\u591c\u9023\u7dda",
        "\u6700\u5f8c\u4e00\u73ed\u8eca",
      ],
    },
    {
      id: 2,
      code: "CHAPTER 02",
      title: "\u96e3\u641e\u53c8\u9ebb\u7169\u7684\u5967\u5ba2",
      restaurant: "\u6708\u5f71\u9435\u677f\u9910\u8eca\u30fb\u5ba2\u8a34\u524d\u7dda",
      description: "\u5728\u6311\u5254\u8981\u6c42\u8207\u81e8\u6642\u52a0\u55ae\u4e4b\u9593\uff0c\u5b88\u4f4f\u54c1\u8cea\u8207\u8010\u5fc3\u3002",
      levels: [
        "\u4e0d\u52a0\u8525\u7684\u5805\u6301",
        "\u6eab\u5ea6\u525b\u525b\u597d",
        "\u81e8\u6642\u8ffd\u52a0\u55ae",
        "\u9000\u55ae\u5371\u6a5f",
        "\u7b11\u8457\u9001\u8d70\u5967\u5ba2",
      ],
    },
    {
      id: 3,
      code: "CHAPTER 03",
      title: "\u586b\u98fd\u6df1\u591c\u7684\u591c\u8c93\u65cf",
      restaurant: "\u661f\u591c\u95dc\u6771\u716e\u6524\u30fb\u5348\u591c\u88dc\u7d66\u7ad9",
      description: "\u70ba\u71ac\u591c\u5de5\u4f5c\u8207\u4e0d\u80af\u5165\u7761\u7684\u4eba\uff0c\u9001\u4e0a\u6696\u80c3\u7684\u6df1\u591c\u88dc\u7d66\u3002",
      levels: [
        "\u5348\u591c\u8993\u98df\u8005",
        "\u904a\u6232\u9023\u52dd\u591c",
        "\u76f4\u64ad\u5f8c\u53f0\u9910",
        "\u9ece\u660e\u524d\u52a0\u55ae",
        "\u591c\u8c93\u5927\u96c6\u5408",
      ],
    },
    {
      id: 4,
      code: "CHAPTER 04",
      title: "\u5f81\u670d\u6311\u5254\u7684\u7f8e\u98df\u5bb6",
      restaurant: "\u6708\u6842\u6d0b\u98df\u9910\u8eca\u30fb\u54c1\u5473\u8a66\u7149\u5834",
      description: "\u7528\u7cbe\u6e96\u706b\u5019\u8207\u7d30\u7dfb\u64fa\u76e4\uff0c\u901a\u904e\u6bcf\u4e00\u9053\u56b4\u683c\u54c1\u8a55\u3002",
      levels: [
        "\u7b2c\u4e00\u53e3\u5be9\u67e5",
        "\u706b\u5019\u96f6\u8aa4\u5dee",
        "\u96b1\u85cf\u83dc\u55ae",
        "\u533f\u540d\u8a55\u8ad6\u5bb6",
        "\u6eff\u5206\u9910\u684c",
      ],
    },
    {
      id: 5,
      code: "CHAPTER 05",
      title: "\u5b88\u4f4f\u6700\u5f8c\u4e00\u665a\u7684\u98df\u5802",
      restaurant: "\u6708\u5149\u98df\u5802\u30fb\u544a\u5225\u591c",
      description: "\u5728\u98df\u5802\u7184\u71c8\u524d\u5b8c\u6210\u6700\u5f8c\u670d\u52d9\uff0c\u8b93\u6bcf\u4f4d\u5ba2\u4eba\u5e36\u8457\u56de\u61b6\u96e2\u958b\u3002",
      levels: [
        "\u719f\u5ba2\u7684\u8001\u4f4d\u7f6e",
        "\u7f3a\u8ca8\u7684\u62db\u724c\u83dc",
        "\u505c\u96fb\u665a\u9910",
        "\u6700\u5f8c\u4e00\u684c\u5ba2\u4eba",
        "\u6708\u5149\u4e0d\u6253\u70ca",
      ],
    },
  ];

  const state = {
    initialized: false,
    started: false,
    view: "chapters",
    selectedChapterId: null,
    chapters: normalizeChapters(DEFAULT_CHAPTERS),
    nativeLevelNodes: [],
    nativeTabKicker: null,
    nativeTabLabel: null,
    levelObserver: null,
  };

  const elements = {};

  function normalizeChapters(chapters) {
    return chapters.slice(0, 5).map((chapter, index) => {
      const id = Number(chapter.id || index + 1);
      const fallback = DEFAULT_CHAPTERS.find((item) => item.id === id) || DEFAULT_CHAPTERS[index] || {};
      const levels = Array.from({ length: LEVELS_PER_CHAPTER }, (_, levelIndex) => {
        return chapter.levels?.[levelIndex] || fallback.levels?.[levelIndex] || `${id}-${levelIndex + 1}`;
      });

      return {
        id,
        code: chapter.code || fallback.code || `CHAPTER ${String(id).padStart(2, "0")}`,
        title: chapter.title || fallback.title || TEXT.chapterOneTitle,
        restaurant: chapter.restaurant || fallback.restaurant || TEXT.ramenTruck,
        description: chapter.description || fallback.description || TEXT.defaultDescription,
        levels,
      };
    });
  }

  function queryElements() {
    elements.lobby = document.querySelector("#lobbyView");
    elements.stage = elements.lobby?.querySelector(".chapter-stage");
    elements.loading = document.querySelector("#loadingView");
    elements.tabs = document.querySelector("#restaurantTabs");
    elements.levelGrid = document.querySelector("#levelGrid");
    elements.chapterLabel = document.querySelector("#restaurantChapter");
    elements.chapterName = document.querySelector("#restaurantName");
    elements.completion = document.querySelector("#restaurantCompletion");
    elements.summary = document.querySelector("#journeySummary");
    return Boolean(elements.lobby && elements.stage && elements.tabs && elements.levelGrid);
  }

  function getChapter(id) {
    return state.chapters.find((chapter) => chapter.id === Number(id)) || null;
  }

  function dispatchFlowEvent(name, detail, target = elements.lobby, cancelable = false) {
    return target.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable, detail }));
  }

  function captureNativeLevels() {
    const nativeNodes = [...elements.levelGrid.children].filter((node) => !node.hasAttribute("data-flow-generated"));
    if (nativeNodes.length) state.nativeLevelNodes = nativeNodes;
  }

  function pauseLevelObserver(callback) {
    state.levelObserver?.disconnect();
    callback();
    observeLevelGrid();
  }

  function observeLevelGrid() {
    if (!elements.levelGrid || typeof MutationObserver === "undefined") return;
    if (!state.levelObserver) {
      state.levelObserver = new MutationObserver(() => {
        const hasNativeNodes = [...elements.levelGrid.children].some((node) => !node.hasAttribute("data-flow-generated"));
        if (!hasNativeNodes) return;
        captureNativeLevels();
        if (state.view === "levels" && state.selectedChapterId && state.selectedChapterId !== 1) {
          renderGeneratedLevels(getChapter(state.selectedChapterId));
        }
      });
    }
    state.levelObserver.observe(elements.levelGrid, { childList: true });
  }

  function makeSelectionView() {
    const view = document.createElement("section");
    view.className = "chapter-flow-selector";
    view.setAttribute("aria-label", TEXT.chapterSelectLabel);
    view.innerHTML = `
      <header class="chapter-flow-heading">
        <small>MOONLIGHT JOURNEY</small>
        <h2>${TEXT.chooseChapter}</h2>
        <p>${TEXT.chooseChapterHelp}</p>
      </header>
      <div class="chapter-flow-list" role="list"></div>
    `;
    elements.stage.append(view);
    elements.selector = view;
    elements.chapterList = view.querySelector(".chapter-flow-list");
  }

  function makeBackButton() {
    const button = document.createElement("button");
    button.className = "chapter-flow-back";
    button.type = "button";
    button.hidden = true;
    button.innerHTML = `<span class="chapter-flow-back-icon" aria-hidden="true"></span><b>${TEXT.backToChapters}</b>`;
    button.addEventListener("click", showChapterSelect);
    elements.stage.append(button);
    elements.backButton = button;
  }

  function renderChapterCards() {
    elements.chapterList.replaceChildren(...state.chapters.map((chapter) => {
      const button = document.createElement("button");
      button.className = `chapter-flow-card chapter-flow-card-${chapter.id}`;
      button.type = "button";
      button.dataset.chapter = String(chapter.id);
      button.setAttribute("role", "listitem");
      button.setAttribute("aria-label", `${TEXT.chapter} ${chapter.id} ${chapter.title}`);
      button.innerHTML = `
        <span class="chapter-flow-art" aria-hidden="true"><i></i><b>${String(chapter.id).padStart(2, "0")}</b></span>
        <span class="chapter-flow-copy">
          <small>${TEXT.chapter} ${chapter.id} / ${chapter.code}</small>
          <strong>${chapter.title}</strong>
          <i>${chapter.restaurant}</i>
        </span>
        <span class="chapter-flow-enter" aria-hidden="true"></span>
      `;
      button.addEventListener("click", () => selectChapter(chapter.id));
      return button;
    }));
  }

  function updateChapterCopy(chapter) {
    if (elements.chapterLabel) elements.chapterLabel.textContent = `${TEXT.chapter} ${chapter.id} / ${chapter.code}`;
    if (elements.chapterName) elements.chapterName.textContent = chapter.title;
    if (elements.completion) elements.completion.textContent = `0 / ${chapter.levels.length}`;
    if (elements.summary) elements.summary.textContent = `0 / ${chapter.levels.length} ${TEXT.smallLevels}`;

    const tabButton = elements.tabs.querySelector(".restaurant-tab");
    const kicker = tabButton?.querySelector("small");
    const label = tabButton?.querySelector("strong");
    if (kicker && state.nativeTabKicker === null) state.nativeTabKicker = kicker.textContent;
    if (label && state.nativeTabLabel === null) state.nativeTabLabel = label.textContent;
    if (kicker) kicker.textContent = `${TEXT.chapter} ${chapter.id}`;
    if (label) label.textContent = chapter.restaurant;
    if (tabButton) tabButton.dataset.chapter = String(chapter.id);
  }

  function restoreNativeLevels() {
    pauseLevelObserver(() => {
      if (!state.nativeLevelNodes.length) {
        elements.levelGrid.replaceChildren();
        return;
      }
      elements.levelGrid.replaceChildren(...state.nativeLevelNodes);
      state.nativeLevelNodes.forEach((node) => {
        node.dataset.chapter = "1";
        node.removeAttribute("data-flow-generated");
        const number = node.querySelector(".level-number");
        if (number && !node.classList.contains("locked")) number.textContent = `1-${node.dataset.level}`;
      });
    });
  }

  function makeLockIcon() {
    const lock = document.createElement("i");
    lock.className = "level-lock";
    lock.setAttribute("aria-hidden", "true");
    return lock;
  }

  function makeStars() {
    const stars = document.createElement("span");
    stars.className = "level-stars";
    for (let index = 0; index < 3; index += 1) stars.append(document.createElement("i"));
    return stars;
  }

  function renderGeneratedLevels(chapter) {
    if (!chapter) return;
    const nodes = chapter.levels.map((title, index) => {
      const level = index + 1;
      const isCurrent = level === 1;
      const button = document.createElement("button");
      button.className = `level-card chapter-node chapter-flow-node ${isCurrent ? "current" : "locked"}`;
      button.type = "button";
      button.dataset.level = String(level);
      button.dataset.chapter = String(chapter.id);
      button.dataset.flowGenerated = "true";
      button.setAttribute("aria-label", `${chapter.id}-${level} ${title}`);
      button.setAttribute("aria-disabled", String(!isCurrent));

      const glow = document.createElement("span");
      glow.className = "node-glow";
      const number = document.createElement("span");
      number.className = "level-number";
      if (isCurrent) number.textContent = `${chapter.id}-${level}`;
      else number.append(makeLockIcon());
      const tooltip = document.createElement("span");
      tooltip.className = "level-tooltip";
      tooltip.innerHTML = `<small>${isCurrent ? TEXT.enterable : TEXT.locked}</small><strong>${title}</strong><i>${chapter.description}</i>`;
      button.append(glow, number, makeStars(), tooltip);

      button.addEventListener("click", () => {
        if (!isCurrent) return;
        dispatchFlowEvent("moonlight:levelselect", { chapter, level, title, generated: true }, elements.levelGrid, true);
      });
      return button;
    });

    pauseLevelObserver(() => elements.levelGrid.replaceChildren(...nodes));
  }

  function selectChapter(id) {
    const chapter = getChapter(id);
    if (!chapter || !state.initialized) return false;

    state.started = true;
    state.selectedChapterId = chapter.id;
    state.view = "levels";
    document.body.classList.add("chapter-flow-active", "chapter-flow-levels");
    document.body.classList.remove("chapter-flow-selecting");
    elements.selector.hidden = true;
    elements.backButton.hidden = false;
    elements.lobby.dataset.selectedChapter = String(chapter.id);
    updateChapterCopy(chapter);

    if (chapter.id === 1) restoreNativeLevels();
    else renderGeneratedLevels(chapter);

    dispatchFlowEvent("moonlight:chapterselect", { chapter }, elements.lobby);
    return true;
  }

  function showChapterSelect() {
    if (!state.initialized) return false;
    state.started = true;
    state.selectedChapterId = null;
    state.view = "chapters";
    document.body.classList.add("chapter-flow-active", "chapter-flow-selecting");
    document.body.classList.remove("chapter-flow-levels");
    elements.selector.hidden = false;
    elements.backButton.hidden = true;
    elements.lobby.removeAttribute("data-selected-chapter");
    dispatchFlowEvent("moonlight:chapterlist", { chapters: state.chapters }, elements.lobby);
    return true;
  }

  function loadingHasFinished() {
    if (!elements.loading) return true;
    return elements.loading.classList.contains("hidden") || elements.loading.classList.contains("leaving");
  }

  function waitForLoading() {
    if (loadingHasFinished()) return showChapterSelect();
    const observer = new MutationObserver(() => {
      if (!loadingHasFinished()) return;
      observer.disconnect();
      showChapterSelect();
    });
    observer.observe(elements.loading, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("moonlight:loadingcomplete", () => {
      observer.disconnect();
      showChapterSelect();
    }, { once: true });
    return true;
  }

  function bindNativeLevelEvents() {
    elements.levelGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".level-card:not([data-flow-generated])");
      if (!button || state.selectedChapterId !== 1) return;
      const level = Number(button.dataset.level);
      dispatchFlowEvent("moonlight:levelselect", {
        chapter: getChapter(1),
        level,
        title: button.querySelector(".level-tooltip strong")?.textContent || `1-${level}`,
        native: true,
      }, elements.levelGrid, true);
    });
  }

  function init(options = {}) {
    if (state.initialized) return api;
    if (!queryElements()) return null;
    if (Array.isArray(options.chapters)) state.chapters = normalizeChapters(options.chapters);

    captureNativeLevels();
    makeSelectionView();
    makeBackButton();
    renderChapterCards();
    bindNativeLevelEvents();
    observeLevelGrid();
    state.initialized = true;
    waitForLoading();
    return api;
  }

  function configure(chapters) {
    if (!Array.isArray(chapters) || chapters.length === 0) throw new TypeError("chapters must be a non-empty array");
    state.chapters = normalizeChapters(chapters);
    if (state.initialized) renderChapterCards();
    return api;
  }

  function destroy() {
    state.levelObserver?.disconnect();
    elements.selector?.remove();
    elements.backButton?.remove();
    document.body.classList.remove("chapter-flow-active", "chapter-flow-selecting", "chapter-flow-levels");
    state.initialized = false;
    state.started = false;
    state.selectedChapterId = null;
    state.nativeLevelNodes = [];
  }

  const api = {
    init,
    destroy,
    configure,
    showChapterSelect,
    selectChapter,
    showLevels: selectChapter,
    getChapters: () => normalizeChapters(state.chapters),
    getState: () => ({
      view: state.view,
      selectedChapterId: state.selectedChapterId,
      started: state.started,
    }),
  };

  window.MoonlightChapterFlow = api;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(), { once: true });
  else init();
})();
