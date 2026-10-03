/* Comic book: the portfolio as an issue of a comic. Panels, speech bubbles, caption boxes,
   sound effects, halftone and sticker sheets. Panels slam in, bubbles wobble, clicks go POW. */
(function () {
  "use strict";
  const SFX = ["POW!", "ZAP!", "BAM!", "WOW!", "BOOM!", "KAPOW!"];
  function burst(n = 16, r1 = 96, r2 = 70) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const a = Math.PI * i / n - Math.PI / 2, r = i % 2 ? r2 : r1; pts.push((100 + r * Math.cos(a)).toFixed(1) + "," + (100 + r * Math.sin(a)).toFixed(1)); }
    return `<svg viewBox="0 0 200 200" aria-hidden="true"><polygon points="${pts.join(" ")}"/></svg>`;
  }

  function render(root, S) {
    const C = S.content, t = S.t, e = S.esc, L = (o) => o[S.lang] || o.en;
    const r = (i, k = 2) => ((i * 53) % 5 - 2) * k / 2;
    const projects = S.projects.map((p, i) => `
      <article class="tc-strip">
        <div class="tc-panel tc-panel--cap tc-pop">
          <span class="tc-caption">${e(L(p.tag))}</span>
          <h3 class="tc-pname">${e(L(p.name))}</h3>
          <p>${e(L(p.desc))}</p>
          <div class="tc-btns">${p.links.map((l) => `<a class="tc-btn" href="${e(l.href)}" target="_blank" rel="noopener">${e(L(l.label))} ↗</a>`).join("")}
          ${p.social ? p.social.map((x) => `<a class="tc-btn tc-btn--alt" href="${e(x.href)}" target="_blank" rel="noopener">${e(x.label)} ↗</a>`).join("") : ""}</div>
        </div>
        <div class="tc-panel tc-panel--shots tc-pop" style="--bg:${["#8FD3FF", "#C9B6FF", "#A8E6B8"][i % 3]}">
          ${p.screens.slice(0, 3).map((k, j) => `<img style="--r:${[-8, 2, 9][j]}deg" src="${e(S.screens[k])}" alt="${e(p.name.en)} screen" loading="lazy">`).join("")}
          <span class="tc-sfx" style="--r:${i % 2 ? 10 : -10}deg">${["SHIPPED!", "LIVE!", "DONE!"][i % 3]}</span>
        </div>
        <div class="tc-panel tc-panel--did tc-pop">
          <span class="tc-caption tc-caption--y">${e(L(C.projects.did))}</span>
          <ul class="tc-bubbles">${L(p.points).map((x, j) => `<li style="--r:${r(j)}deg">${e(x)}</li>`).join("")}</ul>
          ${p.metrics.length ? `<div class="tc-bursts">${p.metrics.map((m, j) => `<span class="tc-burst" style="--r:${[-10, 8, -4, 12][j]}deg">${burst()}<b>${e(m.v)}</b><em>${e(L(m.l))}</em></span>`).join("")}</div>` : ""}
          <div class="tc-stickers">${p.stack.map((x, j) => `<span style="--r:${r(j, 6)}deg">${e(x)}</span>`).join("")}</div>
        </div>
      </article>`).join("");

    root.innerHTML = `
    <header class="tc-mast">
      <nav class="tc-nav">
        <div class="tc-issue"><b>#1</b><span>2026</span></div>
        <div class="tc-links">${C.nav.map(([id, k]) => `<a href="#tc-${id}">${e(t(k))}</a>`).join("")}</div>
        <div class="tc-actions"><button class="tc-btn tc-btn--alt tc-lang" type="button">${S.lang === "ar" ? "EN" : "ع"}</button><button class="tc-btn tc-cv" type="button">CV!</button></div>
      </nav>
      <p class="tc-pre">${S.lang === "ar" ? "مغامرات" : "The adventures of"}</p>
      <h1 class="tc-logo">${e(C.name).split("").map((c) => c === " " ? " " : `<span>${c}</span>`).join("")}</h1>
      <p class="tc-ed">Flutter edition · ${S.lang === "ar" ? "العدد الأول" : "first issue"}</p>
    </header>

    <section class="tc-page tc-hero" id="tc-hero">
      <div class="tc-panel tc-panel--hero tc-pop">
        <div class="tc-halftone"></div>
        <img class="tc-me" src="${e(C.photo)}" alt="${e(C.name)}">
        <div class="tc-say tc-wobble"><b>${e(t(C.hero.hi))}!</b><span>${C.hero.title.map((k) => e(t(k))).join(" ")}</span></div>
        <span class="tc-sfx tc-sfx--hero" style="--r:-12deg">${e(t(C.hero.status)).split("·")[0]}</span>
      </div>
      <div class="tc-panel tc-panel--yellow tc-pop">
        <span class="tc-caption">${S.lang === "ar" ? "في الوقت ده..." : "Meanwhile, in Mansoura..."}</span>
        <p class="tc-sub">${e(t(C.hero.sub))}</p>
        <div class="tc-btns"><a class="tc-btn" href="#tc-projects">${e(t(C.hero.cta1))} →</a><a class="tc-btn tc-btn--alt" href="#tc-contact">${e(t(C.hero.cta2))}</a></div>
      </div>
      <div class="tc-facts">${C.facts.map((f, i) => `<div class="tc-panel tc-panel--fact tc-pop" style="--bg:${["#FFC93C", "#8FD3FF", "#F0603F"][i]}"><span class="tc-burst tc-burst--big">${burst(14)}<b>${e(f.v)}${f.sup ? `<sup>${f.sup}</sup>` : ""}${f.suf || ""}</b></span><em>${e(t(f.k))}</em></div>`).join("")}</div>
    </section>

    <div class="tc-ticker"><div>${C.stack.concat(C.stack).map((x) => `<span>${e(x)}</span>`).join("<i>★</i>")}</div></div>

    <section class="tc-page" id="tc-projects">
      <header class="tc-head tc-pop"><span class="tc-caption">${e(t(C.projects.k))}</span><h2>${e(t(C.projects.title))}</h2><p>${e(t(C.projects.sub))}</p></header>
      ${projects}
      <h3 class="tc-h3">${e(t(C.others.title))}</h3>
      <div class="tc-others">${C.others.items.map((o, i) => `<div class="tc-panel tc-pop" style="--r:${r(i)}deg"><h4>${e(o.name)}</h4><p>${e(t(o.k))}</p>${o.href ? `<a class="tc-btn tc-btn--alt" href="${e(o.href)}" target="_blank" rel="noopener">${e(o.linkKey ? t(o.linkKey) : o.link)}</a>` : ""}</div>`).join("")}</div>
    </section>

    <section class="tc-page" id="tc-experience">
      <header class="tc-head tc-pop"><span class="tc-caption">${S.lang === "ar" ? "في الحلقات اللي فاتت..." : "Previously on..."}</span><h2>${e(t(C.experience.title))}</h2></header>
      <div class="tc-exp">${C.experience.items.map((x, i) => `<div class="tc-panel tc-pop" style="--r:${r(i)}deg">
        <span class="tc-caption tc-caption--y">${e(x.dateKey ? t(x.dateKey) : x.date)} · ${e(x.placeText || t(x.place))}</span>
        <h3>${e(t(x.t))}</h3><ul>${x.points.map((k) => `<li>${e(t(k))}</li>`).join("")}</ul></div>`).join("")}</div>
    </section>

    <section class="tc-page" id="tc-skills">
      <header class="tc-head tc-pop"><span class="tc-caption">${e(t(C.skills.k))}</span><h2>${e(t(C.skills.title))}</h2></header>
      <div class="tc-sheet">${C.skills.groups.map((g, i) => `<div class="tc-panel tc-pop"><h3>${e(t(g.t))}</h3><div class="tc-stickers">${g.tags.map((x, j) => `<span style="--r:${r(i + j, 7)}deg;--c:${["#FFC93C", "#8FD3FF", "#F7A9A0", "#A8E6B8", "#C9B6FF"][(i + j) % 5]}">${e(x)}</span>`).join("")}</div></div>`).join("")}</div>
    </section>

    <section class="tc-page tc-about" id="tc-about">
      <div class="tc-panel tc-panel--photo tc-pop"><img src="${e(C.aboutPhoto)}" alt="" loading="lazy"><span class="tc-caption">${e(t(C.about.cap))}</span></div>
      <div class="tc-think tc-pop tc-wobble"><span class="tc-caption">${e(t(C.about.k))}</span><h2>${e(t(C.about.title))}</h2>${C.about.p.map((k) => `<p>${e(t(k))}</p>`).join("")}<div class="tc-stickers">${C.about.langs.map((k, j) => `<span style="--r:${j ? 4 : -4}deg;--c:${j ? "#8FD3FF" : "#FFC93C"}">${e(t(k))}</span>`).join("")}</div></div>
    </section>

    <section class="tc-page tc-contact" id="tc-contact">
      <div class="tc-bigsay tc-pop">
        <span class="tc-caption">${e(t(C.contact.k))}</span>
        <h2>${e(t(C.contact.t1))} ${e(t(C.contact.t2))}</h2>
        <p>${e(t(C.contact.sub))}</p>
        <div class="tc-mail"><a href="mailto:${e(C.contact.email)}">${e(C.contact.email)}</a><button class="tc-btn tc-copy" type="button">${e(t(C.contact.copy))}</button></div>
        <div class="tc-btns"><a class="tc-btn tc-btn--wa" href="${e(C.contact.whatsapp.href)}" target="_blank" rel="noopener">WhatsApp · ${e(C.contact.whatsapp.label)}</a>
          ${C.contact.links.map((l) => `<a class="tc-btn tc-btn--alt" href="${e(l.href)}" target="_blank" rel="noopener">${e(l.label)}</a>`).join("")}<button class="tc-btn tc-btn--alt tc-cv2" type="button">${e(t(C.contact.cv))}</button></div>
      </div>
      <p class="tc-end">${S.lang === "ar" ? "يتبع..." : "To be continued..."}</p>
    </section>`;

    root.querySelector(".tc-lang").addEventListener("click", () => S.setLang(S.lang === "ar" ? "en" : "ar"));
    root.querySelectorAll(".tc-cv, .tc-cv2").forEach((b) => b.addEventListener("click", S.openCv));
    const copy = root.querySelector(".tc-copy");
    copy.addEventListener("click", () => S.copy(C.contact.email, copy, t(C.contact.copy)));
    root.querySelectorAll('a[href^="#tc-"]').forEach((a) => a.addEventListener("click", (ev) => {
      ev.preventDefault(); const el = root.querySelector(a.getAttribute("href"));
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -10 }); else el.scrollIntoView({ behavior: "smooth" });
    }));

    if (!S.canAnimate) return;
    // a click anywhere on a panel throws a sound effect
    root.addEventListener("pointerdown", (ev) => {
      if (ev.target.closest("a, button")) return;
      const s = document.createElement("span"); s.className = "tc-pow";
      s.innerHTML = burst() + `<b>${SFX[Math.floor(Math.random() * SFX.length)]}</b>`;
      s.style.left = ev.pageX + "px"; s.style.top = ev.pageY + "px";
      root.appendChild(s);
      gsap.fromTo(s, { scale: 0, rotation: gsap.utils.random(-30, 30) }, { scale: 1, duration: .45, ease: "back.out(3)", onComplete: () => gsap.to(s, { scale: 0, opacity: 0, duration: .3, delay: .25, onComplete: () => s.remove() }) });
    });
    ScrollTrigger.batch(root.querySelectorAll(".tc-pop"), {
      start: "top 90%", once: true,
      onEnter: (els) => gsap.from(els, { scale: .4, rotation: () => gsap.utils.random(-12, 12), opacity: 0, duration: .9, ease: "elastic.out(1, .5)", stagger: .08 })
    });
    root.querySelectorAll(".tc-wobble").forEach((b, i) => gsap.to(b, { rotation: i % 2 ? 2 : -2, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    gsap.to(root.querySelector(".tc-ticker > div"), { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
  }

  function intro(root) {
    gsap.timeline()
      .from(root.querySelectorAll(".tc-logo span"), { y: -120, scale: 2, opacity: 0, duration: .7, ease: "bounce.out", stagger: .04 })
      .from(root.querySelectorAll(".tc-pre, .tc-ed, .tc-issue"), { scale: 0, rotation: -20, duration: .5, ease: "back.out(3)", stagger: .08 }, .3);
  }

  window.MOOD_SITES.toon = { render, intro };
})();
