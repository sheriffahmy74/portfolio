# Sherif Fahmy · Portfolio

Personal portfolio for Sherif Fahmy, Flutter developer and founder of Lamma.

Static site: HTML, CSS and vanilla JS. Animation with GSAP + ScrollTrigger, smooth scrolling with Lenis (both vendored in `assets/vendor/`, no build step).

## Run locally

```bash
python3 -m http.server 5173
# open http://localhost:5173
```

## Structure

```
index.html              page markup (English text lives here)
assets/css/main.css     design tokens + styles
assets/js/i18n.js       Arabic strings + typed-line phrases
assets/js/main.js       animations, language toggle, interactions
assets/img/             app screenshots (webp, 540px wide)
assets/vendor/          gsap, ScrollTrigger, lenis
assets/Sherif-Fahmy-CV.pdf
```

## Editing

- **Text:** English is in `index.html`; every element with `data-i18n="key"` has its Arabic in `assets/js/i18n.js` under the same key.
- **Colors:** the tokens at the top of `assets/css/main.css` (`--violet`, `--sky`, `--ink`, …).
- **Screenshots:** drop a 540px-wide `.webp` into `assets/img/…` and point the `<img>` at it.
- **CV:** replace `assets/Sherif-Fahmy-CV.pdf`.

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`
(enable it once under **Settings → Pages → Source: GitHub Actions**).
