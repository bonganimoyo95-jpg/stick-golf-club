"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type GameStep = "intro" | "aim" | "power" | "accuracy" | "flight" | "result" | "complete";
type Lie = "tee" | "fairway" | "rough" | "bunker" | "green" | "cup";
type Motion = "idle" | "flying" | "bouncing" | "rolling";
type Point = { x: number; y: number };
type Club = { id: string; label: string; range: number; roll: number };

const TEE: Point = { x: 29, y: 85 };
const CUP: Point = { x: 68, y: 22 };
const WIND_KMH = 7;

const CLUBS: Club[] = [
  { id: "6I", label: "6 IRON", range: 160, roll: 7 },
  { id: "7I", label: "7 IRON", range: 148, roll: 6 },
  { id: "8I", label: "8 IRON", range: 136, roll: 5 },
  { id: "9I", label: "9 IRON", range: 124, roll: 4 },
  { id: "PW", label: "PITCHING WEDGE", range: 105, roll: 3 },
  { id: "SW", label: "SAND WEDGE", range: 72, roll: 2 },
  { id: "PT", label: "PUTTER", range: 0, roll: 0 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function remainingYards(ball: Point, lie: Lie) {
  if (lie === "tee") return 142;
  return Math.max(1, Math.round(Math.hypot((CUP.x - ball.x) * 1.05, (CUP.y - ball.y) * 2.18)));
}

function scoreLabel(strokes: number) {
  if (strokes === 1) return "ACE";
  if (strokes === 2) return "BIRDIE";
  if (strokes === 3) return "PAR";
  if (strokes === 4) return "BOGEY";
  return "DOUBLE BOGEY";
}

function lieLabel(lie: Lie) {
  return ({ tee: "TEE", fairway: "FAIRWAY", rough: "ROUGH", bunker: "BUNKER", green: "GREEN", cup: "IN THE CUP" })[lie];
}

function rotateVector(dx: number, dy: number, degrees: number) {
  const radians = degrees * Math.PI / 180;
  return {
    x: dx * Math.cos(radians) - dy * Math.sin(radians),
    y: dx * Math.sin(radians) + dy * Math.cos(radians),
  };
}

function onGreen(point: Point) {
  return ((point.x - CUP.x) ** 2) / (14.5 ** 2) + ((point.y - CUP.y) ** 2) / (10.5 ** 2) <= 1;
}

function inBunker(point: Point) {
  const left = ((point.x - 54) ** 2) / (7 ** 2) + ((point.y - 23) ** 2) / (3.6 ** 2) <= 1;
  const right = ((point.x - 82) ** 2) / (6.5 ** 2) + ((point.y - 29) ** 2) / (4.2 ** 2) <= 1;
  return left || right;
}

function inWater(point: Point) {
  return point.x < 24 && point.y > 25 && point.y < 76;
}

function onFairway(point: Point) {
  const expectedX = 29 + (85 - point.y) * .62;
  const width = 8 + (85 - point.y) * .045;
  return point.y > 27 && point.y < 91 && Math.abs(point.x - expectedX) < width;
}

function clubOptions(lie: Lie, yards: number) {
  if (lie === "green") return CLUBS.filter((club) => club.id === "PT");
  if (lie === "bunker") return CLUBS.filter((club) => club.id === "SW" || club.id === "PW");
  if (yards > 130) return CLUBS.filter((club) => ["6I", "7I", "8I"].includes(club.id));
  if (yards > 100) return CLUBS.filter((club) => ["8I", "9I", "PW"].includes(club.id));
  return CLUBS.filter((club) => ["9I", "PW", "SW"].includes(club.id));
}

function recommendedClub(options: Club[], yards: number) {
  return options.reduce((best, club) => Math.abs(club.range - yards) < Math.abs(best.range - yards) ? club : best, options[0]);
}

export default function HoleOneGame({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<GameStep>("intro");
  const [lie, setLie] = useState<Lie>("tee");
  const [ball, setBall] = useState<Point>(TEE);
  const [strokes, setStrokes] = useState(0);
  const [aim, setAim] = useState(0);
  const [clubId, setClubId] = useState("7I");
  const [meter, setMeter] = useState(0);
  const [lockedPower, setLockedPower] = useState(0);
  const [motion, setMotion] = useState<Motion>("idle");
  const [headline, setHeadline] = useState("NO PERFECT SWING REQUIRED.");
  const [detail, setDetail] = useState("Aim for the heart of the green and account for the crosswind.");
  const [shotRead, setShotRead] = useState("READY");
  const timers = useRef<number[]>([]);

  const yards = useMemo(() => remainingYards(ball, lie), [ball, lie]);
  const options = useMemo(() => clubOptions(lie, yards), [lie, yards]);
  const club = CLUBS.find((item) => item.id === clubId) ?? options[0];
  const putting = lie === "green";
  const cupDistance = distance(ball, CUP);
  const puttFeet = Math.max(1, Math.round(cupDistance * 3.2));
  const phaseProgress = ({ intro: -1, aim: 0, power: 1, accuracy: 2, flight: 3, result: 3, complete: 3 } as const)[step];
  const targetPower = putting
    ? clamp(cupDistance * 8.2, 18, 92)
    : clamp((yards / Math.max(1, club.range + club.roll)) * 100, 28, 96);

  const aimEnd = useMemo(() => {
    const vector = rotateVector(CUP.x - ball.x, CUP.y - ball.y, aim);
    const scale = Math.min(1.12, 72 / Math.max(1, Math.hypot(vector.x, vector.y)));
    return { x: clamp(ball.x + vector.x * scale, 1, 99), y: clamp(ball.y + vector.y * scale, 1, 99) };
  }, [aim, ball]);

  const gameStyle = {
    "--ball-x": `${ball.x}%`,
    "--ball-y": `${ball.y}%`,
  } as CSSProperties;

  function later(callback: () => void, delay: number) {
    timers.current.push(window.setTimeout(callback, delay));
  }

  function clearTimers() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => {
    if (step !== "power" && step !== "accuracy") return;
    let value = step === "power" ? 0 : 8;
    let direction = 1;
    const speed = step === "power" ? 2.1 : 3.35;
    const interval = window.setInterval(() => {
      value += speed * direction;
      if (value >= 100) { value = 100; direction = -1; }
      if (value <= 0) { value = 0; direction = 1; }
      setMeter(value);
    }, 24);
    return () => window.clearInterval(interval);
  }, [step]);

  function resetGame() {
    clearTimers();
    setStep("intro");
    setLie("tee");
    setBall(TEE);
    setStrokes(0);
    setAim(0);
    setClubId("7I");
    setMeter(0);
    setLockedPower(0);
    setMotion("idle");
    setHeadline("NO PERFECT SWING REQUIRED.");
    setDetail("Aim for the heart of the green and account for the crosswind.");
    setShotRead("READY");
  }

  function beginHole() {
    setStep("aim");
    setHeadline("PICK A LINE.");
    setDetail("The wind is moving left to right. Favour the left half of the green.");
  }

  function lockAim() {
    setMeter(0);
    setStep("power");
    setHeadline(putting ? "MATCH THE PACE." : "SET YOUR CARRY.");
    setDetail(putting ? "Stop the marker inside the orange window. The green is fast." : "Stop the marker inside the orange window for the selected club.");
  }

  function lockPower() {
    setLockedPower(meter);
    setMeter(8);
    setStep("accuracy");
    setHeadline(putting ? "START IT ON LINE." : "FIND THE CENTRE.");
    setDetail("The smaller cream window is pure. Miss either side and the face opens or closes.");
  }

  function prepareNextShot(nextLie: Lie, nextBall: Point, nextStrokes: number, resultHeadline: string, resultDetail: string) {
    setMotion("idle");
    setBall(nextBall);
    setLie(nextLie);
    setStrokes(nextStrokes);
    setHeadline(resultHeadline);
    setDetail(resultDetail);
    if (nextStrokes >= 5) {
      later(() => setStep("complete"), 280);
    } else {
      setStep("result");
    }
  }

  function finishHole(finalStrokes: number, resultHeadline = "IN THE CUP.") {
    setBall(CUP);
    setLie("cup");
    setStrokes(finalStrokes);
    setMotion("idle");
    setHeadline(resultHeadline);
    setDetail(finalStrokes === 1 ? "One swing. No notes." : `Hole 01 is in the books at ${finalStrokes} strokes.`);
    setStep("complete");
  }

  function assessFullShot(finalPoint: Point, nextStrokes: number) {
    const cupGap = distance(finalPoint, CUP);
    if (cupGap <= 1.05) {
      finishHole(nextStrokes, nextStrokes === 1 ? "ACE AT THE WELCOME MAT." : "DROPPED.");
      return;
    }
    if (inWater(finalPoint)) {
      const penalized = Math.min(5, nextStrokes + 1);
      const drop = { x: 34, y: 57 };
      prepareNextShot("rough", drop, penalized, "FOUND THE WATER.", `One-stroke penalty. You are hitting ${penalized + 1} from the drop zone, ${remainingYards(drop, "rough")} yards out.`);
      return;
    }
    if (onGreen(finalPoint)) {
      const feet = Math.max(1, Math.round(cupGap * 3.2));
      prepareNextShot("green", finalPoint, nextStrokes, "DANCING.", `${feet} feet remain. The putt breaks slightly left on a fast green.`);
      return;
    }
    if (inBunker(finalPoint)) {
      prepareNextShot("bunker", finalPoint, nextStrokes, "BEACH CLUB.", `${remainingYards(finalPoint, "bunker")} yards remain. The sand narrows the pure-strike window.`);
      return;
    }
    const nextLie: Lie = onFairway(finalPoint) ? "fairway" : "rough";
    prepareNextShot(nextLie, finalPoint, nextStrokes, nextLie === "fairway" ? "SHORT GRASS." : "IN THE ROUGH.", `${remainingYards(finalPoint, nextLie)} yards remain. ${nextLie === "rough" ? "Expect less rollout and a tighter strike window." : "You have a clean look at the pin."}`);
  }

  function assessPutt(finalPoint: Point, nextStrokes: number) {
    const cupGap = distance(finalPoint, CUP);
    if (cupGap <= .78) {
      finishHole(nextStrokes);
      return;
    }
    const feet = Math.max(1, Math.round(cupGap * 3.2));
    prepareNextShot("green", finalPoint, nextStrokes, lockedPower > targetPower ? "A LITTLE JUICE." : "JUST MISSED.", `${feet} feet coming back. Read the left break and match the pace.`);
  }

  function strikeBall() {
    if (step !== "accuracy") return;
    clearTimers();
    const strikeError = (meter - 50) / 50;
    const nextStrokes = strokes + 1;
    const strikeName = Math.abs(strikeError) < .13 ? "PURE" : Math.abs(strikeError) < .32 ? "SOLID" : strikeError < 0 ? "PULLED" : "PUSHED";
    setShotRead(strikeName);
    setStrokes(nextStrokes);
    setStep("flight");
    setHeadline(putting ? "ROLLING..." : "BALL AWAY...");
    setDetail(`${Math.round(lockedPower)}% power / ${strikeName.toLowerCase()} strike`);

    if (putting) {
      const dx = CUP.x - ball.x;
      const dy = CUP.y - ball.y;
      const path = Math.max(.1, Math.hypot(dx, dy));
      const aimed = rotateVector(dx / path, dy / path, aim + strikeError * 3.8);
      const travel = path * (lockedPower / Math.max(1, targetPower)) * 1.015;
      const finalPoint = {
        x: clamp(ball.x + aimed.x * travel, 48, 88),
        y: clamp(ball.y + aimed.y * travel, 10, 37),
      };
      setMotion("rolling");
      setBall(finalPoint);
      later(() => assessPutt(finalPoint, nextStrokes), 1120);
      return;
    }

    const dx = CUP.x - ball.x;
    const dy = CUP.y - ball.y;
    const shotYards = (club.range + club.roll) * (lockedPower / 100);
    const fraction = shotYards / Math.max(1, yards);
    const aimed = rotateVector(dx, dy, aim + strikeError * (lie === "bunker" ? 15 : lie === "rough" ? 12 : 9));
    const finalPoint = {
      x: clamp(ball.x + aimed.x * fraction + (WIND_KMH * .24 * Math.min(1.15, fraction)), 1, 99),
      y: clamp(ball.y + aimed.y * fraction, 1, 98),
    };
    const carryPoint = {
      x: ball.x + (finalPoint.x - ball.x) * .84,
      y: ball.y + (finalPoint.y - ball.y) * .84,
    };
    setMotion("flying");
    setBall(carryPoint);
    later(() => {
      setMotion("bouncing");
      setBall(finalPoint);
    }, 860);
    later(() => assessFullShot(finalPoint, nextStrokes), 1510);
  }

  function continuePlay() {
    if (strokes >= 5) { setStep("complete"); return; }
    const nextOptions = clubOptions(lie, remainingYards(ball, lie));
    setClubId(recommendedClub(nextOptions, remainingYards(ball, lie)).id);
    setAim(0);
    setLockedPower(0);
    setMeter(0);
    setShotRead("READY");
    setStep("aim");
    setHeadline(lie === "green" ? "READ THE PUTT." : "PICK YOUR NEXT LINE.");
    setDetail(lie === "green" ? `${puttFeet} feet. Fast green. Slight break to the left.` : `${yards} yards remain from the ${lieLabel(lie).toLowerCase()}.`);
  }

  return (
    <section className="experience-panel game-panel game-v3" role="dialog" aria-modal="true" aria-labelledby="game-title">
      <button className="close-button" onClick={onExit} aria-label="Return to the clubhouse"><span aria-hidden="true">×</span><small>BACK TO ROOM</small></button>

      <div className="simulator-marquee" aria-hidden="true"><span>STICK GOLF SYSTEMS</span><b>SGS—01</b></div>
      <div className="game-status-strip">
        <div><small>HOLE</small><b>01</b></div>
        <div><small>PAR</small><b>3</b></div>
        <div><small>DISTANCE</small><b>{lie === "green" || lie === "cup" ? `${puttFeet} FT` : `${yards} YDS`}</b></div>
        <div><small>STROKE</small><b>{Math.min(strokes + (step === "flight" ? 0 : 1), 5)}</b></div>
        <div className="game-wind"><small>WIND</small><b>{WIND_KMH} KM/H <i>→</i></b></div>
      </div>

      <div className="hole-shell">
        <div className={`hole-canvas motion-${motion}`} style={gameStyle}>
          <svg className="course-map" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect width="100" height="100" fill="#183b27" />
            <path className="course-water" d="M0 0H17C15 12 22 18 19 31C16 44 25 51 21 63C18 73 8 81 13 100H0Z" />
            <path className="course-fairway" d="M22 96C28 76 34 62 44 49C53 37 58 29 62 22L78 26C71 35 66 42 59 51C49 64 44 77 42 96Z" />
            <path className="fairway-stripe stripe-one" d="M27 95C31 76 37 62 47 49C54 39 59 31 64 23L68 24C63 33 58 41 51 51C43 64 38 79 36 96Z" />
            <path className="fairway-stripe stripe-two" d="M36 96C39 78 44 65 54 51C61 41 66 33 71 25L76 26C69 37 64 44 58 53C49 66 45 79 43 96Z" />
            <ellipse className="course-green-fringe" cx="68" cy="22" rx="17" ry="12.5" />
            <ellipse className="course-green" cx="68" cy="22" rx="14.5" ry="10.5" />
            <ellipse className="course-bunker" cx="54" cy="23" rx="7" ry="3.6" transform="rotate(-14 54 23)" />
            <ellipse className="course-bunker" cx="82" cy="29" rx="6.5" ry="4.2" transform="rotate(18 82 29)" />
            <rect className="course-tee" x="23" y="82" width="14" height="7" rx="1" />
            <g className="course-trees">
              <circle cx="30" cy="11" r="3" /><circle cx="38" cy="14" r="4" /><circle cx="45" cy="8" r="3.5" />
              <circle cx="91" cy="12" r="5" /><circle cx="96" cy="22" r="4" /><circle cx="91" cy="43" r="4.5" />
              <circle cx="82" cy="56" r="3.5" /><circle cx="88" cy="65" r="5" /><circle cx="76" cy="73" r="4" />
              <circle cx="64" cy="85" r="5" /><circle cx="55" cy="93" r="4" /><circle cx="12" cy="89" r="5" />
            </g>
          </svg>

          {step === "aim" && <svg className="trajectory-map" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1={ball.x} y1={ball.y} x2={aimEnd.x} y2={aimEnd.y} />
            <circle cx={aimEnd.x} cy={aimEnd.y} r="2.1" />
            <circle className="aim-centre" cx={aimEnd.x} cy={aimEnd.y} r=".65" />
          </svg>}

          <div className="course-pin" aria-hidden="true"><i /><b /></div>
          <div className={`game-ball lie-${lie}`} aria-hidden="true"><i /></div>
          {step !== "intro" && step !== "complete" && <span className="ball-lie-tag">{lieLabel(lie)}</span>}
          <div className="wind-streak wind-one" /><div className="wind-streak wind-two" /><div className="wind-streak wind-three" />
          <div className="simulator-scanlines" />
        </div>
      </div>

      <div className="game-phase-rail" aria-label="Shot sequence">
        {(["aim", "power", "accuracy"] as const).map((phase, index) => <span key={phase} className={step === phase ? "is-active" : phaseProgress > index ? "is-past" : ""}><i>0{index + 1}</i>{phase === "accuracy" ? "STRIKE" : phase.toUpperCase()}</span>)}
      </div>

      <div className="game-callout" aria-live="polite">
        <small>{putting ? "ON THE GREEN" : `SHOT ${Math.min(strokes + 1, 5)} / ${lieLabel(lie)}`}</small>
        <h2 id="game-title">{headline}</h2>
        <p>{detail}</p>
      </div>

      {step === "intro" && <div className="game-intro-card">
        <p>HOLE 01 / PLAYABLE PROTOTYPE</p>
        <h2>THE<br />WELCOME MAT</h2>
        <div className="intro-hole-facts"><span><small>PAR</small><b>3</b></span><span><small>YARDS</small><b>142</b></span><span><small>GREEN</small><b>FAST</b></span></div>
        <p className="intro-copy">A short par three with more teeth than it first shows. Water guards the miss left; two bunkers collect the miss long.</p>
        <ul><li>Aim, then lock power</li><li>Time the centre strike</li><li>Putt everything out</li><li>Double bogey maximum</li></ul>
        <button onClick={beginHole}>STEP INTO THE BAY <span>→</span></button>
      </div>}

      {step !== "intro" && step !== "complete" && <div className={`game-control-deck step-${step}`}>
        {step === "aim" && <>
          <div className="club-picker" aria-label="Choose a club"><small>CLUB</small>{options.map((option) => <button key={option.id} className={clubId === option.id ? "is-selected" : ""} onClick={() => setClubId(option.id)}><b>{option.id}</b><span>{option.id === "PT" ? "ROLL" : `${option.range}Y`}</span></button>)}</div>
          <label className="aim-control"><span>AIM <b>{aim === 0 ? "CENTRE" : `${Math.abs(aim)}° ${aim < 0 ? "LEFT" : "RIGHT"}`}</b></span><div><button onClick={() => setAim((value) => clamp(value - 1, -14, 14))} aria-label="Aim one degree left">←</button><input type="range" min="-14" max="14" step="1" value={aim} onChange={(event) => setAim(Number(event.target.value))} aria-label="Aim direction" /><button onClick={() => setAim((value) => clamp(value + 1, -14, 14))} aria-label="Aim one degree right">→</button></div></label>
          <button className="game-primary" onClick={lockAim}>LOCK AIM <span>→</span></button>
        </>}

        {step === "power" && <>
          <div className="meter-copy"><small>POWER</small><b>{Math.round(meter)}%</b><span>IDEAL {Math.round(targetPower)}%</span></div>
          <div className="game-meter power-meter" aria-label={`Power meter at ${Math.round(meter)} percent`}><span className="meter-target" style={{ left: `${clamp(targetPower - 5, 0, 90)}%`, width: "10%" }} /><i style={{ left: `${meter}%` }} /></div>
          <button className="game-primary" onClick={lockPower}>SET POWER</button>
        </>}

        {step === "accuracy" && <>
          <div className="meter-copy"><small>STRIKE</small><b>{Math.abs(meter - 50) < 7 ? "PURE" : meter < 50 ? "PULL" : "PUSH"}</b><span>{Math.round(lockedPower)}% POWER LOCKED</span></div>
          <div className="game-meter accuracy-meter" aria-label="Swing accuracy meter"><span className="accuracy-zone" /><span className="pure-zone" /><i style={{ left: `${meter}%` }} /></div>
          <button className="game-primary strike-button" onClick={strikeBall}>HIT IT</button>
        </>}

        {step === "flight" && <div className="flight-readout"><span className="flight-pulse" /><small>{putting ? "TRACKING ROLL" : "TRACKING BALL"}</small><b>{shotRead}</b><i>{Math.round(lockedPower)}% POWER</i></div>}

        {step === "result" && <><div className="result-readout"><small>{lieLabel(lie)}</small><b>{lie === "green" ? `${puttFeet} FT` : `${yards} YDS`}</b><span>{strokes} STROKE{strokes === 1 ? "" : "S"} PLAYED</span></div><button className="game-primary" onClick={continuePlay}>{lie === "green" ? "READ THE PUTT" : "PLAY NEXT SHOT"} <span>→</span></button></>}
      </div>}

      {step === "complete" && <div className="game-complete-card">
        <p>HOLE 01 / COMPLETE</p>
        <span className="complete-score">{strokes >= 5 && lie !== "cup" ? "PICK UP" : scoreLabel(strokes)}</span>
        <h2>{strokes}</h2>
        <small>PAR 3 / {strokes > 3 ? "+" : strokes < 3 ? "−" : "E"}{strokes === 3 ? "" : Math.abs(strokes - 3)}</small>
        <p>{lie === "cup" ? "Score earned. Hole 01 feels complete when every shot—and every putt—is yours." : "Double bogey maximum keeps the round moving. Reset and take another line."}</p>
        <div><button onClick={resetGame}>PLAY AGAIN</button><button onClick={onExit}>BACK TO THE CLUBHOUSE</button></div>
        <em>HOLES 02 + 03 ARRIVE AFTER THE SWING FEELS RIGHT.</em>
      </div>}
    </section>
  );
}
