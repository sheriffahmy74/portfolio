(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const canAnimate = hasGsap && !reduced;
  if (!canAnimate) root.classList.add("no-anim");

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ------------------------------------------------------------- themes */
  const THEMES = {
    paper: { bg: "#F2F0EB", fg: "#141414", dim: "#5E5C57", line: "rgba(20,20,20,0.14)", hot: "#C42A0A" },
    ink: { bg: "#141414", fg: "#F2F0EB", dim: "rgba(242,240,235,0.62)", line: "rgba(242,240,235,0.12)", hot: "#FF3B14" },
    red: { bg: "#FF3B14", fg: "#141414", dim: "rgba(20,20,20,0.72)", line: "rgba(20,20,20,0.2)", hot: "#141414" }
  };
  function applyTheme(name, instant) {
    const t = THEMES[name] || THEMES.paper;
    const vars = { "--bg": t.bg, "--fg": t.fg, "--dim": t.dim, "--line": t.line, "--hot": t.hot };
    if (hasGsap && !instant) gsap.to(root, Object.assign({ duration: .55, ease: "power2.out", overwrite: true }, vars));
    else Object.keys(vars).forEach((k) => root.style.setProperty(k, vars[k]));
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = t.bg;
  }

  /* --------------------------------------------------------------- i18n */
  const EN = {};
  $$("[data-i18n]").forEach((el) => { EN[el.dataset.i18n] = el.textContent; });
  let lang = store.get("lang") === "ar" ? "ar" : "en";
  const tr = (k) => (lang === "ar" ? window.I18N_AR[k] : EN[k]) || EN[k] || "";

  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    const isArabic = /[؀-ۿ]/.test(text);
    el.innerHTML = text.trim().split(/\s+/).map((word) => {
      const inner = isArabic ? `<span class="ch">${esc(word)}</span>` : Array.from(word).map((c) => `<span class="ch">${esc(c)}</span>`).join("");
      return `<span class="wd" aria-hidden="true">${inner}</span>`;
    }).join(" ");
  }
  function splitWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  }
  function applyLang(next) {
    lang = next;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach((el) => {
      const v = lang === "ar" ? window.I18N_AR[el.dataset.i18n] : EN[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    $$("[data-split]").forEach(splitChars);
    $$("[data-words]").forEach(splitWords);
    renderRows();
    store.set("lang", lang);
  }

  /* ------------------------------------------------------ work index rows */
  const rowsEl = $("#rows");
  let openRow = 0;
  function renderRows() {
    rowsEl.innerHTML = window.PROJECTS.map((p, i) => {
      const metrics = p.metrics.length ? `<div class="metrics">${p.metrics.map((m) => `<div><b>${esc(m.v)}</b><span>${esc(m.l[lang])}</span></div>`).join("")}</div>` : "";
      const shots = p.screens.map((k) => `<img src="${esc(window.SCREENS[k])}" alt="${esc(p.name.en)} screen" loading="lazy" width="540" height="1200">`).join("");
      return `<article class="row${i === openRow ? " is-open" : ""}" data-i="${i}">
        <button class="row__head" type="button" aria-expanded="${i === openRow}" aria-controls="row-${i}">
          <span class="row__no">${String(i + 1).padStart(2, "0")}</span>
          <span><span class="row__name">${esc(p.name[lang])}</span></span>
          <span class="row__type">${esc(p.tag[lang])}</span>
          <span class="row__stack">${esc(p.stack.slice(0, 4).join(" · "))}</span>
        </button>
        <div class="row__body" id="row-${i}"><div class="row__inner"><div class="row__grid">
          <div class="row__text">
            <p>${esc(p.desc[lang])}</p>
            <ul>${p.points[lang].map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            ${metrics}
            <div class="row__links">${p.links.map((l) => `<a class="pill" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label[lang])} ↗</a>`).join("")}</div>
          </div>
          <div class="row__shots">${shots}</div>
        </div></div></div>
      </article>`;
    }).join("");
  }
  function setOpen(i, scroll) {
    openRow = openRow === i && !scroll ? -1 : i;
    $$(".row", rowsEl).forEach((r) => {
      const on = +r.dataset.i === openRow;
      r.classList.toggle("is-open", on);
      $(".row__head", r).setAttribute("aria-expanded", on);
    });
    if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 650);
    if (scroll) {
      const target = $$(".row", rowsEl)[i];
      if (window.__lenis) window.__lenis.scrollTo(target, { offset: -80 }); else target.scrollIntoView({ behavior: "smooth" });
    }
  }
  rowsEl.addEventListener("click", (e) => { const h = e.target.closest(".row__head"); if (h) setOpen(+h.parentElement.dataset.i); });
  $$(".hero__index a").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); setOpen(+a.dataset.project, true); }));

  // floating preview that follows the cursor over the index (desktop only)
  const peek = $("#peek");
  if (finePointer && hasGsap) {
    const px = gsap.quickTo(peek, "x", { duration: .45, ease: "power3.out" });
    const py = gsap.quickTo(peek, "y", { duration: .45, ease: "power3.out" });
    rowsEl.addEventListener("pointermove", (e) => {
      const head = e.target.closest(".row__head");
      const row = head && head.parentElement;
      if (!row || row.classList.contains("is-open")) { gsap.to(peek, { opacity: 0, scale: .9, duration: .25 }); return; }
      const p = window.PROJECTS[+row.dataset.i];
      const src = window.SCREENS[p.screens[0]];
      if (peek.getAttribute("src") !== src) peek.src = src;
      px(e.clientX + 24); py(e.clientY - 160);
      gsap.to(peek, { opacity: 1, scale: 1, rotate: -4, duration: .3 });
    });
    rowsEl.addEventListener("pointerleave", () => gsap.to(peek, { opacity: 0, scale: .9, duration: .25 }));
  }

  applyLang(lang);
  applyTheme("paper", true);
  wireCv();
  wireCopy();
  $("#langToggle").addEventListener("click", () => {
    const next = lang === "ar" ? "en" : "ar";
    if (!canAnimate) { applyLang(next); return; }
    gsap.to("main", { opacity: 0, duration: .2, onComplete: () => {
      applyLang(next); buildAbout(); ScrollTrigger.refresh();
      gsap.to("main", { opacity: 1, duration: .35 });
    } });
  });

  /* ------------------------------------------------- scroll frame sequence */
  const canvas = $("#seq");
  const ctx = canvas.getContext("2d");
  const FRAMES = 140;
  const useSmall = Math.min(innerWidth, 1400) * Math.min(devicePixelRatio || 1, 2) < 1100;
  const dir = useSmall ? "assets/seq/sm/" : "assets/seq/lg/";
  const frames = new Array(FRAMES);
  let current = 0;
  const path = (i) => dir + String(i).padStart(3, "0") + ".webp";

  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw(current);
  }
  function nearestLoaded(i) {
    for (let d = 0; d < FRAMES; d++) {
      if (frames[i - d] && frames[i - d].complete) return frames[i - d];
      if (frames[i + d] && frames[i + d].complete) return frames[i + d];
    }
    return null;
  }
  function draw(i) {
    current = i;
    const img = frames[i] && frames[i].complete ? frames[i] : nearestLoaded(i);
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (!img || !img.naturalWidth) return;
    const mobile = W / H < 1;
    // desktop: phone sits in the right two-thirds; mobile: upper part, above the caption
    const boxW = mobile ? W * 1.05 : W * .7;
    const boxH = mobile ? H * .64 : H * .96;
    const s = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    const rtl = root.dir === "rtl";
    const cx = mobile ? W / 2 : (rtl ? W * .38 : W * .62);
    const cy = mobile ? H * .44 : H * .52;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  }
  function load(i) {
    if (frames[i]) return;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => { if (Math.abs(i - current) < 3 || i === 0) draw(current); };
    img.src = path(i);
    frames[i] = img;
  }
  // first frame now, a coarse pass next, then fill the gaps
  load(0);
  const order = [];
  [10, 3, 1].forEach((step) => { for (let i = 0; i < FRAMES; i += step) order.push(i); });
  let qi = 0;
  (function pump() {
    let n = 0;
    while (qi < order.length && n < 8) { load(order[qi++]); n++; }
    if (qi < order.length) setTimeout(pump, 60);
  })();
  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();

  const stepEls = $$(".step");
  const stepNo = $("#stepNo");
  function setSeq(p) {
    const i = Math.round(clamp(p) * (FRAMES - 1));
    if (i !== current) draw(i);
    let active = 0;
    stepEls.forEach((s, k) => { if (p >= +s.dataset.from) active = k; });
    stepEls.forEach((s, k) => s.classList.toggle("is-active", k === active));
    stepNo.textContent = String(active).padStart(2, "0");
    $("#seqBar").style.transform = `scaleX(${clamp(p)})`;
  }

  /* -------------------------------------------------------- no-motion path */
  if (!canAnimate) {
    draw(95);
    $$(".step").forEach((s) => s.classList.add("is-active"));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) applyTheme(en.target.dataset.theme, true); }), { rootMargin: "-50% 0px -50% 0px" });
      $$("[data-theme]").forEach((s) => io.observe(s));
    }
    const showStatic = () => { if (frames[95] && frames[95].complete) draw(95); else setTimeout(showStatic, 200); };
    load(95); showStatic();
    return;
  }

  /* ================================================================ motion */
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('.nav a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 ? $(id) : null;
      e.preventDefault();
      lenis.scrollTo(target || 0, { offset: id === "#inside" ? 0 : -60 });
    }));
  }

  // pinned sequence
  ScrollTrigger.create({
    trigger: ".inside", pin: ".inside__pin", start: "top top", end: () => "+=" + innerHeight * 3.2, scrub: .4,
    onUpdate: (s) => setSeq(s.progress)
  });
  gsap.to(".inside__bgword span:first-child", { xPercent: -30, ease: "none", scrollTrigger: { trigger: ".inside", start: "top bottom", end: () => "+=" + innerHeight * 4.2, scrub: true } });
  gsap.to(".inside__bgword span:last-child", { xPercent: 20, ease: "none", scrollTrigger: { trigger: ".inside", start: "top bottom", end: () => "+=" + innerHeight * 4.2, scrub: true } });

  // pinned horizontal gallery
  const track = $("#galleryTrack");
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: "none",
    scrollTrigger: { trigger: ".gallery", pin: ".gallery__pin", start: "top top", end: () => "+=" + dist(), scrub: .5, invalidateOnRefresh: true } });

  // ground colour per section
  $$("[data-theme]").forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => { if (s.isActive) applyTheme(sec.dataset.theme); } }));

  /* ------------------------------------------------------------- intro */
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".cols i", { scaleY: 0, duration: 1.2, stagger: .04, ease: "power3.inOut" }, 0)
    .from(".nav", { opacity: 0, duration: .8, ease: "power2.out" }, .2)
    .from(".hero__name .ch", { yPercent: 110, duration: 1.1, stagger: .035 }, .35)
    .from(".hero__name .dot", { scale: 0, duration: .8, ease: "back.out(3)" }, .95)
    .from(".hero__block", { clipPath: "inset(100% 0 0 0)", duration: 1.1, ease: "expo.inOut" }, .55)
    .from(".hero__block img", { yPercent: 20, duration: 1.4 }, .75)
    .from(".hero__meta div, .hero__index > *, .hero__lede, .hero__scroll", { y: 18, opacity: 0, duration: .8, stagger: .05 }, .9);
  gsap.to(".hero__block img", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* --------------------------------------------------------------- about */
  let aboutST = null;
  function buildAbout() {
    if (aboutST) aboutST.kill();
    aboutST = gsap.to(".about__lead .w", { opacity: 1, stagger: .08, ease: "none",
      scrollTrigger: { trigger: ".about__lead", start: "top 82%", end: "bottom 50%", scrub: .5 } }).scrollTrigger;
  }
  buildAbout();
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    el.textContent = "0";
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true,
      onEnter: () => gsap.to(o, { v: end, duration: end > 50 ? 1.8 : 1, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });

  /* ------------------------------------------------------------- reveals */
  $$(".sec-head, .index, .about__lead, .stats, .also").forEach((el) => gsap.from(el, { y: 40, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
  ScrollTrigger.batch(".row, .tr", { start: "top 92%", once: true, onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: .7, ease: "power3.out", stagger: .06 }) });
  $$(".contact__title .line").forEach((line) => gsap.from($$(".ch", line), { yPercent: 110, duration: 1, ease: "expo.out", stagger: .025, scrollTrigger: { trigger: line, start: "top 92%", once: true } }));
  $$(".h2").forEach((h) => gsap.from(h, { clipPath: "inset(0 100% 0 0)", duration: 1.1, ease: "expo.inOut", scrollTrigger: { trigger: h, start: "top 88%", once: true } }));

  /* ---------------------------------------------------- nav + progress */
  const nav = $("#nav");
  const navLinks = $$(".nav__links a");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => {
    $("#progress").style.transform = `scaleX(${s.progress})`;
    nav.classList.toggle("is-hidden", s.direction === 1 && s.scroll() > 400);
  } });
  ["inside", "work", "about", "contact"].forEach((id) => {
    ScrollTrigger.create({ trigger: "#" + id, start: "top 50%", end: "bottom 50%", onToggle: (s) => {
      if (s.isActive) navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + id));
    } });
  });
  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* ============================================== helpers (no motion needed) */
  function wireCv() {
    const modal = $("#cvModal");
    let last = null;
    const close = () => { modal.hidden = true; if (window.__lenis) window.__lenis.start(); if (last) last.focus(); };
    $$("[data-cv]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault(); last = a; modal.hidden = false;
      if (window.__lenis) window.__lenis.stop();
      $(".cv-modal__close", modal).focus();
    }));
    $$("[data-close]", modal).forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
    // inside the claude.ai preview, plain download links are blocked; save through the viewer instead
    let saver = null;
    if (window.claude && typeof window.claude.use === "function") window.claude.use("downloads").then((ns) => { saver = ns; }, () => {});
    const dl = $(".cv-modal__actions a", modal);
    dl.addEventListener("click", (e) => {
      if (!saver) return;
      e.preventDefault();
      fetch(dl.getAttribute("href")).then((r) => r.blob())
        .then((blob) => saver.save({ filename: "Sherif-Fahmy-CV.pdf", data: blob }))
        .catch(() => { /* declined or unavailable: the preview stays visible */ });
    });
  }
  function wireCopy() {
    const btn = $("#copyMail");
    btn.addEventListener("click", () => {
      const label = $("span", btn);
      const email = $("#mailLink").textContent.trim();
      const done = () => {
        label.textContent = lang === "ar" ? window.I18N_AR["contact.copied"] : "Copied ✓";
        btn.classList.add("is-done");
        setTimeout(() => { label.textContent = tr("contact.copy"); btn.classList.remove("is-done"); }, 1800);
      };
      const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#mailLink")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, fallback);
      else fallback();
    });
  }
})();
