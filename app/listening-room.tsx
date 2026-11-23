"use client";

import { CloseButton } from "./room-ui";

/** The listening station: a turntable on the clubhouse console, with the playlist in the record sleeve. */
export function ListeningRoom({ embedSrc, onClose }: { embedSrc: string; onClose: () => void }) {
  return (
    <section className="experience-panel listening-panel" role="dialog" aria-modal="true" aria-labelledby="sounds-title">
      <span className="listening-lamp" aria-hidden="true" />
      <CloseButton onClick={onClose} />

      <div className="listening-stage">
        <header className="listening-header">
          <p className="panel-kicker">CLUBHOUSE SOUNDS</p>
          <h2 id="sounds-title">The listening room</h2>
          <p>Put the Fairways &amp; Friends playlist on, then keep looking around.</p>
          <small className="sounds-keep-note">MUSIC KEEPS PLAYING WHEN YOU HEAD BACK TO THE ROOM</small>
        </header>

        <div className="listening-console">
          <div className="putting-mat" aria-hidden="true">
            <i className="putting-cup" />
            <i className="putting-ball" />
          </div>

          <div className="turntable" aria-hidden="true">
            <div className="turntable-platter">
              <div className="turntable-vinyl">
                <span className="turntable-label"><span className="series-logo-mask" /><small>CLUBHOUSE SOUNDS · 33⅓</small></span>
              </div>
              <span className="turntable-sheen" />
              <span className="turntable-spindle" />
            </div>
            <svg className="turntable-arm" viewBox="0 0 132 100" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="arm-metal" x1="0" x2="1">
                  <stop offset="0" stopColor="#8f8a83" />
                  <stop offset=".5" stopColor="#f4efe6" />
                  <stop offset="1" stopColor="#7d776f" />
                </linearGradient>
                <radialGradient id="arm-base" cx=".35" cy=".3" r=".8">
                  <stop offset="0" stopColor="#f5f0e7" />
                  <stop offset="1" stopColor="#6e6860" />
                </radialGradient>
              </defs>
              <rect x="108.5" y="7" width="9" height="10" rx="2" fill="#24201c" />
              <circle cx="113" cy="24" r="8.5" fill="url(#arm-base)" />
              <circle cx="113" cy="24" r="3.2" fill="#3a352f" />
              <path d="M113 24C112 44 104 60 84 70L79 73.5" fill="none" stroke="url(#arm-metal)" strokeWidth="2.3" strokeLinecap="round" />
              <path d="M75.5 70.2l6 5.2-4.2 4.6-6-5.2z" fill="#d9d2c6" stroke="#5d5750" strokeWidth=".6" />
              <path d="M121 40v14" stroke="#cfc8bc" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="121" cy="40" r="1.8" fill="#24201c" />
            </svg>
            <span className="turntable-knob knob-speed"><b>33</b><b>45</b></span>
            <span className="turntable-knob knob-power" />
            <span className="turntable-badge"><span className="brand-mark-logo" /></span>
          </div>

          <div className="record-sleeve">
            <span className="record-sleeve-inner" aria-hidden="true" />
            <div className="record-sleeve-cover">
              <p><b>Fairways &amp; Friends</b><span>THE PLAYLIST</span></p>
              <div className="record-sleeve-player">
                <iframe data-testid="embed-iframe" src={embedSrc} width="100%" height="352" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Fairways &amp; Friends playlist on Spotify" />
              </div>
            </div>
          </div>

          <div className="listening-props" aria-hidden="true">
            <span className="prop-scorecard"><span className="brand-mark-logo" /><i /></span>
            <span className="prop-pencil" />
            <span className="prop-tee tee-one" />
            <span className="prop-tee tee-two" />
          </div>
        </div>
      </div>
    </section>
  );
}
