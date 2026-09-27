"use client";

import Image from "next/image";
import { type CSSProperties, type FormEvent, useEffect, useRef, useState } from "react";
import PocketGolfEmbed from "./pocket-golf-embed";

type RoomState = "home" | "next" | "archive" | "sounds" | "play";
type JoinState = "idle" | "loading" | "success" | "error";

const mainPlaylistLink = "https://open.spotify.com/playlist/5ZalrXpKoz5JQbXrON6lff?si=8eb2a83380a249f7";

const archiveCards = [
  { src: "/assets/archive/01-check-in.webp", rotate: "-1.5deg", label: "CHECK-IN", alt: "A guest smiling as she checks in at the event entrance." },
  { src: "/assets/archive/02-the-scorecards.webp", rotate: "1.2deg", label: "THE SCORECARDS", alt: "Hands moving across STICK scorecards at the welcome table." },
  { src: "/assets/archive/03-welcome-in.webp", rotate: "-0.8deg", label: "WELCOME IN", alt: "Friends embracing near the clubhouse entrance." },
  { src: "/assets/archive/04-the-crew.webp", rotate: "1.4deg", label: "THE CREW", alt: "Three friends posing together beside a golf simulator." },
  { src: "/assets/archive/05-three-of-a-kind.webp", rotate: "-1.2deg", label: "THREE OF A KIND", alt: "Three friends photographed in black and white at the simulator bay." },
  { src: "/assets/archive/06-old-friends.webp", rotate: "0.9deg", label: "SIDE BY SIDE", alt: "Two friends laughing with their arms around one another." },
  { src: "/assets/archive/07-raise-a-glass.webp", rotate: "1.5deg", label: "RAISE A GLASS", alt: "Three friends laughing and raising drinks in front of the simulator." },
  { src: "/assets/archive/08-cheers-in-black-and-white.webp", rotate: "-1deg", label: "CHEERS", alt: "A close black-and-white photograph of friends raising their glasses." },
  { src: "/assets/archive/09-first-swing.webp", rotate: "-1.4deg", label: "TAKE YOUR SHOT", alt: "A golfer in a blue skirt swinging in the simulator bay." },
  { src: "/assets/archive/10-full-follow-through.webp", rotate: "1.1deg", label: "FOLLOW THROUGH", alt: "A golfer in a cream outfit completing a full swing." },
  { src: "/assets/archive/11-in-the-bay.webp", rotate: "-0.7deg", label: "IN THE BAY", alt: "A golfer following through toward the simulator screen." },
  { src: "/assets/archive/12-good-form.webp", rotate: "1.4deg", label: "SCOREBOARD ENERGY", alt: "A player celebrating in front of the simulator scoreboard." },
  { src: "/assets/archive/13-the-room.webp", rotate: "-1.1deg", label: "THE ROOM", alt: "A crowded clubhouse watching the action in the simulator bay." },
  { src: "/assets/archive/14-laugh-it-off.webp", rotate: "0.8deg", label: "LAUGH IT OFF", alt: "A guest laughing during a conversation in the clubhouse." },
  { src: "/assets/archive/15-good-night.webp", rotate: "-1.3deg", label: "GOOD TO SEE YOU", alt: "Two friends greeting one another in the middle of the event." },
  { src: "/assets/archive/16-one-more.webp", rotate: "1deg", label: "ONE MORE", alt: "A guest raising both arms in celebration beside the simulator." },
];

function CloseButton({ onClick }: { onClick: () => void }) {
  return <button className="close-button" onClick={onClick} aria-label="Return to the clubhouse"><span aria-hidden="true">×</span><small>BACK TO ROOM</small></button>;
}

function PortalOutline({ points }: { points: string }) {
  return <svg className="object-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points={points} /></svg>;
}

function RoomPortal({
  kind,
  points,
  title,
  description,
  onOpen,
  play = false,
}: {
  kind: "next" | "archive" | "sounds" | "play";
  points: string;
  title: string;
  description: string;
  onOpen: () => void;
  play?: boolean;
}) {
  const descriptionId = `portal-${kind}-description`;
  return (
    <div className={`room-portal portal-${kind}`}>
      <button className="portal-hit" onClick={onOpen} aria-label={title} aria-describedby={descriptionId}>
        <span className="object-surface" aria-hidden="true" />
        <span className="object-glow" aria-hidden="true" />
        <PortalOutline points={points} />
        {play && <span className="simulator-play" aria-hidden="true"><i /></span>}
      </button>
      <span className="object-label" id={descriptionId}><b>{title}</b><small>{description}</small></span>
    </div>
  );
}

export default function Home() {
  const [roomState, setRoomState] = useState<RoomState>("home");
  const [joinState, setJoinState] = useState<JoinState>("idle");
  const [joinMessage, setJoinMessage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hash = window.location.hash.replace("#", "") as RoomState;
      if (["next", "archive", "sounds"].includes(hash)) setRoomState(hash);
      const viewport = viewportRef.current;
      if (viewport && window.innerWidth < 760) viewport.scrollLeft = viewport.scrollWidth * 0.055;
    }, 40);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (selectedPhoto !== null) {
        if (event.key === "Escape") setSelectedPhoto(null);
        if (event.key === "ArrowLeft") setSelectedPhoto((selectedPhoto - 1 + archiveCards.length) % archiveCards.length);
        if (event.key === "ArrowRight") setSelectedPhoto((selectedPhoto + 1) % archiveCards.length);
      } else if (event.key === "Escape") {
        setRoomState("home");
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedPhoto]);

  function setState(next: RoomState) {
    setSelectedPhoto(null);
    setRoomState(next);
    const hash = next === "home" ? window.location.pathname : `#${next}`;
    window.history.replaceState(null, "", hash);
  }

  function closeRoom() { setState("home"); }

  async function submitJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (joinState === "loading") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setJoinState("loading");
    setJoinMessage("ADDING YOU TO THE LIST…");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          company: String(formData.get("company") || ""),
          pageUrl: window.location.href,
          startedAt: Date.now(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Subscription failed.");
      form.reset();
      setJoinState("success");
      setJoinMessage(data.message || "YOU’RE ON THE LIST.");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setJoinState("error");
      setJoinMessage("SOMETHING WENT WRONG. PLEASE TRY AGAIN.");
    }
  }

  function focusSignup() {
    closeRoom();
    window.setTimeout(() => firstNameRef.current?.focus(), 280);
  }

  return (
    <main className={`clubhouse-app state-${roomState}`}>
      <h1 className="sr-only">STICK — Welcome to the new clubhouse</h1>

      <div className="room-viewport" ref={viewportRef} aria-hidden={roomState !== "home"}>
        <div className="room-stage">
          <div className="room-canvas">
            <div className="room-vignette" /><div className="ambient-light light-one" /><div className="ambient-light light-two" />
            <div className="room-atmosphere" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
            <div className="architectural-welcome" aria-hidden="true">WELCOME TO THE NEW CLUBHOUSE</div>
            <RoomPortal kind="next" points="0,9 88,0 100,88 14,100" title="NEXT ROUND" description="Fairways & Friends Vol. 2" onOpen={() => setState("next")} />
            <RoomPortal kind="archive" points="92.4,0 100,0 100,98.9 97.6,100 91.8,99.7 84.1,97.2 47.6,97.2 47.1,88.8 31.2,88 28.2,86.3 7.6,86.3 5.9,82.1 5.9,28.6 3.5,27.5 .6,21.8 2.4,16.2 1.2,10.9" title="THE ARCHIVE" description="Fairways & Friends Vol. 1" onOpen={() => setState("archive")} />
            <RoomPortal kind="sounds" points="60.2,.9 79.2,.9 88.6,6.1 86.9,48.2 98.3,54.4 100,89.5 93.2,90.4 89.8,95.6 74.2,95.6 69.1,92.1 59.3,92.1 55.5,100 48.7,98.2 48.3,89.5 38.6,89.5 33.1,92.1 24.2,87.7 16.1,81.6 6.8,78.1 .4,65.8 .4,41.2 24.6,33.3 35.2,30.7 44.9,31.6 50.4,36.8 58.9,36.8" title="CLUBHOUSE SOUNDS" description="One evolving STICK mix" onOpen={() => setState("sounds")} />
            <RoomPortal kind="play" points="1,1 100,0 99,99 0,100" title="PLAY POCKET GOLF" description="Hole 13 · Azalea Bend" onOpen={() => setState("play")} play />
            <span className="simulator-depth-mask" aria-hidden="true" />
          </div>
        </div>
      </div>

      <p className="mobile-look-hint">SWIPE TO LOOK AROUND <span>↔</span></p>

      <aside className={`signup-dock ${joinState === "success" ? "is-joined" : ""}`} aria-label="Join the STICK clubhouse">
        {joinState !== "success" ? <form onSubmit={submitJoin} aria-busy={joinState === "loading"}>
          <label><span className="sr-only">First name</span><input ref={firstNameRef} name="firstName" autoComplete="given-name" required placeholder="FIRST NAME" /></label>
          <label><span className="sr-only">Email address</span><input name="email" type="email" autoComplete="email" required placeholder="EMAIL ADDRESS" /></label>
          <input className="signup-honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button type="submit" disabled={joinState === "loading"}>{joinState === "loading" ? "SIGNING UP…" : "SIGN ME UP"} <span>→</span></button>
          {joinMessage && <p className={`signup-status is-${joinState}`} role="status" aria-live="polite">{joinMessage}</p>}
        </form> : <div className="signup-confirmation" role="status"><strong>{joinMessage || "YOU’RE ON THE LIST."}</strong><button onClick={() => { setJoinState("idle"); setJoinMessage(""); }}>ADD ANOTHER</button></div>}
      </aside>

      {roomState !== "home" && <div className="experience-layer" role="presentation">
        <div className="experience-scrim" onClick={closeRoom} />

        {roomState === "next" && <section className="experience-panel event-panel" role="dialog" aria-modal="true" aria-labelledby="event-title">
          <CloseButton onClick={closeRoom} /><div className="chalk-rule" /><p className="panel-kicker">THE NEXT ROUND</p><h2 id="event-title">FAIRWAYS<br />&amp; FRIENDS</h2><div className="event-volume">VOL. 2</div>
          <div className="event-meta"><span>NOVEMBER 2026</span><span>DATE TO BE ANNOUNCED</span></div><p className="event-copy">Good swings. Good vibes. Good people. The next gathering is taking shape.</p>
          <button className="text-link light-link" onClick={focusSignup}>BE FIRST TO KNOW <span>→</span></button><small className="editable-note">LIVE WEBSITE COPY — EASY TO UPDATE WHEN THE DATE IS SET</small>
        </section>}

        {roomState === "archive" && <section className="experience-panel archive-panel" role="dialog" aria-modal="true" aria-labelledby="archive-title">
          <CloseButton onClick={closeRoom} /><div className="archive-header"><div><p className="panel-kicker">THE ARCHIVE / ROLL 001</p><h2 id="archive-title">FAIRWAYS &amp; FRIENDS<br />VOL. 1</h2></div><p>Sixteen frames from the first round.<br />Open one, then move through the story.</p></div>
          <div className="photo-contact-sheet">{archiveCards.map((card, index) => <button className="archive-photo" key={card.src} style={{ "--rotate": card.rotate } as CSSProperties} onClick={() => setSelectedPhoto(index)} aria-label={`Open photo ${index + 1}: ${card.label}`}><span className="photo-image"><Image src={card.src} alt={card.alt} fill sizes="(max-width: 760px) 44vw, 22vw" unoptimized /></span><small>{String(index + 1).padStart(2, "0")} / {card.label}</small></button>)}</div>
          <a className="archive-external" href="https://stickgolfclub.pixieset.com/fairwaysandfriendsvol01/" target="_blank" rel="noreferrer">VIEW ALL 121 PHOTOS <span>↗</span></a>
          {selectedPhoto !== null && <div className="archive-lightbox" role="dialog" aria-modal="true" aria-label={`${archiveCards[selectedPhoto].label}, photo ${selectedPhoto + 1} of ${archiveCards.length}`} onClick={() => setSelectedPhoto(null)}>
            <button className="lightbox-close" onClick={() => setSelectedPhoto(null)} aria-label="Close enlarged photo">× <small>CLOSE</small></button>
            <button className="lightbox-arrow lightbox-previous" onClick={(event) => { event.stopPropagation(); setSelectedPhoto((selectedPhoto - 1 + archiveCards.length) % archiveCards.length); }} aria-label="Previous photo">←</button>
            <figure onClick={(event) => event.stopPropagation()}>
              <div className="lightbox-image"><Image src={archiveCards[selectedPhoto].src} alt={archiveCards[selectedPhoto].alt} fill sizes="92vw" priority unoptimized /></div>
              <figcaption><span>{String(selectedPhoto + 1).padStart(2, "0")} / {archiveCards.length}</span><strong>{archiveCards[selectedPhoto].label}</strong><small>USE ← → KEYS TO MOVE THROUGH THE ROLL</small></figcaption>
            </figure>
            <button className="lightbox-arrow lightbox-next" onClick={(event) => { event.stopPropagation(); setSelectedPhoto((selectedPhoto + 1) % archiveCards.length); }} aria-label="Next photo">→</button>
          </div>}
        </section>}

        {roomState === "sounds" && <section className="experience-panel sounds-panel" role="dialog" aria-modal="true" aria-labelledby="sounds-title">
          <CloseButton onClick={closeRoom} /><div className="sounds-copy"><p className="panel-kicker">NOW SPINNING</p><h2 id="sounds-title">SOUNDS FROM<br />THE CLUBHOUSE</h2><p>One evolving mix for the drive over, the first tee and everything after the round.</p><div className="now-playing"><i /><span>STICK RADIO / SIDE A</span><b>33⅓</b></div></div>
          <div className="turntable" aria-hidden="true"><div className="record"><Image src="/assets/stick-s.png" alt="" width={373} height={319} unoptimized /></div><div className="tonearm"><i /></div></div>
          <div className="playlist-crate single-playlist"><a href={mainPlaylistLink} target="_blank" rel="noreferrer"><span>THE CLUBHOUSE MIX</span><b>01</b><small>OPEN IN SPOTIFY ↗</small></a></div>
        </section>}

        {roomState === "play" && <PocketGolfEmbed onExit={closeRoom} />}

      </div>}
    </main>
  );
}
