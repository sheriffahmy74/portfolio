# Sherif Fahmy · Portfolio

Personal portfolio for Sherif Fahmy, Flutter developer and founder of Lamma.

Static, readable portfolio (warm white, navy, cobalt, amber) with one cinematic moment at the end: a full-screen, scroll-driven "dream flight" rendered offline with Three.js (a phone floating above a sunset sea of clouds, a portal opening, a dive into the screen). Motion with GSAP + ScrollTrigger, smooth scrolling with Lenis, all vendored in `assets/vendor/`; no build step for the site.

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
assets/js/main.js       project cards, finale sequence, reveals, language toggle, CV viewer
assets/fin/{lg,sm}/     120-frame closing sequence (1280×720 and 540×960)
tools/render/           Three.js scenes + scripts that render the frame sequences
assets/img/             app screenshots (webp, 540px wide)
assets/vendor/          gsap, ScrollTrigger, lenis, three
assets/Sherif-Fahmy-CV.pdf
```

## Editing

- **Text:** English is in `index.html`; every element with `data-i18n="key"` has its Arabic in `assets/js/i18n.js` under the same key.
- **Colors:** the tokens at the top of `assets/css/main.css` (`--primary`, `--amber`, `--ink`, …). All text pairs pass WCAG AA.
- **Projects:** edit `assets/js/projects.js`.
- **Closing scene:** edit `tools/render/finale.html`, serve the repo on :5180, then `node tools/render/render-finale.mjs lg 120` and `... sm 120`.
- **Screenshots:** drop a 540px-wide `.webp` into `assets/img/…` and point the `<img>` at it.
- **CV:** edit `cv/cv.html`, run `node cv/build.mjs` to rebuild `assets/Sherif-Fahmy-CV.pdf`, then refresh the on-page preview image:
  `pdftoppm -r 150 -png -singlefile assets/Sherif-Fahmy-CV.pdf /tmp/cv && convert /tmp/cv.png -quality 85 assets/img/cv-preview.webp`

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`
(enable it once under **Settings → Pages → Source: GitHub Actions**).
