/**
 * Everything that changes between events lives in this file.
 *
 * Between events: leave `nextEvent` as null. The chalkboard shows `comingUp` and asks people to join the list.
 * When a date is confirmed: fill in `nextEvent` (see the shape below), add a share image, redeploy.
 * After it ends, the site switches back to `comingUp` on its own, so it never advertises a past date.
 * After each event: add its cover photo and Pixieset link to `rounds` so it gets a print on the line.
 */

export const siteUrl = "https://stickgolf.club";
export const instagramUrl = "https://www.instagram.com/stick_golfclub/";
export const instagramHandle = "@stick_golfclub";

/**
 * Cloudflare Web Analytics token. Leave empty to load no analytics at all.
 * Get one at dash.cloudflare.com → Analytics & Logs → Web Analytics → Add a site.
 */
export const cloudflareAnalyticsToken = "";

export type EventDetails = {
  /** Changing this id shows the first-visit invitation again to everyone. */
  id: string;
  series: string;
  volume: string;
  dateLong: string;
  dateFull: string;
  dateShort: string;
  timeShort: string;
  timeLong: string;
  startIso: string;
  endIso: string;
  venue: string;
  city: string;
  price: string;
  priceValue: string;
  currency: string;
  lumaUrl: string;
  shareImage: string;
};

/*
 * Example, from Vol. 02:
 * {
 *   id: "ff-vol-02", series: "Fairways & Friends", volume: "Vol. 02",
 *   dateLong: "Thursday, November 19", dateFull: "THURSDAY, NOVEMBER 19, 2026", dateShort: "NOV 19",
 *   timeShort: "8–11 PM", timeLong: "8:00–11:00 PM",
 *   startIso: "2026-11-19T20:00:00-08:00", endIso: "2026-11-19T23:00:00-08:00",
 *   venue: "Hideout Golf", city: "Vancouver", price: "$30", priceValue: "30", currency: "CAD",
 *   lumaUrl: "https://luma.com/tyngzys7", shareImage: "/assets/share/fairways-and-friends-vol-02.png",
 * }
 */
export const nextEvent: EventDetails | null = null;

/** Shown on the chalkboard whenever there is no upcoming event with a date. */
export const comingUp = {
  series: "Fairways & Friends",
  volume: "Vol. 03",
  when: "Winter 2027",
};

/** Share image used between events. */
export const defaultShareImage = "/assets/share/stick-clubhouse.png";

export function eventIsOver(event: EventDetails, now = Date.now()) {
  return Date.parse(event.endIso) < now;
}

/** UTM tags let Luma report how many ticket visits came from this site, and from which spot. */
export function eventLink(event: EventDetails, placement: string) {
  return `${event.lumaUrl}?utm_source=stickgolf.club&utm_medium=website&utm_campaign=${event.id}&utm_content=${placement}`;
}

/** What the photo room is called on the site. */
export const archiveRoom = {
  name: "The archive",
  intro: "Every round, hung up to dry. Pick a print to see the full gallery.",
};

export type Round = {
  id: string;
  volume: string;
  /** Pixieset gallery the print links to. */
  galleryUrl: string;
  /** Total photos in the gallery, if known. Shown on the print's link. */
  galleryCount?: number;
  /** The photo on the hanging print. Width and height set the print's shape (portrait or landscape). */
  cover: { src: string; alt: string; width: number; height: number };
};

/** Oldest first; each round hangs on the line in this order. */
export const rounds: Round[] = [
  {
    id: "vol-01",
    volume: "Vol. 01",
    galleryUrl: "https://stickgolfclub.pixieset.com/fairwaysandfriendsvol01/",
    galleryCount: 121,
    cover: { src: "/assets/archive/07-raise-a-glass.webp", alt: "Three friends laughing and raising drinks in front of the simulator.", width: 1800, height: 1198 },
  },
  {
    id: "vol-02",
    volume: "Vol. 02",
    galleryUrl: "https://stickgolfclub.pixieset.com/fairwaysandfriendsvol02/",
    cover: { src: "/assets/archive/vol-02-cover.webp", alt: "A golfer in a black puffer vest and green sneakers laughing mid-swing in the simulator bay.", width: 1000, height: 1500 },
  },
];

/**
 * The listening room: the artwork, and where the playlist screen sits on it, in percent of the image.
 * To swap in new artwork, change the image and its size, then re-measure the screen.
 */
export const listeningRoom = {
  image: "/assets/fairways-listening-room.webp",
  width: 1774,
  height: 887,
  screen: { left: 33.5, top: 10, width: 35.8, height: 45.8 },
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
  /** Kept broad on purpose: the series is not tied to one kind of venue. */
  seriesBlurb: "Our event series: golf, music and good people.",
};
