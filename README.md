# STICK Golf Club

A one-screen STICK landing page with a low-resolution, three-hole golf game
inspired by Amen Corner.

## GitHub Pages files

- `index.html` — complete standalone landing page and game
- `.nojekyll` — tells GitHub Pages to serve the site directly
- `worker/index.js` — source used by the existing hosted version
- `scripts/export-github-pages.mjs` — regenerates `index.html`

## Preview locally

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`.
5. Save and use the URL GitHub provides.

## Updating the page

Edit `worker/index.js`, then regenerate the GitHub Pages file:

```sh
npm run export:github
```

Commit both `worker/index.js` and the regenerated `index.html`.

## Mailing list

The current form opens a prepared email. Connect it to the STICK Beehiiv form
before using it for direct newsletter subscriptions.
