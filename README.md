# Sherif Fahmy · Portfolio

Personal portfolio for Sherif Fahmy, Flutter developer and founder of Lamma.

Static site: HTML, CSS and vanilla JS. A procedurally built 3D phone (Three.js) travels down the page between "slots" while the background shifts colour per section. Animation with GSAP + ScrollTrigger, smooth scrolling with Lenis. All libraries are vendored in `assets/vendor/`; there is no build step.

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
assets/js/projects.js   projects in the selector (text, tint colour, phone screens)
assets/js/phone.js      the 3D phone (Three.js)
assets/js/main.js       intro, colour shifts, phone slots, pins, selector, language toggle
assets/img/             app screenshots (webp, 540px wide)
assets/vendor/          gsap, ScrollTrigger, lenis, three
assets/Sherif-Fahmy-CV.pdf
```

## Editing

- **Text:** English is in `index.html`; every element with `data-i18n="key"` has its Arabic in `assets/js/i18n.js` under the same key.
- **Colors:** `--paper`, `--blue`, `--sun`, `--ink` at the top of `assets/css/main.css`, and the `THEMES` map in `assets/js/main.js`.
- **Projects:** edit `assets/js/projects.js`; each project has its own tint (`bg`) and list of phone screens.
- **Phone position:** every `.slot` element in `index.html` is a place the phone visits; `data-rx/ry/rz` set its rotation there.
- **Screenshots:** drop a 540px-wide `.webp` into `assets/img/…` and point the `<img>` at it.
- **CV:** edit `cv/cv.html`, run `node cv/build.mjs` to rebuild `assets/Sherif-Fahmy-CV.pdf`, then refresh the on-page preview image:
  `pdftoppm -r 150 -png -singlefile assets/Sherif-Fahmy-CV.pdf /tmp/cv && convert /tmp/cv.png -quality 85 assets/img/cv-preview.webp`

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`
(enable it once under **Settings → Pages → Source: GitHub Actions**).
