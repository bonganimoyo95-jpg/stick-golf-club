"use client";

import type { CSSProperties } from "react";
import { CloseButton } from "./room-ui";
import { listeningRoom } from "./site-content";

/**
 * The listening room: a full-bleed room image with the Spotify playlist set into its screen.
 * The image is framed around the screen, so the player stays fully visible on any screen size.
 */
export function ListeningRoom({ embedSrc, onClose }: { embedSrc: string; onClose: () => void }) {
  const { image, width, height, screen } = listeningRoom;
  const sceneStyle = {
    "--room-ratio": width / height,
    "--screen-w": screen.width / 100,
    "--screen-h": screen.height / 100,
    "--screen-cx": (screen.left + screen.width / 2) / 100,
    "--screen-cy": (screen.top + screen.height / 2) / 100,
    "--room-image": `url("${image}")`,
  } as CSSProperties;

  return (
    <section className="experience-panel listening-panel" role="dialog" aria-modal="true" aria-labelledby="sounds-title" style={sceneStyle}>
      <span className="listening-backdrop" aria-hidden="true" />
      <div className="listening-scene">
        <div className="listening-screen" style={{ left: `${screen.left}%`, top: `${screen.top}%`, width: `${screen.width}%`, height: `${screen.height}%` }}>
          <iframe data-testid="embed-iframe" src={embedSrc} width="100%" height="100%" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Fairways &amp; Friends playlist on Spotify" />
        </div>
      </div>
      <CloseButton onClick={onClose} />
      <header className="listening-caption">
        <h2 id="sounds-title">Clubhouse Sounds</h2>
        <p>Music keeps playing when you head back to the room.</p>
      </header>
    </section>
  );
}
