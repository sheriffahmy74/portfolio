(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };

  /* ---------------------------------------------------------------- i18n */
  const EN = {};
  $$("[data-i18n]").forEach((el) => { EN[el.dataset.i18n] = el.textContent; });
  let lang = store.get("lang") === "ar" ? "ar" : "en";

  function applyLang(next) {
    lang = next;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    const dict = lang === "ar" ? window.I18N_AR || {} : EN;
    $$("[data-i18n]").forEach((el) => {
      const v = dict[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    $$("[data-split]").forEach(splitChars);
    $$("[data-words]").forEach(splitWords);
    store.set("lang", lang);
  }

  /* Latin text splits into letters; Arabic splits into words so letters stay joined. */
  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    const isArabic = /[؀-ۿ]/.test(text);
    const esc = (p) => p.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    // each word is a no-wrap group so lines only break between words
    el.innerHTML = text.trim().split(/\s+/).map((word) => {
      const inner = isArabic ? `<span class="ch">${esc(word)}</span>` : Array.from(word).map((c) => `<span class="ch">${esc(c)}</span>`).join("");
      return `<span class="wd" aria-hidden="true">${inner}</span>`;
    }).join(" ");
  }
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`).join(" ");
  }

  applyLang(lang);

  /* ------------------------------------------------------------ no motion */
  if (!hasGsap || reduced) {
    root.classList.add("no-anim");
    if (reduced) root.classList.add("reduced");
    const l = $("#loader"); if (l) l.remove();
    wireStatic();
    return;
  }

  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  /* --------------------------------------------------------- smooth scroll */
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 ? $(id) : null;
      if (!target && id !== "#top") return;
      e.preventDefault();
      lenis.scrollTo(target || 0, { offset: -60 });
    }));
  }

  /* ------------------------------------------------------------- loader */
  body.classList.add("is-loading");
  lenis && lenis.stop();
  const counter = { v: 0 };
  const loaderTl = gsap.timeline({ onComplete: () => { body.classList.remove("is-loading"); lenis && lenis.start(); } });
  loaderTl
    .from(".loader__log span", { opacity: 0, x: -12, stagger: .18, duration: .4, ease: "power2.out" })
    .to(counter, {
      v: 100, duration: 1.3, ease: "power2.inOut",
      onUpdate: () => {
        $("#loaderCount").textContent = String(Math.round(counter.v)).padStart(2, "0");
        $("#loaderBar").style.width = counter.v + "%";
      }
    }, 0.2)
    .to(".loader__inner", { opacity: 0, y: -20, duration: .35, ease: "power2.in" })
    .to("#loader", { yPercent: -100, duration: .9, ease: "expo.inOut" }, "-=.05")
    .add(heroIntro(), "-=.55")
    .add(() => $("#loader").remove());

  function heroIntro() {
    const tl = gsap.timeline();
    tl.from(".hero__title .ch", { yPercent: 115, rotate: 6, duration: 1.1, ease: "expo.out", stagger: .045 })
      .from(".hero .reveal-up", { y: 26, opacity: 0, duration: .9, ease: "power3.out", stagger: .09 }, "-=.8")
      .from(".phone--hero", { y: 120, rotateX: 28, rotateY: -18, opacity: 0, duration: 1.4, ease: "expo.out" }, "-=1.1")
      .from(".hero .chip", { scale: .4, opacity: 0, duration: .7, ease: "back.out(2)", stagger: .1 }, "-=.7")
      .from(".nav", { y: -30, opacity: 0, duration: .8, ease: "power3.out" }, "-=1")
      .from(".hero__foot", { opacity: 0, duration: .8 }, "-=.5");
    return tl;
  }

  /* ---------------------------------------------------------- typed line */
  (function typed() {
    const el = $("#typed");
    let i = 0, ch = 0, del = false;
    function tick() {
      const words = (window.TYPED || {})[lang] || [el.textContent];
      const w = words[i % words.length];
      ch += del ? -1 : 1;
      el.textContent = w.slice(0, Math.max(0, ch));
      let wait = del ? 28 : 55;
      if (!del && ch >= w.length) { wait = 1800; del = true; }
      else if (del && ch <= 0) { del = false; i++; wait = 350; }
      setTimeout(tick, wait);
    }
    el.textContent = "";
    setTimeout(tick, 2600);
  })();

  /* ------------------------------------------------------- ambient motion */
  gsap.to(".orb--violet", { x: "8vw", y: "6vh", duration: 14, ease: "sine.inOut", repeat: -1, yoyo: true });
  gsap.to(".orb--sky", { x: "-6vw", y: "-8vh", duration: 11, ease: "sine.inOut", repeat: -1, yoyo: true });
  gsap.to(".orb--deep", { x: "-10vw", y: "10vh", scale: 1.3, duration: 16, ease: "sine.inOut", repeat: -1, yoyo: true });
  $$(".hero .chip").forEach((c, n) => gsap.to(c, { y: n % 2 ? 10 : -10, duration: 2.4 + n * .4, ease: "sine.inOut", repeat: -1, yoyo: true }));

  // hero parallax out
  gsap.to(".hero__copy", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__device", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // 3D tilt on the hero phone
  if (finePointer) {
    const tilt = $("#heroTilt");
    const rx = gsap.quickTo(tilt, "rotationX", { duration: .8, ease: "power3.out" });
    const ry = gsap.quickTo(tilt, "rotationY", { duration: .8, ease: "power3.out" });
    window.addEventListener("pointermove", (e) => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      ry(nx * 22); rx(-ny * 16);
    });
  } else {
    gsap.to("#heroTilt", { rotationY: 10, rotationX: 4, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true });
  }

  /* ------------------------------------------------------------- marquee */
  $$(".marquee__row").forEach((row) => {
    const track = $(".marquee__track", row);
    track.innerHTML += track.innerHTML;
    const dir = Number(row.dataset.dir) || 1;
    const tween = gsap.fromTo(track, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: dir > 0 ? 38 : 46, ease: "none", repeat: -1 });
    ST.create({
      trigger: row, start: "top bottom", end: "bottom top",
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 400, 4);
        gsap.to(tween, { timeScale: 1 + v, duration: .2, overwrite: true });
        gsap.to(tween, { timeScale: 1, duration: 1.2, delay: .2 });
      }
    });
  });

  /* --------------------------------------------------------------- about */
  let aboutST = null;
  function buildAbout() {
    if (aboutST) aboutST.kill();
    const words = $$(".about__lead .w");
    aboutST = gsap.to(words, {
      opacity: 1, stagger: .08, ease: "none",
      scrollTrigger: { trigger: ".about__lead", start: "top 80%", end: "bottom 45%", scrub: .6 }
    }).scrollTrigger;
  }
  buildAbout();

  // counters
  $$("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    el.textContent = "0";
    ST.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => gsap.to(o, { v: end, duration: end > 50 ? 2 : 1.2, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v); } })
    });
  });

  /* ------------------------------------------------------- generic reveal */
  const reveal = (targets, vars = {}) => $$(targets).forEach((el) => {
    gsap.from(el, Object.assign({ y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }, vars));
  });
  reveal(".section-head > *", { y: 40 });
  reveal(".stat", { y: 30 });
  reveal(".eng__col");
  reveal(".lamma__links");
  reveal(".tl", { x: lang === "ar" ? 40 : -40, y: 0 });
  reveal(".contact__mail, .socials");

  ST.batch(".card", { start: "top 88%", once: true, onEnter: (els) => gsap.from(els, { y: 70, opacity: 0, rotate: 1.5, duration: 1.1, ease: "power3.out", stagger: .12 }) });
  ST.batch(".sk", { start: "top 90%", once: true, onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: .9, ease: "power3.out", stagger: .07 }) });
  ST.batch(".also li", { start: "top 92%", once: true, onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: .8, ease: "power3.out", stagger: .08 }) });

  // big split headings outside the hero
  $$(".contact__title .line").forEach((line) => {
    gsap.from($$(".ch", line), { yPercent: 110, duration: 1, ease: "expo.out", stagger: .03, scrollTrigger: { trigger: line, start: "top 90%", once: true } });
  });

  /* ------------------------------------------------------ lamma story */
  const steps = $$(".step");
  const screens = $$("#storyScreens img");
  const dots = $$(".story__dots i");
  function showScreen(n) {
    steps.forEach((s, k) => s.classList.toggle("is-active", k === n));
    screens.forEach((s, k) => s.classList.toggle("is-active", k === n));
    dots.forEach((d, k) => d.classList.toggle("is-active", k === n));
  }
  steps.forEach((step, n) => {
    ST.create({ trigger: step, start: "top 60%", end: "bottom 60%", onToggle: (self) => self.isActive && showScreen(n) });
  });
  gsap.from(".phone--story", { y: 80, rotateY: -25, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".story", start: "top 80%", once: true } });

  // gallery drifts sideways with the scroll
  const track = $("#galleryTrack");
  gsap.fromTo(track, { x: () => 0 }, {
    x: () => -Math.max(0, track.scrollWidth - track.parentElement.clientWidth),
    ease: "none",
    scrollTrigger: { trigger: ".gallery", start: "top 95%", end: "bottom 5%", scrub: 1, invalidateOnRefresh: true }
  });

  /* ------------------------------------------------------- nabdy audit */
  gsap.from(".case__card", { y: 80, opacity: 0, scale: .96, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".case", start: "top 80%", once: true } });
  const auditItems = $$(".audit li");
  ST.create({
    trigger: ".audit", start: "top 75%", once: true,
    onEnter: () => {
      gsap.from(auditItems, { x: lang === "ar" ? -30 : 30, opacity: 0, duration: .7, ease: "power3.out", stagger: .15 });
      auditItems.forEach((li, k) => setTimeout(() => li.classList.add("is-done"), 450 + k * 260));
    }
  });

  /* --------------------------------------------------------- timeline */
  gsap.to("#timelineFill", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: .5 } });

  /* ------------------------------------------------------ nav + progress */
  const nav = $("#nav");
  const navLinks = $$(".nav__links a");
  ST.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      $("#progress").style.transform = `scaleX(${self.progress})`;
      nav.classList.toggle("is-scrolled", self.scroll() > 40);
      nav.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 600);
    }
  });
  ["work", "about", "journey", "contact"].forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    ST.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => {
      if (s.isActive) navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + id));
    } });
  });

  /* ------------------------------------------------------------ cursor */
  if (finePointer) {
    root.classList.add("has-cursor");
    const dot = $(".cursor__dot"), ring = $(".cursor__ring");
    const dx = gsap.quickTo(dot, "x", { duration: .1 }), dy = gsap.quickTo(dot, "y", { duration: .1 });
    const rx = gsap.quickTo(ring, "x", { duration: .45, ease: "power3.out" }), ry = gsap.quickTo(ring, "y", { duration: .45, ease: "power3.out" });
    window.addEventListener("pointermove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener("pointerover", (e) => {
      $(".cursor").classList.toggle("is-hover", !!e.target.closest("a, button, .gallery figure"));
    });

    // magnetic buttons
    $$(".magnetic").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: .5, ease: "elastic.out(1, .4)" });
      const my = gsap.quickTo(el, "y", { duration: .5, ease: "elastic.out(1, .4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .3);
        my((e.clientY - r.top - r.height / 2) * .4);
      });
      el.addEventListener("pointerleave", () => { mx(0); my(0); });
    });

    // hero letters jump on hover
    $$(".hero__title .ch").forEach((c) => c.addEventListener("pointerenter", () => {
      gsap.fromTo(c, { y: 0 }, { y: -18, duration: .25, ease: "power2.out", yoyo: true, repeat: 1 });
    }));
  }

  wireStatic();

  /* --------------------------------------------------------- language */
  $("#langToggle").addEventListener("click", () => {
    const next = lang === "ar" ? "en" : "ar";
    gsap.to("main", { opacity: 0, duration: .25, onComplete: () => {
      applyLang(next);
      buildAbout();
      ST.refresh();
      gsap.to("main", { opacity: 1, duration: .4 });
    } });
  });

  window.addEventListener("load", () => ST.refresh());

  /* ------------------------------------------- pieces that work without GSAP */
  function wireStatic() {
    // spotlight on cards
    $$(".card").forEach((card) => card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    }));

    // task manager preview modes
    const seg = $$(".seg button");
    const shots = $$("#taskScreens img");
    seg.forEach((b) => b.addEventListener("click", () => {
      seg.forEach((x) => x.classList.toggle("is-active", x === b));
      shots.forEach((s) => s.classList.toggle("is-active", s.dataset.mode === b.dataset.mode));
    }));

    // copy email
    const copyBtn = $("#copyMail");
    copyBtn.addEventListener("click", () => {
      const label = $("span", copyBtn);
      const email = $("#mailLink").textContent.trim();
      const done = () => {
        label.textContent = lang === "ar" ? window.I18N_AR["contact.copied"] : "Copied ✓";
        copyBtn.classList.add("is-done");
        setTimeout(() => { label.textContent = lang === "ar" ? window.I18N_AR["contact.copy"] : EN["contact.copy"]; copyBtn.classList.remove("is-done"); }, 1800);
      };
      const fallback = () => {
        const range = document.createRange();
        range.selectNodeContents($("#mailLink"));
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, fallback);
      } else fallback();
    });

    if (!hasGsap || reduced) {
      $("#langToggle").addEventListener("click", () => applyLang(lang === "ar" ? "en" : "ar"));
      // story without scroll animation: cycle by visibility
      const steps = $$(".step"), screens = $$("#storyScreens img");
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const n = steps.indexOf(en.target);
          steps.forEach((s, k) => s.classList.toggle("is-active", k === n));
          screens.forEach((s, k) => s.classList.toggle("is-active", k === n));
        }), { rootMargin: "-45% 0px -45% 0px" });
        steps.forEach((s) => io.observe(s));
      }
      const t = $("#typed"); if (t) t.textContent = ((window.TYPED || {})[lang] || [t.textContent])[0];
    }
  }
})();
