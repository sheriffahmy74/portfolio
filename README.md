# Sherif Fahmy · Portfolio

Personal portfolio for Sherif Fahmy, Flutter developer and founder of Lamma.

Static, readable portfolio (warm white, navy, cobalt, amber). The hero is a live, interactive 3D scene (Three.js): a sharp cut-out photo stands in real 3D space among glossy objects that each stand for a skill (the Flutter logo, a phone running Lamma, a map pin, a chat bubble, a store star, a tests badge, a code tag). The camera follows the pointer, objects dodge the cursor and spring back, hovering explains each one, and clicking spins it with a confetti pop (the phone switches screens, the Flutter logo breaks apart and snaps back). Projects stack like a deck on wide screens (each card sticks and the next slides over it), with letter-by-letter titles, phones that fly in and flip between screens, and a giant outlined name drifting behind them. The About photo is a simple rounded portrait by default; each mood restyles it (polaroid, framed, duotone, arch, offset block). Cards, tags and buttons react to the pointer too. Press `r` (or the Hot reload button) and the portfolio is swapped for a Scrapbook edition built from the same content in the same order: a torn-paper header, polaroids with tape, draggable sticky notes, projects as taped pages, experience as a shop receipt and contact as an envelope. Pressing `r` again replays it; `R` (Hot restart) brings back the original. It renders live, so it stays sharp at every screen size. Project screenshots fan out in 3D, float, tilt with the pointer and cycle through screens. Motion with GSAP + ScrollTrigger, smooth scrolling with Lenis, all vendored in `assets/vendor/`; no build step.

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
assets/js/scene.js      the interactive 3D hero (WebGL)
assets/js/main.js       hero motion, project cards, reveals, language toggle, CV viewer
assets/js/content.js    the shared content model the hot-reload sites render from
assets/js/moods.js      hot reload / hot restart: loads and swaps in the Scrapbook edition
moods/scrap.js|.css     the Scrapbook edition
assets/img/             app screenshots (webp, 540px wide)
assets/vendor/          gsap, ScrollTrigger, lenis, three
assets/Sherif-Fahmy-CV.pdf
```

## Editing

- **Text:** English is in `index.html`; every element with `data-i18n="key"` has its Arabic in `assets/js/i18n.js` under the same key.
- **Colors:** the tokens at the top of `assets/css/main.css` (`--primary`, `--amber`, `--ink`, …). All text pairs pass WCAG AA.
- **Projects:** edit `assets/js/projects.js`.
- **Photos:** the hero uses `assets/img/me/hero-suit.webp` (a transparent cut-out) and About uses `assets/img/me/work-16.webp`. Swap those images to change them. The 3D objects and their positions are listed in `scene.js`; their hover labels are the `tip.*` strings.
- **CV:** edit `cv/cv.html`, run `node cv/build.mjs` to rebuild `assets/Sherif-Fahmy-CV.pdf`, then refresh the on-page preview image:
  `pdftoppm -r 150 -png -singlefile assets/Sherif-Fahmy-CV.pdf /tmp/cv && convert /tmp/cv.png -quality 85 assets/img/cv-preview.webp`

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`
(enable it once under **Settings → Pages → Source: GitHub Actions**).
