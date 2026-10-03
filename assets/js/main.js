(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const canAnimate = hasGsap && !reduced;
  if (!canAnimate) root.classList.add("no-anim");

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* --------------------------------------------------------------- i18n */
  let redrawHero = null;
  const EN = {};
  $$("[data-i18n]").forEach((el) => { EN[el.dataset.i18n] = el.textContent; });
  let lang = store.get("lang") === "ar" ? "ar" : "en";
  const tr = (k) => (lang === "ar" ? window.I18N_AR[k] : EN[k]) || EN[k] || "";

  function applyLang(next) {
    lang = next;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach((el) => {
      const v = lang === "ar" ? window.I18N_AR[el.dataset.i18n] : EN[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    renderProjects();
    if (redrawHero) redrawHero();
    store.set("lang", lang);
  }

  /* ----------------------------------------------------------- projects */
  const L = {
    did: { en: "What I did", ar: "اللي عملته" },
    follow: { en: "Follow Lamma", ar: "تابع لمّة" }
  };
  function renderProjects() {
    $("#projectList").innerHTML = window.PROJECTS.map((p) => {
      const devices = p.screens.slice(0, 3).map((k) => `<div class="device"><img src="${esc(window.SCREENS[k])}" alt="${esc(p.name.en)} screen" loading="lazy" width="540" height="1200"></div>`).join("");
      const metrics = p.metrics.length ? `<div class="metrics">${p.metrics.map((m) => `<div><b>${esc(m.v)}</b><span>${esc(m.l[lang])}</span></div>`).join("")}</div>` : "";
      return `<article class="project">
        <div class="project__visual" style="background:${p.bg}">${devices}</div>
        <div class="project__body">
          <span class="project__tag">${esc(p.tag[lang])}</span>
          <h3 class="project__name">${esc(p.name[lang])}</h3>
          <p class="project__desc">${esc(p.desc[lang])}</p>
          <p class="project__label">${L.did[lang]}</p>
          <ul class="project__points">${p.points[lang].map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          ${metrics}
          <ul class="tags">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <div class="project__links">${p.links.map((l, i) => `<a class="btn ${i ? "btn--ghost" : "btn--primary"} btn--sm" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label[lang])} ↗</a>`).join("")}</div>
          ${p.social ? `<div class="socials"><span>${L.follow[lang]}</span>${p.social.map((x) => `<a href="${esc(x.href)}" target="_blank" rel="noopener">${esc(x.label)} ↗</a>`).join("")}</div>` : ""}
        </div>
      </article>`;
    }).join("");
  }

  applyLang(lang);
  wireCv();
  wireCopy();
  $("#langToggle").addEventListener("click", () => {
    const next = lang === "ar" ? "en" : "ar";
    if (!canAnimate) { applyLang(next); return; }
    gsap.to("main", { opacity: 0, duration: .2, onComplete: () => {
      applyLang(next); revealProjects(); ScrollTrigger.refresh();
      gsap.to("main", { opacity: 1, duration: .35 });
    } });
  });

  /* ------------------------------------- hero: falling Flutter mark (frames) */
  const hero = $("#hero");
  const canvas = $("#dropCanvas");
  const ctx = canvas.getContext("2d");
  const FRAMES = 110;
  const AUTO = 39;                 // frames 0..AUTO play on load (the drop), the rest follow the scroll
  const mobile = () => matchMedia("(max-width: 900px)").matches;
  const set = mobile() ? "sm" : "lg";
  const LOGO_X = set === "lg" ? .677 : .5;   // where the mark sits in the rendered frame
  const frames = new Array(FRAMES);
  let current = 0;
  const src = (i) => `assets/drop/${set}/${String(i).padStart(3, "0")}.webp`;

  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw(current);
  }
  function pick(i) {
    if (frames[i] && frames[i].complete && frames[i].naturalWidth) return frames[i];
    for (let d = 1; d < FRAMES; d++) {
      const a = frames[i - d], b = frames[i + d];
      if (a && a.complete && a.naturalWidth) return a;
      if (b && b.complete && b.naturalWidth) return b;
    }
    return null;
  }
  function draw(i) {
    current = i;
    const img = pick(i);
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (!img) return;
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight); // cover
    const w = img.naturalWidth * s, h = img.naturalHeight * s, x = (W - w) / 2;
    ctx.drawImage(img, x, (H - h) / 2, w, h);
    // keep the cut-out photo standing right in front of the mark
    if (!mobile()) {
      const fx = root.dir === "rtl" ? 1 - LOGO_X : LOGO_X;
      hero.style.setProperty("--lx", ((x + w * fx) / W * canvas.clientWidth) + "px");
    }
  }
  const loaded = [];
  for (let i = 0; i < FRAMES; i++) {
    loaded.push(new Promise((res) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => { if (Math.abs(i - current) < 3) draw(current); res(); };
      img.src = src(i);
      frames[i] = img;
    }));
  }
  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();
  redrawHero = () => draw(current);

  if (!canAnimate) {
    Promise.all(loaded.slice(0, AUTO + 1)).then(() => draw(AUTO));
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
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 ? $(id) : null;
      if (!target && id !== "#top") return;
      e.preventDefault();
      lenis.scrollTo(target || 0, { offset: -70 });
    }));
  }

  // hero entrance: the mark drops in (frames 0 → AUTO), then the photo and copy arrive
  const drop = { f: 0 };
  let dropDone = false;
  Promise.all(loaded.slice(0, AUTO + 1)).then(() => {
    gsap.to(drop, { f: AUTO, duration: 2.1, ease: "none", onUpdate: () => draw(Math.round(drop.f)), onComplete: () => { dropDone = true; } });
  });
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hero__copy > *", { y: 26, opacity: 0, duration: .8, stagger: .08 }, .2)
    .from(".hero__photo", { y: 80, opacity: 0, duration: 1.2, ease: "expo.out" }, 1.1)
    .from(".float-chip", { scale: .6, opacity: 0, duration: .6, stagger: .1, ease: "back.out(2)" }, 1.6);
  $$(".float-chip").forEach((c, i) => gsap.to(c, { y: i % 2 ? 8 : -8, duration: 2.6 + i * .4, repeat: -1, yoyo: true, ease: "sine.inOut" }));

  // after the drop, scrolling spins the mark and bursts it
  function onHeroScroll(p) {
    if (!dropDone) return;
    draw(Math.round(AUTO + clamp(p) * (FRAMES - 1 - AUTO)));
  }
  if (mobile()) {
    ScrollTrigger.create({ trigger: ".hero__visual", start: "top top", end: "bottom top", scrub: .3, onUpdate: (s) => onHeroScroll(s.progress) });
  } else {
    ScrollTrigger.create({ trigger: hero, pin: true, start: "top top", end: () => "+=" + innerHeight * 1.1, scrub: .3, onUpdate: (s) => onHeroScroll(s.progress) });
    gsap.to(".hero__copy", { y: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: () => "+=" + innerHeight * 1.1, scrub: true } });
  }

  // counters
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    el.textContent = "0";
    gsap.to(o, { v: end, duration: end > 50 ? 1.8 : 1, delay: .6, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v); } });
  });

  // stack strip
  const strip = $(".strip__track");
  strip.innerHTML += strip.innerHTML;
  gsap.fromTo(strip, { xPercent: 0 }, { xPercent: -50, duration: 36, ease: "none", repeat: -1 });

  // reveals
  $$(".sec-head, .minor-title, .about__copy, .about__photos, .contact__inner > *").forEach((el) =>
    gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
  ScrollTrigger.batch(".other, .tl, .skill", { start: "top 90%", once: true, onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: .7, ease: "power3.out", stagger: .08 }) });
  function revealProjects() {
    $$(".project").forEach((card) => {
      gsap.from(card, { y: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%", once: true } });
      const devs = $$(".device", card);
      gsap.from(devs, { y: 120, duration: 1.2, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: card, start: "top 80%", once: true } });
      gsap.to(devs, { yPercent: -6, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }
  revealProjects();

  // nav + progress
  const nav = $("#nav");
  const navLinks = $$(".nav__links a");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => {
    $("#progress").style.transform = `scaleX(${s.progress})`;
    nav.classList.toggle("is-scrolled", s.scroll() > 10);
    nav.classList.toggle("is-hidden", s.direction === 1 && s.scroll() > 500);
  } });
  ["projects", "experience", "skills", "about", "contact"].forEach((id) => {
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
        setTimeout(() => { label.textContent = tr("contact.copy"); }, 1800);
      };
      const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#mailLink")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, fallback);
      else fallback();
    });
  }
})();
