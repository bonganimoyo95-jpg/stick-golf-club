"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef } from "react";
import { CloseButton } from "./room-ui";
import { comingUp, type Round } from "./site-content";

/** Where each print hangs on the line, as a percentage of the room's width. Oldest on the left. */
const desktopSlots = [30, 56];
const vol3Slot = 81;

function ClothesPin() {
  return (
    <svg className="clothespin" viewBox="0 0 18 52" aria-hidden="true">
      <defs>
        <linearGradient id="pin-wood" x1="0" x2="1">
          <stop offset="0" stopColor="#8a5226" />
          <stop offset=".45" stopColor="#e7ad69" />
          <stop offset="1" stopColor="#9b5d2b" />
        </linearGradient>
      </defs>
      <path d="M2.5 1.5h5.6l.6 49H3.4Z" fill="url(#pin-wood)" />
      <path d="M9.9 1.5h5.6l-1 49H9.3Z" fill="url(#pin-wood)" />
      <path d="M8.3 2v48" stroke="#4a2a12" strokeWidth=".8" />
      <rect x="1.6" y="17" width="14.8" height="4.6" rx="1.4" fill="#6b5f55" />
      <rect x="1.6" y="17.6" width="14.8" height="1.2" fill="#c9b8a4" opacity=".7" />
    </svg>
  );
}

function DarkroomShelf() {
  return (
    <svg className="darkroom-shelf" viewBox="0 0 1200 250" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="dr-steel" x1="0" x2="1">
          <stop offset="0" stopColor="#2b190c" />
          <stop offset=".28" stopColor="#c98a45" />
          <stop offset=".42" stopColor="#f6c37f" />
          <stop offset=".62" stopColor="#8a5528" />
          <stop offset="1" stopColor="#24150a" />
        </linearGradient>
        <linearGradient id="dr-counter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4a22" />
          <stop offset=".12" stopColor="#3b2210" />
          <stop offset="1" stopColor="#140b05" />
        </linearGradient>
        <linearGradient id="dr-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb85c" stopOpacity=".55" />
          <stop offset="1" stopColor="#a4561c" stopOpacity=".35" />
        </linearGradient>
        <radialGradient id="dr-face" cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="#2a1a0e" />
          <stop offset="1" stopColor="#0c0704" />
        </radialGradient>
      </defs>

      {/* Film reels on a rod */}
      <g transform="translate(120 112)">
        <path d="M-60 80h140" stroke="#3a2412" strokeWidth="6" />
        <path d="M-40 80V46M60 80V46" stroke="url(#dr-steel)" strokeWidth="5" />
        {[-20, 30].map((x) => (
          <g key={x} transform={`translate(${x} 46)`}>
            <ellipse rx="34" ry="34" fill="none" stroke="url(#dr-steel)" strokeWidth="3" />
            <path d="M0 0m-26 0a26 26 0 1 0 52 0a22 22 0 1 0 -44 0a18 18 0 1 0 36 0a14 14 0 1 0 -28 0a10 10 0 1 0 20 0" fill="none" stroke="#e0a25c" strokeWidth="1.4" opacity=".8" />
            <circle r="5" fill="#f2c07c" />
            <path d="M0-34V34M-34 0H34" stroke="#e0a25c" strokeWidth="1.6" opacity=".7" />
          </g>
        ))}
      </g>

      {/* Developing tank */}
      <g transform="translate(330 70)">
        <rect x="0" y="22" width="78" height="120" rx="6" fill="url(#dr-steel)" />
        <rect x="-5" y="8" width="88" height="22" rx="5" fill="url(#dr-steel)" />
        <rect x="26" y="0" width="26" height="12" rx="3" fill="#2a190c" />
        <path d="M4 52h70M4 112h70" stroke="#2a170a" strokeWidth="2" opacity=".6" />
      </g>

      {/* Graduated beakers */}
      {[
        { x: 470, w: 64, h: 112, fill: 0.55 },
        { x: 548, w: 52, h: 88, fill: 0.35 },
        { x: 612, w: 46, h: 136, fill: 0.7 },
      ].map(({ x, w, h, fill }) => (
        <g key={x} transform={`translate(${x} ${212 - h})`}>
          <rect y={h * (1 - fill)} width={w} height={h * fill} rx="4" fill="url(#dr-liquid)" />
          <path d={`M-4 0h${w + 8}M0 0v${h - 4}q0 4 4 4h${w - 8}q4 0 4-4V0`} fill="none" stroke="#ffcf8f" strokeOpacity=".75" strokeWidth="2.4" />
          {Array.from({ length: Math.floor(h / 18) }, (_, i) => <path key={i} d={`M${w - 12} ${h - 14 - i * 18}h8`} stroke="#ffcf8f" strokeOpacity=".55" strokeWidth="1.4" />)}
          <path d={`M6 8v${h - 20}`} stroke="#fff1d6" strokeOpacity=".28" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
      <g transform="translate(624 30) rotate(14)">
        <rect width="10" height="100" rx="3" fill="#d79b55" />
        <rect y="78" width="10" height="22" rx="3" fill="#6f4220" />
      </g>

      {/* Darkroom timer */}
      <g transform="translate(900 58)">
        <rect width="150" height="154" rx="10" fill="#1d120a" stroke="#5a3a1e" strokeWidth="3" />
        <circle cx="75" cy="72" r="56" fill="url(#dr-face)" stroke="#d4954f" strokeWidth="3" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const long = i % 5 === 0;
          const r1 = long ? 43 : 48;
          return <path key={i} d={`M${75 + Math.sin(a) * r1} ${72 - Math.cos(a) * r1}L${75 + Math.sin(a) * 52} ${72 - Math.cos(a) * 52}`} stroke="#f2b76c" strokeWidth={long ? 2.2 : 1} strokeOpacity={long ? 0.95 : 0.6} />;
        })}
        {[0, 15, 30, 45].map((n) => {
          const a = (n / 60) * Math.PI * 2;
          return <text key={n} x={75 + Math.sin(a) * 33} y={72 - Math.cos(a) * 33 + 4} fill="#f2b76c" fontSize="12" fontFamily="monospace" textAnchor="middle">{n || 60}</text>;
        })}
        <path d="M75 72L101 44" stroke="#f6d39c" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M75 72L66 104" stroke="#d9663b" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="75" cy="72" r="4" fill="#f6d39c" />
        <rect x="38" y="134" width="74" height="10" rx="3" fill="#3a2614" />
        <rect x="60" y="-14" width="30" height="16" rx="4" fill="#5a3a1e" />
      </g>

      {/* Counter */}
      <rect x="-200" y="212" width="1600" height="60" fill="url(#dr-counter)" />
      <rect x="-200" y="212" width="1600" height="2.5" fill="#ffc47a" opacity=".45" />
    </svg>
  );
}

export function Darkroom({
  rounds,
  albumId,
  photoIndex,
  onOpenAlbum,
  onBackToDarkroom,
  onPhoto,
  onClose,
  onJoin,
}: {
  rounds: Round[];
  albumId: string | null;
  photoIndex: number | null;
  onOpenAlbum: (id: string) => void;
  onBackToDarkroom: () => void;
  onPhoto: (index: number | null) => void;
  onClose: () => void;
  onJoin: () => void;
}) {
  const album = rounds.find((round) => round.id === albumId && round.photos.length > 0) ?? null;
  const backRef = useRef<HTMLButtonElement>(null);
  const lastPrintRef = useRef<string | null>(null);

  useEffect(() => {
    if (album) {
      lastPrintRef.current = album.id;
      backRef.current?.focus();
    } else if (lastPrintRef.current) {
      document.querySelector<HTMLElement>(`[data-print="${lastPrintRef.current}"]`)?.focus();
    }
  }, [album]);

  return (
    <section className="experience-panel darkroom-panel" role="dialog" aria-modal="true" aria-labelledby="darkroom-title">
      <div className="darkroom-scene" aria-hidden={album ? true : undefined} inert={album ? true : undefined}>
        <span className="darkroom-glow" aria-hidden="true" />
        <span className="darkroom-safelight" aria-hidden="true"><i /><b /></span>
        <CloseButton onClick={onClose} />

        <header className="darkroom-header">
          <p className="panel-kicker">THE ARCHIVE</p>
          <h2 id="darkroom-title">The darkroom</h2>
          <p>Every round, hung up to dry. Pick a print to open the roll.</p>
        </header>

        <svg className="darkroom-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="line-desktop" d="M-2 30Q50 44 102 30" />
          <path className="line-mobile" d="M-2 33Q50 43 102 33" />
        </svg>

        {rounds.map((round, index) => {
          const slot = desktopSlots[index] ?? 30 + index * 26;
          const style = { "--x": slot, "--mx": index % 2 === 0 ? 27 : 73, "--tilt": index % 2 === 0 ? "-2.6deg" : "2.2deg", "--sway-delay": `${-index * 1.7}s` } as CSSProperties;
          const hasRoll = round.photos.length > 0;
          const paper = (
            <>
              <ClothesPin />
              <span className="print-paper">
                {round.cover ? (
                  <span className="print-photo"><Image src={round.cover.src} alt="" fill sizes="(max-width: 760px) 42vw, 25vw" unoptimized /></span>
                ) : (
                  <span className="print-photo print-latent" aria-hidden="true"><b>{round.volume}</b><small>still in the tray</small></span>
                )}
                <span className="print-caption">Fairways &amp; Friends · {round.volume}</span>
              </span>
              <span className="print-cta">{hasRoll ? <>Open the roll <span aria-hidden="true">→</span></> : <>See the gallery <span aria-hidden="true">↗</span></>}</span>
            </>
          );
          return hasRoll ? (
            <button key={round.id} data-print={round.id} className="darkroom-print" style={style} onClick={() => onOpenAlbum(round.id)} aria-label={`Fairways & Friends ${round.volume}: open the photos`}>{paper}</button>
          ) : (
            <a key={round.id} data-print={round.id} className="darkroom-print" style={style} href={round.galleryUrl} target="_blank" rel="noreferrer" aria-label={`Fairways & Friends ${round.volume}: open the full gallery on Pixieset`}>{paper}</a>
          );
        })}

        <div className="darkroom-next" style={{ "--x": vol3Slot } as CSSProperties}>
          <span className="darkroom-next-pin"><ClothesPin /></span>
          <span className="darkroom-next-string" aria-hidden="true" />
          <button className="darkroom-next-tag" onClick={onJoin}>
            <b>{comingUp.volume}</b>
            <span>{comingUp.when}</span>
            <small>Get the first invite <span aria-hidden="true">→</span></small>
          </button>
        </div>

        <DarkroomShelf />
      </div>

      {album && (
        <>
          <div className="darkroom-album-scrim" onClick={onBackToDarkroom} aria-hidden="true" />
          <section className="experience-panel archive-panel darkroom-album" role="dialog" aria-modal="true" aria-labelledby="album-title">
            <CloseButton onClick={onBackToDarkroom} buttonRef={backRef} label="Back to the darkroom" text="BACK TO THE DARKROOM" />
            <div className="archive-header">
              <div>
                <p className="panel-kicker">THE ARCHIVE / {album.roll}</p>
                <h2 id="album-title">FAIRWAYS &amp; FRIENDS<br />{album.volume.toUpperCase()}</h2>
              </div>
              <p>{album.caption}<br />Open one, then move through the story.</p>
            </div>
            <div className="photo-contact-sheet">
              {album.photos.map((photo, index) => (
                <button className="archive-photo" key={photo.src} style={{ "--rotate": photo.rotate } as CSSProperties} onClick={() => onPhoto(index)} aria-label={`Open photo ${index + 1}: ${photo.label}`}>
                  <span className="photo-image"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 760px) 44vw, 22vw" unoptimized /></span>
                  <small>{String(index + 1).padStart(2, "0")} / {photo.label}</small>
                </button>
              ))}
            </div>
            <a className="archive-external" href={album.galleryUrl} target="_blank" rel="noreferrer">{album.galleryCount ? `VIEW ALL ${album.galleryCount} PHOTOS` : "VIEW THE FULL GALLERY"} <span>↗</span></a>

            {photoIndex !== null && album.photos[photoIndex] && (
              <div className="archive-lightbox" role="dialog" aria-modal="true" aria-label={`${album.photos[photoIndex].label}, photo ${photoIndex + 1} of ${album.photos.length}`} onClick={() => onPhoto(null)}>
                <button className="lightbox-close" onClick={() => onPhoto(null)} aria-label="Close enlarged photo">× <small>CLOSE</small></button>
                <button className="lightbox-arrow lightbox-previous" onClick={(event) => { event.stopPropagation(); onPhoto((photoIndex - 1 + album.photos.length) % album.photos.length); }} aria-label="Previous photo">←</button>
                <figure onClick={(event) => event.stopPropagation()}>
                  <div className="lightbox-image"><Image src={album.photos[photoIndex].src} alt={album.photos[photoIndex].alt} fill sizes="92vw" priority unoptimized /></div>
                  <figcaption><span>{String(photoIndex + 1).padStart(2, "0")} / {album.photos.length}</span><strong>{album.photos[photoIndex].label}</strong><small>USE ← → KEYS TO MOVE THROUGH THE ROLL</small></figcaption>
                </figure>
                <button className="lightbox-arrow lightbox-next" onClick={(event) => { event.stopPropagation(); onPhoto((photoIndex + 1) % album.photos.length); }} aria-label="Next photo">→</button>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
