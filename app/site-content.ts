/**
 * Everything that changes between events lives in this file.
 * After an event: update `nextEvent` (or set `live: false`), swap the share image, redeploy.
 */

export const siteUrl = "https://stickgolf.club";

/**
 * Cloudflare Web Analytics token. Leave empty to load no analytics at all.
 * Get one at dash.cloudflare.com → Analytics & Logs → Web Analytics → Add a site.
 */
export const cloudflareAnalyticsToken = "";

const lumaBase = "https://luma.com/tyngzys7";

export const nextEvent = {
  /** Changing this id shows the first-visit invitation again to everyone. */
  id: "ff-vol-02",
  live: true,
  series: "Fairways & Friends",
  volume: "Vol. 02",
  dateLong: "Thursday, November 19",
  dateFull: "THURSDAY, NOVEMBER 19, 2026",
  dateShort: "NOV 19",
  timeShort: "8–11 PM",
  timeLong: "8:00–11:00 PM",
  startIso: "2026-11-19T20:00:00-08:00",
  endIso: "2026-11-19T23:00:00-08:00",
  venue: "Hideout Golf",
  city: "Vancouver",
  price: "$30",
  priceValue: "30",
  currency: "CAD",
  /** UTM tags let Luma report how many ticket visits came from this site. */
  link: (placement: string) => `${lumaBase}?utm_source=stickgolf.club&utm_medium=website&utm_campaign=ff-vol-02&utm_content=${placement}`,
  shareImage: "/assets/share/fairways-and-friends-vol-02.png",
};

/** DRAFT COPY — written from the founder's notes. Edit freely. */
export const vision = {
  kicker: "ABOUT STICK",
  headline: "Golf has room for you.",
  paragraphs: [
    "STICK is a Vancouver community growing the game by widening the way in. If you want to be part of golf, but want it to look and feel different from how it does now, this is your clubhouse.",
    "Come as you are and play how you play. The game gets better when more people bring themselves to it.",
    "The clubhouse is how we think about belonging: a place where you are already a member. This one is online for now. A real one is the goal.",
  ],
  programsTitle: "WHAT'S ON AT THE CLUBHOUSE",
  seriesBlurb: "Our event series. Golf simulators, music and good people.",
  comingSoonLabel: "IN THE WORKS",
  comingSoon: ["After-work nines", "Golf trips", "Merch"],
};
