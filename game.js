(() => {
  "use strict";

  const STORAGE_KEY = "i-want-quiet-merit-v2";
  const VISITOR_KEY = "i-want-quiet-visitor-id";
  const DAILY_GOAL = 108;
  const STATS_ENDPOINT = window.QUIET_STATS_CONFIG?.endpoint?.trim() || "";
  const fish = document.querySelector("#wood-fish");
  const gameCard = document.querySelector(".zen-room");
  const morePlay = document.querySelector(".more-play");
  const stage = document.querySelector("#fish-stage");
  const feedbackLayer = document.querySelector("#feedback-layer");
  const meritCount = document.querySelector("#merit-count");
  const soundToggle = document.querySelector("#sound-toggle");
  const soundLabel = document.querySelector("#sound-label");
  const soundSelect = document.querySelector("#sound-select");
  const onlineCount = document.querySelector("#online-count");
  const visitorCount = document.querySelector("#visitor-count");
  const globalMeritCount = document.querySelector("#global-merit-count");
  const companionHours = document.querySelector("#companion-hours");
  const levelName = document.querySelector("#level-name");
  const levelProgress = document.querySelector("#level-progress");
  const levelFill = document.querySelector("#level-fill");
  const levelNote = document.querySelector("#level-note");
  const wisdomToast = document.querySelector("#wisdom-toast");
  const wisdomText = document.querySelector("#wisdom-text");
  const frogAudio = document.querySelector("#frog-audio");
  const photoInput = document.querySelector("#photo-input");
  const photoOverlay = document.querySelector("#photo-overlay");
  const photoFrame = document.querySelector("#photo-frame");
  const photoClear = document.querySelector("#photo-clear");
  const photoTip = document.querySelector("#photo-tip");
  const worryInput = document.querySelector("#worry-input");
  const comboCount = document.querySelector("#combo-count");
  const rhythmStatus = document.querySelector("#rhythm-status");
  const rhythmDots = [...document.querySelectorAll("#rhythm-dots i")];
  const totalCount = document.querySelector("#total-count");
  const streakCount = document.querySelector("#streak-count");
  const completionRate = document.querySelector("#completion-rate");
  const achievementCount = document.querySelector("#achievement-count");
  const achievementList = document.querySelector("#achievement-list");
  const shareCard = document.querySelector("#share-card");
  const releaseModal = document.querySelector("#release-modal");
  const releaseText = document.querySelector("#release-text");
  const releaseClose = document.querySelector("#release-close");

  let state = loadState();
  let soundEnabled = loadSoundPreference();
  let soundType = loadSoundType();
  let audioContext;
  let toastTimer;
  let frogStopTimer;
  let photoUrl;
  let combo = 0;
  let lastKnockAt = 0;
  let comboResetTimer;
  const visitorId = getVisitorId();

  const wisdoms = new Map([
    [1, "第一声，先把今天的烦恼放在门外。"],
    [10, "莫生气莫生气，生气容易早嗝屁。"],
    [36, "心浮气躁时，先把呼吸放慢一点。"],
    [54, "已过半程。你正在把注意力还给自己。"],
    [72, "别急着抵达，安静本身就是答案。"],
    [108, "功德圆满 108 声：愿你所念皆安，所行皆坦。"],
    [216, "敲得很好，但也别忘了喝口水、伸个懒腰。"],
  ]);

  const feedbacks = ["烦恼 -1", "心静 +1", "好运 +1", "杂念散开", "此刻很好"];
  const achievements = [
    { id: "first", icon: "一", name: "第一声", hint: "敲下第一声", unlocked: () => state.total >= 1 },
    { id: "echo", icon: "连", name: "木鱼回响", hint: "完成 8 连击", unlocked: () => state.achievements.includes("echo") },
    { id: "goal", icon: "圆", name: "今日圆满", hint: "完成 108 声", unlocked: () => state.count >= DAILY_GOAL || state.achievements.includes("goal") },
    { id: "days", icon: "久", name: "静心三日", hint: "连续静心 3 天", unlocked: () => state.streak >= 3 || state.achievements.includes("days") },
  ];

  function dateKey(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function daysBetween(from, to) {
    const start = new Date(`${from}T00:00:00`).getTime();
    const end = new Date(`${to}T00:00:00`).getTime();
    return Math.round((end - start) / 86400000);
  }

  function loadState() {
    const today = dateKey();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Number.isFinite(saved.count)) {
        const isToday = saved.date === today;
        const count = isToday ? saved.count : 0;
        const hadActivity = saved.count > 0;
        const streak = isToday
          ? (Number.isFinite(saved.streak) ? saved.streak : (count > 0 ? 1 : 0))
          : (hadActivity && daysBetween(saved.date, today) === 1 ? (saved.streak || 1) + 1 : 0);
        return {
          date: today,
          count,
          total: Number.isFinite(saved.total) ? saved.total : Math.max(0, saved.count),
          streak,
          achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
          worry: isToday ? (typeof saved.worry === "string" ? saved.worry : "") : "",
          released: isToday ? Boolean(saved.released) : false,
        };
      }
    } catch (_) {
      // Storage is optional; the game still works in private or restricted contexts.
    }
    return { date: today, count: 0, total: 0, streak: 0, achievements: [], worry: "", released: false };
  }

  function loadSoundPreference() {
    try { return localStorage.getItem("i-want-quiet-sound") !== "off"; } catch (_) { return true; }
  }

  function loadSoundType() {
    try { return localStorage.getItem("i-want-quiet-sound-type") || "wood"; } catch (_) { return "wood"; }
  }

  function getVisitorId() {
    try {
      const saved = localStorage.getItem(VISITOR_KEY);
      if (saved) return saved;
      const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
      return id;
    } catch (_) {
      return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* no-op */ }
  }

  function ensureToday() {
    if (state.date === dateKey()) return;
    state = loadState();
    combo = 0;
    updateDisplay();
  }

  function formatNumber(value) { return new Intl.NumberFormat("zh-CN").format(value); }

  function updateDisplay() {
    meritCount.textContent = String(state.count);
    levelName.textContent = state.count >= DAILY_GOAL ? "今日静心 · 已圆满" : "今日静心 · 108 声";
    levelProgress.textContent = `${Math.min(state.count, DAILY_GOAL)} / ${DAILY_GOAL}`;
    levelFill.style.width = `${Math.min(100, (state.count / DAILY_GOAL) * 100)}%`;
    levelNote.textContent = state.count >= DAILY_GOAL
      ? "这一声声，已经把今天好好安放。"
      : `再敲 ${Math.max(0, DAILY_GOAL - state.count)} 声，给烦恼一个“已放下”。`;
    totalCount.textContent = formatNumber(state.total);
    streakCount.textContent = String(state.streak);
    completionRate.textContent = `${Math.min(100, Math.round((state.count / DAILY_GOAL) * 100))}%`;
    shareCard.disabled = state.count < DAILY_GOAL;
    shareCard.textContent = state.count < DAILY_GOAL ? "完成 108 声后生成静心卡" : "保存今日静心卡";
    worryInput.value = state.worry;
    renderAchievements();
    updateRhythm();
  }

  function renderAchievements() {
    const unlocked = achievements.filter((item) => item.unlocked()).length;
    achievementCount.textContent = `${unlocked} / ${achievements.length}`;
    achievementList.innerHTML = achievements.map((item) => {
      const active = item.unlocked();
      return `<span class="achievement${active ? " is-unlocked" : ""}" title="${item.hint}"><b>${item.icon}</b><i>${item.name}</i></span>`;
    }).join("");
  }

  function updateRhythm() {
    comboCount.textContent = `${combo} 连`;
    rhythmStatus.textContent = combo >= 8 ? "回响已满，心也跟着定下来了" : combo >= 3 ? "木鱼正在回响，保持这个节奏" : "连续敲击 3 声，唤醒木鱼回响";
    rhythmDots.forEach((dot, index) => dot.classList.toggle("is-active", combo > index));
  }

  function updateCombo(now) {
    combo = now - lastKnockAt <= 720 ? Math.min(combo + 1, 12) : 1;
    lastKnockAt = now;
    window.clearTimeout(comboResetTimer);
    comboResetTimer = window.setTimeout(() => { combo = 0; updateRhythm(); }, 1000);
    updateRhythm();
    if (combo === 3) showWisdom("木鱼回响已唤醒：不急，跟着自己的节奏来。 ");
  }

  function unlockAchievements() {
    achievements.forEach((item) => {
      const isEarned = item.id === "first"
        ? state.total >= 1
        : item.id === "echo"
          ? combo >= 8
          : item.id === "goal"
            ? state.count >= DAILY_GOAL
            : state.streak >= 3;
      if (isEarned && !state.achievements.includes(item.id)) {
        state.achievements.push(item.id);
        showWisdom(`解锁「${item.name}」：${item.hint}。`);
      }
    });
  }

  function playWoodSound() {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const now = audioContext.currentTime;
      if (soundType === "frog") playFrogSound(now);
      else if (soundType === "chime") playChimeSound(now);
      else playWoodTone(now);
    } catch (_) { /* Audio restrictions must never prevent a knock. */ }
  }

  function tone(frequency, start, duration, type, volume, endFrequency = frequency) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playWoodTone(now) {
    // 三层共鸣加木质瞬态，比单一正弦音更接近实体木鱼，移动端也更清晰。
    playWoodAttack(now);
    tone(590, now, 0.07, "triangle", 0.12, 470);
    tone(305, now, 0.38, "sine", 0.25, 178);
    tone(870, now + 0.012, 0.13, "sine", 0.075, 570);
  }

  function playWoodAttack(now) {
    const duration = 0.035;
    const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * duration), audioContext.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
    }
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1250, now);
    filter.Q.setValueAtTime(1.1, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(audioContext.destination);
    source.start(now);
  }
  function playFrogSound(now) {
    try {
      window.clearTimeout(frogStopTimer);
      frogAudio.pause();
      frogAudio.currentTime = 0;
      frogAudio.volume = 0.55;
      frogAudio.play().catch(() => playFrogFallback(now));
      frogStopTimer = window.setTimeout(() => { frogAudio.pause(); frogAudio.currentTime = 0; }, 560);
    } catch (_) { playFrogFallback(now); }
  }
  function playFrogFallback(now) { tone(180, now, 0.12, "sawtooth", 0.055, 115); tone(147, now + 0.075, 0.14, "sawtooth", 0.045, 105); }
  function playChimeSound(now) { tone(880, now, 0.42, "sine", 0.07, 740); tone(1320, now + 0.035, 0.34, "sine", 0.035, 1100); }

  function showFeedback() {
    const pop = document.createElement("span");
    pop.className = "merit-pop";
    pop.textContent = state.count % 9 === 0 ? "功德 +1 · 回响" : (Math.random() < 0.24 ? feedbacks[Math.floor(Math.random() * feedbacks.length)] : "功德 +1");
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const impactMark = document.createElement("i");
    impactMark.className = "impact-mark";
    feedbackLayer.append(pop, ripple, impactMark);
    for (let i = 0; i < 14; i += 1) {
      const spark = document.createElement("i");
      spark.className = i % 3 === 0 ? "spark ember" : "spark";
      spark.style.setProperty("--angle", `${i * (360 / 14)}deg`);
      feedbackLayer.append(spark);
      window.setTimeout(() => spark.remove(), 700);
    }
    window.setTimeout(() => pop.remove(), 850);
    window.setTimeout(() => ripple.remove(), 680);
    window.setTimeout(() => impactMark.remove(), 400);
  }

  function showWisdom(message) {
    wisdomText.textContent = message;
    wisdomToast.classList.add("is-visible");
    wisdomToast.setAttribute("aria-hidden", "false");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      wisdomToast.classList.remove("is-visible");
      wisdomToast.setAttribute("aria-hidden", "true");
    }, 3800);
  }

  function updateTempleStats(stats) {
    if (!stats) return;
    onlineCount.textContent = formatNumber(stats.online || 0);
    visitorCount.textContent = formatNumber(stats.visitors || 0);
    globalMeritCount.textContent = formatNumber(stats.merits || 0);
    companionHours.textContent = formatNumber(Math.floor((stats.merits || 0) / 108));
    document.querySelectorAll('[data-stat="online"]').forEach((node) => { node.textContent = formatNumber(stats.online || 0); });
    document.querySelectorAll('[data-stat="visitors"]').forEach((node) => { node.textContent = formatNumber(stats.visitors || 0); });
    document.querySelectorAll('[data-stat="merits"]').forEach((node) => { node.textContent = formatNumber(stats.merits || 0); });
    document.querySelectorAll('[data-stat="hours"]').forEach((node) => { node.textContent = formatNumber(Math.floor((stats.merits || 0) / 108)); });
  }

  async function syncTempleStats(action) {
    if (!STATS_ENDPOINT) return;
    try {
      const response = await fetch(STATS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, visitorId }),
        keepalive: action === "knock",
      });
      if (!response.ok) return;
      const result = await response.json();
      updateTempleStats(result);
    } catch (_) {
      // A temporary network failure does not affect the local game experience.
    }
  }

  function releaseWorry() {
    if (state.released) return;
    state.released = true;
    const worry = state.worry.trim();
    releaseText.textContent = worry ? `“${worry}” 已放下。愿你今晚睡个好觉。` : "愿此刻的心事，随木鱼声慢慢远去。";
    state.worry = "";
    saveState();
    worryInput.value = "";
    releaseModal.hidden = false;
    releaseClose.focus();
  }

  function knock() {
    ensureToday();
    const now = performance.now();
    updateCombo(now);
    state.count += 1;
    state.total += 1;
    if (state.count === 1 && state.streak === 0) state.streak = 1;
    unlockAchievements();
    saveState();
    updateDisplay();
    syncTempleStats("knock");
    showFeedback();
    playWoodSound();
    if (wisdoms.has(state.count)) showWisdom(wisdoms.get(state.count));
    if (state.count === DAILY_GOAL) window.setTimeout(releaseWorry, 680);
    fish.classList.remove("is-knocking");
    void fish.offsetWidth;
    fish.classList.add("is-knocking");
    stage.classList.remove("is-impact");
    void stage.offsetWidth;
    stage.classList.add("is-impact");
    gameCard.classList.remove("is-resonating");
    void gameCard.offsetWidth;
    gameCard.classList.add("is-resonating");
  }

  function updateSoundButton() {
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundLabel.textContent = soundEnabled ? "音效已开启" : "音效已静音";
  }

  function updateTheme() {
    const hour = new Date().getHours();
    document.body.classList.toggle("night-mode", hour >= 19 || hour < 6);
  }

  function saveShareCard() {
    if (state.count < DAILY_GOAL) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, "#fff1c9");
    gradient.addColorStop(1, "#d97942");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(104, 48, 24, .32)";
    context.lineWidth = 4;
    context.strokeRect(52, 52, 976, 1246);
    context.fillStyle = "#6b2d1b";
    context.textAlign = "center";
    context.font = "52px serif";
    context.fillText("我 想 静 静", 540, 190);
    context.font = "30px sans-serif";
    context.fillText(dateKey().replaceAll("-", " · ") + "  今日静心记录", 540, 250);
    context.fillStyle = "#9d3e20";
    context.beginPath(); context.ellipse(540, 560, 280, 170, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#cf6b32";
    context.beginPath(); context.ellipse(540, 520, 245, 135, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#69291a";
    context.beginPath(); context.ellipse(540, 565, 72, 30, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#fff1c9";
    context.font = "bold 116px serif";
    context.fillText("108", 540, 840);
    context.font = "38px sans-serif";
    context.fillText("今日功德 · 已圆满", 540, 905);
    context.font = "30px sans-serif";
    context.fillText(`累计 ${formatNumber(state.total)} 声  ·  坚持 ${state.streak} 天`, 540, 1005);
    context.font = "28px serif";
    context.fillText("愿你所念皆安，所行皆坦。", 540, 1135);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `我想静静-${dateKey()}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  fish.addEventListener("click", knock);
  document.addEventListener("dblclick", (event) => {
    if (window.matchMedia("(max-width: 700px)").matches) event.preventDefault();
  }, { passive: false });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isControl = target instanceof HTMLElement && (target.closest("button, input, textarea, select, a") || target.isContentEditable);
    if (isControl || (event.key !== " " && event.key !== "Enter")) return;
    event.preventDefault();
    knock();
  });
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    try { localStorage.setItem("i-want-quiet-sound", soundEnabled ? "on" : "off"); } catch (_) { /* no-op */ }
    updateSoundButton();
  });
  soundSelect.value = soundType;
  soundSelect.addEventListener("change", () => {
    soundType = soundSelect.value;
    try { localStorage.setItem("i-want-quiet-sound-type", soundType); } catch (_) { /* no-op */ }
  });
  photoInput.addEventListener("change", () => {
    const [file] = photoInput.files;
    if (!file) return;
    if (!file.type.startsWith("image/")) { photoTip.textContent = "请选择 PNG、JPG、WebP 或 GIF 图片。"; return; }
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(file);
    photoOverlay.src = photoUrl;
    photoFrame.classList.add("is-visible");
    photoClear.hidden = false;
    photoTip.textContent = "照片已融入木鱼，轻敲一下，把烦恼敲散。";
  });
  photoClear.addEventListener("click", () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = undefined;
    photoOverlay.removeAttribute("src");
    photoFrame.classList.remove("is-visible");
    photoClear.hidden = true;
    photoInput.value = "";
    photoTip.textContent = "图片仅在本次浏览器会话使用，不上传。";
  });
  worryInput.addEventListener("input", () => { state.worry = worryInput.value; saveState(); });
  releaseClose.addEventListener("click", () => { releaseModal.hidden = true; fish.focus(); });
  shareCard.addEventListener("click", saveShareCard);
  morePlay.addEventListener("toggle", () => {
    gameCard.classList.toggle("is-more-open", morePlay.open);
  });
  document.querySelectorAll("[data-panel]").forEach((trigger) => trigger.addEventListener("click", () => {
    document.querySelectorAll(".more-panel").forEach((panel) => { panel.hidden = panel.id !== trigger.dataset.panel; });
    document.querySelector(".feature-list").hidden = true;
  }));
  document.querySelectorAll(".panel-back").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".more-panel").forEach((panel) => { panel.hidden = true; });
    document.querySelector(".feature-list").hidden = false;
  }));
  document.querySelector(".sheet-close").addEventListener("click", () => { morePlay.open = false; });

  updateTheme();
  updateDisplay();
  updateSoundButton();
  syncTempleStats("visit");
  window.setInterval(() => syncTempleStats("heartbeat"), 30000);
  window.setInterval(() => syncTempleStats("stats"), 15000);
  window.setInterval(updateTheme, 60000);
})();
