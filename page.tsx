"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Darkroom } from "./darkroom";
import { ListeningRoom } from "./listening-room";
import PocketGolfEmbed from "./pocket-golf-embed";
import { CloseButton } from "./room-ui";
import { comingUp, type EventDetails, eventIsOver, eventLink, instagramHandle, instagramUrl, nextEvent, rounds, vision } from "./site-content";

type RoomState = "home" | "next" | "archive" | "sounds" | "play" | "about";
type JoinState = "idle" | "loading" | "success" | "error";

const mainPlaylistEmbed = "https://open.spotify.com/embed/playlist/3444vekU37Ct11BEwRVFUE?utm_source=generator&si=b1b5c74c3ea24311";
const seriesLogo = "/assets/brand/fairways-and-friends.svg";

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
  event,
  isOpen,
  onOpen,
  onClose,
  onJoin,
  onSeePhotos,
}: {
  event: EventDetails | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onJoin: () => void;
  onSeePhotos: () => void;
}) {
  const volume = event ? event.volume : comingUp.volume;
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
      {!isOpen ? <button ref={triggerRef} className="portal-hit chalkboard-hit" onClick={onOpen} aria-label={event ? `Open the next ${event.series} event details` : `${comingUp.series} ${comingUp.volume}: what's next`} aria-describedby="portal-next-description">
        <span className="object-surface" aria-hidden="true" />
        <span className="object-glow" aria-hidden="true" />
        <PortalOutline points="0,9 88,0 100,88 14,100" />
        <span className="chalkboard-wipe" aria-hidden="true" />
        <span className="chalkboard-teaser" aria-hidden="true">
          <small>Up next:</small>
          <span className="series-logo-mask chalkboard-logo" />
          <b>{volume}</b>
          <svg className="chalkboard-stroke" viewBox="0 0 100 8" preserveAspectRatio="none"><path d="M3 5C30 2 62 6 97 3" /></svg>
          <em>{event ? `${event.dateShort} · ${event.timeShort}` : comingUp.when}</em>
          <label className={event ? undefined : "is-long"}>{event ? "tap for details" : "get the first invite"}</label>
        </span>
      </button> : <section className="event-board-face" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <div className="event-board-slate">
          <CloseButton onClick={onClose} buttonRef={closeRef} />
          <div className="chalk">
            <h2 id="event-title"><span className="sr-only">{comingUp.series}</span><span className="series-logo-mask event-board-logo" aria-hidden="true" /></h2>
            <div className="event-volume"><span>{volume.toUpperCase()}</span>
              <svg viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M3 8C28 4 58 9 117 4" /></svg>
            </div>
            <svg className="event-board-flight" viewBox="0 0 150 80" fill="none" aria-hidden="true">
              <path className="flight-arc" d="M4 76C30 40 70 22 112 20" />
              <circle className="flight-ball" cx="130" cy="18" r="13" />
              <path className="flight-dimples" d="M124 13h.1M130 11h.1M136 14h.1M126 19h.1M132 17h.1M137 20h.1M128 24h.1M134 24h.1" />
            </svg>
          </div>
          <div className="event-board-details chalk">
            {event ? <>
              <strong>{event.dateFull}</strong>
              <span>{event.timeLong}</span>
              <span>{event.venue.toUpperCase()} · {event.city.toUpperCase()}</span>
            </> : <>
              <strong>COMING {comingUp.when.toUpperCase()}</strong>
              <span>DATE &amp; VENUE TO COME</span>
              <span>THE LIST HEARS FIRST</span>
            </>}
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
            <span className={"event-price" + (event ? "" : " is-soon")}><b>{event ? event.price : "soon"}</b></span>
          </div>
          {event
            ? <a className="event-reserve-button" href={eventLink(event, "chalkboard")} target="_blank" rel="noreferrer"><span>RESERVE YOUR SPOT</span></a>
            : <>
              <button className="event-reserve-button" onClick={onJoin}><span>GET THE FIRST INVITE</span></button>
              <button className="event-board-aside" onClick={onSeePhotos}>Missed the last one? See the photos <span aria-hidden="true">→</span></button>
            </>}
        </div>
      </section>}
      {!isOpen && <span className="object-label" id="portal-next-description"><b>NEXT ROUND</b><small>{event ? `${event.series} ${event.volume} · ${event.dateShort}` : `${comingUp.series} ${comingUp.volume} · ${comingUp.when}`}</small></span>}
    </div>
  );
}

export default function Home() {
  const [roomState, setRoomState] = useState<RoomState>("home");
  const [joinState, setJoinState] = useState<JoinState>("idle");
  const [joinMessage, setJoinMessage] = useState("");
  // The board advertises nextEvent until it ends, then switches to what's coming up, even without a redeploy.
  const [eventOver, setEventOver] = useState(false);
  const activeEvent = nextEvent && !eventOver ? nextEvent : null;
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
      if (nextEvent && eventIsOver(nextEvent)) setEventOver(true);
      const hash = window.location.hash.replace("#", "").split("/")[0] as RoomState;
      if (["next", "archive", "sounds", "about"].includes(hash)) setRoomState(hash);
      if (hash === "sounds") setSoundsLoaded(true);
      const viewport = viewportRef.current;
      if (viewport && window.innerWidth < 760) viewport.scrollLeft = viewport.scrollWidth * 0.055;
    }, 40);
    // The invitation greets a visitor once per event, after they have had a moment to see the room.
    const inviteTimer = window.setTimeout(() => {
      const event = nextEvent && !eventIsOver(nextEvent) ? nextEvent : null;
      if (!event || window.location.hash) return;
      const inviteSeenKey = `stick-invite-seen:${event.id}`;
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
      if (event.key === "Escape" && eventInviteOpen) {
        setEventInviteOpen(false);
      } else if (event.key === "Escape") {
        setRoomState("home");
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function setState(next: RoomState) {
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
              <RoomPortal kind="archive" points="92.4,0 100,0 100,98.9 97.6,100 91.8,99.7 84.1,97.2 47.6,97.2 47.1,88.8 31.2,88 28.2,86.3 7.6,86.3 5.9,82.1 5.9,28.6 3.5,27.5 .6,21.8 2.4,16.2 1.2,10.9" title="THE ARCHIVE" description={`Every round in photos · Vol. ${rounds.map((round) => round.volume.replace("Vol. ", "")).join(" & ")}`} onOpen={() => setState("archive")} />
              <RoomPortal kind="sounds" points="1.3,22.1 22.0,13.4 49.6,5.5 85.0,7.7 90.9,2.1 97.2,5.5 98.4,35.2 82.1,39.6 81.1,98.0 61.4,92.7 11.2,70.1 1.7,61.4" title="CLUBHOUSE SOUNDS" description="The listening room · F&F playlist" onOpen={() => setState("sounds")} />
              <RoomPortal kind="play" points="1,1 100,0 99,99 0,100" title="PLAY POCKET GOLF" description="Hole 13 · Azalea Bend" onOpen={() => setState("play")} play />
              <span className="simulator-depth-mask" aria-hidden="true" />
            </div>
            <EventChalkboard event={activeEvent} isOpen={roomState === "next"} onOpen={() => setState("next")} onClose={closeRoom} onJoin={goToSignup} onSeePhotos={() => setState("archive")} />
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

        {roomState === "archive" && <Darkroom rounds={rounds} onClose={closeRoom} />}

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
                <Image src={seriesLogo} alt={comingUp.series} width={1965} height={616} unoptimized />
                <div>
                  <p>{vision.seriesBlurb}</p>
                  <button className="about-link" onClick={() => setState("next")}>{activeEvent ? `${activeEvent.volume} · ${activeEvent.dateLong}` : `${comingUp.volume} · ${comingUp.when}`} <span aria-hidden="true">→</span></button>
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
        <ListeningRoom embedSrc={mainPlaylistEmbed} onClose={closeRoom} />
      </div>}

      {soundsLoaded && roomState === "home" && !eventInviteOpen && <div className="sounds-chip">
        <button className="sounds-chip-open" onClick={() => setState("sounds")} aria-label="Open the Clubhouse Sounds player"><i aria-hidden="true"><b /><b /><b /></i>CLUBHOUSE SOUNDS</button>
        <button className="sounds-chip-stop" onClick={() => setSoundsLoaded(false)} aria-label="Stop the music and close the player">×</button>
      </div>}

      {eventInviteOpen && activeEvent && roomState === "home" && <div className="event-invite-layer">
        <div className="event-invite-scrim" aria-hidden="true" onClick={() => setEventInviteOpen(false)} />
        <svg className="event-invite-arrow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs><marker id="invite-arrowhead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto" viewBox="0 0 5 5"><path d="M0 0 L5 2.5 L0 5 Z" /></marker></defs>
          <path className="desktop-invite-arrow" d="M 37 49 C 31 55, 25 62, 18 72" markerEnd="url(#invite-arrowhead)" />
          <path className="mobile-invite-arrow" d="M 7 65 C 9 71, 12 76, 15 82" markerEnd="url(#invite-arrowhead)" />
        </svg>
        <section className="event-invite-card" role="dialog" aria-modal="true" aria-labelledby="invite-title">
          <button ref={inviteCloseRef} className="event-invite-close" onClick={() => setEventInviteOpen(false)} aria-label="Close event announcement">×</button>
          <p className="invite-kicker">UP NEXT AT STICK</p>
          <h2 id="invite-title"><Image className="invite-logo" src={seriesLogo} alt={activeEvent.series} width={1965} height={616} priority unoptimized /><span>{activeEvent.volume}</span></h2>
          <div className="invite-rule" />
          <div className="invite-event-details"><strong>{activeEvent.dateLong}</strong><span>{activeEvent.timeShort} · {activeEvent.venue} · {activeEvent.city}</span><b>{activeEvent.price}</b></div>
          <a className="invite-reserve-link" href={eventLink(activeEvent, "invite")} target="_blank" rel="noreferrer" onClick={() => setEventInviteOpen(false)}>RESERVE YOUR SPOT <span>↗</span></a>
        </section>
        <p className="invite-board-note">You can also open event details on the chalkboard.</p>
      </div>}
    </main>
  );
}
