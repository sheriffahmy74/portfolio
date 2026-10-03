(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMQ = window.matchMedia("(max-width: 760px)");
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const canAnimate = hasGsap && !reduced;
  const has3D = canAnimate && window.Phone3D && window.Phone3D.supported();
  if (!canAnimate) root.classList.add("no-anim");
  if (!has3D) root.classList.add("no-webgl");

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ------------------------------------------------------------ themes */
  const THEMES = {
    paper: { bg: "#F6F3EC", fg: "#101418", muted: "#5B6068", line: "rgba(16,20,24,0.14)", accent: "#0468D7", chip: "rgba(16,20,24,0.06)" },
    blue: { bg: "#0468D7", fg: "#FFFFFF", muted: "rgba(255,255,255,0.8)", line: "rgba(255,255,255,0.28)", accent: "#FFC83D", chip: "rgba(255,255,255,0.14)" },
    sun: { bg: "#FFC83D", fg: "#101418", muted: "rgba(16,20,24,0.72)", line: "rgba(16,20,24,0.22)", accent: "#0468D7", chip: "rgba(16,20,24,0.08)" }
  };
  let activeTheme = "paper";
  let project = 0;
  function themeValues(name) {
    if (name === "project") return Object.assign({}, THEMES.paper, { bg: window.PROJECTS[project].bg });
    return THEMES[name] || THEMES.paper;
  }
  function applyTheme(name, instant) {
    activeTheme = name;
    const t = themeValues(name);
    const vars = { "--bg": t.bg, "--fg": t.fg, "--muted": t.muted, "--line": t.line, "--accent": t.accent, "--chip": t.chip };
    if (hasGsap && !instant) gsap.to(root, Object.assign({ duration: .7, ease: "power2.out", overwrite: true }, vars));
    else Object.keys(vars).forEach((k) => root.style.setProperty(k, vars[k]));
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = t.bg;
  }

  /* -------------------------------------------------------------- i18n */
  const EN = {};
  $$("[data-i18n]").forEach((el) => { EN[el.dataset.i18n] = el.textContent; });
  let lang = store.get("lang") === "ar" ? "ar" : "en";
  const tr = (k) => (lang === "ar" && window.I18N_AR[k]) || EN[k] || k;

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
    renderTabs(); renderProject(false);
    store.set("lang", lang);
  }

  /* ------------------------------------------------------ project selector */
  const tabsEl = $("#projectTabs");
  const detailEl = $("#projectDetail");
  const dotsEl = $("#shotDots");
  const workSlot = $("#workSlot");
  const workFallback = $("#workFallback");
  let shot = 0;
  let userPicked = false;

  function renderTabs() {
    tabsEl.innerHTML = window.PROJECTS.map((p, i) =>
      `<button class="tab${i === project ? " is-active" : ""}" role="tab" type="button" aria-selected="${i === project}" data-i="${i}">${esc(p.name[lang])}<small>0${i + 1}</small></button>`
    ).join("");
  }
  function renderProject(animate) {
    const p = window.PROJECTS[project];
    const metrics = p.metrics.length
      ? `<div class="metrics">${p.metrics.map((m) => `<div><b>${esc(m.v)}</b><span>${esc(m.l[lang])}</span></div>`).join("")}</div>` : "";
    detailEl.innerHTML =
      `<span class="tagline">${esc(p.tag[lang])}</span>` +
      `<h3>${esc(p.name[lang])}</h3>` +
      `<p>${esc(p.desc[lang])}</p>` +
      `<ul class="points">${p.points[lang].map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` +
      metrics +
      `<ul class="pills">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` +
      `<div class="links">${p.links.map((l) => `<a class="btn btn--small" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label[lang])}</a>`).join("")}</div>`;
    dotsEl.innerHTML = p.screens.length > 1
      ? p.screens.map((s, i) => `<button type="button" aria-label="Screen ${i + 1}" class="${i === shot ? "is-active" : ""}" data-s="${i}"></button>`).join("") : "";
    setShot(shot);
    if (animate && canAnimate) gsap.from(detailEl.children, { y: 24, opacity: 0, duration: .6, ease: "power3.out", stagger: .05 });
  }
  function setShot(i) {
    const p = window.PROJECTS[project];
    shot = i % p.screens.length;
    workSlot.dataset.screen = p.screens[shot];
    workFallback.src = window.SCREENS[p.screens[shot]];
    $$("button", dotsEl).forEach((b, k) => b.classList.toggle("is-active", k === shot));
  }
  function selectProject(i) {
    if (i === project) return;
    project = i; shot = 0;
    $$(".tab", tabsEl).forEach((b, k) => { b.classList.toggle("is-active", k === i); b.setAttribute("aria-selected", k === i); });
    renderProject(true);
    if (activeTheme === "project") applyTheme("project");
  }
  tabsEl.addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (b) { userPicked = true; selectProject(+b.dataset.i); } });
  dotsEl.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { userPicked = true; setShot(+b.dataset.s); } });
  // cycle screens while the section is on screen, until the visitor takes over
  setInterval(() => { if (activeTheme === "project" && !userPicked && !document.hidden) setShot(shot + 1); }, 3200);

  applyLang(lang);
  applyTheme("paper", true);

  /* ------------------------------------------------------------ static wiring */
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

  if (!canAnimate) {
    const intro = $("#intro"); if (intro) intro.remove();
    // still shift colours as sections come into view
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) applyTheme(en.target.dataset.theme, true); }), { rootMargin: "-50% 0px -50% 0px" });
      $$("[data-theme]").forEach((s) => io.observe(s));
    }
    $$(".layer").forEach((l) => l.classList.add("is-active"));
    return;
  }

  /* ==================================================================== motion */
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 ? $(id) : null;
      if (!target && id !== "#top") return;
      e.preventDefault();
      lenis.scrollTo(target || 0, { offset: 0 });
    }));
  }

  /* --------------------------------------------------- pinned: architecture */
  let archP = 0;
  const layersEls = $$(".layer");
  ScrollTrigger.create({
    trigger: ".arch", pin: ".arch__pin", start: "top top", end: () => "+=" + innerHeight * 2.4, scrub: true,
    onUpdate: (s) => {
      archP = s.progress;
      const idx = archP < .14 ? 0 : Math.min(3, 1 + Math.floor((archP - .14) / .25));
      layersEls.forEach((l, k) => l.classList.toggle("is-active", k === idx));
    }
  });

  /* ------------------------------------------------ pinned: horizontal gallery */
  const track = $("#galleryTrack");
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, {
    x: () => -dist(), ease: "none",
    scrollTrigger: { trigger: ".gallery", pin: ".gallery__pin", start: "top top", end: () => "+=" + dist(), scrub: .6, invalidateOnRefresh: true }
  });

  /* ---------------------------------------------------- colour shift by section */
  $$("[data-theme]").forEach((sec) => {
    ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%", onToggle: (s) => { if (s.isActive) applyTheme(sec.dataset.theme); } });
  });

  /* ---------------------------------------------------------------- 3D phone */
  let phone = null;
  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => { pointer.x = e.clientX / innerWidth - .5; pointer.y = e.clientY / innerHeight - .5; });
  const introState = { x: innerWidth / 2, y: -innerHeight * .5, h: innerHeight * .62, rx: .5, ry: -7.2, rz: .3, explode: 0, vis: 1 };
  const introMix = { v: 0 };

  if (has3D) {
    try {
      phone = window.Phone3D.create($("#stage"), window.SCREENS);
      phone.preload(Object.keys(window.SCREENS));
      window.addEventListener("resize", () => phone.resize());
    } catch (err) {
      phone = null;
      root.classList.add("no-webgl");
    }
  }

  function slotState(slot) {
    const r = slot.getBoundingClientRect();
    const hide = slot.dataset.hide === "1" || (mobileMQ.matches && slot.dataset.hideMobile === "1");
    let rx = +slot.dataset.rx || 0, ry = +slot.dataset.ry || 0, rz = +slot.dataset.rz || 0, explode = 0;
    if (slot.dataset.mode === "arch") {
      const turn = clamp(archP / .35);
      explode = clamp((archP - .1) / .5);
      ry = lerp(-.2, -.95, turn); rx = lerp(.05, .3, turn); rz = lerp(0, .05, turn);
    }
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height, rx, ry, rz, explode, vis: hide ? 0 : 1, screen: slot.dataset.screen };
  }

  const slots = $$(".slot");
  function phoneTarget() {
    const mid = innerHeight / 2;
    const list = slots.map(slotState).filter((s) => s.h > 0);
    if (!list.length) return null;
    let a = list[0], b = list[0], t = 0;
    if (mid <= list[0].cy) { a = b = list[0]; }
    else if (mid >= list[list.length - 1].cy) { a = b = list[list.length - 1]; }
    else {
      for (let i = 0; i < list.length - 1; i++) {
        if (mid >= list[i].cy && mid <= list[i + 1].cy) { a = list[i]; b = list[i + 1]; t = (mid - a.cy) / (b.cy - a.cy || 1); break; }
      }
    }
    const e = t * t * (3 - 2 * t);
    // a hidden neighbour shrinks the phone in place instead of flying it across the screen
    const ax = a.vis ? a.cx : b.cx, bx = b.vis ? b.cx : a.cx;
    const ay = a.vis ? a.cy : b.cy, by = b.vis ? b.cy : a.cy;
    return {
      x: lerp(ax, bx, e), y: lerp(ay, by, e), h: lerp(a.h, b.h, e),
      rx: lerp(a.rx, b.rx, e), ry: lerp(a.ry, b.ry, e), rz: lerp(a.rz, b.rz, e),
      explode: lerp(a.explode, b.explode, e), vis: lerp(a.vis, b.vis, e),
      screen: e < .5 ? a.screen : b.screen
    };
  }

  if (phone) {
    gsap.ticker.add((time, deltaMs) => {
      const tg = phoneTarget();
      if (!tg) return;
      tg.ry += pointer.x * .35 * (1 - tg.explode * .6);
      tg.rx += pointer.y * .18;
      if (introMix.v < 1) {
        const m = introMix.v;
        ["x", "y", "h", "rx", "ry", "rz"].forEach((k) => { tg[k] = lerp(introState[k], tg[k], m); });
        tg.vis = 1;
      }
      phone.setScreen(tg.screen);
      phone.setTarget(tg);
      phone.tick(Math.min(deltaMs, 50) / 1000, time);
    });
  }

  /* -------------------------------------------------------------------- intro */
  splitHeroReady();
  function splitHeroReady() {
    const intro = $("#intro");
    body.classList.add("is-intro");
    lenis && lenis.stop();
    const tl = gsap.timeline({
      onComplete: () => { body.classList.remove("is-intro"); lenis && lenis.start(); intro && intro.remove(); introMix.v = 1; }
    });
    tl.from(".intro__name, .intro__tag", { y: 30, opacity: 0, duration: .5, ease: "power3.out", stagger: .06 }, 0);
    if (phone) {
      tl.to(introState, { y: innerHeight * .48, ry: 0, rx: .05, rz: 0, duration: 1.15, ease: "power3.out" }, .05);
    }
    tl.to(".intro", { yPercent: -100, duration: .85, ease: "expo.inOut" }, phone ? 1.05 : .6)
      .to(introMix, { v: 1, duration: 1, ease: "power3.inOut" }, "<")
      .from(".hero__photo", { yPercent: 18, opacity: 0, duration: 1.1, ease: "expo.out" }, "<.25")
      .from(".hero__name .ch", { yPercent: 115, duration: 1, ease: "expo.out", stagger: .035 }, "<.1")
      .from(".hero .eyebrow, .hero__role, .hero__cta, .hero__foot, .nav", { y: 20, opacity: 0, duration: .7, ease: "power3.out", stagger: .06 }, "<.2")
      .from(".hero__marquee", { opacity: 0, duration: 1 }, "<");
  }

  /* ------------------------------------------------------------- hero marquee */
  $$(".mq").forEach((row) => {
    const tr2 = $(".mq__track", row);
    tr2.innerHTML += tr2.innerHTML;
    const dir = Number(row.dataset.dir) || 1;
    const tw = gsap.fromTo(tr2, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: 40, ease: "none", repeat: -1 });
    ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onUpdate: (s) => {
      gsap.to(tw, { timeScale: 1 + Math.min(Math.abs(s.getVelocity()) / 300, 5), duration: .2, overwrite: true });
      gsap.to(tw, { timeScale: 1, duration: 1.2, delay: .25 });
    } });
  });
  gsap.to(".hero__photo", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__copy", { yPercent: -20, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });

  /* ------------------------------------------------------------------ about */
  let aboutST = null;
  function buildAbout() {
    if (aboutST) aboutST.kill();
    aboutST = gsap.to(".about__lead .w", { opacity: 1, stagger: .08, ease: "none",
      scrollTrigger: { trigger: ".about__lead", start: "top 80%", end: "bottom 45%", scrub: .5 } }).scrollTrigger;
  }
  buildAbout();
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    el.textContent = "0";
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true,
      onEnter: () => gsap.to(o, { v: end, duration: end > 50 ? 1.8 : 1, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });

  /* ---------------------------------------------------------------- reveals */
  const reveal = (sel, vars) => $$(sel).forEach((el) => gsap.from(el, Object.assign({ y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }, vars)));
  reveal(".kicker, .h2", { y: 40 });
  reveal(".work__list, .work__detail");
  reveal(".tl", { y: 30 });
  reveal(".contact__mail, .socials", { y: 30 });
  ScrollTrigger.batch(".sk, .also__list li", { start: "top 92%", once: true, onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: .8, ease: "power3.out", stagger: .08 }) });
  $$(".contact__title .line").forEach((line) => gsap.from($$(".ch", line), { yPercent: 115, duration: 1, ease: "expo.out", stagger: .025, scrollTrigger: { trigger: line, start: "top 92%", once: true } }));
  gsap.to("#timelineFill", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: .5 } });

  /* ------------------------------------------------------- nav + progress bar */
  const nav = $("#nav");
  const navLinks = $$(".nav__links a");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => {
    $("#progress").style.transform = `scaleX(${s.progress})`;
    nav.classList.toggle("is-hidden", s.direction === 1 && s.scroll() > 500);
  } });
  ["work", "about", "journey", "contact"].forEach((id) => {
    const sec = document.getElementById(id);
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => {
      if (s.isActive) navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + id));
    } });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  mobileMQ.addEventListener && mobileMQ.addEventListener("change", () => ScrollTrigger.refresh());

  /* ===================================================== helpers (no motion needed) */
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
        label.textContent = tr("contact.copied") === "contact.copied" ? "Copied ✓" : tr("contact.copied");
        btn.classList.add("is-done");
        setTimeout(() => { label.textContent = tr("contact.copy"); btn.classList.remove("is-done"); }, 1800);
      };
      const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#mailLink")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, fallback);
      else fallback();
    });
  }
})();
