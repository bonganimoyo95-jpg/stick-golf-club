# STICK Clubhouse Screen Blueprints

An interactive design prototype for the new STICK landing page.

The central idea is that the clubhouse room is the navigation. The objects are
the interface—there is no floating icon layer or conventional menu:

- **Next Round** - the chalkboard
- **Archive** - the photography pinboard
- **Sounds** - the turntable and record crate
- **Play** - the golf simulator and three-hole scorecard
- **Join** - the persistent first-name and email bar

Each physical object is traced as its own hit area, so only its silhouette—not
a surrounding rectangle—illuminates when hovered or focused. The simulator is
the one exception: a play button is built directly into its screen. The STICK mark lives only inside the room beneath the lamp, and
`WELCOME TO THE NEW CLUBHOUSE` is treated as architectural signage.

## Review the states

Run the project, then select objects in the room or open these hashes directly:

- `/` - clubhouse landing screen
- `/#next` - Fairways & Friends Vol. 2
- `/#archive` - curated event archive
- `/#sounds` - four Spotify playlists
- `/#play` - three-hole game blueprint
- `/?mobile=1` - annotated mobile screen blueprint

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The prototype uses the supplied STICK wordmark and the generated clubhouse
concept art in `public/assets/`.

## What is functional now

- Clickable chalkboard, pinboard, turntable and simulator zones
- Object illumination, hover/focus descriptions and an initial discovery cue
- Compact first-name, email and `SIGN ME UP` bar
- Responsive desktop and mobile structures
- Horizontally pannable mobile room beginning at the entrance
- Event, archive, playlist and game states
- Spotify and Pixieset destination links
- Three-hole scorecard interaction
- Signup confirmation state
- Keyboard Escape support and reduced-motion handling

## What changes in production

- Replace archive placeholders with 12-16 selected event photographs.
- Connect the signup form to the existing Beehiiv flow.
- Replace the interaction-level golf prototype with the full shot physics.
- Separate the room artwork into animation-ready layers.
- Add optional ambient audio; keep it off by default.
- Replace `DATE TO BE ANNOUNCED` when the November date is finalized.

The current signup form deliberately does not send data. It demonstrates the
layout and success state only.
