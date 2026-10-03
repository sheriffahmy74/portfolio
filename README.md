# Sherif Fahmy · Portfolio

Personal portfolio for Sherif Fahmy, Flutter developer and founder of Lamma.

Static, readable portfolio (warm white, navy, cobalt, amber). The hero is a live WebGL liquid-paint effect (Three.js shader): a glossy 3D paint blob splashes in and drips down, the full-resolution photo pours in on top of it, ripples like water under the cursor or finger, and melts as you scroll. The About photo sits inside a paint splash the same way. It renders live, so it stays sharp at every screen size. Project screenshots fan out in 3D, float, tilt with the pointer and cycle through screens. Motion with GSAP + ScrollTrigger, smooth scrolling with Lenis, all vendored in `assets/vendor/`; no build step.

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
assets/js/liquid.js     the liquid paint photos (WebGL)
assets/js/main.js       hero motion, project cards, reveals, language toggle, CV viewer
assets/img/             app screenshots (webp, 540px wide)
assets/vendor/          gsap, ScrollTrigger, lenis, three
assets/Sherif-Fahmy-CV.pdf
```

## Editing

- **Text:** English is in `index.html`; every element with `data-i18n="key"` has its Arabic in `assets/js/i18n.js` under the same key.
- **Colors:** the tokens at the top of `assets/css/main.css` (`--primary`, `--amber`, `--ink`, …). All text pairs pass WCAG AA.
- **Projects:** edit `assets/js/projects.js`.
- **Photos:** the hero uses `assets/img/me/hero.webp` (a transparent cut-out) and About uses `assets/img/me/work-16.webp`. Swap those images to change them; paint colours are set where `LiquidImage.create` is called in `main.js`.
- **CV:** edit `cv/cv.html`, run `node cv/build.mjs` to rebuild `assets/Sherif-Fahmy-CV.pdf`, then refresh the on-page preview image:
  `pdftoppm -r 150 -png -singlefile assets/Sherif-Fahmy-CV.pdf /tmp/cv && convert /tmp/cv.png -quality 85 assets/img/cv-preview.webp`

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`
(enable it once under **Settings → Pages → Source: GitHub Actions**).
