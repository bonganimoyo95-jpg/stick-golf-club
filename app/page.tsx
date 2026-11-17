"use client";

import Image from "next/image";
import { type CSSProperties, type FormEvent, type RefObject, useEffect, useRef, useState } from "react";
import PocketGolfEmbed from "./pocket-golf-embed";
import { instagramHandle, instagramUrl, nextEvent, vision } from "./site-content";

type RoomState = "home" | "next" | "archive" | "sounds" | "play" | "about";
type JoinState = "idle" | "loading" | "success" | "error";

const mainPlaylistEmbed = "https://open.spotify.com/embed/playlist/3444vekU37Ct11BEwRVFUE?utm_source=generator&si=b1b5c74c3ea24311";
const inviteSeenKey = `stick-invite-seen:${nextEvent.id}`;
const seriesLogo = "/assets/brand/fairways-and-friends.svg";

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
  kind: "archive" | "sounds" | "play" | "about";
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
      {!isOpen ? <button ref={triggerRef} className="portal-hit chalkboard-hit" onClick={onOpen} aria-label={`Open the next ${nextEvent.series} event details`} aria-describedby="portal-next-description">
        <span className="object-surface" aria-hidden="true" />
        <span className="object-glow" aria-hidden="true" />
        <PortalOutline points="0,9 88,0 100,88 14,100" />
        <span className="chalkboard-wipe" aria-hidden="true" />
        <span className="chalkboard-teaser" aria-hidden="true">
          <small>Up next:</small>
          <span className="series-logo-mask chalkboard-logo" />
          <b>{nextEvent.volume}</b>
          <svg className="chalkboard-stroke" viewBox="0 0 100 8" preserveAspectRatio="none"><path d="M3 5C30 2 62 6 97 3" /></svg>
          <em>{nextEvent.dateShort} · {nextEvent.timeShort}</em>
          <label>tap for details</label>
        </span>
      </button> : <section className="event-board-face" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <div className="event-board-slate">
          <CloseButton onClick={onClose} buttonRef={closeRef} />
          <div className="chalk">
            <h2 id="event-title"><span className="sr-only">{nextEvent.series}</span><span className="series-logo-mask event-board-logo" aria-hidden="true" /></h2>
            <div className="event-volume"><span>{nextEvent.volume.toUpperCase()}</span>
              <svg viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M3 8C28 4 58 9 117 4" /></svg>
            </div>
            <svg className="event-board-flight" viewBox="0 0 150 80" fill="none" aria-hidden="true">
              <path className="flight-arc" d="M4 76C30 40 70 22 112 20" />
              <circle className="flight-ball" cx="130" cy="18" r="13" />
              <path className="flight-dimples" d="M124 13h.1M130 11h.1M136 14h.1M126 19h.1M132 17h.1M137 20h.1M128 24h.1M134 24h.1" />
            </svg>
          </div>
          <div className="event-board-details chalk">
            <strong>{nextEvent.dateFull}</strong>
            <span>{nextEvent.timeLong}</span>
            <span>{nextEvent.venue.toUpperCase()} · {nextEvent.city.toUpperCase()}</span>
          </div>
          <div className="event-board-art chalk" aria-hidden="true">
            <svg viewBox="0 0 220 96" fill="none">
              <path d="M30 40l-6 11h4l-7 11h5l-8 11h24l-8-11h5l-7-11h4zM30 73v7M52 50l-5 9h3l-6 9h4l-6 8h20l-6-8h4l-6-9h3zM52 76v5M70 60l-4 7h3l-5 8h12l-5-8h3zM70 75v4" />
              <path d="M8 84c30-9 60-12 96-12s70 4 108 12" />
              <ellipse cx="128" cy="78" rx="62" ry="10" />
              <path className="art-soft" d="M84 80c20 5 66 6 90 0M70 76c8-3 20-5 30-5M96 86c22 3 52 3 72-1" />
              <path d="M128 78V34l22 8-22 9" />
              <path className="art-soft" d="M124 79c2 1 6 1 8 0" />
            </svg>
            <span className="event-price"><b>{nextEvent.price}</b></span>
          </div>
          <a className="event-reserve-button" href={nextEvent.link("chalkboard")} target="_blank" rel="noreferrer"><span>RESERVE YOUR SPOT</span></a>
        </div>
      </section>}
      {!isOpen && <span className="object-label" id="portal-next-description"><b>NEXT ROUND</b><small>{nextEvent.series} {nextEvent.volume} · {nextEvent.dateShort}</small></span>}
    </div>
  );
}

export default function Home() {
  const [roomState, setRoomState] = useState<RoomState>("home");
  const [joinState, setJoinState] = useState<JoinState>("idle");
  const [joinMessage, setJoinMessage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [eventInviteOpen, setEventInviteOpen] = useState(false);
  // Once opened, the Spotify player stays mounted so music keeps playing while the visitor explores.
  const [soundsLoaded, setSoundsLoaded] = useState(false);
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
      if (["next", "archive", "sounds", "about"].includes(hash)) setRoomState(hash);
      if (hash === "sounds") setSoundsLoaded(true);
      const viewport = viewportRef.current;
      if (viewport && window.innerWidth < 760) viewport.scrollLeft = viewport.scrollWidth * 0.055;
    }, 40);
    // The invitation greets a visitor once per event, after they have had a moment to see the room.
    const inviteTimer = window.setTimeout(() => {
      if (!nextEvent.live || window.location.hash) return;
      let seen = false;
      try { seen = window.localStorage.getItem(inviteSeenKey) === "1"; } catch { /* storage unavailable: show it */ }
      if (seen) return;
      setEventInviteOpen(true);
      try { window.localStorage.setItem(inviteSeenKey, "1"); } catch { /* ignore */ }
    }, 1800);
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
    if (next === "sounds") setSoundsLoaded(true);
    setRoomState(next);
    const hash = next === "home" ? window.location.pathname : `#${next}`;
    window.history.replaceState(null, "", hash);
  }

  function closeRoom() { setState("home"); }

  function goToSignup() {
    setState("home");
    window.setTimeout(() => firstNameRef.current?.focus(), 80);
  }

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
          // The bridge still receives this as `company`; the input itself has a name autofill tools ignore.
          company: String(formData.get("hp_trap_x7") || ""),
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
      <svg className="chalk-defs" aria-hidden="true" focusable="false">
        <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="2" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="8" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 1.75" result="dust" />
          <feComposite in="rough" in2="dust" operator="in" />
        </filter>
        <filter id="chalk-fine" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="5" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.1" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="11" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.6" result="dust" />
          <feComposite in="rough" in2="dust" operator="in" />
        </filter>
      </svg>

      <h1 className="sr-only">STICK — Welcome to the new clubhouse</h1>

      <div className="room-viewport" ref={viewportRef} aria-hidden={(roomState !== "home" && roomState !== "next") || eventInviteOpen}>
        <div className="room-stage">
          <div className="room-canvas">
            <div className="room-scene-layer" aria-hidden={roomState === "next"} inert={roomState === "next"}>
              <div className="room-vignette" /><div className="ambient-light light-one" /><div className="ambient-light light-two" />
              <div className="room-atmosphere" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
              <div className="architectural-welcome" aria-hidden="true">WELCOME TO THE NEW CLUBHOUSE</div>
              <RoomPortal kind="about" points="0,0 100,0 100,100 0,100" title="WHAT IS STICK?" description="Our story and what's next" onOpen={() => setState("about")} />
              <RoomPortal kind="archive" points="92.4,0 100,0 100,98.9 97.6,100 91.8,99.7 84.1,97.2 47.6,97.2 47.1,88.8 31.2,88 28.2,86.3 7.6,86.3 5.9,82.1 5.9,28.6 3.5,27.5 .6,21.8 2.4,16.2 1.2,10.9" title="THE ARCHIVE" description="Fairways & Friends Vol. 01" onOpen={() => setState("archive")} />
              <RoomPortal kind="sounds" points="1.3,22.1 22.0,13.4 49.6,5.5 85.0,7.7 90.9,2.1 97.2,5.5 98.4,35.2 82.1,39.6 81.1,98.0 61.4,92.7 11.2,70.1 1.7,61.4" title="CLUBHOUSE SOUNDS" description="Fairways & Friends playlist" onOpen={() => setState("sounds")} />
              <RoomPortal kind="play" points="1,1 100,0 99,99 0,100" title="PLAY POCKET GOLF" description="Hole 13 · Azalea Bend" onOpen={() => setState("play")} play />
              <span className="simulator-depth-mask" aria-hidden="true" />
            </div>
            <EventChalkboard isOpen={roomState === "next"} onOpen={() => setState("next")} onClose={closeRoom} />
          </div>
        </div>
      </div>

      <button className="brand-mark" onClick={() => setState("about")} aria-label="What is STICK? Read our story" aria-hidden={eventInviteOpen || roomState !== "home"} tabIndex={eventInviteOpen || roomState !== "home" ? -1 : 0}>
        <span className="brand-mark-logo" aria-hidden="true" />
        <small>WHAT IS STICK? <span aria-hidden="true">→</span></small>
      </button>

      <p className="mobile-look-hint">SWIPE TO LOOK AROUND <span>↔</span></p>

      <aside className={`signup-dock ${joinState === "success" ? "is-joined" : ""}`} aria-label="Join the STICK clubhouse" aria-hidden={eventInviteOpen || roomState === "next"}>
        {joinState !== "success" ? <form onSubmit={submitJoin} aria-busy={joinState === "loading"}>
          <label><span className="sr-only">First name</span><input ref={firstNameRef} name="firstName" autoComplete="given-name" required placeholder="FIRST NAME" enterKeyHint="next" /></label>
          <label><span className="sr-only">Email address</span><input name="email" type="email" autoComplete="email" required placeholder="EMAIL" inputMode="email" enterKeyHint="send" /></label>
          <input className="signup-honeypot" name="hp_trap_x7" tabIndex={-1} autoComplete="off" aria-hidden="true" data-1p-ignore data-lpignore="true" data-form-type="other" />
          <button type="submit" disabled={joinState === "loading"}>{joinState === "loading" ? "JOINING…" : "JOIN THE LIST"} <span aria-hidden="true">→</span></button>
          {!joinMessage && <p className="signup-promise">FIRST WORD ON EVERY STICK EVENT. NO SPAM.</p>}
          {joinMessage && <p className={`signup-status is-${joinState}`} role="status" aria-live="polite">{joinMessage}</p>}
        </form> : <div className="signup-confirmation" role="status"><strong>{joinMessage || "YOU’RE ON THE LIST."}</strong><button onClick={() => { setJoinState("idle"); setJoinMessage(""); }}>ADD ANOTHER</button></div>}
      </aside>

      {roomState !== "home" && roomState !== "next" && roomState !== "sounds" && <div className="experience-layer" role="presentation">
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

        {roomState === "about" && <section className="experience-panel about-panel" role="dialog" aria-modal="true" aria-labelledby="about-title">
          <CloseButton onClick={closeRoom} />
          <div className="about-inner">
            <span className="about-wordmark" role="img" aria-label="STICK" />
            <p className="panel-kicker">{vision.kicker}</p>
            <h2 id="about-title">{vision.headline}</h2>
            {vision.paragraphs.map((paragraph) => <p className="about-copy" key={paragraph}>{paragraph}</p>)}
            <div className="about-programs">
              <p className="panel-kicker">{vision.programsTitle}</p>
              <div className="about-series">
                <Image src={seriesLogo} alt={nextEvent.series} width={1965} height={616} unoptimized />
                <div>
                  <p>{vision.seriesBlurb}</p>
                  {nextEvent.live && <button className="about-link" onClick={() => setState("next")}>{nextEvent.volume} · {nextEvent.dateLong} <span aria-hidden="true">→</span></button>}
                </div>
              </div>
            </div>
            <div className="about-actions">
              <button className="about-join" onClick={goToSignup}>JOIN THE LIST <span aria-hidden="true">→</span></button>
              <a className="about-social" href={instagramUrl} target="_blank" rel="noreferrer">INSTAGRAM {instagramHandle} <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>}

        {roomState === "play" && <PocketGolfEmbed onExit={closeRoom} />}

      </div>}

      {soundsLoaded && <div className={"experience-layer sounds-layer" + (roomState === "sounds" ? "" : " is-parked")} role="presentation" aria-hidden={roomState !== "sounds"} inert={roomState !== "sounds"}>
        <div className="experience-scrim" onClick={closeRoom} />
        <section className="experience-panel sounds-panel listening-room-panel" role="dialog" aria-modal="true" aria-labelledby="sounds-title">
          <h2 id="sounds-title" className="sr-only">Clubhouse Sounds: Fairways &amp; Friends</h2>
          <CloseButton onClick={closeRoom} />
          <div className="listening-room-image">
            <div className="listening-screen">
              <iframe data-testid="embed-iframe" src={mainPlaylistEmbed} width="100%" height="100%" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Fairways &amp; Friends playlist on Spotify" />
            </div>
          </div>
          <p className="sounds-keep-note">MUSIC KEEPS PLAYING WHEN YOU HEAD BACK TO THE ROOM.</p>
        </section>
      </div>}

      {soundsLoaded && roomState === "home" && !eventInviteOpen && <div className="sounds-chip">
        <button className="sounds-chip-open" onClick={() => setState("sounds")} aria-label="Open the Clubhouse Sounds player"><i aria-hidden="true"><b /><b /><b /></i>CLUBHOUSE SOUNDS</button>
        <button className="sounds-chip-stop" onClick={() => setSoundsLoaded(false)} aria-label="Stop the music and close the player">×</button>
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
          <h2 id="invite-title"><Image className="invite-logo" src={seriesLogo} alt={nextEvent.series} width={1965} height={616} priority unoptimized /><span>{nextEvent.volume}</span></h2>
          <div className="invite-rule" />
          <div className="invite-event-details"><strong>{nextEvent.dateLong}</strong><span>{nextEvent.timeShort} · {nextEvent.venue} · {nextEvent.city}</span><b>{nextEvent.price}</b></div>
          <a className="invite-reserve-link" href={nextEvent.link("invite")} target="_blank" rel="noreferrer" onClick={() => setEventInviteOpen(false)}>RESERVE YOUR SPOT <span>↗</span></a>
        </section>
        <p className="invite-board-note">You can also open event details on the chalkboard.</p>
      </div>}
    </main>
  );
}
