import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Caveat_Brush, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cloudflareAnalyticsToken, comingUp, defaultShareImage, eventIsOver, eventLink, instagramUrl, nextEvent, siteUrl } from "./site-content";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Chalkboard lettering.
const boardSans = Barlow_Condensed({ variable: "--font-board", subsets: ["latin"], weight: ["600"] });
const boardHand = Caveat_Brush({ variable: "--font-chalk", subsets: ["latin"], weight: ["400"] });

// Decided at build time; the page itself also switches once an event has ended.
const activeEvent = nextEvent && !eventIsOver(nextEvent) ? nextEvent : null;

const title = "STICK — Golf has room for you";
const description = activeEvent
  ? `STICK is a Vancouver golf community widening the way into the game. Next up: ${activeEvent.series} ${activeEvent.volume}, ${activeEvent.dateLong} at ${activeEvent.venue}.`
  : `STICK is a Vancouver golf community widening the way into the game. Step into the clubhouse: photos from every round, the playlist, and ${comingUp.series} ${comingUp.volume}, coming ${comingUp.when}.`;
const shareImage = activeEvent
  ? { url: activeEvent.shareImage, width: 1200, height: 630, alt: `${activeEvent.series} ${activeEvent.volume} — ${activeEvent.dateLong}, ${activeEvent.venue}, ${activeEvent.city}` }
  : { url: defaultShareImage, width: 1200, height: 630, alt: "STICK — Golf has room for you. stickgolf.club" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "STICK", title, description, images: [shareImage], locale: "en_CA" },
  twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/assets/stick-s.png", type: "image/png" }], shortcut: "/assets/stick-s.png", apple: "/assets/stick-s.png" },
};

export const viewport: Viewport = { themeColor: "#15120e" };

const eventJsonLd = activeEvent && {
  "@context": "https://schema.org",
  "@type": "SocialEvent",
  name: `${activeEvent.series} ${activeEvent.volume}`,
  startDate: activeEvent.startIso,
  endDate: activeEvent.endIso,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: { "@type": "Place", name: activeEvent.venue, address: { "@type": "PostalAddress", addressLocality: activeEvent.city, addressRegion: "BC", addressCountry: "CA" } },
  image: [`${siteUrl}${activeEvent.shareImage}`],
  description: "A Fairways & Friends night from STICK: golf, music and good people.",
  offers: { "@type": "Offer", price: activeEvent.priceValue, priceCurrency: activeEvent.currency, url: eventLink(activeEvent, "search"), availability: "https://schema.org/InStock" },
  organizer: { "@type": "Organization", name: "STICK", url: siteUrl, sameAs: [instagramUrl] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${boardSans.variable} ${boardHand.variable}`}>
        {children}
        {eventJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />}
        {cloudflareAnalyticsToken && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: cloudflareAnalyticsToken })} />}
      </body>
    </html>
  );
}
