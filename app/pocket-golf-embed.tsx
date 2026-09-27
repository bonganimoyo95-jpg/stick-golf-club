"use client";

import { useEffect, useRef, useState } from "react";

const GAME_URL =
  "https://bonganimoyo95-jpg.github.io/golf-game/";

type PocketGolfEmbedProps = {
  onExit: () => void;
};

export default function PocketGolfEmbed({
  onExit,
}: PocketGolfEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousScrollPosition = window.scrollY;

    previousFocusRef.current =
      document.activeElement as HTMLElement | null;

    document.documentElement.classList.add("pocket-golf-open");
    document.body.classList.add("pocket-golf-open");

    window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onExit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.classList.remove("pocket-golf-open");
      document.body.classList.remove("pocket-golf-open");
      window.scrollTo(0, previousScrollPosition);
      previousFocusRef.current?.focus();
    };
  }, [onExit]);

  return (
    <div className="pocket-golf-layer">
      <button
        className="pocket-golf-scrim"
        type="button"
        onClick={onExit}
        aria-label="Close Pocket Golf"
      />

      <section
        className="pocket-golf-cabinet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pocket-golf-title"
      >
        <header className="pocket-golf-header">
          <div>
            <small>STICK GOLF SYSTEMS</small>
            <strong id="pocket-golf-title">
              FAIRWAYS &amp; FRIENDS POCKET GOLF
            </strong>
          </div>

          <button
            ref={closeButtonRef}
            className="pocket-golf-close"
            type="button"
            onClick={onExit}
            aria-label="Close game and return to the clubhouse"
          >
            <span aria-hidden="true">×</span>
            <small>BACK TO ROOM</small>
          </button>
        </header>

        <div className="pocket-golf-bezel">
          <div className="pocket-golf-frame">
            {!loaded && (
              <div
                className="pocket-golf-loading"
                role="status"
                aria-live="polite"
              >
                <strong>WARMING UP THE SIMULATOR</strong>
                <small>HOLE 13 · AZALEA BEND</small>
              </div>
            )}

            <iframe
              className={loaded ? "is-ready" : ""}
              src={GAME_URL}
              title="Fairways & Friends Pocket Golf"
              allow="autoplay"
              onLoad={() => setLoaded(true)}
            />
          </div>
        </div>

        <footer className="pocket-golf-footer">
          <span>POCKET GOLF · V0.12.0</span>
          <span>TOUCH + KEYBOARD</span>
        </footer>
      </section>
    </div>
  );
}