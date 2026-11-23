import type { RefObject } from "react";

export function CloseButton({ onClick, buttonRef, label = "Return to the clubhouse", text = "BACK TO ROOM" }: { onClick: () => void; buttonRef?: RefObject<HTMLButtonElement | null>; label?: string; text?: string }) {
  return <button ref={buttonRef} className="close-button" onClick={onClick} aria-label={label}><span aria-hidden="true">×</span><small>{text}</small></button>;
}
