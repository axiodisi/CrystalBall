import type { ReactNode } from "react";

type BriefItem = {
  label: string;
  text: string;
};

type BriefCardProps = {
  kicker: string;
  badge: ReactNode;
  lines?: string[];
  items?: BriefItem[];
};

export function BriefCard({ kicker, badge, lines, items }: BriefCardProps) {
  return (
    <article className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.28em] text-amber uppercase">
          {kicker}
        </p>
        {badge}
      </div>
      <div className="mt-3 space-y-2.5">
        {items
          ? items.map((item) => (
              <div key={item.label}>
                <p className="font-mono text-[10px] tracking-wide text-fog uppercase">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-paper/90">
                  {item.text}
                </p>
              </div>
            ))
          : lines?.map((line, index) => (
              <p key={index} className="text-sm leading-snug text-paper/90">
                {line}
              </p>
            ))}
      </div>
    </article>
  );
}
