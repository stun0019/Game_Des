(() => {
  "use strict";

  const API_NAME = "MoonlightLoadingAudio";
  const AUDIO_STORAGE_KEY = "moonlight-diner-audio-v1";
  const GAME_STORAGE_KEY = "moonlight-diner-v2";
  const EVENTS = Object.freeze({
    progress: "moonlight:loading-progress",
    ready: "moonlight:loading-ready",
    start: "moonlight:start-requested",
    exit: "moonlight:loading-exit",
    audio: "moonlight:audio-change",
  });

  const currentScriptUrl = document.currentScript?.src || "";

  function dispatch(name, detail, cancelable = false) {
    return document.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      cancelable,
      detail,
    }));
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function loadAudioPreference() {
    try {
      const profile = JSON.parse(localStorage.getItem(GAME_STORAGE_KEY));
      if (typeof profile?.sound === "boolean") return !profile.sound;
      const saved = JSON.parse(localStorage.getItem(AUDIO_STORAGE_KEY));
      return saved?.muted === true;
    } catch {
      return false;
    }
  }

  function injectStyleSheet() {
    if (document.querySelector('link[data-moonlight-loading-audio="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.dataset.moonlightLoadingAudio = "true";
    link.href = currentScriptUrl
      ? new URL("loading-audio.css", currentScriptUrl).href
      : "loading-audio.css";
    document.head.append(link);
  }

  class MoonlightAudioController {
    constructor() {
      this.context = null;
      this.master = null;
      this.musicBus = null;
      this.sfxBus = null;
      this.musicTimer = null;
      this.musicStep = 0;
      this.musicMode = "lobby";
      this.musicRequested = false;
      this.unlocked = false;
      this.muted = loadAudioPreference();
      this.soundButton = null;
      this.boundSoundClick = this.handleSoundClick.bind(this);
      this.boundSoundPointer = this.handleSoundPointer.bind(this);
      this.boundInteractionClick = this.handleInteractionClick.bind(this);
      this.boundInteractionPointer = this.handleInteractionPointer.bind(this);
      this.boundVisibility = this.handleVisibility.bind(this);
      document.addEventListener("visibilitychange", this.boundVisibility);
      document.addEventListener("pointerdown", this.boundInteractionPointer, { passive: true });
      document.addEventListener("click", this.boundInteractionClick);
    }

    createGraph() {
      if (this.context) return this.context;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.musicBus = this.context.createGain();
      this.sfxBus = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : .78;
      this.musicBus.gain.value = .7;
      this.sfxBus.gain.value = .9;
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(this.context.destination);
      return this.context;
    }

    async unlock() {
      const context = this.createGraph();
      if (!context) return false;
      try {
        if (context.state === "suspended") await context.resume();
        this.unlocked = context.state === "running";
        return this.unlocked;
      } catch {
        return false;
      }
    }

    savePreference() {
      try {
        localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify({ muted: this.muted }));
      } catch {
        // Audio remains usable when storage is unavailable.
      }
    }

    updateSoundButton() {
      if (!this.soundButton) return;
      this.soundButton.classList.toggle("muted", this.muted);
      this.soundButton.classList.toggle("mla-muted", this.muted);
      this.soundButton.setAttribute("aria-pressed", String(this.muted));
      this.soundButton.setAttribute("aria-label", this.muted ? "開啟音樂與音效" : "關閉音樂與音效");
      this.soundButton.title = this.muted ? "開啟音樂與音效" : "關閉音樂與音效";
    }

    bindSoundButton(button = document.querySelector("#soundButton")) {
      if (this.soundButton === button) {
        this.updateSoundButton();
        return this;
      }
      if (this.soundButton) {
        this.soundButton.removeEventListener("click", this.boundSoundClick);
        this.soundButton.removeEventListener("pointerdown", this.boundSoundPointer);
      }
      this.soundButton = button;
      if (button) {
        button.addEventListener("pointerdown", this.boundSoundPointer);
        button.addEventListener("click", this.boundSoundClick);
      }
      this.updateSoundButton();
      return this;
    }

    handleSoundPointer() {
      void this.unlock();
    }

    handleSoundClick() {
      const mutedBeforeClick = this.muted;
      queueMicrotask(() => {
        const buttonMuted = this.soundButton?.classList.contains("muted") ?? mutedBeforeClick;
        const nextMuted = buttonMuted === mutedBeforeClick ? !mutedBeforeClick : buttonMuted;
        void this.setMuted(nextMuted);
      });
    }

    handleInteractionPointer(event) {
      const button = event.target.closest?.("button");
      if (button && !button.disabled) void this.unlock();
    }

    handleInteractionClick(event) {
      const button = event.target.closest?.("button");
      if (!button || button.disabled || button === this.soundButton || button.classList.contains("mla-start-button")) return;

      if (button.matches("#startLevelButton, #retryButton")) {
        this.play("startLevel");
      } else if (button.matches("#homeButton, #leaveGameButton, #resultMapButton, [data-close]")) {
        this.play("back");
      } else if (button.matches("[data-upgrade], [data-buddy], [data-achievement], #claimDailyButton")) {
        this.play("unlock");
      } else if (button.matches(".primary-button, .secondary-button, .booster-card, .level-card")) {
        this.play("confirm");
      } else {
        this.play("click");
      }
    }

    async setMuted(muted) {
      this.muted = Boolean(muted);
      this.savePreference();
      this.updateSoundButton();
      if (this.master && this.context) {
        const now = this.context.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setTargetAtTime(this.muted ? 0 : .78, now, .025);
      }
      if (this.muted) {
        this.stopMusic(true);
      } else {
        await this.unlock();
        this.play("confirm");
        if (this.musicRequested) void this.startMusic();
      }
      dispatch(EVENTS.audio, { muted: this.muted, controller: this });
      return this.muted;
    }

    toggleMuted() {
      return this.setMuted(!this.muted);
    }

    voice(frequency, duration, options = {}) {
      if (this.muted || !this.context || !this.unlocked) return;
      const {
        delay = 0,
        type = "sine",
        volume = .035,
        attack = .012,
        release = .14,
        destination = this.sfxBus,
        detune = 0,
        cutoff = 4200,
      } = options;
      const now = this.context.currentTime + delay;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const filter = this.context.createBiquadFilter();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.detune.setValueAtTime(detune, now);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoff, now);
      filter.Q.value = .6;
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), now + attack);
      gain.gain.setValueAtTime(Math.max(.0002, volume), now + Math.max(attack, duration - release));
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      oscillator.start(now);
      oscillator.stop(now + duration + .03);
    }

    play(name = "click") {
      if (this.muted || !this.unlocked) return;
      const sounds = {
        click: [
          [560, .07, { type: "triangle", volume: .026, cutoff: 2400 }],
        ],
        confirm: [
          [523.25, .11, { type: "sine", volume: .034 }],
          [659.25, .15, { delay: .065, type: "triangle", volume: .03 }],
        ],
        back: [
          [493.88, .1, { type: "triangle", volume: .028 }],
          [369.99, .15, { delay: .055, type: "sine", volume: .027 }],
        ],
        unlock: [
          [659.25, .12, { type: "sine", volume: .03 }],
          [830.61, .16, { delay: .07, type: "sine", volume: .028 }],
          [987.77, .24, { delay: .14, type: "triangle", volume: .024 }],
        ],
        start: [
          [392, .14, { type: "triangle", volume: .035 }],
          [523.25, .2, { delay: .075, type: "triangle", volume: .035 }],
          [783.99, .32, { delay: .16, type: "sine", volume: .03 }],
        ],
      };
      const aliases = { levelStart: "start", "start-level": "start" };
      const sound = aliases[name] || name;
      (sounds[sound] || sounds.click).forEach(([frequency, duration, options]) => {
        this.voice(frequency, duration, options);
      });
    }

    scheduleMusicPhrase() {
      if (this.muted || !this.context || !this.unlocked || document.hidden) return;
      const lobbyChords = [
        [220, 261.63, 329.63],
        [196, 246.94, 293.66],
        [174.61, 220, 261.63],
        [196, 246.94, 329.63],
      ];
      const gameChords = [
        [220, 277.18, 329.63],
        [246.94, 293.66, 369.99],
        [196, 246.94, 329.63],
        [220, 261.63, 349.23],
      ];
      const chords = this.musicMode === "game" ? gameChords : lobbyChords;
      const chord = chords[this.musicStep % chords.length];
      const phraseDuration = this.musicMode === "game" ? 2.65 : 3.65;

      chord.forEach((frequency, index) => {
        this.voice(frequency, phraseDuration, {
          type: index === 0 ? "sine" : "triangle",
          volume: index === 0 ? .018 : .009,
          attack: .55,
          release: 1.25,
          destination: this.musicBus,
          detune: index === 2 ? 3 : 0,
          cutoff: 1250,
        });
      });
      this.voice(chord[1] * 2, .72, {
        delay: .32,
        type: "sine",
        volume: .009,
        attack: .08,
        release: .52,
        destination: this.musicBus,
        cutoff: 2200,
      });
      this.musicStep += 1;
    }

    async startMusic(mode = this.musicMode) {
      this.musicMode = mode;
      this.musicRequested = true;
      if (this.muted || this.musicTimer) return false;
      if (!await this.unlock()) return false;
      this.scheduleMusicPhrase();
      const interval = this.musicMode === "game" ? 2450 : 3450;
      this.musicTimer = window.setInterval(() => this.scheduleMusicPhrase(), interval);
      return true;
    }

    stopMusic(preserveRequest = false) {
      if (this.musicTimer) window.clearInterval(this.musicTimer);
      this.musicTimer = null;
      if (!preserveRequest) this.musicRequested = false;
    }

    setMusicMode(mode) {
      const nextMode = mode === "game" ? "game" : "lobby";
      if (nextMode === this.musicMode) return;
      const wasPlaying = Boolean(this.musicTimer);
      this.stopMusic(true);
      this.musicMode = nextMode;
      this.musicStep = 0;
      if (wasPlaying) void this.startMusic(nextMode);
    }

    handleVisibility() {
      if (document.hidden) {
        this.stopMusic(true);
      } else if (this.musicRequested && this.unlocked && !this.muted) {
        void this.startMusic();
      }
    }

    destroy() {
      this.stopMusic();
      document.removeEventListener("visibilitychange", this.boundVisibility);
      document.removeEventListener("pointerdown", this.boundInteractionPointer);
      document.removeEventListener("click", this.boundInteractionClick);
      if (this.soundButton) {
        this.soundButton.removeEventListener("click", this.boundSoundClick);
        this.soundButton.removeEventListener("pointerdown", this.boundSoundPointer);
      }
      if (this.context && this.context.state !== "closed") void this.context.close();
    }
  }

  class MoonlightLoadingGate {
    constructor(audio) {
      this.audio = audio;
      this.view = null;
      this.bar = null;
      this.percent = null;
      this.text = null;
      this.button = null;
      this.actions = null;
      this.progress = 0;
      this.ready = false;
      this.started = false;
      this.allowExit = false;
      this.observer = null;
      this.guardObserver = null;
      this.exitTimer = null;
      this.boundStart = this.handleStart.bind(this);
    }

    mount(view = document.querySelector("#loadingView")) {
      if (!view || this.view === view) return this;
      this.destroyObservers();
      this.view = view;
      this.bar = view.querySelector("#loadingBar");
      this.percent = view.querySelector("#loadingPercent");
      this.text = view.querySelector("#loadingText");
      this.installActions();
      this.observeProgress();
      this.observeExitAttempts();
      this.readExistingProgress();
      return this;
    }

    installActions() {
      this.actions = this.view.querySelector(".mla-loading-actions");
      if (!this.actions) {
        this.actions = document.createElement("div");
        this.actions.className = "mla-loading-actions";
        this.actions.setAttribute("aria-live", "polite");
        this.actions.innerHTML = `
          <div class="mla-ready-panel">
            <p class="mla-ready-copy"><span class="mla-ready-mark" aria-hidden="true"></span><span>夜間食堂準備完成</span></p>
            <button class="mla-start-button" type="button" aria-label="開始遊戲" disabled>
              <span class="mla-start-emblem" aria-hidden="true"></span>
              <span class="mla-start-label"><strong>開始遊戲</strong><small>OPEN THE DINER</small></span>
              <span class="mla-start-arrow" aria-hidden="true"></span>
            </button>
          </div>`;
        const consolePanel = this.view.querySelector(".loading-console") || this.view;
        consolePanel.append(this.actions);
      }
      this.button = this.actions.querySelector(".mla-start-button");
      this.button?.addEventListener("click", this.boundStart);
    }

    observeProgress() {
      if (!this.percent && !this.bar) return;
      this.observer = new MutationObserver(() => this.readExistingProgress());
      if (this.percent) this.observer.observe(this.percent, { childList: true, characterData: true, subtree: true });
      if (this.bar) this.observer.observe(this.bar, { attributes: true, attributeFilter: ["style", "aria-valuenow"] });
    }

    observeExitAttempts() {
      this.guardObserver = new MutationObserver(() => {
        if (this.allowExit || !this.view) return;
        if (this.view.classList.contains("leaving") || this.view.classList.contains("hidden")) {
          this.view.classList.remove("leaving", "hidden");
        }
        if (!document.body.classList.contains("loading-active")) {
          document.body.classList.add("loading-active");
        }
      });
      this.guardObserver.observe(this.view, { attributes: true, attributeFilter: ["class"] });
      this.guardObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    readExistingProgress() {
      if (this.started) return;
      const percentValue = Number.parseFloat(this.percent?.textContent || "");
      const barValue = Number.parseFloat(this.bar?.style.width || this.bar?.getAttribute("aria-valuenow") || "");
      const value = Number.isFinite(percentValue) ? percentValue : barValue;
      if (Number.isFinite(value)) this.setProgress(value, undefined, { updateDom: false });
    }

    setProgress(value, label, options = {}) {
      const nextProgress = clamp(Number(value) || 0, 0, 100);
      const changed = nextProgress !== this.progress;
      this.progress = nextProgress;
      if (options.updateDom !== false) {
        if (this.bar) {
          this.bar.style.width = `${nextProgress}%`;
          this.bar.setAttribute("aria-valuenow", String(nextProgress));
        }
        if (this.percent) this.percent.textContent = `${Math.round(nextProgress)}%`;
      }
      if (label && this.text) this.text.textContent = label;
      if (changed) dispatch(EVENTS.progress, { progress: nextProgress, gate: this });
      if (nextProgress >= 100) this.complete(label);
      return this.progress;
    }

    complete(label = "準備完成，請開始遊戲") {
      if (this.ready || this.started) return this;
      this.progress = 100;
      this.ready = true;
      if (this.bar) {
        this.bar.style.width = "100%";
        this.bar.setAttribute("aria-valuenow", "100");
      }
      if (this.percent) this.percent.textContent = "100%";
      if (this.text) this.text.textContent = label || "準備完成，請開始遊戲";
      this.view?.classList.remove("leaving", "hidden");
      this.view?.classList.add("mla-ready");
      this.view?.setAttribute("aria-busy", "false");
      document.body.classList.add("loading-active");
      this.button?.removeAttribute("disabled");
      dispatch(EVENTS.ready, { progress: 100, gate: this });
      return this;
    }

    async handleStart(event) {
      event.preventDefault();
      if (!this.ready || this.started) return;
      this.started = true;
      if (this.button) this.button.disabled = true;
      this.view?.classList.add("mla-exiting");
      const unlockRequest = this.audio.unlock();

      const shouldUseDefaultExit = dispatch(EVENTS.start, {
        gate: this,
        audio: this.audio,
        source: this.button,
      }, true);
      if (shouldUseDefaultExit) this.exit();

      await unlockRequest;
      this.audio.play("start");
      void this.audio.startMusic("lobby");
    }

    exit() {
      if (!this.view) return;
      this.started = true;
      this.allowExit = true;
      this.view.classList.add("mla-exiting", "leaving");
      document.body.classList.remove("loading-active");
      window.clearTimeout(this.exitTimer);
      this.exitTimer = window.setTimeout(() => {
        this.view?.classList.add("hidden");
        dispatch(EVENTS.exit, { gate: this });
      }, 430);
    }

    reset() {
      window.clearTimeout(this.exitTimer);
      this.progress = 0;
      this.ready = false;
      this.started = false;
      this.allowExit = false;
      this.view?.classList.remove("mla-ready", "mla-exiting", "leaving", "hidden");
      this.view?.setAttribute("aria-busy", "true");
      document.body.classList.add("loading-active");
      if (this.button) this.button.disabled = true;
      this.setProgress(0, "準備餐車中…");
      return this;
    }

    destroyObservers() {
      this.observer?.disconnect();
      this.guardObserver?.disconnect();
      this.observer = null;
      this.guardObserver = null;
    }

    destroy() {
      window.clearTimeout(this.exitTimer);
      this.destroyObservers();
      this.button?.removeEventListener("click", this.boundStart);
    }
  }

  injectStyleSheet();
  const audio = new MoonlightAudioController();
  const loading = new MoonlightLoadingGate(audio);

  const api = Object.freeze({
    version: "1.1.0",
    events: EVENTS,
    audio,
    loading,
    mount() {
      loading.mount();
      audio.bindSoundButton();
      return api;
    },
    setProgress(value, label) {
      api.mount();
      return loading.setProgress(value, label);
    },
    complete(label) {
      api.mount();
      return loading.complete(label);
    },
    exit() {
      return loading.exit();
    },
    play(soundName) {
      return audio.play(soundName);
    },
    setMuted(muted) {
      return audio.setMuted(muted);
    },
    toggleMuted() {
      return audio.toggleMuted();
    },
    startMusic(mode) {
      return audio.startMusic(mode);
    },
    stopMusic() {
      return audio.stopMusic();
    },
    setMusicMode(mode) {
      return audio.setMusicMode(mode);
    },
    destroy() {
      loading.destroy();
      audio.destroy();
    },
  });

  window[API_NAME] = api;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => api.mount(), { once: true });
  } else {
    api.mount();
  }
})();
