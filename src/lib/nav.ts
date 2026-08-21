export type NavItem = {
  href: string;
  label: string;
  hint: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Command", hint: "Overview" },
  { href: "/research", label: "Research", hint: "Pairs" },
  { href: "/watchlist", label: "Watchlist", hint: "Live" },
  { href: "/indicators", label: "Indicators", hint: "Signals" },
];
