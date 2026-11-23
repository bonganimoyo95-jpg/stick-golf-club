"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { CloseButton } from "./room-ui";
import { archiveRoom, type Round } from "./site-content";

/** Where each print hangs on the line, as a percentage of the room's width. Oldest on the left. */
const desktopSlots = [37, 63];

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

/** The archive: a darkroom-style line of prints, one per round, each opening its Pixieset gallery. */
export function Darkroom({ rounds, onClose }: { rounds: Round[]; onClose: () => void }) {
  return (
    <section className="experience-panel darkroom-panel" role="dialog" aria-modal="true" aria-labelledby="darkroom-title">
      <div className="darkroom-scene">
        <span className="darkroom-glow" aria-hidden="true" />
        <span className="darkroom-safelight" aria-hidden="true"><i /><b /></span>
        <CloseButton onClick={onClose} />

        <header className="darkroom-header">
          <p className="panel-kicker">FAIRWAYS &amp; FRIENDS</p>
          <h2 id="darkroom-title">{archiveRoom.name}</h2>
          <p>{archiveRoom.intro}</p>
        </header>

        <svg className="darkroom-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="line-desktop" d="M-2 27Q50 39 102 27" />
          <path className="line-mobile" d="M-2 33Q50 43 102 33" />
        </svg>

        {rounds.map((round, index) => {
          const portrait = round.cover.height > round.cover.width;
          const style = {
            "--x": desktopSlots[index] ?? 30 + index * 26,
            "--mx": index % 2 === 0 ? 27 : 73,
            "--tilt": index % 2 === 0 ? "-2.6deg" : "2.2deg",
            "--sway-delay": `${-index * 1.7}s`,
            "--ratio": `${round.cover.width} / ${round.cover.height}`,
          } as CSSProperties;
          return (
            <a key={round.id} className={"darkroom-print" + (portrait ? " is-portrait" : "")} style={style} href={round.galleryUrl} target="_blank" rel="noreferrer" aria-label={`Fairways & Friends ${round.volume}: see the full gallery on Pixieset (opens in a new tab)`}>
              <ClothesPin />
              <span className="print-paper">
                <span className="print-photo"><Image src={round.cover.src} alt="" fill sizes="(max-width: 760px) 42vw, 25vw" unoptimized /></span>
                <span className="print-caption"><span className="print-caption-series">Fairways &amp; Friends · </span>{round.volume}</span>
              </span>
              <span className="print-cta">{round.galleryCount ? `See all ${round.galleryCount} photos` : "See the gallery"} <span aria-hidden="true">↗</span></span>
            </a>
          );
        })}

        <DarkroomShelf />
      </div>
    </section>
  );
}
