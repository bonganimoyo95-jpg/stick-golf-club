import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Caveat_Brush, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cloudflareAnalyticsToken, instagramUrl, nextEvent, siteUrl } from "./site-content";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Chalkboard lettering.
const boardSans = Barlow_Condensed({ variable: "--font-board", subsets: ["latin"], weight: ["600"] });
const boardHand = Caveat_Brush({ variable: "--font-chalk", subsets: ["latin"], weight: ["400"] });

const title = "STICK — Golf has room for you";
const description = nextEvent.live
  ? `STICK is a Vancouver golf community widening the way into the game. Next up: ${nextEvent.series} ${nextEvent.volume}, ${nextEvent.dateLong} at ${nextEvent.venue}.`
  : "STICK is a Vancouver golf community widening the way into the game. Step into the clubhouse: events, music, memories and the next round.";
const shareImage = { url: nextEvent.shareImage, width: 1200, height: 630, alt: `${nextEvent.series} ${nextEvent.volume} — ${nextEvent.dateLong}, ${nextEvent.venue}, ${nextEvent.city}` };

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

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "SocialEvent",
  name: `${nextEvent.series} ${nextEvent.volume}`,
  startDate: nextEvent.startIso,
  endDate: nextEvent.endIso,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: { "@type": "Place", name: nextEvent.venue, address: { "@type": "PostalAddress", addressLocality: nextEvent.city, addressRegion: "BC", addressCountry: "CA" } },
  image: [`${siteUrl}${nextEvent.shareImage}`],
  description: "A Fairways & Friends night from STICK: golf, music and good people.",
  offers: { "@type": "Offer", price: nextEvent.priceValue, priceCurrency: nextEvent.currency, url: nextEvent.link("search"), availability: "https://schema.org/InStock" },
  organizer: { "@type": "Organization", name: "STICK", url: siteUrl, sameAs: [instagramUrl] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${boardSans.variable} ${boardHand.variable}`}>
        {children}
        {nextEvent.live && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />}
        {cloudflareAnalyticsToken && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: cloudflareAnalyticsToken })} />}
      </body>
    </html>
  );
}
