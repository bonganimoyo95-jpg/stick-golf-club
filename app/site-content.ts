/**
 * Everything that changes between events lives in this file.
 *
 * Between events: leave `nextEvent` as null. The chalkboard shows `comingUp` and asks people to join the list.
 * When a date is confirmed: fill in `nextEvent` (see the shape below), add a share image, redeploy.
 * After it ends, the site switches back to `comingUp` on its own, so it never advertises a past date.
 * After each event: add its photos to `rounds` so it gets a print in the darkroom.
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

export type RoundPhoto = { src: string; label: string; alt: string; rotate: string };

export type Round = {
  id: string;
  volume: string;
  roll: string;
  /** Short line under the title in the album. */
  caption: string;
  galleryUrl: string;
  /** Total photos in the full gallery, if known. */
  galleryCount?: number;
  /** The photo on the print hanging in the darkroom. Leave empty until the photos are in. */
  cover?: { src: string; alt: string };
  /** The curated roll shown on the site. Empty means the print links straight to the full gallery. */
  photos: RoundPhoto[];
};

/** Oldest first; each round hangs on the darkroom line in this order. */
export const rounds: Round[] = [
  {
    id: "vol-01",
    volume: "Vol. 01",
    roll: "ROLL 001",
    caption: "Sixteen frames from the first round.",
    galleryUrl: "https://stickgolfclub.pixieset.com/fairwaysandfriendsvol01/",
    galleryCount: 121,
    cover: { src: "/assets/archive/07-raise-a-glass.webp", alt: "Three friends laughing and raising drinks in front of the simulator." },
    photos: [
      { src: "/assets/archive/01-check-in.webp", rotate: "-1.5deg", label: "CHECK-IN", alt: "A guest smiling as she checks in at the event entrance." },
      { src: "/assets/archive/02-the-scorecards.webp", rotate: "1.2deg", label: "THE SCORECARDS", alt: "Hands moving across STICK scorecards at the welcome table." },
      { src: "/assets/archive/03-welcome-in.webp", rotate: "-0.8deg", label: "WELCOME IN", alt: "Friends embracing near the clubhouse entrance." },
      { src: "/assets/archive/04-the-crew.webp", rotate: "1.4deg", label: "THE CREW", alt: "Three friends posing together beside a golf simulator." },
      { src: "/assets/archive/05-three-of-a-kind.webp", rotate: "-1.2deg", label: "THREE OF A KIND", alt: "Three friends photographed in black and white at the simulator bay." },
      { src: "/assets/archive/06-old-friends.webp", rotate: "0.9deg", label: "SIDE BY SIDE", alt: "Two friends laughing with their arms around one another." },
      { src: "/assets/archive/07-raise-a-glass.webp", rotate: "1.5deg", label: "RAISE A GLASS", alt: "Three friends laughing and raising drinks in front of the simulator." },
      { src: "/assets/archive/08-cheers-in-black-and-white.webp", rotate: "-1deg", label: "CHEERS", alt: "A close black-and-white photograph of friends raising their glasses." },
      { src: "/assets/archive/09-first-swing.webp", rotate: "-1.4deg", label: "TAKE YOUR SHOT", alt: "A golfer in a blue skirt swinging in the simulator bay." },
      { src: "/assets/archive/10-full-follow-through.webp", rotate: "1.1deg", label: "FOLLOW THROUGH", alt: "A golfer in a cream outfit completing a full swing." },
      { src: "/assets/archive/11-in-the-bay.webp", rotate: "-0.7deg", label: "IN THE BAY", alt: "A golfer following through toward the simulator screen." },
      { src: "/assets/archive/12-good-form.webp", rotate: "1.4deg", label: "SCOREBOARD ENERGY", alt: "A player celebrating in front of the simulator scoreboard." },
      { src: "/assets/archive/13-the-room.webp", rotate: "-1.1deg", label: "THE ROOM", alt: "A crowded clubhouse watching the action in the simulator bay." },
      { src: "/assets/archive/14-laugh-it-off.webp", rotate: "0.8deg", label: "LAUGH IT OFF", alt: "A guest laughing during a conversation in the clubhouse." },
      { src: "/assets/archive/15-good-night.webp", rotate: "-1.3deg", label: "GOOD TO SEE YOU", alt: "Two friends greeting one another in the middle of the event." },
      { src: "/assets/archive/16-one-more.webp", rotate: "1deg", label: "ONE MORE", alt: "A guest raising both arms in celebration beside the simulator." },
    ],
  },
  {
    id: "vol-02",
    volume: "Vol. 02",
    roll: "ROLL 002",
    caption: "The second round, at Hideout Golf.",
    galleryUrl: "https://stickgolfclub.pixieset.com/fairwaysandfriendsvol02/",
    // TODO: add the curated Vol. 02 photos (public/assets/archive/vol-02/) and a cover.
    photos: [],
  },
];

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
