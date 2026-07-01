import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";

export function RowActions({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mobile, setMobile] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function placeMenu() {
      const useMobileSheet = window.matchMedia("(max-width: 760px)").matches;
      setMobile(useMobileSheet);
      if (useMobileSheet) return;
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menuWidth = 160;
      const menuHeight = Math.max(88, React.Children.count(children) * 38 + 12);
      const top =
        rect.bottom + menuHeight + 8 > window.innerHeight
          ? Math.max(8, rect.top - menuHeight - 4)
          : rect.bottom + 4;
      const left = Math.min(window.innerWidth - menuWidth - 8, Math.max(8, rect.right - menuWidth));
      setPosition({ top, left });
    }

    placeMenu();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [children, open]);

  return (
    <div className="row-actions">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Actions"
        className="row-actions-trigger"
        onClick={() => setOpen((value) => !value)}
      >
        <EllipsisVertical size={18} />
      </button>
      {open && mobile ? (
        <div className="action-sheet-layer" role="presentation" onMouseDown={() => setOpen(false)}>
          <div
            className="action-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Row actions"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </div>
      ) : null}
      {open && !mobile ? (
        <div className="row-menu" style={{ top: position.top, left: position.left, right: "auto" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
