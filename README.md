# Sherif Fahmy · Portfolio

Personal portfolio for Sherif Fahmy, Flutter developer and founder of Lamma.

Static, readable portfolio (warm white, navy, cobalt, amber). The hero is a scroll-driven scene rendered offline with Three.js: the three pieces of the Flutter mark fall from above with a rain of small marks, snap together behind a cut-out photo, then spin and burst as you scroll. Motion with GSAP + ScrollTrigger, smooth scrolling with Lenis, all vendored in `assets/vendor/`; no build step for the site.

## Run locally

```bash
python3 -m http.server 5173
# open http://localhost:5173
```

## Structure

```
index.html              page markup (English text lives here)
assets/css/main.css     design tokens + styles
assets/js/i18n.js       Arabic strings
assets/js/projects.js   project cards (text, panel colour, screens, links)
assets/js/main.js       hero frame sequence, project cards, reveals, language toggle, CV viewer
assets/drop/{lg,sm}/    110-frame transparent hero sequence (1440×900 and 720×1100)
tools/render/           Three.js scenes + scripts that render the frame sequences
assets/img/             app screenshots (webp, 540px wide)
assets/vendor/          gsap, ScrollTrigger, lenis, three
assets/Sherif-Fahmy-CV.pdf
```

## Editing

- **Text:** English is in `index.html`; every element with `data-i18n="key"` has its Arabic in `assets/js/i18n.js` under the same key.
- **Colors:** the tokens at the top of `assets/css/main.css` (`--primary`, `--amber`, `--ink`, …). All text pairs pass WCAG AA.
- **Projects:** edit `assets/js/projects.js`.
- **Hero scene:** edit `tools/render/flutter-drop.html`, serve the repo on :5180, then `node tools/render/render-drop.mjs lg 110` and `... sm 110` (needs Playwright).
- **Screenshots:** drop a 540px-wide `.webp` into `assets/img/…` and point the `<img>` at it.
- **CV:** edit `cv/cv.html`, run `node cv/build.mjs` to rebuild `assets/Sherif-Fahmy-CV.pdf`, then refresh the on-page preview image:
  `pdftoppm -r 150 -png -singlefile assets/Sherif-Fahmy-CV.pdf /tmp/cv && convert /tmp/cv.png -quality 85 assets/img/cv-preview.webp`

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`
(enable it once under **Settings → Pages → Source: GitHub Actions**).
