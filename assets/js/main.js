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
    store.set("lang", lang);
  }

  /* ----------------------------------------------------------- projects */
  const L = {
    did: { en: "What I did", ar: "اللي عملته" },
    follow: { en: "Follow Lamma", ar: "تابع لمّة" }
  };
  function renderProjects() {
    $("#projectList").innerHTML = window.PROJECTS.map((p) => {
      const img = (k, on) => `<img class="${on ? "is-on" : ""}" src="${esc(window.SCREENS[k])}" alt="${esc(p.name.en)} screen" loading="lazy" width="540" height="1200">`;
      const sc = p.screens;
      const devices = sc.length === 1
        ? `<div class="device" data-depth="1"><div class="device__screens">${img(sc[0], true)}</div></div>`
        : `<div class="device" data-depth=".6"><div class="device__screens">${img(sc[0], true)}</div></div>`
          + `<div class="device device--live" data-depth="1.2"><div class="device__screens">${sc.map((k, i) => img(k, i === 1)).join("")}</div></div>`
          + `<div class="device" data-depth=".6"><div class="device__screens">${img(sc[sc.length - 1], true)}</div></div>`;
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
  if (!reduced && matchMedia("(pointer: fine)").matches) wireTouches();
  $("#langToggle").addEventListener("click", () => {
    const next = lang === "ar" ? "en" : "ar";
    if (scene3d) scene3d.relabel();
    if (!canAnimate) { applyLang(next); return; }
    gsap.to("main", { opacity: 0, duration: .2, onComplete: () => {
      applyLang(next); revealProjects(); ScrollTrigger.refresh();
      gsap.to("main", { opacity: 1, duration: .35 });
    } });
  });

  /* ------------------------------------------------- hero: interactive 3D scene */
  const hero = $("#hero");
  Object.assign(EN, {
    "tip.flutter": "Flutter & Dart", "tip.phone": "Lamma · click to switch screens", "tip.maps": "Google Maps & geolocation",
    "tip.chat": "Realtime chat with Supabase", "tip.store": "Shipped to App Store & Google Play", "tip.tests": "746+ automated tests",
    "tip.code": "Clean Architecture", "hero.hintTouch": "Tap the 3D objects"
  });
  let scene3d = null;
  if (window.HeroScene && window.HeroScene.supported()) {
    try {
      const S = window.SCREENS;
      scene3d = window.HeroScene.create($("#sceneStage"), {
        photo: "assets/img/me/hero-suit.webp",
        screens: [S["lamma-en"], S["lamma-search"], S["lamma-outing"], S["lamma-chat"], S["lamma-wallet"]],
        tip: $("#sceneTip"), reduced,
        label: (k) => tr("tip." + k)
      });
      root.classList.add("has-scene");
      if (matchMedia("(pointer: coarse)").matches) {
        const hint = $(".hero__hint");
        hint.dataset.i18n = "hero.hintTouch";
        hint.textContent = tr("hero.hintTouch");
      }
    } catch (e) { scene3d = null; }
  }

  /* ------------------------------------------- build story: code → phone → apps */
  let build3d = null;
  if (window.BuildScene && window.BuildScene.supported()) {
    try { build3d = window.BuildScene.create($("#buildStage"), { tip: $("#buildTip") }); root.classList.add("has-build"); }
    catch (e) { build3d = null; }
  }
  const steps = $$(".build__step");
  function setBuild(p) {
    if (build3d) build3d.progress = p;
    const k = p < .3 ? 0 : p < .5 ? 1 : 2;
    steps.forEach((s, i) => s.classList.toggle("is-on", i === k));
    $(".build").style.setProperty("--p", p.toFixed(3));
  }

  // live screen inside the middle phone of each project
  setInterval(() => {
    if (document.hidden) return;
    $$(".device--live .device__screens").forEach((box) => {
      const imgs = $$("img", box);
      const i = imgs.findIndex((x) => x.classList.contains("is-on"));
      imgs[i].classList.remove("is-on");
      imgs[(i + 1) % imgs.length].classList.add("is-on");
    });
  }, 2600);

  if (!canAnimate) {
    if (scene3d) scene3d.start();
    setBuild(1);
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

  // hero entrance: copy slides in while the 3D objects fly in from deep space
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hero__copy > *", { y: 26, opacity: 0, duration: .8, stagger: .08 }, .1)
    .from(".hero__hint", { opacity: 0, duration: .6 }, 2.2);
  if (scene3d) {
    gsap.delayedCall(.15, () => scene3d.start());
    // scrolling away pulls the objects apart and towards you
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", scrub: .4, onUpdate: (s) => { scene3d.exit = s.progress; } });
  } else {
    gsap.from(".hero__photo", { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", delay: .3 });
  }

  // build story: pinned while you scroll through it
  ScrollTrigger.create({ trigger: ".build", start: "top top", end: () => "+=" + innerHeight * 3, pin: true, scrub: .6, anticipatePin: 1,
    onUpdate: (s) => setBuild(s.progress) });
  setBuild(0);
  // pinning adds scroll length; let Lenis know whenever ScrollTrigger re-measures
  if (lenis) { ScrollTrigger.addEventListener("refresh", () => lenis.resize()); ScrollTrigger.refresh(); }

  // about: the portrait opens like a lens as it scrolls in
  gsap.fromTo(".about__circle", { "--r": "0%" }, { "--r": "50%", ease: "none", scrollTrigger: { trigger: ".about__photo", start: "top 85%", end: "center 55%", scrub: .5 } });
  gsap.fromTo(".about__img", { "--z": 1.35 }, { "--z": 1, ease: "none", scrollTrigger: { trigger: ".about__photo", start: "top 85%", end: "bottom 40%", scrub: .5 } });

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
  $$(".sec-head, .minor-title, .about__copy, .contact__inner > *").forEach((el) =>
    gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
  ScrollTrigger.batch(".other, .tl, .skill", { start: "top 90%", once: true, onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: .7, ease: "power3.out", stagger: .08 }) });
  function revealProjects() {
    $$(".project").forEach((card) => {
      gsap.from(card, { y: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%", once: true } });
      const devs = $$(".device", card);
      // phones fan out from a stack
      gsap.from(devs, { x: (i) => (1 - i) * 90, rotationY: (i) => (i - 1) * 35, scale: .7, opacity: 0, duration: 1.3, ease: "expo.out", stagger: .08,
        scrollTrigger: { trigger: card, start: "top 78%", once: true } });
      // idle float
      devs.forEach((d, i) => gsap.to(d, { y: i % 2 ? -10 : 10, duration: 2.8 + i * .5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * .3 }));
      // 3D tilt toward the pointer
      const vis = $(".project__visual", card);
      vis.addEventListener("pointermove", (e) => {
        const r = vis.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        devs.forEach((d) => { const k = +d.dataset.depth || 1; gsap.to(d, { rotationY: nx * 26 * k, rotationX: -ny * 18 * k, z: 40 * k, duration: .6, ease: "power3.out", overwrite: "auto" }); });
      });
      vis.addEventListener("pointerleave", () => devs.forEach((d) => gsap.to(d, { rotationY: 0, rotationX: 0, z: 0, duration: .8, ease: "power3.out", overwrite: "auto" })));
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
  /* small interactions: every card and button answers the pointer */
  function wireTouches() {
    // about portrait drifts towards the pointer
    const ph = $(".about__photo"), circ = $(".about__circle");
    ph.addEventListener("pointermove", (e) => {
      const r = ph.getBoundingClientRect();
      circ.style.setProperty("--mx", ((e.clientX - r.left) / r.width - .5) * 22 + "px");
      circ.style.setProperty("--my", ((e.clientY - r.top) / r.height - .5) * 22 + "px");
    });
    ph.addEventListener("pointerleave", () => { circ.style.setProperty("--mx", "0px"); circ.style.setProperty("--my", "0px"); });
    // skill cards and fact tiles: tilt + a spotlight that follows the cursor
    $$(".skill, .facts > div, .mailcard").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
        el.style.transform = `perspective(700px) rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg) translateY(-4px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
    // magnetic buttons
    $$(".btn, .whatsapp, .lang").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

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
