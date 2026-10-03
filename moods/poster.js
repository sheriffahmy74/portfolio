/* Poster: the portfolio as a run of bold street posters. Giant condensed type, a mustard band,
   marquees, rows that flip colour on hover. Type slides with the scroll and skews with its speed. */
(function () {
  "use strict";
  function render(root, S) {
    const C = S.content, t = S.t, e = S.esc, L = (o) => o[S.lang] || o.en, ar = S.lang === "ar";
    const [first, last] = C.name.split(" ");
    const marquee = (items, sep = "★") => `<div class="ps-mq"><div>${items.concat(items).map((x) => `<span>${e(x)}</span>`).join(`<i>${sep}</i>`)}</div></div>`;

    const posters = S.projects.map((p, i) => `
      <article class="ps-poster ${i % 2 ? "ps-poster--alt" : ""}">
        <h3 class="ps-pname"><span class="ps-slide" data-dir="${i % 2 ? 1 : -1}">${e(L(p.name))}</span></h3>
        <div class="ps-pgrid">
          <div class="ps-phones">${p.screens.slice(0, 3).map((k) => `<img class="ps-slam" src="${e(S.screens[k])}" alt="${e(p.name.en)} screen" loading="lazy">`).join("")}</div>
          <div class="ps-info">
            <p class="ps-tag ps-slam">${e(L(p.tag))}</p>
            <p class="ps-desc ps-slam">${e(L(p.desc))}</p>
            ${p.metrics.length ? `<div class="ps-nums ps-slam">${p.metrics.map((m) => `<div><b>${e(m.v)}</b><span>${e(L(m.l))}</span></div>`).join("")}</div>` : ""}
            <p class="ps-label">${e(L(C.projects.did))}</p>
            <ul class="ps-list">${L(p.points).map((x) => `<li class="ps-slam">${e(x)}</li>`).join("")}</ul>
            <div class="ps-btns">${p.links.map((l) => `<a class="ps-btn" href="${e(l.href)}" target="_blank" rel="noopener">${e(L(l.label))} ↗</a>`).join("")}
            ${p.social ? p.social.map((x) => `<a class="ps-btn ps-btn--ghost" href="${e(x.href)}" target="_blank" rel="noopener">${e(x.label)} ↗</a>`).join("") : ""}</div>
          </div>
        </div>
        ${marquee(p.stack, "/")}
      </article>`).join("");

    root.innerHTML = `
    <header class="ps-bar"><span class="ps-mark">SF</span><nav>${C.nav.map(([id, k]) => `<a href="#ps-${id}">${e(t(k))}</a>`).join("")}</nav>
      <span class="ps-tools"><button class="ps-lang" type="button">${ar ? "EN" : "ع"}</button><button class="ps-cv" type="button">CV ↓</button></span></header>

    <section class="ps-hero" id="ps-hero">
      <span class="ps-corner ps-corner--tl">${e(t(C.hero.status))}</span><span class="ps-corner ps-corner--tr">${e(t(C.about.cap))} / 2026</span>
      <h1 class="ps-name"><span class="ps-slide" data-dir="-1">${e(first)}</span><span class="ps-slide" data-dir="1">${e(last || "")}</span></h1>
      <img class="ps-me" src="${e(C.photo)}" alt="${e(C.name)}">
      <div class="ps-band">${marquee(["Flutter developer", "Clean Architecture", "Supabase", "Firebase", "Bloc / Cubit"])}</div>
      <div class="ps-herobottom">
        <div class="ps-intro"><p class="ps-hi">${e(t(C.hero.hi))}</p><p class="ps-title">${C.hero.title.map((k, i) => i === 1 ? `<mark>${e(t(k))}</mark>` : e(t(k))).join(" ")}</p>
          <p class="ps-sub">${e(t(C.hero.sub))}</p>
          <div class="ps-btns"><a class="ps-btn" href="#ps-projects">${e(t(C.hero.cta1))} →</a><a class="ps-btn ps-btn--ghost" href="#ps-contact">${e(t(C.hero.cta2))}</a></div></div>
        <div class="ps-facts">${C.facts.map((f) => `<div><b>${e(f.v)}${f.sup ? `<sup>${f.sup}</sup>` : ""}${f.suf || ""}</b><span>${e(t(f.k))}</span></div>`).join("")}</div>
      </div>
    </section>

    <section class="ps-sec" id="ps-projects">
      <header class="ps-head"><span>${e(t(C.projects.k))}</span><h2 class="ps-h2"><span class="ps-slide" data-dir="-1">${e(t(C.projects.title))}</span></h2><p>${e(t(C.projects.sub))}</p></header>
      ${posters}
      <div class="ps-others"><h3>${e(t(C.others.title))}</h3>${C.others.items.map((o) => `<a class="ps-row" ${o.href ? `href="${e(o.href)}" target="_blank" rel="noopener"` : ""}><b>${e(o.name)}</b><span>${e(t(o.k))}</span><i>${o.href ? "↗" : "—"}</i></a>`).join("")}</div>
    </section>

    <section class="ps-sec ps-sec--y" id="ps-experience">
      <header class="ps-head"><span>${e(t(C.experience.k))}</span><h2 class="ps-h2"><span class="ps-slide" data-dir="1">${e(t(C.experience.title))}</span></h2></header>
      <div class="ps-exp">${C.experience.items.map((x) => `<div class="ps-row ps-row--exp"><b>${e(x.dateKey ? t(x.dateKey) : x.date)}</b><div><h3>${e(t(x.t))}</h3><p class="ps-place">${e(x.placeText || t(x.place))}</p><ul>${x.points.map((k) => `<li>${e(t(k))}</li>`).join("")}</ul></div></div>`).join("")}</div>
    </section>

    <section class="ps-sec" id="ps-skills">
      <header class="ps-head"><span>${e(t(C.skills.k))}</span><h2 class="ps-h2"><span class="ps-slide" data-dir="-1">${e(t(C.skills.title))}</span></h2></header>
      <div class="ps-skills">${C.skills.groups.map((g, i) => `<div class="ps-skill ${i % 2 ? "ps-skill--rev" : ""}"><span class="ps-skill__t">${e(t(g.t))}</span>${marquee(g.tags, "●")}</div>`).join("")}</div>
    </section>

    <section class="ps-sec ps-about" id="ps-about">
      <figure class="ps-afig"><img src="${e(C.aboutPhoto)}" alt="" loading="lazy"><figcaption>${e(t(C.about.cap))}</figcaption></figure>
      <div><header class="ps-head"><span>${e(t(C.about.k))}</span></header><p class="ps-quote">${e(t(C.about.title))}</p>${C.about.p.map((k) => `<p class="ps-p">${e(t(k))}</p>`).join("")}
        <p class="ps-langs">${C.about.langs.map((k) => `<span>${e(t(k))}</span>`).join("")}</p></div>
    </section>

    <section class="ps-sec ps-contact" id="ps-contact">
      <span class="ps-kick">${e(t(C.contact.k))}</span>
      <h2 class="ps-mega"><span class="ps-slide" data-dir="-1">${e(t(C.contact.t1))}</span><span class="ps-slide ps-y" data-dir="1">${e(t(C.contact.t2))}</span></h2>
      <p class="ps-sub">${e(t(C.contact.sub))}</p>
      <a class="ps-email" href="mailto:${e(C.contact.email)}">${e(C.contact.email)}</a>
      <div class="ps-btns"><button class="ps-btn ps-copy" type="button">${e(t(C.contact.copy))}</button><a class="ps-btn ps-btn--wa" href="${e(C.contact.whatsapp.href)}" target="_blank" rel="noopener">WhatsApp ${e(C.contact.whatsapp.label)}</a>
        ${C.contact.links.map((l) => `<a class="ps-btn ps-btn--ghost" href="${e(l.href)}" target="_blank" rel="noopener">${e(l.label)}</a>`).join("")}<button class="ps-btn ps-btn--ghost ps-cv2" type="button">${e(t(C.contact.cv))}</button></div>
      <footer class="ps-foot"><span>© 2026 ${e(C.name)}</span><span>${ar ? "اتعمل بإيدي" : "Designed and built by me"}</span></footer>
    </section>`;

    root.querySelector(".ps-lang").addEventListener("click", () => S.setLang(ar ? "en" : "ar"));
    root.querySelectorAll(".ps-cv, .ps-cv2").forEach((b) => b.addEventListener("click", S.openCv));
    const copy = root.querySelector(".ps-copy");
    copy.addEventListener("click", () => S.copy(C.contact.email, copy, t(C.contact.copy)));
    root.querySelectorAll('a[href^="#ps-"]').forEach((a) => a.addEventListener("click", (ev) => {
      ev.preventDefault(); const el = root.querySelector(a.getAttribute("href"));
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -50 }); else el.scrollIntoView({ behavior: "smooth" });
    }));

    if (!S.canAnimate) return;
    // marquees run forever, alternating directions
    root.querySelectorAll(".ps-mq > div").forEach((m, i) => {
      const rev = m.closest(".ps-skill--rev");
      gsap.fromTo(m, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, duration: 22 + (i % 4) * 5, ease: "none", repeat: -1 });
    });
    // giant words slide sideways with the scroll
    root.querySelectorAll(".ps-slide").forEach((s) => {
      const d = +s.dataset.dir || 1;
      gsap.fromTo(s, { xPercent: 8 * d }, { xPercent: -8 * d, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: .5 } });
    });
    // blocks slam in hard and fast
    ScrollTrigger.batch(root.querySelectorAll(".ps-slam, .ps-row, .ps-skill, .ps-afig, .ps-quote"), { start: "top 90%", once: true,
      onEnter: (els) => gsap.from(els, { x: -120, skewX: -18, opacity: 0, duration: .55, ease: "power4.out", stagger: .05, clearProps: "transform" }) });
    // the faster you scroll, the more the giant type leans
    const big = root.querySelectorAll(".ps-name, .ps-pname, .ps-h2, .ps-mega");
    const setSkew = big.length ? gsap.quickTo(big, "skewX", { duration: .4, ease: "power3.out" }) : null;
    ScrollTrigger.create({ onUpdate: (st) => { if (setSkew) setSkew(gsap.utils.clamp(-8, 8, st.getVelocity() / -220)); } });
  }

  function intro(root) {
    gsap.timeline()
      .from(root.querySelectorAll(".ps-name > span"), { yPercent: 110, duration: .7, ease: "power4.out", stagger: .1 })
      .from(root.querySelector(".ps-band"), { xPercent: -110, duration: .6, ease: "power4.out" }, .25)
      .from(root.querySelector(".ps-me"), { y: 120, opacity: 0, duration: .8, ease: "power4.out" }, .35)
      .from(root.querySelectorAll(".ps-corner, .ps-facts > div"), { scale: 0, duration: .4, ease: "back.out(3)", stagger: .06 }, .6);
  }

  window.MOOD_SITES.poster = { render, intro };
})();
