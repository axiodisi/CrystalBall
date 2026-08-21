"use client";

import { useEffect, type ReactNode } from "react";

type DetailSheetProps = {
  children: ReactNode;
};

export function DetailSheet({ children }: DetailSheetProps) {
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      const lock = !mq.matches;
      document.documentElement.style.overflow = lock ? "hidden" : "";
      document.body.style.overflow = lock ? "hidden" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="sheet-overlay">
      <div className="sheet-frame">{children}</div>
    </div>
  );
}
