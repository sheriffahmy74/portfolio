/* Magazine: the portfolio as a printed issue. Masthead, cover lines, feature articles with drop caps
   and pull quotes, a career column, an index and letters to the editor. Slow, editorial motion. */
(function () {
  "use strict";
  function render(root, S) {
    const C = S.content, t = S.t, e = S.esc, L = (o) => o[S.lang] || o.en, ar = S.lang === "ar";
    const features = S.projects.map((p, i) => {
      const pts = L(p.points);
      const quote = p.metrics.length ? p.metrics.map((m) => `${m.v} ${L(m.l)}`).join(" · ") : pts[0];
      return `<article class="mg-feature mg-rev">
        <p class="mg-kicker">${e(L(p.tag))}</p>
        <h3 class="mg-ftitle"><span>${e(L(p.name))}</span></h3>
        <p class="mg-stand">${e(L(p.desc))}</p>
        <div class="mg-fgrid">
          <figure class="mg-fig">
            <div class="mg-shots">${p.screens.slice(0, 3).map((k) => `<img src="${e(S.screens[k])}" alt="${e(p.name.en)} screen" loading="lazy">`).join("")}</div>
            <figcaption>${ar ? "شكل" : "Fig."} ${i + 1} — ${e(L(p.name))}, ${e(p.stack.slice(0, 3).join(", "))}</figcaption>
          </figure>
          <div class="mg-cols">
            <p class="mg-label">${e(L(C.projects.did))}</p>
            ${pts.map((x, j) => `<p class="${j === 0 ? "mg-drop" : ""}">${e(x)}</p>`).join("")}
            <blockquote class="mg-pull">“${e(quote)}”</blockquote>
            <p class="mg-filed">${ar ? "تحت تصنيف" : "Filed under"}: ${e(p.stack.join(", "))}</p>
            <p class="mg-more">${p.links.map((l) => `<a href="${e(l.href)}" target="_blank" rel="noopener">${e(L(l.label))} →</a>`).join(" ")}
            ${p.social ? p.social.map((x) => `<a href="${e(x.href)}" target="_blank" rel="noopener">${e(x.label)} →</a>`).join(" ") : ""}</p>
          </div>
        </div>
      </article>`;
    }).join('<hr class="mg-rule mg-draw">');

    root.innerHTML = `
    <div class="mg-paper">
    <header class="mg-top">
      <div class="mg-bar"><span>Vol. 1 — Flutter Edition</span><span>${e(t(C.about.cap))} · 2026</span>
        <span class="mg-actions"><button class="mg-lang" type="button">${ar ? "English" : "العربية"}</button><button class="mg-cv" type="button">CV</button></span></div>
      <h1 class="mg-mast"><span class="mg-mast__in">${e(C.name.split(" ")[0])}</span></h1>
      <div class="mg-sub"><span>${e(C.name.split(" ")[1] || "")}</span><span>${e(t(C.hero.status))}</span></div>
      <hr class="mg-rule mg-rule--double mg-draw">
      <nav class="mg-nav"><b>${ar ? "في العدد ده" : "In this issue"}</b>${C.nav.map(([id, k]) => `<a href="#mg-${id}">${e(t(k))}</a>`).join("")}</nav>
    </header>

    <section class="mg-cover" id="mg-hero">
      <aside class="mg-lines">${C.facts.map((f) => `<div class="mg-rev"><b>${e(f.v)}${f.sup ? `<sup>${f.sup}</sup>` : ""}${f.suf || ""}</b><span>${e(t(f.k))}</span></div>`).join("")}</aside>
      <figure class="mg-coverimg"><div class="mg-coverbg"></div><img src="${e(C.photo)}" alt="${e(C.name)}"></figure>
      <div class="mg-story">
        <p class="mg-kicker">${e(t(C.hero.hi))}</p>
        <h2 class="mg-head">${C.hero.title.map((k, i) => `<span class="mg-line"><span${i === 1 ? ' class="mg-it"' : ""}>${e(t(k))}</span></span>`).join(" ")}</h2>
        <p class="mg-stand mg-rev">${e(t(C.hero.sub))}</p>
        <p class="mg-more mg-rev"><a href="#mg-projects">${e(t(C.hero.cta1))} →</a> <a href="#mg-contact">${e(t(C.hero.cta2))} →</a></p>
      </div>
    </section>

    <section class="mg-sec" id="mg-projects">
      <header class="mg-shead mg-rev"><span>${e(t(C.projects.k))}</span><h2>${e(t(C.projects.title))}</h2><p>${e(t(C.projects.sub))}</p></header>
      ${features}
      <hr class="mg-rule mg-draw">
      <div class="mg-briefs"><h3>${e(t(C.others.title))}</h3>${C.others.items.map((o) => `<div class="mg-rev"><b>${e(o.name)}.</b> ${e(t(o.k))} ${o.href ? `<a href="${e(o.href)}" target="_blank" rel="noopener">${e(o.linkKey ? t(o.linkKey) : o.link)}</a>` : ""}</div>`).join("")}</div>
    </section>

    <section class="mg-sec mg-sec--tint" id="mg-experience">
      <header class="mg-shead mg-rev"><span>${e(t(C.experience.k))}</span><h2>${e(t(C.experience.title))}</h2></header>
      <ol class="mg-career">${C.experience.items.map((x) => `<li class="mg-rev"><i>${e(x.dateKey ? t(x.dateKey) : x.date)}</i><div><h3>${e(t(x.t))}</h3><p class="mg-place">${e(x.placeText || t(x.place))}</p>${x.points.map((k) => `<p>${e(t(k))}</p>`).join("")}</div></li>`).join("")}</ol>
    </section>

    <section class="mg-sec" id="mg-skills">
      <header class="mg-shead mg-rev"><span>${e(t(C.skills.k))}</span><h2>${e(t(C.skills.title))}</h2></header>
      <div class="mg-index">${C.skills.groups.map((g) => `<div class="mg-rev"><h3>${e(t(g.t))}</h3><ul>${g.tags.map((x) => `<li><span>${e(x)}</span></li>`).join("")}</ul></div>`).join("")}</div>
    </section>

    <section class="mg-sec mg-sec--tint mg-profile" id="mg-about">
      <figure class="mg-pfig mg-rev"><img src="${e(C.aboutPhoto)}" alt="" loading="lazy"><figcaption>${e(C.name)} — ${e(t(C.about.cap))}</figcaption></figure>
      <div>
        <header class="mg-shead mg-rev"><span>${e(t(C.about.k))}</span></header>
        <blockquote class="mg-bigquote mg-rev">“${e(t(C.about.title))}”</blockquote>
        ${C.about.p.map((k, i) => `<p class="mg-rev ${i === 0 ? "mg-drop" : ""}">${e(t(k))}</p>`).join("")}
        <p class="mg-filed mg-rev">${C.about.langs.map((k) => e(t(k))).join(" — ")}</p>
      </div>
    </section>

    <section class="mg-sec" id="mg-contact">
      <div class="mg-letters mg-rev">
        <span class="mg-kicker">${e(t(C.contact.k))}</span>
        <h2 class="mg-head"><span class="mg-line"><span>${e(t(C.contact.t1))}</span></span> <span class="mg-line"><span class="mg-it">${e(t(C.contact.t2))}</span></span></h2>
        <p class="mg-stand">${e(t(C.contact.sub))}</p>
        <p class="mg-mail"><a href="mailto:${e(C.contact.email)}">${e(C.contact.email)}</a> <button class="mg-copy" type="button">${e(t(C.contact.copy))}</button></p>
        <p class="mg-more"><a href="${e(C.contact.whatsapp.href)}" target="_blank" rel="noopener">WhatsApp ${e(C.contact.whatsapp.label)} →</a>
        ${C.contact.links.map((l) => `<a href="${e(l.href)}" target="_blank" rel="noopener">${e(l.label)}</a>`).join(" ")} <button class="mg-cv2" type="button">${e(t(C.contact.cv))} →</button></p>
      </div>
      <footer class="mg-colophon"><span>© 2026 ${e(C.name)}</span><span>${ar ? "اتصمم وتنفّذ بإيدي، متصفّف بـ Playfair Display" : "Designed and built by me. Set in Playfair Display and Libre Franklin."}</span></footer>
    </section>
    </div>`;

    root.querySelector(".mg-lang").addEventListener("click", () => S.setLang(ar ? "en" : "ar"));
    root.querySelectorAll(".mg-cv, .mg-cv2").forEach((b) => b.addEventListener("click", S.openCv));
    const copy = root.querySelector(".mg-copy");
    copy.addEventListener("click", () => S.copy(C.contact.email, copy, t(C.contact.copy)));
    root.querySelectorAll('a[href^="#mg-"]').forEach((a) => a.addEventListener("click", (ev) => {
      ev.preventDefault(); const el = root.querySelector(a.getAttribute("href"));
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -10 }); else el.scrollIntoView({ behavior: "smooth" });
    }));

    if (!S.canAnimate) return;
    // slow reveals: text rises out of a mask, rules draw across, figures settle
    ScrollTrigger.batch(root.querySelectorAll(".mg-rev"), { start: "top 88%", once: true,
      onEnter: (els) => gsap.from(els, { y: 50, clipPath: "inset(0 0 100% 0)", duration: 1.3, ease: "power4.out", stagger: .1, clearProps: "clipPath" }) });
    ScrollTrigger.batch(root.querySelectorAll(".mg-draw"), { start: "top 92%", once: true,
      onEnter: (els) => gsap.from(els, { scaleX: 0, transformOrigin: "0 50%", duration: 1.4, ease: "power3.inOut", stagger: .1 }) });
    root.querySelectorAll(".mg-ftitle span").forEach((s) => gsap.from(s, { yPercent: 105, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: s, start: "top 90%", once: true } }));
    gsap.to(root.querySelector(".mg-coverimg img"), { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".mg-cover", start: "top top", end: "bottom top", scrub: true } });
    root.querySelectorAll(".mg-shots img").forEach((im) => gsap.from(im, { scale: 1.12, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: im, start: "top 90%", once: true } }));
  }

  function intro(root) {
    gsap.timeline()
      .from(root.querySelector(".mg-mast__in"), { yPercent: 100, duration: 1.3, ease: "power4.out" })
      .from(root.querySelectorAll(".mg-bar > *, .mg-sub > *, .mg-nav > *"), { opacity: 0, y: 10, duration: .6, stagger: .04 }, .4)
      .from(root.querySelectorAll(".mg-line > span"), { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: .12 }, .5)
      .from(root.querySelector(".mg-coverimg"), { clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power4.inOut" }, .3);
  }

  window.MOOD_SITES.mag = { render, intro };
})();
