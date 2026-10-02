# STICK Clubhouse — Landing Page Source

This is the complete landing-page source for the STICK digital clubhouse. The room remains the interface: its chalkboard, photo wall, turntable and golf simulator open their matching experiences.

## Latest design updates

- **Clubhouse Sounds:** the real Fairways & Friends Spotify playlist loads only after the visitor opens the turntable experience. The iframe sits directly in the listening-room TV's screen opening; the TV frame and headphones remain part of the room artwork. On phones, the artwork crops around the TV so the player remains legible.
- **Next Round:** the small event chalkboard itself expands into the full Fairways & Friends Vol. 02 design in the room. It does not open a separate, dimmed event card. Close the board to return to the same room view.
- **Event invite:** the centered first-visit invitation links to Luma, and the room's own chalkboard remains another route to the event.
- **Archive:** the curated 16-photo selection and Pixieset link are included.
- **Signup:** the landing-page form continues to use the existing Beehiiv bridge.
- **Pocket Golf:** the landing page contains only the iframe integration. The Phaser game source remains in its separate repository.

## Files to edit

- `app/page.tsx` contains the landing page, room interactions and live content.
- `app/globals.css` contains the room layout, responsive behavior and visual treatments.
- `public/assets/` contains the room artwork, listening-room artwork, archive photos and brand assets.
- `app/pocket-golf-embed.tsx` contains the game iframe integration; it does not contain the Phaser game source.

## Build and publish

Requirements: Node.js 22 or newer.

```bash
npm ci
npm run lint
npm run build:pages
```

The GitHub Pages workflow builds the static site into `out/` and publishes it when changes reach the `main` branch. Do not commit `out/` or `node_modules/`; GitHub Actions creates the deployment output.

To update the website through GitHub's file uploader, extract this ZIP first and upload the extracted project files to the repository. Do not upload the ZIP file as the site.
