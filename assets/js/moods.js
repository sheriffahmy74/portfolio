/* Hot reload: swaps the whole portfolio for the Scrapbook edition (its own layout, components, type and
   motion), built from the same content in the same order (content.js + projects.js). Pressing r again
   replays it; R or the restart button goes back to the original. The site lives in moods/scrap.js + .css
   and is loaded the first time it is needed; more editions can be added to ORDER. */
(function () {
  "use strict";
  const ORDER = [
    { id: "scrap", name: "Scrapbook", fonts: ["Fraunces:opsz,wght@9..144,600;9..144,800", "Caveat:wght@600;700", "Kalam:wght@400;700"] }
  ];
  window.MOOD_SITES = window.MOOD_SITES || {};

  const $ = (s, c = document) => c.querySelector(s);
  const root = document.documentElement;
  const loaded = new Set();
  const load = (tag, attrs) => new Promise((res) => {
    const key = attrs.href || attrs.src;
    if (loaded.has(key)) return res();
    const el = document.createElement(tag); Object.assign(el, attrs);
    el.onload = () => { loaded.add(key); res(); }; el.onerror = () => res();
    document.head.appendChild(el);
  });
  const fonts = (list) => list.forEach((f) => load("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=" + f + "&display=swap" }));

  let current = -1, busy = false, ctx = null, host = null, hideT = 0;
  const box = $("#hotReload"), btn = $("#hrBtn"), reset = $("#hrReset"), term = $("#hrTerm"), scan = $(".hr-scan");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const ln = (cls, t) => `<span class="${cls}">${esc(t)}</span>`;
  function say(lines, hold) {
    clearTimeout(hideT);
    term.innerHTML = lines.join("\n"); term.classList.add("is-on");
    if (hold) hideT = setTimeout(() => term.classList.remove("is-on"), hold);
  }
  const S = () => window.SITE;
  const anim = () => S() && S().canAnimate && window.gsap;

  // quick generic exit: a scan line wipes the old site away
  function wipe(mid) {
    return new Promise((res) => {
      if (!anim()) { mid(); return res(); }
      gsap.timeline({ onComplete: res })
        .set(scan, { opacity: 1, backgroundPosition: "0 100%" })
        .to(scan, { backgroundPosition: "0 -100%", duration: .7, ease: "power2.inOut" })
        .add(mid, .35)
        .to(scan, { opacity: 0, duration: .15 }, .6);
    });
  }

  function unmount() {
    if (ctx) { ctx.revert(); ctx = null; }
    if (host) { host.remove(); host = null; }
    ORDER.forEach((m) => root.classList.remove("mood-" + m.id));
    root.classList.remove("in-mood");
  }
  function mount(i, intro) {
    const m = ORDER[i], site = window.MOOD_SITES[m.id];
    unmount();
    host = document.createElement("div");
    host.id = "mood"; host.className = "mood m-" + m.id;
    document.body.insertBefore(host, box);
    root.classList.add("in-mood", "mood-" + m.id);
    window.scrollTo(0, 0); if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    const run = () => { site.render(host, S()); if (intro && site.intro && anim()) site.intro(host, S()); };
    if (window.gsap) ctx = gsap.context(run, host); else run();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  async function go(i) {
    if (busy) return; busy = true;
    const m = ORDER[i];
    box.classList.add("is-busy");
    const libs = 3 + Math.floor(Math.random() * 9), ms = 180 + Math.floor(Math.random() * 240);
    const head = [ln("dim", "$ flutter run  ·  r"), "Performing hot reload..."];
    say(head);
    fonts(m.fonts);
    await Promise.all([load("link", { rel: "stylesheet", href: "moods/" + m.id + ".css?v=20261003a" }), load("script", { src: "moods/" + m.id + ".js?v=20261003a" })]);
    if (!window.MOOD_SITES[m.id]) { say(head.concat([ln("err", "✗ Could not load " + m.name)]), 3000); box.classList.remove("is-busy"); busy = false; return; }
    await wipe(() => { mount(i, true); current = i; reset.hidden = false; });
    say(head.concat([ln("ok", "✓ Reloaded " + libs + " of 1,302 libraries in " + ms + "ms."), ln("acc", "  site → " + m.name) + ln("dim", "  (content kept)")]), 3400);
    box.classList.remove("is-busy"); busy = false;
  }
  async function restart() {
    if (busy || current < 0) return; busy = true;
    box.classList.add("is-busy");
    const ms = 520 + Math.floor(Math.random() * 300);
    const head = [ln("dim", "$ flutter run  ·  R"), "Performing hot restart..."];
    say(head);
    await wipe(() => {
      unmount(); current = -1; reset.hidden = true;
      window.scrollTo(0, 0); if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
    say(head.concat([ln("ok", "✓ Restarted application in " + ms + "ms."), ln("acc", "  site → Original")]), 3000);
    box.classList.remove("is-busy"); busy = false;
  }
  const next = () => go((current + 1) % ORDER.length);

  btn.addEventListener("click", next);
  reset.addEventListener("click", restart);
  window.addEventListener("keydown", (e) => {
    if ((e.key !== "r" && e.key !== "R") || e.metaKey || e.ctrlKey || e.altKey) return;
    const a = document.activeElement;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable) return;
    if (!$("#cvModal").hidden) return;
    e.key === "R" ? restart() : next();
  });

  // language switches inside a mood re-render the same site without the intro
  window.MOODS = { rerender() { if (current >= 0) mount(current, false); }, get current() { return current < 0 ? null : ORDER[current].id; } };

  // a little nudge the first time, so people find it
  setTimeout(() => {
    if (current >= 0) return;
    const tip = document.createElement("span"); tip.className = "hr__hint";
    tip.textContent = root.lang === "ar" ? "جرّبني ⚡" : "Try me ⚡";
    box.appendChild(tip);
    if (anim()) { gsap.from(tip, { y: 8, opacity: 0, duration: .4, ease: "back.out(2)" }); gsap.fromTo(btn, { rotation: -6 }, { rotation: 6, duration: .09, repeat: 7, yoyo: true, clearProps: "rotation" }); }
    setTimeout(() => tip.remove(), 4000);
  }, 7000);
})();
