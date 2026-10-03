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
      const name = p.name[lang];
      const split = lang === "ar"
        ? name.split(" ").map((w) => `<span class="ch"><span>${esc(w)}</span></span>`).join(" ")
        : [...name].map((c) => c === " " ? " " : `<span class="ch"><span>${esc(c)}</span></span>`).join("");
      return `<article class="project" data-id="${esc(p.id)}">
        <div class="project__visual" style="background:${p.bg}"><span class="project__word" aria-hidden="true">${esc(p.name.en)}</span><div class="project__phones">${devices}</div></div>
        <div class="project__body">
          <span class="project__tag">${esc(p.tag[lang])}</span>
          <h3 class="project__name" aria-label="${esc(name)}">${split}</h3>
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
  // what the hot-reload sites (moods.js) use: the same text, data and helpers as this page
  window.SITE = {
    t: tr, esc, canAnimate, reduced,
    get lang() { return lang; },
    setLang(next) { applyLang(next); if (window.MOODS) window.MOODS.rerender(); },
    projects: window.PROJECTS, screens: window.SCREENS, content: window.CONTENT,
    openCv: () => openCv(null),
    copy(text, labelEl, idle) {
      const done = () => { labelEl.textContent = lang === "ar" ? window.I18N_AR["contact.copied"] : "Copied ✓"; setTimeout(() => { labelEl.textContent = idle; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => {}); else done();
    }
  };
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
    "tip.chat": "Realtime chat with Supabase", "tip.store": "Shipped to App Store & Google Play", "tip.tests": "1,302 automated tests",
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

  // live screen inside the middle phone of each project
  setInterval(() => {
    if (document.hidden) return;
    $$(".device--live .device__screens").forEach((box) => {
      const imgs = $$("img", box);
      const i = imgs.findIndex((x) => x.classList.contains("is-on"));
      const swap = () => { imgs[i].classList.remove("is-on"); imgs[(i + 1) % imgs.length].classList.add("is-on"); };
      if (!canAnimate) return swap();
      // the screen flips like a card to the next one
      gsap.timeline().to(box, { rotationY: 90, duration: .28, ease: "power2.in", onComplete: swap }).fromTo(box, { rotationY: -90 }, { rotationY: 0, duration: .5, ease: "back.out(1.6)" });
    });
  }, 2600);

  if (!canAnimate) {
    if (scene3d) scene3d.start();
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

  // keep Lenis in step whenever ScrollTrigger re-measures the page
  if (lenis) { ScrollTrigger.addEventListener("refresh", () => lenis.resize()); ScrollTrigger.refresh(); }

  // about: a quiet fade-up for the portrait
  gsap.from(".about__photo", { y: 40, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".about__photo", start: "top 82%", once: true } });

  // counters
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    el.textContent = "0";
    gsap.to(o, { v: end, duration: end > 50 ? 1.8 : 1, delay: .6, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString("en-US"); } });
  });

  // stack strip
  const strip = $(".strip__track");
  strip.innerHTML += strip.innerHTML;
  gsap.fromTo(strip, { xPercent: 0 }, { xPercent: -50, duration: 36, ease: "none", repeat: -1 });

  // reveals
  $$(".sec-head, .minor-title, .about__copy, .contact__inner > *").forEach((el) =>
    gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
  ScrollTrigger.batch(".other, .tl, .skill", { start: "top 90%", once: true, onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: .7, ease: "power3.out", stagger: .08 }) });
  let projectCtx = null;
  function revealProjects() {
    if (projectCtx) projectCtx.revert();
    projectCtx = gsap.context(() => {
      const cards = $$(".project");
      // on wide screens the cards stack: each one sticks and the next slides over it
      cards.forEach((c) => { c.style.minHeight = ""; c.style.top = ""; });
      const hmax = Math.max(...cards.map((c) => c.offsetHeight));
      const stack = innerWidth > 900 && hmax < innerHeight - 112 - (cards.length - 1) * 14;
      $("#projectList").classList.toggle("is-stacked", stack);
      // same height for every card, each one a little lower, like a deck
      if (stack) cards.forEach((c, i) => { c.style.minHeight = hmax + "px"; c.style.top = 92 + i * 14 + "px"; });
      cards.forEach((card, idx) => {
        const devs = $$(".device", card), vis = $(".project__visual", card), one = devs.length === 1;
        const pose = (i) => one ? { y: 0, r: 0 } : [{ y: 16, r: -5 }, { y: -12, r: 0 }, { y: 16, r: 5 }][i] || { y: 0, r: 0 };
        gsap.set(devs, { y: (i) => pose(i).y, rotation: (i) => pose(i).r });
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 82%", once: true } });
        tl.from(card, { y: 90, rotationX: 10, transformPerspective: 1400, transformOrigin: "50% 0%", opacity: 0, duration: 1.1, ease: "expo.out" })
          .from($$(".project__name .ch > span", card), { yPercent: 115, rotation: 8, duration: .8, ease: "back.out(1.6)", stagger: .035 }, .25)
          .from($$(".project__tag, .project__desc, .project__label", card), { y: 18, opacity: 0, duration: .6, ease: "power3.out", stagger: .06 }, .35)
          .from($$(".project__points li", card), { x: -24, opacity: 0, duration: .55, ease: "power3.out", stagger: .07 }, .5)
          .from($$(".metrics > div, .tags li", card), { y: 14, scale: .8, opacity: 0, duration: .5, ease: "back.out(2)", stagger: .03 }, .6)
          // phones rise from below and fan out to their places (sides a little lower and tilted)
          .fromTo(devs, { y: 110, x: (i) => (one ? 0 : (1 - i) * 70), rotation: 0, scale: .82, opacity: 0 },
            { y: (i) => pose(i).y, x: 0, rotation: (i) => pose(i).r, scale: 1, opacity: 1, duration: 1.15, ease: "power3.out", stagger: .12 }, .15);
        // metrics count up
        $$(".metrics b", card).forEach((b) => {
          const m = b.textContent.replace(/,/g, "").match(/^(\d+)(.*)$/); if (!m) return;
          const o = { v: 0 }, end = +m[1];
          tl.to(o, { v: end, duration: 1.4, ease: "power3.out", onUpdate: () => { b.textContent = Math.round(o.v).toLocaleString("en-US") + m[2]; } }, .6);
        });
        // gentle idle float (on yPercent, so it never fights the resting position)
        devs.forEach((d, i) => gsap.fromTo(d, { yPercent: 0 }, { yPercent: i % 2 ? -2.2 : 2.2, duration: 2.6 + i * .4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5 + i * .25 }));
        // giant outlined name slides behind the phones
        gsap.fromTo($(".project__word", card), { xPercent: 12 }, { xPercent: -38, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: .6 } });
        // stacking: the card under the next one shrinks back and dims
        if (stack && idx < cards.length - 1) {
          gsap.to(card, { scale: .9, "--dim": .35, ease: "none", scrollTrigger: { trigger: cards[idx + 1], start: "top bottom", end: () => "top " + (92 + (idx + 1) * 14) + "px", scrub: true } });
        }
        // 3D tilt toward the pointer + a spotlight that follows it
        vis.addEventListener("pointermove", (e) => {
          const r = vis.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
          vis.style.setProperty("--mx", (nx + .5) * 100 + "%"); vis.style.setProperty("--my", (ny + .5) * 100 + "%");
          devs.forEach((d) => { const k = +d.dataset.depth || 1; gsap.to(d, { rotationY: nx * 30 * k, rotationX: -ny * 20 * k, z: 50 * k, duration: .6, ease: "power3.out", overwrite: "auto" }); });
        });
        vis.addEventListener("pointerleave", () => devs.forEach((d) => gsap.to(d, { rotationY: 0, rotationX: 0, z: 0, duration: .9, ease: "elastic.out(1, .5)", overwrite: "auto" })));
      });
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

  var openCv; // var: wireCv() runs (and sets it) before this line is reached
  function wireCv() {
    const modal = $("#cvModal");
    let last = null;
    const close = () => { modal.hidden = true; if (window.__lenis) window.__lenis.start(); if (last) last.focus(); };
    openCv = (from) => { last = from || document.activeElement; modal.hidden = false; if (window.__lenis) window.__lenis.stop(); $(".cv-modal__close", modal).focus(); };
    $$("[data-cv]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); openCv(a); }));
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
