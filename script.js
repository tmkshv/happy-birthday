const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const wishText = document.getElementById("wish-text");
const wishButtons = document.querySelectorAll(".wish-item");
const toProposalWrap = document.getElementById("to-proposal-wrap");
const proposalPanel = document.getElementById("proposal-panel");
const answerStage = document.getElementById("answer-stage");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const accepted = document.getElementById("accepted");

const wishes = [
  "Go be a great artist — no shame in that dream. Friends and family have your back, and honestly? I’m already saving you the #1 spot in my Spotify Wrapped.",
  "And please — no more getting sick this year, okay? Especially that throat. We’ve got better things to do than rest and tea. Haha.",
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

function getStageBounds() {
  return {
    width: answerStage.clientWidth,
    height: answerStage.clientHeight,
  };
}

function getNoButtonSize() {
  return {
    width: Math.ceil(noBtn.offsetWidth) || 104,
    height: Math.ceil(noBtn.offsetHeight) || 48,
  };
}

function clampNoPosition(x, y) {
  const stage = getStageBounds();
  const { width: btnW, height: btnH } = getNoButtonSize();
  const pad = 10;
  const maxX = Math.max(0, Math.floor(stage.width - btnW - pad));
  const maxY = Math.max(0, Math.floor(stage.height - btnH - pad));
  const minX = Math.min(pad, maxX);
  const minY = Math.min(pad, maxY);

  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
    btnW,
    btnH,
    pad,
    stage,
    maxX,
    maxY,
  };
}

function placeNoButton(x, y) {
  const { x: clampedX, y: clampedY } = clampNoPosition(x, y);

  noBtn.style.setProperty("--no-x", `${clampedX}px`);
  noBtn.style.setProperty("--no-y", `${clampedY}px`);
  lastNoX = clampedX;
  lastNoY = clampedY;
  recentSpots.push({ x: clampedX, y: clampedY });
  if (recentSpots.length > 6) recentSpots.shift();
}

function isPhone() {
  // Only treat real phones/touch-narrow screens as phone — not desktop windows
  return window.matchMedia("(max-width: 720px) and (pointer: coarse)").matches;
}

function availableStageWidth() {
  const styles = window.getComputedStyle(proposalPanel);
  const padX =
    (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
  return Math.max(200, Math.floor(proposalPanel.clientWidth - padX));
}

function applyYesScale(scale) {
  yesScale = scale;
  yesBtn.style.setProperty("--yes-scale", String(yesScale));
  yesBtn.style.transform = `translate(-100%, -50%) scale(${yesScale})`;
  yesBtn.style.fontSize = `${1 + (yesScale - 1) * 0.32}rem`;
  yesBtn.style.minWidth = `${6.5 + (yesScale - 1) * 1.8}rem`;
  yesBtn.style.padding = `${0.9 + (yesScale - 1) * 0.22}rem ${1.6 + (yesScale - 1) * 0.35}rem`;
  const avail = availableStageWidth();
  answerStage.style.width = `${Math.min(avail, 560 + (yesScale - 1) * 55)}px`;
  answerStage.style.height = `${Math.min(360, 300 + (yesScale - 1) * 55)}px`;
  void yesBtn.offsetWidth;
}

function yesFitsInStage(pad = 12) {
  const stage = answerStage.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();
  return (
    yes.left >= stage.left + pad &&
    yes.right <= stage.right - pad &&
    yes.top >= stage.top + pad &&
    yes.bottom <= stage.bottom - pad
  );
}

function growYesButton() {
  if (isPhone()) return;
  const maxScale = 1.75;
  if (yesScale >= maxScale) return;

  const next = Math.min(yesScale + 0.16, maxScale);
  applyYesScale(next);

  // Dial back if Yes would leave the white stage
  while (yesScale > 1 && !yesFitsInStage()) {
    applyYesScale(Math.max(1, yesScale - 0.08));
  }
}

function getYesSafeZone(stageRect) {
  // Measure after layout so scaled Yes size is accurate
  void yesBtn.offsetWidth;
  const yes = yesBtn.getBoundingClientRect();
  const stage = stageRect || answerStage.getBoundingClientRect();
  const clear = Math.min(36, 18 + yesScale * 10);

  return {
    left: yes.left - stage.left - clear,
    top: yes.top - stage.top - clear,
    right: yes.right - stage.left + clear,
    bottom: yes.bottom - stage.top + clear,
  };
}

function rectsOverlap(ax, ay, aw, ah, zone) {
  return !(
    ax + aw <= zone.left ||
    ax >= zone.right ||
    ay + ah <= zone.top ||
    ay >= zone.bottom
  );
}

function isValidNoSpot(x, y, btnW, btnH, stage, zone, pad) {
  const maxX = Math.floor(stage.width - btnW - pad);
  const maxY = Math.floor(stage.height - btnH - pad);
  if (x < pad || y < pad || x > maxX || y > maxY) return false;
  if (x < 0 || y < 0) return false;
  if (rectsOverlap(x, y, btnW, btnH, zone)) return false;
  return true;
}

function wasRecentlyUsed(x, y) {
  return recentSpots.some((spot) => Math.hypot(spot.x - x, spot.y - y) < 55);
}

function collectSafeSpots(stage, btnW, btnH, zone, pad) {
  const maxX = Math.max(0, Math.floor(stage.width - btnW - pad));
  const maxY = Math.max(0, Math.floor(stage.height - btnH - pad));
  const minX = Math.min(pad, maxX);
  const minY = Math.min(pad, maxY);
  const spots = [];
  const rangeX = Math.max(0, maxX - minX);
  const rangeY = Math.max(0, maxY - minY);

  for (let i = 0; i < 120; i += 1) {
    const x = minX + Math.random() * rangeX;
    const y = minY + Math.random() * rangeY;
    if (isValidNoSpot(x, y, btnW, btnH, stage, zone, pad) && !wasRecentlyUsed(x, y)) {
      spots.push({ x, y });
    }
  }

  const edges = [
    [minX, minY],
    [maxX, minY],
    [minX, maxY],
    [maxX, maxY],
    [minX, minY + rangeY * 0.5],
    [maxX, minY + rangeY * 0.5],
    [minX + rangeX * 0.5, minY],
    [minX + rangeX * 0.5, maxY],
    [minX + rangeX * 0.25, minY],
    [minX + rangeX * 0.75, minY],
    [minX + rangeX * 0.25, maxY],
    [minX + rangeX * 0.75, maxY],
    [minX, minY + rangeY * 0.25],
    [minX, minY + rangeY * 0.75],
    [maxX, minY + rangeY * 0.25],
    [maxX, minY + rangeY * 0.75],
  ];

  edges.forEach(([x, y]) => {
    if (isValidNoSpot(x, y, btnW, btnH, stage, zone, pad)) {
      spots.push({ x, y });
    }
  });

  return spots;
}

function pickVariedSpot(spots, stageRect, btnW, btnH, clientX, clientY) {
  const ranked = spots
    .map((spot) => {
      const cx = stageRect.left + spot.x + btnW / 2;
      const cy = stageRect.top + spot.y + btnH / 2;
      const fromCursor = Math.hypot(cx - clientX, cy - clientY);
      const fromLast =
        lastNoX == null ? 180 : Math.hypot(spot.x - lastNoX, spot.y - lastNoY);
      return { spot, fromCursor, fromLast };
    })
    .filter((item) => item.fromCursor > 70 && item.fromLast > 45)
    .sort((a, b) => b.fromCursor - a.fromCursor || b.fromLast - a.fromLast);

  const pool = ranked.length ? ranked : spots.map((spot) => ({ spot }));
  const top = pool.slice(0, Math.min(14, pool.length));
  return top[Math.floor(Math.random() * top.length)].spot;
}

function moveNoAway(clientX, clientY, shouldGrow = true) {
  if (shouldGrow && !isPhone()) growYesButton();

  // Settle layout after Yes/stage resize before measuring
  void answerStage.offsetWidth;

  const stageSize = getStageBounds();
  const stageRect = answerStage.getBoundingClientRect();
  const { width: btnW, height: btnH } = getNoButtonSize();
  const pad = 10;
  const zone = getYesSafeZone(stageRect);
  let spots = collectSafeSpots(stageSize, btnW, btnH, zone, pad);

  if (!spots.length) {
    const maxX = Math.max(0, Math.floor(stageSize.width - btnW - pad));
    const maxY = Math.max(0, Math.floor(stageSize.height - btnH - pad));
    const minX = Math.min(pad, maxX);
    const minY = Math.min(pad, maxY);
    for (let i = 0; i < 150; i += 1) {
      const x = minX + Math.random() * Math.max(0, maxX - minX);
      const y = minY + Math.random() * Math.max(0, maxY - minY);
      if (isValidNoSpot(x, y, btnW, btnH, stageSize, zone, pad)) spots.push({ x, y });
    }
  }

  if (!spots.length) {
    // Prefer edge midpoints that still clear Yes — never leave the stage
    const maxX = Math.max(0, Math.floor(stageSize.width - btnW - pad));
    const maxY = Math.max(0, Math.floor(stageSize.height - btnH - pad));
    const minX = Math.min(pad, maxX);
    const minY = Math.min(pad, maxY);
    const fallbacks = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY },
      { x: minX, y: (minY + maxY) / 2 },
      { x: maxX, y: (minY + maxY) / 2 },
      { x: (minX + maxX) / 2, y: minY },
      { x: (minX + maxX) / 2, y: maxY },
    ].filter((spot) => isValidNoSpot(spot.x, spot.y, btnW, btnH, stageSize, zone, pad));

    if (fallbacks.length) {
      fallbacks.sort((a, b) => {
        const da = Math.hypot(stageRect.left + a.x - clientX, stageRect.top + a.y - clientY);
        const db = Math.hypot(stageRect.left + b.x - clientX, stageRect.top + b.y - clientY);
        return db - da;
      });
      placeNoButton(fallbacks[0].x, fallbacks[0].y);
      return;
    }

    // Absolute last resort: keep previous valid spot, still clamped inside
    if (lastNoX != null) {
      placeNoButton(lastNoX, lastNoY);
    } else {
      placeNoButton(maxX, minY);
    }
    return;
  }

  const pick = pickVariedSpot(spots, stageRect, btnW, btnH, clientX, clientY);
  placeNoButton(pick.x, pick.y);
}

function initNoButton() {
  yesScale = 1;
  lastNoX = null;
  lastNoY = null;
  recentSpots.length = 0;
  yesBtn.style.setProperty("--yes-scale", "1");
  yesBtn.style.transform = "";
  yesBtn.style.fontSize = "";
  yesBtn.style.minWidth = "";
  yesBtn.style.padding = "";
  answerStage.style.width = "";
  answerStage.style.height = "";
  void answerStage.offsetWidth;

  // Phones: static Yes/No — no chase (no cursor)
  if (isPhone()) {
    noBtn.style.transition = "none";
    noBtn.style.removeProperty("--no-x");
    noBtn.style.removeProperty("--no-y");
    noBtn.style.transform = "";
    void noBtn.offsetWidth;
    noBtn.style.transition = "";
    return;
  }

  const stage = getStageBounds();
  const { height: btnH } = getNoButtonSize();
  noBtn.style.transition = "none";
  placeNoButton(stage.width / 2 + 16, (stage.height - btnH) / 2);
  void noBtn.offsetWidth;
  noBtn.style.transition = "";
}

function onNoEscape(event) {
  if (isPhone()) return;
  event.preventDefault();
  if (noEscapeLocked || proposalPanel.classList.contains("done")) return;
  noEscapeLocked = true;
  const point = event.touches?.[0] || event;
  moveNoAway(point.clientX, point.clientY, true);
  window.setTimeout(() => {
    noEscapeLocked = false;
  }, 180);
}

function onNoChase(event) {
  if (isPhone()) return;
  if (proposalPanel.classList.contains("done") || noEscapeLocked) return;
  const point = event.touches?.[0] || event;
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dist = Math.hypot(point.clientX - cx, point.clientY - cy);

  if (dist < 100) {
    noEscapeLocked = true;
    moveNoAway(point.clientX, point.clientY, true);
    window.setTimeout(() => {
      noEscapeLocked = false;
    }, 160);
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

proposalPanel.addEventListener("touchmove", (event) => {
  if (isPhone() || proposalPanel.classList.contains("done")) return;
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
  // Don't reset Yes growth mid-game on accidental resize
  if (!proposalPanel.classList.contains("done") && yesScale <= 1) {
    initNoButton();
  }
});

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
