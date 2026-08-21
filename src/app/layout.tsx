import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { ServiceWorkerRegister } from "@/components/shell/ServiceWorkerRegister";
import { WatchlistLiveProvider } from "@/components/watchlist/WatchlistLiveProvider";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CrystalBall",
    template: "%s · CrystalBall",
  },
  description:
    "Mobile-first command center for statistical pair discovery, watchlist monitoring, and market intelligence.",
  applicationName: "CrystalBall",
  appleWebApp: {
    capable: true,
    title: "CrystalBall",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0E13",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink font-sans text-paper">
        <ServiceWorkerRegister />
        <WatchlistLiveProvider>
          <AppShell>{children}</AppShell>
        </WatchlistLiveProvider>
      </body>
    </html>
  );
}
