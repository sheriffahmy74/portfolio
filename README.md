# Sherif Fahmy · Portfolio

Personal portfolio for Sherif Fahmy, Flutter developer and founder of Lamma.

Static site in the Swiss International Style: visible 12-column grid, paper / ink / one signal red. The centrepiece is a scroll-driven frame sequence of a 3D phone (rendered offline with Three.js) that turns around and splits into Lamma's architecture layers. Motion with GSAP + ScrollTrigger, smooth scrolling with Lenis, all vendored in `assets/vendor/`; there is no build step for the site.

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
assets/js/projects.js   projects in the work index (text, screens, links)
assets/js/main.js       intro, frame sequence, section colours, work index, language toggle
assets/seq/{lg,sm}/     140-frame phone sequence (1200px and 600px)
tools/render/           Three.js phone model + renderer that produces assets/seq
assets/img/             app screenshots (webp, 540px wide)
assets/vendor/          gsap, ScrollTrigger, lenis, three
assets/Sherif-Fahmy-CV.pdf
```

## Editing

- **Text:** English is in `index.html`; every element with `data-i18n="key"` has its Arabic in `assets/js/i18n.js` under the same key.
- **Colors:** `--paper`, `--ink`, `--red`, `--red-text` at the top of `assets/css/main.css`, and `THEMES` in `assets/js/main.js`. Bright red is for large type and blocks only; small red text uses `--red-text` for contrast.
- **Projects:** edit `assets/js/projects.js`.
- **Phone sequence:** edit the camera path in `tools/render/render.html`, serve the repo on :5180, then `node tools/render/render.mjs 140` and resize to `assets/seq/sm` (600px wide).
- **Screenshots:** drop a 540px-wide `.webp` into `assets/img/…` and point the `<img>` at it.
- **CV:** edit `cv/cv.html`, run `node cv/build.mjs` to rebuild `assets/Sherif-Fahmy-CV.pdf`, then refresh the on-page preview image:
  `pdftoppm -r 150 -png -singlefile assets/Sherif-Fahmy-CV.pdf /tmp/cv && convert /tmp/cv.png -quality 85 assets/img/cv-preview.webp`

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`
(enable it once under **Settings → Pages → Source: GitHub Actions**).
