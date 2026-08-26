const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const wishText = document.getElementById("wish-text");
const wishButtons = document.querySelectorAll(".wish-balloon");
const toProposalWrap = document.getElementById("to-proposal-wrap");
const proposalPanel = document.getElementById("proposal-panel");
const answerStage = document.getElementById("answer-stage");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const accepted = document.getElementById("accepted");

const wishes = [
  "Go be a great artist — no shame in that dream. Friends and family have your back, and honestly? I’m already saving you the #1 spot in my Spotify Wrapped.",
  "And please — no more getting sick, especially that throat of yours. It’s got bigger plans than coughing this year. Haha.",
  "And just a regular one — you deserve a year that treats you as kindly as you treat everyone else.",
];

const colors = ["#d4a5a5", "#c9dce8", "#e8d4c8", "#c9848a", "#b7c9d6", "#ead9c8"];
const pieces = [];
let width = 0;
let height = 0;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function spawnBurst(count = 70, originX = width / 2, originY = height * 0.3) {
  if (reducedMotion) return;

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.8 + Math.random() * 5.5;
    pieces.push({
      x: originX + (Math.random() - 0.5) * 30,
      y: originY + (Math.random() - 0.5) * 16,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.22,
      life: 110 + Math.random() * 40,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    });
  }
}

function spawnRain(count = 16) {
  if (reducedMotion) return;

  for (let i = 0; i < count; i += 1) {
    pieces.push({
      x: Math.random() * width,
      y: -20 - Math.random() * height * 0.25,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.9 + Math.random() * 1.4,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.15,
      life: 200 + Math.random() * 70,
      shape: Math.random() > 0.45 ? "rect" : "circle",
    });
  }
}

function drawPiece(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = Math.min(1, p.life / 40);
  ctx.fillStyle = p.color;
  if (p.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
  }
  ctx.restore();
}

function tick() {
  ctx.clearRect(0, 0, width, height);

  for (let i = pieces.length - 1; i >= 0; i -= 1) {
    const p = pieces[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.vx *= 0.996;
    p.rotation += p.spin;
    p.life -= 1;
    drawPiece(p);

    if (p.life <= 0 || p.y > height + 40) {
      pieces.splice(i, 1);
    }
  }

  requestAnimationFrame(tick);
}

function revealWish(index, button) {
  if (button.classList.contains("burst")) return;

  button.classList.add("burst");
  const rect = button.getBoundingClientRect();
  spawnBurst(45, rect.left + rect.width / 2, rect.top + 36);

  wishText.classList.add("swap");
  window.setTimeout(() => {
    wishText.textContent = wishes[index];
    wishText.classList.remove("swap");
  }, 180);

  const allPopped = [...wishButtons].every((btn) => btn.classList.contains("burst"));
  if (allPopped) {
    toProposalWrap.classList.add("is-visible");
    window.setTimeout(() => spawnBurst(90, width / 2, height * 0.4), 250);
  }
}

wishButtons.forEach((button) => {
  button.addEventListener("click", () => {
    revealWish(Number(button.dataset.wish), button);
  });
});

let yesScale = 1;
let noEscapeLocked = false;
let lastNoX = null;
let lastNoY = null;
const recentSpots = [];

function placeNoButton(x, y) {
  noBtn.style.setProperty("--no-x", `${x}px`);
  noBtn.style.setProperty("--no-y", `${y}px`);
  lastNoX = x;
  lastNoY = y;
  recentSpots.push({ x, y });
  if (recentSpots.length > 6) recentSpots.shift();
}

function growYesButton() {
  if (yesScale >= 2.5) return;
  yesScale = Math.min(yesScale + 0.2, 2.5);
  yesBtn.style.transition = "none";
  yesBtn.style.setProperty("--yes-scale", String(yesScale));
  const baseHeight = window.matchMedia("(max-width: 720px)").matches ? 260 : 280;
  answerStage.style.height = `${baseHeight + (yesScale - 1) * 100}px`;
  void yesBtn.offsetWidth;
  requestAnimationFrame(() => {
    yesBtn.style.transition = "";
  });
}

function getYesSafeZone(stage) {
  const yes = yesBtn.getBoundingClientRect();
  const clear = 52 + yesScale * 18;

  return {
    left: yes.left - stage.left - clear,
    top: yes.top - stage.top - clear,
    right: yes.right - stage.left + clear,
    bottom: yes.bottom - stage.top + clear,
  };
}

function isAwayFromYes(x, y, btnW, btnH, zone) {
  return (
    x + btnW <= zone.left ||
    x >= zone.right ||
    y + btnH <= zone.top ||
    y >= zone.bottom
  );
}

function wasRecentlyUsed(x, y) {
  return recentSpots.some((spot) => Math.hypot(spot.x - x, spot.y - y) < 70);
}

function collectSafeSpots(stage, btnW, btnH, zone, pad) {
  const maxX = Math.max(pad, stage.width - btnW - pad);
  const maxY = Math.max(pad, stage.height - btnH - pad);
  const spots = [];

  // Scatter across the whole play area for variety
  for (let i = 0; i < 80; i += 1) {
    const x = pad + Math.random() * Math.max(0, maxX - pad);
    const y = pad + Math.random() * Math.max(0, maxY - pad);
    if (isAwayFromYes(x, y, btnW, btnH, zone) && !wasRecentlyUsed(x, y)) {
      spots.push({ x, y });
    }
  }

  // Extra samples in different bands: top, bottom, left, right, mid
  const bands = [
    () => ({ x: pad + Math.random() * Math.max(0, maxX - pad), y: pad + Math.random() * Math.max(20, maxY * 0.28) }),
    () => ({ x: pad + Math.random() * Math.max(0, maxX - pad), y: maxY * 0.55 + Math.random() * Math.max(20, maxY * 0.4) }),
    () => ({ x: pad + Math.random() * Math.max(20, maxX * 0.3), y: pad + Math.random() * Math.max(0, maxY - pad) }),
    () => ({ x: maxX * 0.55 + Math.random() * Math.max(20, maxX * 0.4), y: pad + Math.random() * Math.max(0, maxY - pad) }),
    () => ({ x: maxX * 0.25 + Math.random() * Math.max(20, maxX * 0.5), y: maxY * 0.2 + Math.random() * Math.max(20, maxY * 0.55) }),
  ];

  bands.forEach((make) => {
    for (let i = 0; i < 12; i += 1) {
      const spot = make();
      const x = Math.min(maxX, Math.max(pad, spot.x));
      const y = Math.min(maxY, Math.max(pad, spot.y));
      if (isAwayFromYes(x, y, btnW, btnH, zone) && !wasRecentlyUsed(x, y)) {
        spots.push({ x, y });
      }
    }
  });

  return spots;
}

function pickVariedSpot(spots, stage, btnW, btnH, clientX, clientY) {
  const ranked = spots
    .map((spot) => {
      const cx = stage.left + spot.x + btnW / 2;
      const cy = stage.top + spot.y + btnH / 2;
      const fromCursor = Math.hypot(cx - clientX, cy - clientY);
      const fromLast =
        lastNoX == null ? 160 : Math.hypot(spot.x - lastNoX, spot.y - lastNoY);
      return { spot, fromCursor, fromLast };
    })
    // Prefer smooth mid-range hops, not huge teleports
    .filter(
      (item) =>
        item.fromCursor > 70 &&
        item.fromLast > 50 &&
        item.fromLast < 240
    )
    .sort((a, b) => Math.abs(a.fromLast - 140) - Math.abs(b.fromLast - 140));

  const pool = ranked.length
    ? ranked
    : spots
        .map((spot) => {
          const fromLast =
            lastNoX == null ? 160 : Math.hypot(spot.x - lastNoX, spot.y - lastNoY);
          return { spot, fromLast };
        })
        .sort((a, b) => a.fromLast - b.fromLast);

  const top = pool.slice(0, Math.min(10, pool.length));
  return top[Math.floor(Math.random() * top.length)].spot;
}

function moveNoAway(clientX, clientY, shouldGrow = true) {
  if (shouldGrow) growYesButton();

  const stage = answerStage.getBoundingClientRect();
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;
  const pad = 10;
  const zone = getYesSafeZone(stage);
  let spots = collectSafeSpots(stage, btnW, btnH, zone, pad);

  if (!spots.length) {
    for (let i = 0; i < 80; i += 1) {
      const x = pad + Math.random() * Math.max(0, stage.width - btnW - pad * 2);
      const y = pad + Math.random() * Math.max(0, stage.height - btnH - pad * 2);
      if (isAwayFromYes(x, y, btnW, btnH, zone)) spots.push({ x, y });
    }
  }

  if (!spots.length) return;

  const pick = pickVariedSpot(spots, stage, btnW, btnH, clientX, clientY);
  placeNoButton(pick.x, pick.y);
}

function initNoButton() {
  yesScale = 1;
  lastNoX = null;
  lastNoY = null;
  recentSpots.length = 0;
  yesBtn.style.setProperty("--yes-scale", "1");
  answerStage.style.height = "";
  const stage = answerStage.getBoundingClientRect();
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;
  const styles = getComputedStyle(answerStage);
  const gap = Number.parseFloat(styles.getPropertyValue("--pair-gap")) || 44;
  noBtn.style.transition = "none";
  placeNoButton(stage.width / 2 + gap / 2, (stage.height - btnH) / 2);
  void noBtn.offsetWidth;
  noBtn.style.transition = "";
}

function onNoEscape(event) {
  event.preventDefault();
  if (noEscapeLocked || proposalPanel.classList.contains("done")) return;
  noEscapeLocked = true;
  const point = event.touches?.[0] || event;
  moveNoAway(point.clientX, point.clientY, true);
  window.setTimeout(() => {
    noEscapeLocked = false;
  }, 320);
}

function onNoChase(event) {
  if (proposalPanel.classList.contains("done") || noEscapeLocked) return;
  const point = event.touches?.[0] || event;
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dist = Math.hypot(point.clientX - cx, point.clientY - cy);
  const isPhone = window.matchMedia("(max-width: 720px)").matches;
  const near = isPhone ? 110 : 85;

  if (dist < near) {
    noEscapeLocked = true;
    moveNoAway(point.clientX, point.clientY, true);
    window.setTimeout(() => {
      noEscapeLocked = false;
    }, isPhone ? 280 : 320);
  }
}

noBtn.addEventListener("mouseenter", onNoEscape);
noBtn.addEventListener("pointerdown", onNoEscape);
noBtn.addEventListener("touchstart", onNoEscape, { passive: false });
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
});

answerStage.addEventListener("mousemove", onNoChase);
answerStage.addEventListener("touchmove", onNoChase, { passive: false });

// Phone-friendly: also chase when finger moves across the proposal panel
proposalPanel.addEventListener("touchmove", (event) => {
  if (proposalPanel.classList.contains("done")) return;
  onNoChase(event);
}, { passive: false });

yesBtn.addEventListener("click", () => {
  proposalPanel.classList.add("done");
  accepted.hidden = false;
  noBtn.style.display = "none";
  const rect = proposalPanel.getBoundingClientRect();
  spawnBurst(120, rect.left + rect.width / 2, rect.top + rect.height * 0.35);
});

yesBtn.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});

window.addEventListener("resize", () => {
  resize();
  if (!proposalPanel.classList.contains("done")) {
    initNoButton();
  }
});

const isPhone = () => window.matchMedia("(max-width: 720px)").matches;

resize();
initNoButton();
spawnBurst(isPhone() ? 40 : 70);
spawnRain(isPhone() ? 10 : 18);
window.setInterval(() => spawnRain(isPhone() ? 4 : 6), 2800);
tick();

// Background music volume dock (same style as before)
const music = document.getElementById("bg-music");
const musicMute = document.getElementById("music-mute");
const musicVolume = document.getElementById("music-volume");
const musicLevelLabel = document.getElementById("music-level");
let musicLevel = 0.6;
let prevMusicLevel = 0.6;

function iconLevel(level) {
  if (level === 0) return "off";
  if (level < 0.45) return "low";
  return "high";
}

function applyMusicVolume(level) {
  musicLevel = level;
  const percent = Math.round(level * 100);
  music.volume = level;
  musicVolume.value = String(percent);
  musicVolume.style.setProperty("--vol", `${percent}%`);
  if (musicLevelLabel) musicLevelLabel.textContent = String(percent);
  musicMute.dataset.level = iconLevel(level);
  musicMute.setAttribute("aria-label", level === 0 ? "Unmute background music" : "Mute background music");
  musicMute.title = level === 0 ? "Unmute" : "Mute";
}

function ensureMusicPlaying() {
  if (music.paused) music.play().catch(() => {});
}

applyMusicVolume(0.6);

window.addEventListener("pointerdown", () => ensureMusicPlaying(), { once: true });
window.addEventListener("keydown", () => ensureMusicPlaying(), { once: true });

musicVolume.addEventListener("input", () => {
  const next = Number(musicVolume.value) / 100;
  if (next > 0) prevMusicLevel = next;
  applyMusicVolume(next);
  if (next > 0) ensureMusicPlaying();
});

musicMute.addEventListener("click", () => {
  if (musicLevel > 0) {
    prevMusicLevel = musicLevel;
    applyMusicVolume(0);
  } else {
    applyMusicVolume(prevMusicLevel || 0.6);
    ensureMusicPlaying();
  }
});
