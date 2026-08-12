(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const ui = {
    frame: document.querySelector("#gameFrame"),
    close: document.querySelector("#gameClose"),
    roundScore: document.querySelector("#roundScore"),
    toast: document.querySelector("#gameToast"),
    result: document.querySelector("#holeResult"),
    resultKicker: document.querySelector("#resultKicker"),
    resultName: document.querySelector("#resultName"),
    resultDetail: document.querySelector("#resultDetail"),
    nextHole: document.querySelector("#nextHole"),
    clubPrev: document.querySelector("#clubPrev"),
    clubNext: document.querySelector("#clubNext"),
    clubName: document.querySelector("#clubName"),
    clubDistance: document.querySelector("#clubDistance"),
    aimLeft: document.querySelector("#aimLeft"),
    aimRight: document.querySelector("#aimRight"),
    aimValue: document.querySelector("#aimValue"),
    swing: document.querySelector("#swingButton"),
    swingStep: document.querySelector("#swingStep"),
    swingLabel: document.querySelector("#swingLabel"),
    meterLabel: document.querySelector("#meterLabel"),
    meterReadout: document.querySelector("#meterReadout"),
    meterHint: document.querySelector("#meterHint"),
    meterNeedle: document.querySelector("#meterNeedle"),
    powerWindow: document.querySelector("#powerWindow"),
    invite: document.querySelector("#gameInvite"),
    inviteAccept: document.querySelector("#inviteAccept"),
    inviteLater: document.querySelector("#inviteLater"),
    inviteClose: document.querySelector("#inviteClose")
  };

  const COLORS = {
    ink: "#15120e",
    paper: "#f1dfc0",
    paperLight: "#fff7e7",
    rust: "#c65a22",
    rustDark: "#8a4f23",
    forest: "#173b24",
    forestDark: "#102b1a",
    fairway: "#637d45",
    fairwayLight: "#708a50",
    rough: "#36572f",
    roughDark: "#2b4827",
    green: "#829b5b",
    greenLight: "#93a96d",
    sand: "#c6a86e",
    water: "#335f68",
    waterLight: "#5f8585",
    sky: "#9db6bf",
    skyLight: "#e1d9c2",
    gold: "#e5a51d",
    tan: "#b89463"
  };

  const clubs = [
    { id: "driver", name: "Driver", carry: 285, roll: 18, loft: .62, teeOnly: true },
    { id: "3w", name: "3 Wood", carry: 245, roll: 14, loft: .7 },
    { id: "5w", name: "5 Wood", carry: 220, roll: 10, loft: .8 },
    { id: "3i", name: "3 Iron", carry: 205, roll: 8, loft: .86 },
    { id: "5i", name: "5 Iron", carry: 180, roll: 7, loft: .95 },
    { id: "7i", name: "7 Iron", carry: 155, roll: 5, loft: 1.05 },
    { id: "9i", name: "9 Iron", carry: 125, roll: 3, loft: 1.18 },
    { id: "pw", name: "Pitching Wedge", shortName: "PW", carry: 105, roll: 2, loft: 1.35 },
    { id: "sw", name: "Sand Wedge", shortName: "SW", carry: 75, roll: 1, loft: 1.55 },
    { id: "putter", name: "Putter", carry: 45, roll: 0, loft: 0, unit: "ft" }
  ];

  const holes = [
    {
      no: 11,
      name: "White Dogwood",
      par: 4,
      length: 520,
      path: [[0, 0], [125, 3], [255, -8], [380, -13], [455, -17], [520, -22]],
      wind: { speed: 7, lateral: -1, along: .2, label: "7 MPH ↙" },
      hazards: [
        { type: "water", y1: 420, y2: 542, x1: -76, x2: -37 },
        { type: "sand", y1: 474, y2: 523, x1: -4, x2: 24 }
      ]
    },
    {
      no: 12,
      name: "Golden Bell",
      par: 3,
      length: 155,
      path: [[0, 0], [80, 1], [155, 2]],
      wind: { speed: 5, lateral: 1, along: -.1, label: "5 MPH ↗" },
      hazards: [
        { type: "water", y1: 76, y2: 96, x1: -82, x2: 82 },
        { type: "sand", y1: 124, y2: 157, x1: -40, x2: -21 },
        { type: "sand", y1: 132, y2: 162, x1: 24, x2: 43 }
      ]
    },
    {
      no: 13,
      name: "Azalea",
      par: 5,
      length: 545,
      path: [[0, 0], [150, -5], [280, -26], [390, -39], [470, -34], [545, -23]],
      wind: { speed: 9, lateral: -1, along: -.15, label: "9 MPH ←" },
      hazards: [
        { type: "water", y1: 242, y2: 492, x1: -82, x2: -55 },
        { type: "sand", y1: 500, y2: 547, x1: 1, x2: 29 },
        { type: "sand", y1: 516, y2: 555, x1: -50, x2: -34 }
      ]
    }
  ];

  const mobileQuery = window.matchMedia("(max-width: 820px)");
  let toastTimer;
  let state;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const currentHole = () => holes[state.holeIndex];

  function interpolatePath(path, y) {
    if (y <= path[0][0]) return path[0][1];
    for (let i = 1; i < path.length; i += 1) {
      if (y <= path[i][0]) {
        const [y0, x0] = path[i - 1];
        const [y1, x1] = path[i];
        return mix(x0, x1, (y - y0) / (y1 - y0));
      }
    }
    return path[path.length - 1][1];
  }

  function courseCenter(hole, y) {
    return interpolatePath(hole.path, clamp(y, 0, hole.length));
  }

  function fairwayWidth(hole, y) {
    const progress = clamp(y / hole.length, 0, 1);
    if (progress < .08) return 28;
    if (progress > .9) return 35;
    return 43 + Math.sin(progress * Math.PI * 3) * 4;
  }

  function cupFor(hole) {
    return { x: courseCenter(hole, hole.length), y: hole.length };
  }

  function lieAt(hole, x, y) {
    if (y < -8 || y > hole.length + 28) return "out of bounds";
    const greenX = courseCenter(hole, hole.length);
    const greenDistance = Math.hypot((x - greenX) / 1.15, y - hole.length);

    for (const hazard of hole.hazards) {
      if (y >= hazard.y1 && y <= hazard.y2 && x >= hazard.x1 && x <= hazard.x2) {
        return hazard.type;
      }
    }

    if (greenDistance <= 24) return "green";
    if (greenDistance <= 29) return "fringe";

    const center = courseCenter(hole, y);
    const offset = Math.abs(x - center);
    if (offset <= fairwayWidth(hole, y) / 2) return "fairway";
    if (offset <= 68) return "rough";
    return "out of bounds";
  }

  function lieFactor(lie) {
    return {
      tee: 1,
      fairway: 1,
      fringe: .96,
      rough: .83,
      sand: .72,
      green: 1
    }[lie] || .8;
  }

  function availableClubs() {
    const lie = state.lie;
    if (lie === "green") return clubs.filter(club => club.id === "putter");
    if (lie === "sand") return clubs.filter(club => club.id === "pw" || club.id === "sw");
    if (lie === "fringe") return clubs.filter(club => ["putter", "pw", "sw"].includes(club.id));
    if (lie === "rough") return clubs.filter(club => !club.teeOnly && !["3w", "putter"].includes(club.id));
    if (lie === "fairway") return clubs.filter(club => !club.teeOnly && club.id !== "putter");
    return clubs.filter(club => club.id !== "putter");
  }

  function pinDistanceYards() {
    return distance(state.ball, cupFor(currentHole()));
  }

  function effectiveCarry(club) {
    if (club.unit === "ft") return club.carry / 3;
    return club.carry * lieFactor(state.lie);
  }

  function recommendedPower() {
    const club = state.club;
    const pin = pinDistanceYards();
    if (club.unit === "ft") return clamp((pin * 3 / club.carry) * 100, 18, 100);
    const maxCarry = effectiveCarry(club);
    const expectedRoll = club.roll * (state.lie === "rough" ? .3 : state.lie === "sand" ? .05 : 1);
    const desiredCarry = pin > maxCarry + expectedRoll + 4 ? maxCarry * .96 : Math.max(18, pin - expectedRoll);
    return clamp((desiredCarry / maxCarry) * 100, 18, 100);
  }

  function selectRecommendedClub() {
    const list = availableClubs();
    const pin = pinDistanceYards();
    let best = list[0];
    let bestScore = Infinity;
    for (const club of list) {
      const range = club.unit === "ft" ? club.carry / 3 : effectiveCarry(club) + club.roll;
      let score = Math.abs(range - pin);
      if (range < pin) score += Math.min(85, (pin - range) * .65);
      if (score < bestScore) {
        bestScore = score;
        best = club;
      }
    }
    state.club = best;
  }

  function scoreLabel(value) {
    if (value === 0) return "E";
    return value > 0 ? `+${value}` : String(value);
  }

  function scoreName(value) {
    if (value <= -3) return "Albatross";
    if (value === -2) return "Eagle";
    if (value === -1) return "Birdie";
    if (value === 0) return "Par";
    if (value === 1) return "Bogey";
    if (value === 2) return "Double bogey";
    if (value === 3) return "Triple bogey";
    return `+${value}`;
  }

  function resetRound() {
    state = {
      holeIndex: 0,
      roundToPar: 0,
      completed: [],
      token: (state?.token || 0) + 1
    };
    loadHole();
  }

  function loadHole() {
    const hole = currentHole();
    state.ball = { x: courseCenter(hole, 0), y: 0 };
    state.lastSafe = { ...state.ball };
    state.lie = "tee";
    state.shots = 0;
    state.aimOffset = 0;
    state.phase = "ready";
    state.meter = 0;
    state.powerLocked = null;
    state.impactLocked = null;
    state.camera = { x: state.ball.x, y: state.ball.y - 4 };
    state.flight = null;
    state.pose = 0;
    ui.result.classList.remove("is-open");
    ui.result.setAttribute("aria-hidden", "true");
    selectRecommendedClub();
    updateInterface();
  }

  function formatLie(lie) {
    return lie === "out of bounds" ? "OB" : lie.charAt(0).toUpperCase() + lie.slice(1);
  }

  function setClub(direction) {
    if (state.phase !== "ready") return;
    const list = availableClubs();
    const currentIndex = Math.max(0, list.findIndex(club => club.id === state.club.id));
    state.club = list[(currentIndex + direction + list.length) % list.length];
    state.meter = 0;
    updateInterface();
  }

  function changeAim(direction) {
    if (state.phase !== "ready") return;
    const step = state.club.unit === "ft" ? 2 / 3 : 6;
    const limit = state.club.unit === "ft" ? 3 : 36;
    state.aimOffset = clamp(state.aimOffset + direction * step, -limit, limit);
    updateInterface();
  }

  function aimLabel() {
    if (Math.abs(state.aimOffset) < .1) return "Centre";
    const amount = state.club.unit === "ft" ? `${Math.round(Math.abs(state.aimOffset) * 3)} ft` : `${Math.round(Math.abs(state.aimOffset))} yd`;
    return `${amount} ${state.aimOffset < 0 ? "left" : "right"}`;
  }

  function updateInterface() {
    const power = recommendedPower();
    const club = state.club;
    ui.clubName.textContent = club.shortName || club.name;
    ui.clubName.title = club.name;
    ui.clubDistance.textContent = club.unit === "ft" ? `${club.carry} ft` : `${Math.round(effectiveCarry(club))} yd`;
    ui.aimValue.textContent = aimLabel();
    ui.roundScore.textContent = scoreLabel(state.roundToPar);
    ui.powerWindow.style.left = `${clamp(power - 4, 0, 92)}%`;
    ui.powerWindow.style.width = `${power > 96 ? 100 - (power - 4) : 8}%`;

    const setupLocked = state.phase !== "ready";
    const swingLocked = !["ready", "power", "accuracy"].includes(state.phase);
    ui.clubPrev.disabled = setupLocked;
    ui.clubNext.disabled = setupLocked;
    ui.aimLeft.disabled = setupLocked;
    ui.aimRight.disabled = setupLocked;
    ui.swing.disabled = swingLocked;

    if (state.phase === "ready") {
      ui.swingStep.textContent = "01";
      ui.swingLabel.textContent = "Swing";
      ui.meterLabel.textContent = "Recommended power";
      ui.meterReadout.textContent = `${Math.round(power)}%`;
      ui.meterHint.textContent = "Tap SWING to start the meter";
      setMeterNeedle(0);
    } else if (state.phase === "power") {
      ui.swingStep.textContent = "02";
      ui.swingLabel.textContent = "Set power";
      ui.meterLabel.textContent = "Power";
      ui.meterReadout.textContent = `${Math.round(state.meter)}%`;
      ui.meterHint.textContent = "Stop the needle inside the marked power lines";
    } else if (state.phase === "accuracy") {
      ui.swingStep.textContent = "03";
      ui.swingLabel.textContent = "Impact";
      ui.meterLabel.textContent = "Accuracy";
      ui.meterReadout.textContent = impactReadout(state.meter);
      ui.meterHint.textContent = "Stop between the centre lines — misses curve";
    } else {
      ui.swingStep.textContent = "—";
      ui.swingLabel.textContent = "Watch";
    }
  }

  function setMeterNeedle(value) {
    ui.meterNeedle.style.left = `${clamp(value, 0, 100)}%`;
  }

  function impactReadout(value) {
    const error = value - 50;
    const abs = Math.abs(error);
    if (abs <= 3) return "Perfect";
    if (abs <= 8) return "Pure";
    if (error > 0) return abs <= 18 ? "Push" : "Slice";
    return abs <= 18 ? "Pull" : "Hook";
  }

  function swingAction() {
    const now = performance.now();
    if (state.phase === "ready") {
      state.phase = "power";
      state.meterStarted = now;
      state.meter = 0;
      state.pose = .25;
      updateInterface();
      return;
    }
    if (state.phase === "power") {
      state.powerLocked = state.meter;
      state.phase = "accuracy";
      state.meterStarted = now;
      state.meter = 100;
      state.pose = .7;
      updateInterface();
      return;
    }
    if (state.phase === "accuracy") {
      state.impactLocked = state.meter;
      startShot();
    }
  }

  function deterministicNudge() {
    const seed = (state.holeIndex + 1) * 31 + state.shots * 17;
    return Math.sin(seed * 12.9898) * 1.4;
  }

  function shotPlan() {
    const hole = currentHole();
    const club = state.club;
    const cup = cupFor(hole);
    const start = { ...state.ball };
    const powerFraction = clamp(state.powerLocked / 100, .05, 1.03);
    const impactError = clamp((state.impactLocked - 50) / 50, -1, 1);

    if (club.unit === "ft") {
      const target = { x: cup.x + state.aimOffset, y: cup.y };
      const dx = target.x - start.x;
      const dy = target.y - start.y;
      const length = Math.hypot(dx, dy) || 1;
      const travel = (club.carry * powerFraction) / 3;
      const side = impactError * 2.6;
      const end = {
        x: start.x + (dx / length) * travel + (-dy / length) * side,
        y: start.y + (dy / length) * travel + (dx / length) * side
      };
      const pathMiss = segmentDistance(cup, start, end);
      const holed = pathMiss < .55 && travel >= length - .45 && travel <= length + 1.25;
      return {
        start,
        landing: { ...end },
        end: holed ? cup : end,
        carry: travel,
        roll: 0,
        apex: 0,
        impactError,
        holed,
        total: travel,
        grade: impactReadout(state.impactLocked)
      };
    }

    const carry = club.carry * lieFactor(state.lie) * powerFraction * (1 + hole.wind.along * hole.wind.speed * .0025);
    const rollFactor = state.lie === "rough" ? .28 : state.lie === "sand" ? .05 : 1;
    const roll = club.roll * rollFactor * (.6 + powerFraction * .4);
    const intendedY = clamp(start.y + carry + roll, 0, hole.length + 35);
    const intendedX = courseCenter(hole, intendedY) + state.aimOffset;
    const forward = Math.max(1, intendedY - start.y);
    const directionalRate = (intendedX - start.x) / forward;
    const wayward = impactError * (8 + carry * .12);
    const windMove = hole.wind.lateral * hole.wind.speed * carry * .007;
    const nudge = deterministicNudge();
    const landing = {
      x: start.x + directionalRate * carry + wayward * .84 + windMove + nudge,
      y: start.y + carry
    };
    const end = {
      x: landing.x + directionalRate * roll + wayward * .16,
      y: landing.y + roll
    };

    return {
      start,
      landing,
      end,
      carry,
      roll,
      apex: clamp(carry * .14 * club.loft, 18, 58),
      impactError,
      holed: distance(end, cup) < .45,
      total: carry + roll,
      grade: impactReadout(state.impactLocked)
    };
  }

  function segmentDistance(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy || 1;
    const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
    return Math.hypot(point.x - (start.x + dx * t), point.y - (start.y + dy * t));
  }

  function startShot() {
    const plan = shotPlan();
    state.shots += 1;
    state.phase = "flight";
    state.pose = 1;
    state.flight = {
      ...plan,
      started: performance.now(),
      duration: plan.apex === 0 ? 1100 : clamp(1450 + plan.carry * 2.8, 1550, 2350),
      ball: { ...plan.start, z: 0 },
      trail: []
    };
    ui.swing.disabled = true;
    updateInterface();
  }

  function resolveShot() {
    const hole = currentHole();
    const flight = state.flight;
    if (!flight) return;

    if (flight.holed) {
      state.ball = cupFor(hole);
      finishHole();
      return;
    }

    const lie = lieAt(hole, flight.end.x, flight.end.y);
    if (lie === "water" || lie === "out of bounds") {
      state.shots += 1;
      state.ball = { ...state.lastSafe };
      state.lie = lieAt(hole, state.ball.x, state.ball.y);
      if (state.ball.y === 0) state.lie = "tee";
      showToast(`${lie === "water" ? "Water" : "Out of bounds"} · penalty stroke · drop`);
    } else {
      state.ball = { ...flight.end };
      state.lie = lie;
      state.lastSafe = { ...state.ball };
      const pin = pinDistanceYards();
      if (pin < .55) {
        finishHole();
        return;
      }
      const distanceText = state.club.unit === "ft" ? `${Math.round(flight.total * 3)} ft` : `${Math.round(flight.total)} yd`;
      showToast(`${flight.grade} · ${formatLie(lie)} · ${distanceText}`);
    }

    state.phase = "settling";
    state.camera = { x: state.ball.x, y: state.ball.y - 18 };
    const token = state.token;
    setTimeout(() => {
      if (state.token !== token || state.phase !== "settling") return;
      state.phase = "ready";
      state.camera = { x: state.ball.x, y: state.ball.y - 4 };
      state.aimOffset = 0;
      state.powerLocked = null;
      state.impactLocked = null;
      state.meter = 0;
      state.pose = 0;
      selectRecommendedClub();
      updateInterface();
      canvas.focus({ preventScroll: true });
    }, 1050);
  }

  function finishHole() {
    const hole = currentHole();
    state.phase = "complete";
    const relative = state.shots - hole.par;
    state.roundToPar += relative;
    state.completed.push({ no: hole.no, shots: state.shots, relative });
    state.camera = { x: cupFor(hole).x, y: hole.length - 28 };
    ui.roundScore.textContent = scoreLabel(state.roundToPar);
    ui.resultKicker.textContent = state.holeIndex === holes.length - 1 ? "Amen Corner complete" : `Hole ${hole.no} complete`;
    ui.resultName.textContent = scoreName(relative);
    ui.resultDetail.textContent = `${state.shots} shots · ${scoreLabel(state.roundToPar)} for the round`;
    ui.nextHole.textContent = state.holeIndex === holes.length - 1 ? "Run it back" : "Next hole";
    const token = state.token;
    setTimeout(() => {
      if (state.token !== token || state.phase !== "complete") return;
      ui.result.classList.add("is-open");
      ui.result.setAttribute("aria-hidden", "false");
      ui.nextHole.focus({ preventScroll: true });
    }, 650);
    updateInterface();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => ui.toast.classList.remove("is-visible"), 1800);
  }

  function projectionSettings() {
    const hole = currentHole();
    const pin = Math.max(0, hole.length - state.camera.y);
    const viewRange = state.phase === "flight"
      ? clamp(state.flight.carry * 1.18, 230, 430)
      : clamp(pin * 1.04, 205, 555);
    return { horizon: 214, bottom: 594, viewRange };
  }

  function project(x, y, z = 0) {
    const settings = projectionSettings();
    const relative = y - state.camera.y;
    const depth = clamp(relative / settings.viewRange, -.025, 1.08);
    const curve = Math.pow(clamp(depth, 0, 1), .62);
    const scale = clamp(1 - curve * .88, .115, 1.05);
    return {
      x: W / 2 + (x - state.camera.x) * 10.4 * scale,
      y: settings.bottom - curve * (settings.bottom - settings.horizon) - z * 8.5 * scale,
      scale,
      visible: relative > -12 && relative < settings.viewRange * 1.12
    };
  }

  function polygon(points, fill, stroke, lineWidth = 1) {
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, COLORS.sky);
    gradient.addColorStop(.72, COLORS.skyLight);
    gradient.addColorStop(1, "#d8cfb4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, 260);

    ctx.fillStyle = "rgba(255,248,220,.45)";
    ctx.beginPath();
    ctx.ellipse(140, 92, 92, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(735, 118, 125, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#273a27";
    ctx.beginPath();
    ctx.moveTo(0, 226);
    for (let x = 0; x <= W; x += 18) {
      const y = 218 - Math.sin(x * .067) * 7 - Math.sin(x * .021) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, 264);
    ctx.lineTo(0, 264);
    ctx.fill();
  }

  function visibleStrip(hole, leftOffset, rightOffset, yStart, yEnd, step = 12) {
    const left = [];
    const right = [];
    for (let y = yStart; y <= yEnd; y += step) {
      const center = courseCenter(hole, y);
      left.push(project(center + leftOffset(hole, y), y));
      right.push(project(center + rightOffset(hole, y), y));
    }
    return [...left, ...right.reverse()];
  }

  function drawGround() {
    const hole = currentHole();
    const { horizon, viewRange } = projectionSettings();
    ctx.fillStyle = COLORS.rough;
    ctx.fillRect(0, horizon, W, H - horizon);

    const yStart = Math.max(0, state.camera.y - 5);
    const yEnd = Math.min(hole.length + 30, state.camera.y + viewRange * 1.05);

    for (let y = Math.floor(yStart / 42) * 42; y < yEnd; y += 42) {
      const p0 = project(-120, y);
      const p1 = project(120, y);
      const p2 = project(120, y + 21);
      const p3 = project(-120, y + 21);
      polygon([p0, p1, p2, p3], y / 42 % 2 ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.025)");
    }

    const fairway = visibleStrip(
      hole,
      (h, y) => -fairwayWidth(h, y) / 2,
      (h, y) => fairwayWidth(h, y) / 2,
      yStart,
      yEnd
    );
    polygon(fairway, COLORS.fairway, "rgba(36,62,31,.55)", 2);

    ctx.save();
    polygon(fairway);
    ctx.clip();
    for (let y = Math.floor(yStart / 36) * 36; y < yEnd; y += 72) {
      const p0 = project(-120, y);
      const p1 = project(120, y);
      const p2 = project(120, y + 34);
      const p3 = project(-120, y + 34);
      polygon([p0, p1, p2, p3], "rgba(255,255,255,.045)");
    }
    ctx.restore();

    for (const hazard of hole.hazards) drawHazard(hazard);
    drawGreen(hole);
    drawTrees(hole, yStart, yEnd);
    drawPin(hole);
  }

  function drawHazard(hazard) {
    const a = project(hazard.x1, hazard.y1);
    const b = project(hazard.x2, hazard.y1);
    const c = project(hazard.x2, hazard.y2);
    const d = project(hazard.x1, hazard.y2);
    if (![a, b, c, d].some(point => point.visible)) return;
    const color = hazard.type === "water" ? COLORS.water : COLORS.sand;
    polygon([a, b, c, d], color, hazard.type === "water" ? COLORS.waterLight : "#94784c", 2);
    if (hazard.type === "water") {
      ctx.save();
      polygon([a, b, c, d]);
      ctx.clip();
      ctx.strokeStyle = "rgba(240,231,198,.2)";
      ctx.lineWidth = 2;
      for (let y = Math.min(a.y, b.y, c.y, d.y); y < Math.max(a.y, b.y, c.y, d.y); y += 9) {
        ctx.beginPath();
        ctx.moveTo(Math.min(a.x, d.x), y);
        ctx.lineTo(Math.max(b.x, c.x), y - 3);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawGreen(hole) {
    const center = cupFor(hole);
    const p = project(center.x, center.y);
    if (!p.visible) return;
    const px = project(center.x + 25, center.y);
    const py = project(center.x, center.y - 24);
    const rx = Math.max(5, Math.abs(px.x - p.x));
    const ry = Math.max(2, Math.abs(py.y - p.y));
    ctx.fillStyle = COLORS.green;
    ctx.strokeStyle = "#6e8650";
    ctx.lineWidth = Math.max(1, p.scale * 3);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.04)";
    ctx.beginPath();
    ctx.ellipse(p.x - rx * .15, p.y - ry * .08, rx * .75, ry * .55, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTree(x, y, scale, variation) {
    if (scale < .13) return;
    const trunkH = 28 * scale;
    ctx.fillStyle = "#3e2b1c";
    ctx.fillRect(x - 3 * scale, y - trunkH, 6 * scale, trunkH);
    ctx.fillStyle = variation > 0 ? "#203a24" : "#29472a";
    ctx.beginPath();
    ctx.ellipse(x, y - trunkH - 13 * scale, 19 * scale, 25 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 11 * scale, y - trunkH - 3 * scale, 15 * scale, 19 * scale, -.25, 0, Math.PI * 2);
    ctx.ellipse(x + 12 * scale, y - trunkH - 4 * scale, 15 * scale, 18 * scale, .25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(167,184,119,.12)";
    ctx.beginPath();
    ctx.ellipse(x - 6 * scale, y - trunkH - 20 * scale, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTrees(hole, yStart, yEnd) {
    const first = Math.floor(yStart / 38) * 38;
    const trees = [];
    for (let y = first; y <= yEnd; y += 38) {
      const center = courseCenter(hole, y);
      const width = fairwayWidth(hole, y) / 2;
      const wave = Math.sin((y + hole.no * 13) * .17) * 8;
      trees.push({ x: center - width - 25 - Math.abs(wave), y, variation: -1 });
      trees.push({ x: center + width + 25 + Math.abs(wave * .7), y: y + 9, variation: 1 });
    }
    trees.sort((a, b) => b.y - a.y);
    for (const tree of trees) {
      const p = project(tree.x, tree.y);
      if (!p.visible || p.x < -60 || p.x > W + 60) continue;
      drawTree(p.x, p.y, p.scale * 1.25, tree.variation);
    }
  }

  function drawPin(hole) {
    const cup = cupFor(hole);
    const base = project(cup.x, cup.y);
    const top = project(cup.x, cup.y, 5.3);
    if (!base.visible) return;
    ctx.strokeStyle = COLORS.paperLight;
    ctx.lineWidth = Math.max(1, base.scale * 3);
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    const flagW = Math.max(5, 28 * base.scale);
    const flagH = Math.max(3, 13 * base.scale);
    ctx.fillStyle = COLORS.rust;
    ctx.fillRect(top.x, top.y, flagW, flagH);
    if (base.scale > .35) {
      ctx.fillStyle = COLORS.paper;
      ctx.font = `900 ${Math.max(5, 7 * base.scale)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("S", top.x + flagW / 2, top.y + flagH * .75);
    }
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.ellipse(base.x, base.y, Math.max(1.5, 4 * base.scale), Math.max(1, 2 * base.scale), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function previewTarget() {
    const hole = currentHole();
    const power = recommendedPower() / 100;
    if (state.club.unit === "ft") {
      const cup = cupFor(hole);
      return { x: cup.x + state.aimOffset, y: cup.y };
    }
    const carry = effectiveCarry(state.club) * power;
    const roll = state.club.roll * (state.lie === "rough" ? .3 : state.lie === "sand" ? .05 : 1);
    const y = clamp(state.ball.y + carry + roll, 0, hole.length + 20);
    return { x: courseCenter(hole, y) + state.aimOffset, y };
  }

  function drawTargetMarker() {
    if (!["ready", "power", "accuracy"].includes(state.phase)) return;
    const target = previewTarget();
    const p = project(target.x, target.y);
    if (!p.visible) return;
    const radius = clamp(14 * p.scale, 4, 14);
    ctx.strokeStyle = COLORS.paper;
    ctx.lineWidth = Math.max(1, 2 * p.scale);
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, radius * 1.5, radius * .55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(p.x - 1, p.y - radius * 1.4, 2, radius * 1.2);
  }

  function drawGolfer(x, y, scale, pose) {
    const s = clamp(scale, .58, 1.1);
    const skin = "#5a311f";
    const trouser = "#203b2b";
    const knit = "#ead9ba";
    const cap = COLORS.rust;

    ctx.save();
    ctx.translate(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = trouser;
    ctx.lineWidth = 8 * s;
    ctx.beginPath();
    ctx.moveTo(-5 * s, -31 * s);
    ctx.lineTo(-10 * s, -5 * s);
    ctx.moveTo(5 * s, -31 * s);
    ctx.lineTo(12 * s, -5 * s);
    ctx.stroke();

    ctx.strokeStyle = "#eee7d6";
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(-14 * s, -4 * s);
    ctx.lineTo(-5 * s, -4 * s);
    ctx.moveTo(9 * s, -4 * s);
    ctx.lineTo(18 * s, -4 * s);
    ctx.stroke();

    ctx.fillStyle = knit;
    ctx.beginPath();
    ctx.moveTo(-13 * s, -69 * s);
    ctx.quadraticCurveTo(0, -78 * s, 14 * s, -68 * s);
    ctx.lineTo(11 * s, -30 * s);
    ctx.lineTo(-10 * s, -30 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(1 * s, -83 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cap;
    ctx.fillRect(-10 * s, -94 * s, 21 * s, 7 * s);
    ctx.fillRect(7 * s, -91 * s, 10 * s, 4 * s);

    const handX = pose < .3 ? 23 : pose < .75 ? -11 : 25;
    const handY = pose < .3 ? -44 : pose < .75 ? -96 : -81;
    ctx.strokeStyle = knit;
    ctx.lineWidth = 7 * s;
    ctx.beginPath();
    ctx.moveTo(-8 * s, -66 * s);
    ctx.lineTo(handX * s, handY * s);
    ctx.moveTo(10 * s, -65 * s);
    ctx.lineTo(handX * s, handY * s);
    ctx.stroke();
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(handX * s, handY * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#d9d9cf";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    if (pose < .3) {
      ctx.moveTo(handX * s, handY * s);
      ctx.lineTo(31 * s, -5 * s);
    } else if (pose < .75) {
      ctx.moveTo(handX * s, handY * s);
      ctx.lineTo(-45 * s, -115 * s);
    } else {
      ctx.moveTo(handX * s, handY * s);
      ctx.lineTo(-23 * s, -111 * s);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayerAndBall() {
    const ballGround = project(state.ball.x, state.ball.y);
    if (["ready", "power", "accuracy"].includes(state.phase) && ballGround.visible) {
      drawGolfer(ballGround.x - 37 * ballGround.scale, ballGround.y + 2, ballGround.scale, state.pose);
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.beginPath();
      ctx.ellipse(ballGround.x, ballGround.y + 2, 7 * ballGround.scale, 2.5 * ballGround.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffdf4";
      ctx.beginPath();
      ctx.arc(ballGround.x, ballGround.y - 2, clamp(4 * ballGround.scale, 2, 4), 0, Math.PI * 2);
      ctx.fill();
    }

    if (state.phase === "flight" && state.flight) {
      for (let i = 0; i < state.flight.trail.length; i += 1) {
        const point = state.flight.trail[i];
        const p = project(point.x, point.y, point.z);
        const alpha = (i + 1) / state.flight.trail.length * .5;
        ctx.fillStyle = `rgba(255,250,232,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.scale * 2.4), 0, Math.PI * 2);
        ctx.fill();
      }
      const ball = state.flight.ball;
      const p = project(ball.x, ball.y, ball.z);
      ctx.fillStyle = "rgba(0,0,0,.22)";
      const shadow = project(ball.x, ball.y, 0);
      ctx.beginPath();
      ctx.ellipse(shadow.x, shadow.y, clamp(7 * shadow.scale, 2, 7), clamp(2.5 * shadow.scale, 1, 3), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffdf4";
      ctx.strokeStyle = "rgba(21,18,14,.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, clamp(4.5 * p.scale + 1.5, 2.2, 5), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawHudPanel() {
    const hole = currentHole();
    const pinYards = pinDistanceYards();
    const displayDistance = state.lie === "green" ? `${Math.max(1, Math.round(pinYards * 3))} FT` : `${Math.max(1, Math.round(pinYards))} YD`;

    ctx.fillStyle = "rgba(21,18,14,.9)";
    ctx.fillRect(18, 18, 330, 82);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(18, 18, 7, 82);
    hudText(`${hole.no}  ${hole.name.toUpperCase()}`, 38, 42, 14, COLORS.paper, "left", 800);
    hudText(`PAR ${hole.par}  ·  ${hole.length} YD`, 38, 67, 10, COLORS.tan, "left", 800);

    ctx.fillStyle = "rgba(21,18,14,.88)";
    ctx.fillRect(18, 108, 330, 50);
    hudText("TO PIN", 34, 127, 8, COLORS.tan, "left", 900);
    hudText(displayDistance, 34, 146, 17, COLORS.paper, "left", 800);
    hudText("LIE", 172, 127, 8, COLORS.tan, "left", 900);
    hudText(formatLie(state.lie).toUpperCase(), 172, 146, 12, COLORS.paper, "left", 800);
    hudText("WIND", 262, 127, 8, COLORS.tan, "left", 900);
    hudText(state.lie === "green" ? "—" : hole.wind.label, 262, 146, 11, COLORS.rust, "left", 900);

    ctx.fillStyle = "rgba(21,18,14,.88)";
    ctx.fillRect(18, 166, 166, 37);
    hudText(`SHOT ${state.shots + 1}`, 31, 185, 10, COLORS.paper, "left", 900);
    hudText(`ROUND ${scoreLabel(state.roundToPar)}`, 171, 185, 10, COLORS.gold, "right", 900);

    drawMiniMap(hole);

    if (state.phase === "ready" && state.shots === 0) {
      ctx.fillStyle = "rgba(21,18,14,.88)";
      ctx.fillRect(365, 528, 230, 40);
      hudText(`HOLE ${hole.no} · TEE BOX`, 480, 548, 11, COLORS.paper, "center", 900);
    }
  }

  function hudText(value, x, y, size, color, align = "left", weight = 700) {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px "Courier New", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(value, x, y);
  }

  function mapPoint(hole, x, y, map) {
    const lateralScale = map.w / 150;
    return {
      x: map.x + map.w / 2 + x * lateralScale,
      y: map.y + map.h - (y / hole.length) * map.h
    };
  }

  function drawMiniMap(hole) {
    const map = { x: 797, y: 18, w: 145, h: 205 };
    ctx.fillStyle = "rgba(21,18,14,.88)";
    ctx.fillRect(map.x, map.y, map.w, map.h);
    ctx.strokeStyle = "rgba(241,223,192,.26)";
    ctx.strokeRect(map.x + .5, map.y + .5, map.w - 1, map.h - 1);
    hudText("SHOT VIEW", map.x + 12, map.y + 15, 7, COLORS.tan, "left", 900);

    const left = [];
    const right = [];
    for (let y = 0; y <= hole.length; y += 12) {
      const center = courseCenter(hole, y);
      const half = fairwayWidth(hole, y) / 2;
      left.push(mapPoint(hole, center - half, y, map));
      right.push(mapPoint(hole, center + half, y, map));
    }
    polygon([...left, ...right.reverse()], "#697b4a");

    for (const hazard of hole.hazards) {
      const a = mapPoint(hole, hazard.x1, hazard.y1, map);
      const b = mapPoint(hole, hazard.x2, hazard.y1, map);
      const c = mapPoint(hole, hazard.x2, hazard.y2, map);
      const d = mapPoint(hole, hazard.x1, hazard.y2, map);
      polygon([a, b, c, d], hazard.type === "water" ? COLORS.water : COLORS.sand);
    }

    const cup = mapPoint(hole, cupFor(hole).x, hole.length, map);
    ctx.fillStyle = COLORS.rust;
    ctx.beginPath();
    ctx.arc(cup.x, cup.y + 8, 4, 0, Math.PI * 2);
    ctx.fill();

    const target = mapPoint(hole, previewTarget().x, previewTarget().y, map);
    ctx.strokeStyle = COLORS.paper;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(target.x, target.y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const ball = mapPoint(hole, state.ball.x, state.ball.y, map);
    ctx.fillStyle = COLORS.paperLight;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    drawSky();
    drawGround();
    drawTargetMarker();
    drawPlayerAndBall();
    drawHudPanel();
  }

  function updateAnimation(now) {
    if (state.phase === "power") {
      const cycle = ((now - state.meterStarted) / 920) % 2;
      state.meter = cycle <= 1 ? cycle * 100 : (2 - cycle) * 100;
      state.pose = .24 + state.meter / 100 * .48;
      setMeterNeedle(state.meter);
      ui.meterReadout.textContent = `${Math.round(state.meter)}%`;
    } else if (state.phase === "accuracy") {
      const elapsed = (now - state.meterStarted) / 950;
      state.meter = clamp(100 - elapsed * 100, 0, 100);
      state.pose = .72 + (100 - state.meter) / 100 * .2;
      setMeterNeedle(state.meter);
      ui.meterReadout.textContent = impactReadout(state.meter);
      if (state.meter <= 0) {
        state.impactLocked = 0;
        startShot();
      }
    } else if (state.phase === "flight" && state.flight) {
      const flight = state.flight;
      const t = clamp((now - flight.started) / flight.duration, 0, 1);
      if (flight.apex === 0) {
        const eased = 1 - Math.pow(1 - t, 2.3);
        flight.ball.x = mix(flight.start.x, flight.end.x, eased);
        flight.ball.y = mix(flight.start.y, flight.end.y, eased);
        flight.ball.z = 0;
      } else if (t < .78) {
        const air = t / .78;
        flight.ball.x = mix(flight.start.x, flight.landing.x, air);
        flight.ball.y = mix(flight.start.y, flight.landing.y, air);
        flight.ball.z = Math.sin(Math.PI * air) * flight.apex;
      } else {
        const roll = (t - .78) / .22;
        const eased = 1 - Math.pow(1 - roll, 3);
        flight.ball.x = mix(flight.landing.x, flight.end.x, eased);
        flight.ball.y = mix(flight.landing.y, flight.end.y, eased);
        flight.ball.z = Math.sin(Math.PI * roll * 2) * Math.max(0, 1.2 * (1 - roll));
      }

      const follow = smooth(clamp(t * 1.08, 0, 1));
      state.camera.x = mix(flight.start.x, flight.end.x, follow * .7);
      state.camera.y = mix(flight.start.y - 4, Math.max(flight.start.y, flight.end.y - 32), follow);
      flight.trail.push({ ...flight.ball });
      if (flight.trail.length > 18) flight.trail.shift();

      if (t >= 1) resolveShot();
    }
  }

  function gameLoop(now) {
    updateAnimation(now);
    drawFrame();
    requestAnimationFrame(gameLoop);
  }

  function showInvite() {
    if (!mobileQuery.matches || ui.invite.classList.contains("is-open")) return;
    ui.invite.classList.add("is-open");
    ui.invite.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-active");
    setTimeout(() => ui.inviteAccept.focus(), 50);
  }

  function hideInvite() {
    ui.invite.classList.remove("is-open");
    ui.invite.setAttribute("aria-hidden", "true");
    if (!ui.frame.classList.contains("is-open")) document.body.classList.remove("modal-active");
  }

  function openGame(reset = false) {
    hideInvite();
    if (reset) resetRound();
    if (mobileQuery.matches) {
      ui.frame.classList.add("is-open");
      document.body.classList.add("modal-active");
      setTimeout(() => canvas.focus({ preventScroll: true }), 80);
    } else {
      document.querySelector("#play").scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => canvas.focus({ preventScroll: true }), 650);
    }
  }

  function closeGame() {
    ui.frame.classList.remove("is-open");
    document.body.classList.remove("modal-active");
    const launcher = document.querySelector("[data-open-game]");
    launcher?.focus({ preventScroll: true });
  }

  ui.clubPrev.addEventListener("click", () => setClub(-1));
  ui.clubNext.addEventListener("click", () => setClub(1));
  ui.aimLeft.addEventListener("click", () => changeAim(-1));
  ui.aimRight.addEventListener("click", () => changeAim(1));
  ui.swing.addEventListener("click", swingAction);
  canvas.addEventListener("dblclick", swingAction);

  ui.nextHole.addEventListener("click", () => {
    if (state.holeIndex === holes.length - 1) {
      resetRound();
    } else {
      state.holeIndex += 1;
      state.token += 1;
      loadHole();
    }
    canvas.focus({ preventScroll: true });
  });

  document.querySelectorAll("[data-open-game]").forEach(button => {
    button.addEventListener("click", () => openGame(true));
  });

  ui.close.addEventListener("click", closeGame);
  ui.inviteAccept.addEventListener("click", () => openGame(true));
  ui.inviteLater.addEventListener("click", hideInvite);
  ui.inviteClose.addEventListener("click", hideInvite);
  ui.invite.addEventListener("pointerdown", event => {
    if (event.target === ui.invite) hideInvite();
  });

  document.addEventListener("keydown", event => {
    const tag = event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (event.key === "Escape") {
      if (ui.invite.classList.contains("is-open")) hideInvite();
      else if (ui.frame.classList.contains("is-open")) closeGame();
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      if (document.activeElement === ui.nextHole) return;
      if (!mobileQuery.matches || ui.frame.classList.contains("is-open")) {
        swingAction();
        event.preventDefault();
      }
    } else if (event.key === "ArrowLeft") {
      changeAim(-1);
      event.preventDefault();
    } else if (event.key === "ArrowRight") {
      changeAim(1);
      event.preventDefault();
    } else if (event.key.toLowerCase() === "c") {
      setClub(-1);
      event.preventDefault();
    } else if (event.key.toLowerCase() === "v") {
      setClub(1);
      event.preventDefault();
    }
  });

  mobileQuery.addEventListener?.("change", event => {
    if (!event.matches) closeGame();
  });

  resetRound();
  requestAnimationFrame(gameLoop);

  if (mobileQuery.matches) {
    setTimeout(showInvite, 700);
  }
})();
