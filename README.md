# STICK Golf Club

The GitHub Pages site for [stickgolf.club](https://stickgolf.club): an editorial,
photo-led landing page with a playable three-hole Amen Corner challenge.

## Site files

- `index.html` — page structure, social metadata and newsletter form
- `styles.css` — responsive “New Clubhouse” design system
- `game.js` — perspective golf game, three-click swing meter and mobile invite
- `assets/` — STICK marks, event photography and the 1200×630 social card
- `frontend/` — Beehiiv subscription bridge and configuration
- `CNAME` — preserves the `stickgolf.club` custom domain

## Preview and validate

```sh
npm install
npm run dev
npm test
```

## Publishing

GitHub Pages serves the repository root from `main`. Pushing the validated
files updates the live site while retaining the custom domain in `CNAME`.
