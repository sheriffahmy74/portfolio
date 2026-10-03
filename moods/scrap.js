/* Scrapbook: a hand-made portfolio. Torn paper header, polaroids with tape, sticky notes you can drag,
   projects as taped pages, experience as a shop receipt, contact as an envelope. */
(function () {
  "use strict";
  const STAR = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M20 3l4.6 11 11.4.9-8.7 7.4 2.7 11.2L20 27.7 9.9 33.5l2.7-11.2L3.9 14.9 15.4 14z"/></svg>';
  const SPARK = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 4c1.6 9 5.4 13 16 16-10.6 3-14.4 7-16 16-1.6-9-5.4-13-16-16 10.6-3 14.4-7 16-16z"/></svg>';
  const SMILE = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="20" cy="20" r="16"/><path d="M13 23c3 5 11 5 14 0"/><path d="M14 15v2M26 15v2"/></svg>';
  const ARROW = '<svg viewBox="0 0 90 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 30c22-24 52-26 76-10"/><path d="M70 10l10 10-13 5"/></svg>';

  function render(root, S) {
    const C = S.content, t = S.t, e = S.esc, L = (o) => o[S.lang] || o.en;
    const rot = (i, k = 2.2) => ((i * 37) % 7 - 3) * k / 3;
    const proj = S.projects.map((p, i) => {
      const shots = p.screens.slice(0, 3).map((k, j) => `<figure class="sb-pol sb-pol--s" style="--r:${[-6, 3, -2][j]}deg"><i class="sb-tape"></i><img src="${e(S.screens[k])}" alt="${e(p.name.en)} screen" loading="lazy"></figure>`).join("");
      return `<article class="sb-page sb-drop" style="--r:${i % 2 ? 1.2 : -1.2}deg">
        <i class="sb-tape sb-tape--l"></i><i class="sb-tape sb-tape--r"></i>
        <div class="sb-page__shots">${shots}</div>
        <div class="sb-page__body">
          <span class="sb-label">${e(L(p.tag))}</span>
          <h3 class="sb-page__name">${e(L(p.name))}</h3>
          <p>${e(L(p.desc))}</p>
          <p class="sb-hand">${e(L(C.projects.did))}</p>
          <ul class="sb-checks">${L(p.points).map((x) => `<li>${e(x)}</li>`).join("")}</ul>
          ${p.metrics.length ? `<div class="sb-stamps">${p.metrics.map((m, j) => `<span style="--r:${[-8, 6, -4, 9][j]}deg"><b>${e(m.v)}</b>${e(L(m.l))}</span>`).join("")}</div>` : ""}
          <div class="sb-tags">${p.stack.map((x) => `<span>${e(x)}</span>`).join("")}</div>
          <div class="sb-tickets">${p.links.map((l) => `<a class="sb-ticket" href="${e(l.href)}" target="_blank" rel="noopener">${e(L(l.label))} ↗</a>`).join("")}
          ${p.social ? p.social.map((x) => `<a class="sb-ticket sb-ticket--alt" href="${e(x.href)}" target="_blank" rel="noopener">${e(x.label)} ↗</a>`).join("") : ""}</div>
        </div>
      </article>`;
    }).join("");
    const others = C.others.items.map((o, i) => `<div class="sb-index sb-drop" style="--r:${rot(i + 2)}deg"><b>${e(o.name)}</b><p>${e(t(o.k))}</p>${o.href ? `<a href="${e(o.href)}" target="_blank" rel="noopener">${e(o.linkKey ? t(o.linkKey) : o.link)}</a>` : ""}</div>`).join("");
    const exp = C.experience.items.map((x) => `<li><div class="sb-rc__row"><b>${e(t(x.t))}</b><i></i><span>${e(x.dateKey ? t(x.dateKey) : x.date)}</span></div>
      <em>${e(x.placeText || t(x.place))}</em><ul>${x.points.map((k) => `<li>${e(t(k))}</li>`).join("")}</ul></li>`).join("");
    const notes = C.skills.groups.map((g, i) => `<div class="sb-note sb-drop" data-drag style="--r:${rot(i, 4)}deg;--c:var(--n${i % 3})"><i class="sb-pin"></i><h3>${e(t(g.t))}</h3><ul>${g.tags.map((x) => `<li>${e(x)}</li>`).join("")}</ul></div>`).join("");

    root.innerHTML = `
    <header class="sb-top">
      <nav class="sb-nav">
        <a class="sb-brand" href="#sb-hero">Sherif <span>${SPARK}</span></a>
        <div class="sb-links">${C.nav.map(([id, k]) => `<a href="#sb-${id}">${e(t(k))}</a>`).join("")}</div>
        <div class="sb-actions"><button class="sb-lang" type="button">${S.lang === "ar" ? "EN" : "ع"}</button><button class="sb-cv" type="button">CV ↓</button></div>
      </nav>
      <div class="sb-mast">
        <span class="sb-year">2026</span>
        <h1 class="sb-title" aria-label="Portfolio"><span>P</span><span>o</span><span>r</span><span>t</span><span>f</span><span class="sb-o">o</span><span>l</span><span>i</span><span>o</span></h1>
        <p class="sb-tagline">Flutter <b>✦</b> Clean Architecture <b>✦</b> Supabase</p>
        <i class="sb-doodle sb-doodle--a">${STAR}</i><i class="sb-doodle sb-doodle--b">${SPARK}</i><i class="sb-doodle sb-doodle--c">${STAR}</i>
      </div>
    </header>

    <section class="sb-board" id="sb-hero">
      <div class="sb-wrap sb-hero">
        <figure class="sb-pol sb-pol--hero sb-drop" style="--r:-4deg"><i class="sb-tape"></i><div class="sb-pol__bg"><img src="${e(C.photo)}" alt="${e(C.name)}"></div><figcaption>${e(C.name)}</figcaption><i class="sb-sticker">${SMILE}</i></figure>
        <div class="sb-hello">
          <span class="sb-status">${e(t(C.hero.status))}</span>
          <h2 class="sb-hi">${e(t(C.hero.hi))} <span class="sb-wave">!</span></h2>
          <p class="sb-lead">${C.hero.title.map((k, i) => i === 1 ? `<mark>${e(t(k))}</mark>` : e(t(k))).join(" ")}</p>
          <p class="sb-sub">${e(t(C.hero.sub))}</p>
          <div class="sb-tickets"><a class="sb-ticket" href="#sb-projects">${e(t(C.hero.cta1))} →</a><a class="sb-ticket sb-ticket--alt" href="#sb-contact">${e(t(C.hero.cta2))}</a></div>
          <div class="sb-facts">${C.facts.map((f, i) => `<div class="sb-sticky" data-drag style="--r:${[-5, 3, -2][i]}deg;--c:var(--n${i})"><b>${e(f.v)}${f.sup ? `<sup>${f.sup}</sup>` : ""}${f.suf || ""}</b><span>${e(t(f.k))}</span></div>`).join("")}</div>
        </div>
      </div>
      <div class="sb-strip"><div>${C.stack.concat(C.stack).map((x) => `<span>${e(x)}</span>`).join("<i>✦</i>")}</div></div>
    </section>

    <section class="sb-sec" id="sb-projects">
      <div class="sb-wrap">
        <header class="sb-head"><span class="sb-hand">${e(t(C.projects.k))}</span><h2 class="sb-h2"><span class="sb-labeltape">${e(t(C.projects.title))}</span></h2><p>${e(t(C.projects.sub))}</p></header>
        <div class="sb-pages">${proj}</div>
        <h3 class="sb-h3">${e(t(C.others.title))}</h3>
        <div class="sb-others">${others}</div>
      </div>
    </section>

    <section class="sb-sec sb-sec--tint" id="sb-experience">
      <div class="sb-wrap sb-exp">
        <header class="sb-head"><span class="sb-hand">${e(t(C.experience.k))}</span><h2 class="sb-h2">${e(t(C.experience.title))}</h2><i class="sb-arrow">${ARROW}</i></header>
        <div class="sb-receipt sb-drop" style="--r:1.5deg">
          <p class="sb-rc__shop">the experience shop</p>
          <p class="sb-rc__meta"><span>item</span><span>date</span></p>
          <ol>${exp}</ol>
          <p class="sb-rc__total"><span>TOTAL</span><span>1,302 tests ✓</span></p>
          <p class="sb-rc__thanks">thank you for reading!</p>
        </div>
      </div>
    </section>

    <section class="sb-sec" id="sb-skills">
      <div class="sb-wrap">
        <header class="sb-head"><span class="sb-hand">${e(t(C.skills.k))}</span><h2 class="sb-h2"><span class="sb-labeltape">${e(t(C.skills.title))}</span></h2><p class="sb-hint">${S.lang === "ar" ? "اسحب الورق" : "drag the notes around"} ↯</p></header>
        <div class="sb-notes">${notes}</div>
      </div>
    </section>

    <section class="sb-sec sb-sec--tint" id="sb-about">
      <div class="sb-wrap sb-about">
        <figure class="sb-pol sb-pol--about sb-drop" style="--r:3deg"><i class="sb-tape"></i><img src="${e(C.aboutPhoto)}" alt="" loading="lazy"><figcaption>${e(t(C.about.cap))}</figcaption></figure>
        <div class="sb-notebook sb-drop" style="--r:-1deg">
          <span class="sb-hand">${e(t(C.about.k))}</span>
          <h2 class="sb-h2">${e(t(C.about.title))}</h2>
          ${C.about.p.map((k) => `<p>${e(t(k))}</p>`).join("")}
          <p class="sb-langs">${C.about.langs.map((k) => `<span>${e(t(k))}</span>`).join("")}</p>
        </div>
      </div>
    </section>

    <section class="sb-sec" id="sb-contact">
      <div class="sb-wrap">
        <div class="sb-envelope sb-drop" style="--r:-1deg">
          <span class="sb-hand">${e(t(C.contact.k))}</span>
          <h2 class="sb-big">${e(t(C.contact.t1))} <mark>${e(t(C.contact.t2))}</mark></h2>
          <p>${e(t(C.contact.sub))}</p>
          <div class="sb-mail"><a href="mailto:${e(C.contact.email)}">${e(C.contact.email)}</a><button class="sb-stampbtn" type="button">${e(t(C.contact.copy))}</button></div>
          <div class="sb-tickets">
            <a class="sb-ticket sb-ticket--wa" href="${e(C.contact.whatsapp.href)}" target="_blank" rel="noopener">WhatsApp · ${e(C.contact.whatsapp.label)}</a>
            ${C.contact.links.map((l) => `<a class="sb-ticket sb-ticket--alt" href="${e(l.href)}" target="_blank" rel="noopener">${e(l.label)}</a>`).join("")}
            <button class="sb-ticket sb-cv2" type="button">${e(t(C.contact.cv))}</button>
          </div>
          <i class="sb-postmark">MANSOURA<br>EGYPT</i>
        </div>
        <p class="sb-foot">© 2026 ${e(C.name)} · ${S.lang === "ar" ? "متعمل بالإيد" : "made by hand, with code"}</p>
      </div>
    </section>`;

    root.querySelector(".sb-lang").addEventListener("click", () => S.setLang(S.lang === "ar" ? "en" : "ar"));
    root.querySelectorAll(".sb-cv, .sb-cv2").forEach((b) => b.addEventListener("click", S.openCv));
    const copy = root.querySelector(".sb-stampbtn");
    copy.addEventListener("click", () => S.copy(C.contact.email, copy, t(C.contact.copy)));
    root.querySelectorAll('a[href^="#sb-"]').forEach((a) => a.addEventListener("click", (ev) => {
      ev.preventDefault(); const el = root.querySelector(a.getAttribute("href"));
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -10 }); else el.scrollIntoView({ behavior: "smooth" });
    }));

    // sticky notes can be picked up and moved
    root.querySelectorAll("[data-drag]").forEach((n) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, on = false;
      n.addEventListener("pointerdown", (ev) => { on = true; sx = ev.clientX; sy = ev.clientY; ox = +n.dataset.x || 0; oy = +n.dataset.y || 0; n.setPointerCapture(ev.pointerId); n.classList.add("is-held"); });
      n.addEventListener("pointermove", (ev) => {
        if (!on) return;
        const x = ox + ev.clientX - sx, y = oy + ev.clientY - sy;
        n.dataset.x = x; n.dataset.y = y; n.style.translate = `${x}px ${y}px`;
      });
      const up = () => { on = false; n.classList.remove("is-held"); };
      n.addEventListener("pointerup", up); n.addEventListener("pointercancel", up);
    });

    if (!S.canAnimate) return;
    // things drop onto the page a little crooked, then settle
    ScrollTrigger.batch(root.querySelectorAll(".sb-drop, .sb-sticky"), {
      start: "top 90%", once: true,
      onEnter: (els) => gsap.from(els, { y: -90, rotation: () => gsap.utils.random(-14, 14), opacity: 0, duration: .9, ease: "back.out(1.6)", stagger: .08 })
    });
    gsap.to(root.querySelector(".sb-strip > div"), { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    gsap.to(root.querySelectorAll(".sb-doodle"), { rotation: "+=360", duration: 18, ease: "none", repeat: -1 });
  }

  function intro(root) {
    gsap.timeline()
      .from(root.querySelector(".sb-top"), { yPercent: -100, duration: .7, ease: "power3.out" })
      .from(root.querySelectorAll(".sb-title span"), { y: -80, rotation: () => gsap.utils.random(-30, 30), opacity: 0, duration: .8, ease: "back.out(2)", stagger: .05 }, .3)
      .from(root.querySelectorAll(".sb-year, .sb-tagline, .sb-doodle"), { scale: 0, opacity: 0, duration: .6, ease: "back.out(2.5)", stagger: .08 }, .7);
  }

  window.MOOD_SITES.scrap = { render, intro };
})();
