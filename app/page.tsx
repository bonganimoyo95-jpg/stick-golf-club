"use client";

import Image from "next/image";
import { type CSSProperties, type FormEvent, type RefObject, useEffect, useRef, useState } from "react";
import PocketGolfEmbed from "./pocket-golf-embed";

type RoomState = "home" | "next" | "archive" | "sounds" | "play";
type JoinState = "idle" | "loading" | "success" | "error";

const mainPlaylistEmbed = "https://open.spotify.com/embed/playlist/3444vekU37Ct11BEwRVFUE?utm_source=generator&si=b1b5c74c3ea24311";
const nextEventLink = "https://luma.com/tyngzys7";

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

function CloseButton({ onClick, buttonRef }: { onClick: () => void; buttonRef?: RefObject<HTMLButtonElement | null> }) {
  return <button ref={buttonRef} className="close-button" onClick={onClick} aria-label="Return to the clubhouse"><span aria-hidden="true">×</span><small>BACK TO ROOM</small></button>;
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
  kind: "archive" | "sounds" | "play";
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

function EventChalkboard({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
    else if (wasOpenRef.current) triggerRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <div className={"room-portal portal-next chalkboard-object" + (isOpen ? " is-open" : "")}>
      {!isOpen ? <button ref={triggerRef} className="portal-hit chalkboard-hit" onClick={onOpen} aria-label="Open the next Fairways & Friends event details" aria-describedby="portal-next-description">
        <span className="object-surface" aria-hidden="true" />
        <span className="object-glow" aria-hidden="true" />
        <PortalOutline points="0,9 88,0 100,88 14,100" />
        <span className="chalkboard-teaser" aria-hidden="true">
          <small>UP NEXT</small>
          <strong>FAIRWAYS<br />&amp; FRIENDS</strong>
          <b>VOL. 02</b>
          <i />
          <em>NOV 19 · 8–11 PM</em>
          <em>HIDEOUT GOLF · $30</em>
          <label>TAP FOR DETAILS</label>
        </span>
      </button> : <section className="event-board-face" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <div className="event-board-slate">
          <CloseButton onClick={onClose} buttonRef={closeRef} />
          <p className="event-board-kicker">THE NEXT ROUND · VANCOUVER</p>
          <h2 id="event-title">FAIRWAYS<br />&amp; FRIENDS</h2>
          <div className="event-volume">VOL. 02</div>
          <div className="event-board-rule" />
          <div className="event-board-details">
            <strong>THURSDAY, NOVEMBER 19, 2026</strong>
            <span>8:00–11:00 PM</span>
            <span>HIDEOUT GOLF · VANCOUVER</span>
          </div>
          <div className="event-board-art" aria-hidden="true">
            <svg viewBox="0 0 180 82" fill="none">
              <path d="M5 67c20-18 35-21 55-11 11-18 25-19 42-8 12-22 29-25 54-6 10-3 17-1 22 3" />
              <path d="M15 71h151M80 65V26m0 0 22 9-22 8" />
              <path d="M20 68 28 49l9 19m5 0 10-26 11 26m51 0 9-19 8 19" />
              <circle cx="145" cy="24" r="15" />
            </svg>
            <span className="event-price"><small>ENTRY</small><b>$30</b></span>
          </div>
          <a className="event-reserve-button" href={nextEventLink} target="_blank" rel="noreferrer">RESERVE YOUR SPOT <span>↗</span></a>
          <small className="event-board-footnote">TICKETS &amp; FULL DETAILS ON LUMA</small>
        </div>
      </section>}
      {!isOpen && <span className="object-label" id="portal-next-description"><b>NEXT ROUND</b><small>Fairways &amp; Friends Vol. 02 · November 19</small></span>}
    </div>
  );
}

export default function Home() {
  const [roomState, setRoomState] = useState<RoomState>("home");
  const [joinState, setJoinState] = useState<JoinState>("idle");
  const [joinMessage, setJoinMessage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [eventInviteOpen, setEventInviteOpen] = useState(false);
  const inviteCloseRef = useRef<HTMLButtonElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const signupStartedAt = useRef(0);

useEffect(() => {
  signupStartedAt.current = Date.now();
}, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hash = window.location.hash.replace("#", "") as RoomState;
      if (["next", "archive", "sounds"].includes(hash)) setRoomState(hash);
      const viewport = viewportRef.current;
      if (viewport && window.innerWidth < 760) viewport.scrollLeft = viewport.scrollWidth * 0.055;
    }, 40);
    const inviteTimer = window.setTimeout(() => {
      if (!window.location.hash) setEventInviteOpen(true);
    }, 650);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(inviteTimer);
    };
  }, []);

  useEffect(() => {
    if (!eventInviteOpen) return;
    const timer = window.setTimeout(() => inviteCloseRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [eventInviteOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (eventInviteOpen && event.key === "Tab") {
        const focusable = Array.from(document.querySelectorAll<HTMLElement>(".event-invite-card button:not([disabled]), .event-invite-card a[href]"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (first && last && event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (first && last && !event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        return;
      }
      if (selectedPhoto !== null) {
        if (event.key === "Escape") setSelectedPhoto(null);
        if (event.key === "ArrowLeft") setSelectedPhoto((selectedPhoto - 1 + archiveCards.length) % archiveCards.length);
        if (event.key === "ArrowRight") setSelectedPhoto((selectedPhoto + 1) % archiveCards.length);
      } else if (event.key === "Escape" && eventInviteOpen) {
        setEventInviteOpen(false);
      } else if (event.key === "Escape") {
        setRoomState("home");
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedPhoto, eventInviteOpen]);

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
      const response = await fetch("https://stick-golf-club.bonganimoyo95.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          company: String(formData.get("company") || ""),
          pageUrl: window.location.href,
          startedAt: signupStartedAt.current,
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

  return (
    <main className={`clubhouse-app state-${roomState}`}>
      <h1 className="sr-only">STICK — Welcome to the new clubhouse</h1>

      <div className="room-viewport" ref={viewportRef} aria-hidden={(roomState !== "home" && roomState !== "next") || eventInviteOpen}>
        <div className="room-stage">
          <div className="room-canvas">
            <div className="room-scene-layer" aria-hidden={roomState === "next"} inert={roomState === "next"}>
              <div className="room-vignette" /><div className="ambient-light light-one" /><div className="ambient-light light-two" />
              <div className="room-atmosphere" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
              <div className="architectural-welcome" aria-hidden="true">WELCOME TO THE NEW CLUBHOUSE</div>
              <RoomPortal kind="archive" points="92.4,0 100,0 100,98.9 97.6,100 91.8,99.7 84.1,97.2 47.6,97.2 47.1,88.8 31.2,88 28.2,86.3 7.6,86.3 5.9,82.1 5.9,28.6 3.5,27.5 .6,21.8 2.4,16.2 1.2,10.9" title="THE ARCHIVE" description="Fairways & Friends Vol. 01" onOpen={() => setState("archive")} />
              <RoomPortal kind="sounds" points="60.2,.9 79.2,.9 88.6,6.1 86.9,48.2 98.3,54.4 100,89.5 93.2,90.4 89.8,95.6 74.2,95.6 69.1,92.1 59.3,92.1 55.5,100 48.7,98.2 48.3,89.5 38.6,89.5 33.1,92.1 24.2,87.7 16.1,81.6 6.8,78.1 .4,65.8 .4,41.2 24.6,33.3 35.2,30.7 44.9,31.6 50.4,36.8 58.9,36.8" title="CLUBHOUSE SOUNDS" description="Fairways & Friends playlist" onOpen={() => setState("sounds")} />
              <RoomPortal kind="play" points="1,1 100,0 99,99 0,100" title="PLAY POCKET GOLF" description="Hole 13 · Azalea Bend" onOpen={() => setState("play")} play />
              <span className="simulator-depth-mask" aria-hidden="true" />
            </div>
            <EventChalkboard isOpen={roomState === "next"} onOpen={() => setState("next")} onClose={closeRoom} />
          </div>
        </div>
      </div>

      <p className="mobile-look-hint">SWIPE TO LOOK AROUND <span>↔</span></p>

      <aside className={`signup-dock ${joinState === "success" ? "is-joined" : ""}`} aria-label="Join the STICK clubhouse" aria-hidden={eventInviteOpen || roomState === "next"}>
        {joinState !== "success" ? <form onSubmit={submitJoin} aria-busy={joinState === "loading"}>
          <label><span className="sr-only">First name</span><input ref={firstNameRef} name="firstName" autoComplete="given-name" required placeholder="FIRST NAME" /></label>
          <label><span className="sr-only">Email address</span><input name="email" type="email" autoComplete="email" required placeholder="EMAIL ADDRESS" /></label>
          <input className="signup-honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button type="submit" disabled={joinState === "loading"}>{joinState === "loading" ? "SIGNING UP…" : "SIGN ME UP"} <span>→</span></button>
          {joinMessage && <p className={`signup-status is-${joinState}`} role="status" aria-live="polite">{joinMessage}</p>}
        </form> : <div className="signup-confirmation" role="status"><strong>{joinMessage || "YOU’RE ON THE LIST."}</strong><button onClick={() => { setJoinState("idle"); setJoinMessage(""); }}>ADD ANOTHER</button></div>}
      </aside>

      {roomState !== "home" && roomState !== "next" && <div className="experience-layer" role="presentation">
        <div className="experience-scrim" onClick={closeRoom} />

        {roomState === "archive" && <section className="experience-panel archive-panel" role="dialog" aria-modal="true" aria-labelledby="archive-title">
          <CloseButton onClick={closeRoom} /><div className="archive-header"><div><p className="panel-kicker">THE ARCHIVE / ROLL 001</p><h2 id="archive-title">FAIRWAYS &amp; FRIENDS<br />VOL. 01</h2></div><p>Sixteen frames from the first round.<br />Open one, then move through the story.</p></div>
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

        {roomState === "sounds" && <section className="experience-panel sounds-panel listening-room-panel" role="dialog" aria-modal="true" aria-labelledby="sounds-title">
          <h2 id="sounds-title" className="sr-only">Clubhouse Sounds: Fairways &amp; Friends</h2>
          <CloseButton onClick={closeRoom} />
          <div className="listening-room-image">
            <div className="listening-screen">
              <iframe data-testid="embed-iframe" src={mainPlaylistEmbed} width="100%" height="100%" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Fairways &amp; Friends playlist on Spotify" />
            </div>
          </div>
        </section>}

        {roomState === "play" && <PocketGolfEmbed onExit={closeRoom} />}

      </div>}

      {eventInviteOpen && roomState === "home" && <div className="event-invite-layer">
        <div className="event-invite-scrim" aria-hidden="true" onClick={() => setEventInviteOpen(false)} />
        <svg className="event-invite-arrow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs><marker id="invite-arrowhead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto" viewBox="0 0 5 5"><path d="M0 0 L5 2.5 L0 5 Z" /></marker></defs>
          <path className="desktop-invite-arrow" d="M 37 49 C 31 55, 25 62, 18 72" markerEnd="url(#invite-arrowhead)" />
          <path className="mobile-invite-arrow" d="M 7 65 C 9 71, 12 76, 15 82" markerEnd="url(#invite-arrowhead)" />
        </svg>
        <section className="event-invite-card" role="dialog" aria-modal="true" aria-labelledby="invite-title">
          <button ref={inviteCloseRef} className="event-invite-close" onClick={() => setEventInviteOpen(false)} aria-label="Close event announcement">×</button>
          <p className="invite-kicker">UP NEXT AT STICK</p>
          <h2 id="invite-title">Fairways &amp; Friends <span>Vol. 02</span></h2>
          <div className="invite-rule" />
          <div className="invite-event-details"><strong>Thursday, November 19</strong><span>8–11 PM · Hideout Golf · Vancouver</span><b>$30</b></div>
          <a className="invite-reserve-link" href={nextEventLink} target="_blank" rel="noreferrer" onClick={() => setEventInviteOpen(false)}>RESERVE YOUR SPOT <span>↗</span></a>
        </section>
        <p className="invite-board-note">You can also open event details on the chalkboard.</p>
      </div>}
    </main>
  );
}
