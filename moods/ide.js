/* IDE: the portfolio as a code editor. File tree, tabs, line numbers, Dart/YAML/log files,
   a live terminal you can type into, and a status bar. Lines type in as you scroll. */
(function () {
  "use strict";
  function render(root, S) {
    const C = S.content, t = S.t, e = S.esc, L = (o) => o[S.lang] || o.en, ar = S.lang === "ar";
    const q = (s) => `<s>'${e(s)}'</s>`;                 // string literal
    const c = (s) => `<i>// ${e(s)}</i>`;               // comment
    const k = (s) => `<b>${s}</b>`;                      // keyword
    const lines = (arr) => arr.map((h) => `<div class="ln">${h || "&nbsp;"}</div>`).join("");
    const slug = (p) => p.id === "tasks" ? "task_manager" : p.id;
    const cls = (p) => L(p.name).replace(/[^A-Za-z0-9]/g, "") || p.id;

    const files = [
      { id: "hero", name: "README.md", icon: "md" },
      ...S.projects.map((p) => ({ id: "p-" + p.id, name: slug(p) + ".dart", icon: "dart", dir: "projects" })),
      { id: "others", name: "others.md", icon: "md", dir: "projects" },
      { id: "experience", name: "experience.log", icon: "log" },
      { id: "skills", name: "skills.yaml", icon: "yaml" },
      { id: "about", name: "about.md", icon: "md" },
      { id: "contact", name: "contact.sh", icon: "sh" }
    ];
    const tree = files.map((f, i) => {
      const dirOpen = f.dir && (i === 0 || files[i - 1].dir !== f.dir) ? `<li class="id-dir">▾ ${f.dir}/</li>` : "";
      return dirOpen + `<li><a href="#id-${f.id}" class="${f.dir ? "id-in" : ""}" data-f="${f.id}"><span class="id-ic id-ic--${f.icon}"></span>${e(f.name)}</a></li>`;
    }).join("");

    const projectFiles = S.projects.map((p) => `
      <section class="id-file" id="id-p-${p.id}" data-file="p-${p.id}">
        <div class="id-split">
          <div class="id-code">${lines([
            c(L(p.tag)),
            `${k("class")} <u>${e(cls(p))}</u> ${k("extends")} <u>FlutterApp</u> {`,
            `  ${c(L(p.desc))}`,
            ``,
            `  ${k("final")} did = [ ${c(L(C.projects.did))}`,
            ...L(p.points).map((x) => `    ${q(x)},`),
            `  ];`,
            ...(p.metrics.length ? [``, ...p.metrics.map((m) => `  ${k("static const")} ${e(L(m.l).replace(/\s+/g, "_"))} = <em>${e(m.v)}</em>;`)] : []),
            ``,
            `  ${k("final")} stack = [${p.stack.map(q).join(", ")}];`,
            ...p.links.map((l) => `  ${k("@link")} <a href="${e(l.href)}" target="_blank" rel="noopener">${e(L(l.label))} ↗</a>`),
            ...(p.social ? p.social.map((x) => `  ${k("@social")} <a href="${e(x.href)}" target="_blank" rel="noopener">${e(x.label)} ↗</a>`) : []),
            `}`
          ])}</div>
          <div class="id-preview"><p class="id-ptitle">▸ device preview — ${e(L(p.name))}</p><div class="id-phones">${p.screens.slice(0, 3).map((s) => `<img src="${e(S.screens[s])}" alt="${e(p.name.en)} screen" loading="lazy">`).join("")}</div></div>
        </div>
      </section>`).join("");

    root.innerHTML = `
    <div class="id-app">
      <header class="id-title"><span class="id-dots"><i></i><i></i><i></i></span><span class="id-path">sherif_fahmy / portfolio <em>· main</em></span>
        <span class="id-tools"><button class="id-lang" type="button">${ar ? "EN" : "ع"}</button><button class="id-cv" type="button">⤓ cv.pdf</button></span></header>
      <aside class="id-side">
        <p class="id-sidehead">${ar ? "الملفات" : "Explorer"}</p>
        <ul class="id-tree">${tree}</ul>
        <div class="id-photo"><img src="${e(C.photo)}" alt="${e(C.name)}"><span>sherif.png</span></div>
      </aside>
      <main class="id-main">
        <div class="id-tabs"><span class="id-tab is-on" id="idTab">README.md</span><span class="id-tab">pubspec.yaml</span></div>

        <section class="id-file id-readme" id="id-hero" data-file="hero">
          ${lines([
            `<span class="id-h"># ${e(C.name)}</span>`,
            `<span class="id-hl">${e(t(C.hero.status))}</span>`,
            ``,
            `## ${e(t(C.hero.hi))}`,
            `<strong class="id-big">${C.hero.title.map((x, i) => i === 1 ? `<mark>${e(t(x))}</mark>` : e(t(x))).join(" ")}</strong>`,
            ``,
            `&gt; ${e(t(C.hero.sub))}`,
            ``,
            `${k("const")} facts = {`,
            ...C.facts.map((f) => `  ${q(t(f.k))}: <em>${e(f.v)}${f.sup || ""}${f.suf || ""}</em>,`),
            `};`,
            ``,
            `<a class="id-run" href="#id-p-${S.projects[0].id}">▶ ${e(t(C.hero.cta1))}</a> <a class="id-run id-run--alt" href="#id-contact">${e(t(C.hero.cta2))}</a>`
          ])}
        </section>

        <section class="id-file" data-file="p-${S.projects[0].id}" aria-hidden="true"><div class="id-sec">${lines([`<span class="id-h"># ${e(t(C.projects.title))}</span>`, c(t(C.projects.sub))])}</div></section>
        ${projectFiles}

        <section class="id-file" id="id-others" data-file="others">${lines([`<span class="id-h">## ${e(t(C.others.title))}</span>`, ...C.others.items.map((o) => `- **${e(o.name)}** — ${e(t(o.k))} ${o.href ? `<a href="${e(o.href)}" target="_blank" rel="noopener">${e(o.linkKey ? t(o.linkKey) : o.link)}</a>` : ""}`)])}</section>

        <section class="id-file" id="id-experience" data-file="experience">${lines([
          `<span class="id-h"># ${e(t(C.experience.title))}</span>`, ``,
          ...C.experience.items.flatMap((x) => [
            `<span class="id-log">[${e(x.dateKey ? t(x.dateKey) : x.date)}]</span> <em>INFO</em> <strong>${e(t(x.t))}</strong> <i>@ ${e(x.placeText || t(x.place))}</i>`,
            ...x.points.map((p) => `    <span class="id-ok">✓</span> ${e(t(p))}`), ``
          ])
        ])}</section>

        <section class="id-file" id="id-skills" data-file="skills">${lines([
          c(t(C.skills.title)),
          ...C.skills.groups.flatMap((g) => [`<b>${e(t(g.t).toLowerCase().replace(/\s+/g, "_"))}:</b>`, ...g.tags.map((x) => `  - ${q(x)}`)])
        ])}</section>

        <section class="id-file id-aboutfile" id="id-about" data-file="about">
          <div class="id-split">
            <div class="id-code">${lines([`<span class="id-h"># ${e(t(C.about.k))}</span>`, ``, `<strong class="id-big">${e(t(C.about.title))}</strong>`, ``, ...C.about.p.map((x) => e(t(x))), ``, ...C.about.langs.map((x) => `- ${e(t(x))}`)])}</div>
            <div class="id-preview"><p class="id-ptitle">▸ ${e(t(C.about.cap))}</p><img class="id-aboutimg" src="${e(C.aboutPhoto)}" alt="" loading="lazy"></div>
          </div>
        </section>

        <section class="id-file" id="id-contact" data-file="contact">${lines([
          `<i>#!/bin/bash</i>`, c(t(C.contact.sub)), ``,
          `<span class="id-h">${e(t(C.contact.t1))} ${e(t(C.contact.t2))}</span>`, ``,
          `$ ${k("mail")} <a href="mailto:${e(C.contact.email)}">${e(C.contact.email)}</a>  <button class="id-run id-copy" type="button">${e(t(C.contact.copy))}</button>`,
          `$ ${k("open")} <a href="${e(C.contact.whatsapp.href)}" target="_blank" rel="noopener">whatsapp ${e(C.contact.whatsapp.label)}</a>`,
          ...C.contact.links.map((l) => `$ ${k("open")} <a href="${e(l.href)}" target="_blank" rel="noopener">${e(l.label.toLowerCase())}</a>`),
          `$ ${k("download")} <button class="id-run id-cv2" type="button">${e(t(C.contact.cv))}</button>`
        ])}</section>

        <section class="id-term">
          <p class="id-termhead">TERMINAL <span>${ar ? "اكتب help" : "type help"}</span></p>
          <div class="id-out" id="idOut"></div>
          <label class="id-prompt"><span>sherif@portfolio:~$</span><input id="idIn" autocomplete="off" spellcheck="false" aria-label="terminal"></label>
        </section>
      </main>
      <footer class="id-status"><span>⎇ main</span><span>✓ 1,302 tests</span><span>Dart · Flutter</span><span id="idPos">Ln 1</span><span>UTF-8</span></footer>
    </div>`;

    const go = (id) => { const el = root.querySelector(id); if (!el) return; if (window.__lenis) window.__lenis.scrollTo(el, { offset: -60 }); else el.scrollIntoView({ behavior: "smooth" }); };
    root.querySelector(".id-lang").addEventListener("click", () => S.setLang(ar ? "en" : "ar"));
    root.querySelectorAll(".id-cv, .id-cv2").forEach((b) => b.addEventListener("click", S.openCv));
    const copy = root.querySelector(".id-copy");
    copy.addEventListener("click", () => S.copy(C.contact.email, copy, t(C.contact.copy)));
    root.querySelectorAll('a[href^="#id-"]').forEach((a) => a.addEventListener("click", (ev) => { ev.preventDefault(); go(a.getAttribute("href")); }));

    // the terminal answers a few commands
    const out = root.querySelector("#idOut"), input = root.querySelector("#idIn");
    const print = (h) => { out.insertAdjacentHTML("beforeend", `<div>${h}</div>`); out.scrollTop = out.scrollHeight; };
    const cmds = {
      help: () => "commands: <b>whoami</b> · <b>projects</b> · <b>open lamma|nabdy|tasks</b> · <b>experience</b> · <b>skills</b> · <b>contact</b> · <b>cv</b> · <b>clear</b>",
      whoami: () => `${e(C.name)} — ${e(t(C.hero.sub))}`,
      projects: () => S.projects.map((p) => `• ${e(L(p.name))} — ${e(L(p.tag))}`).join("<br>"),
      experience: () => { go("#id-experience"); return "→ experience.log"; },
      skills: () => { go("#id-skills"); return "→ skills.yaml"; },
      contact: () => { go("#id-contact"); return `→ ${e(C.contact.email)} · ${e(C.contact.whatsapp.label)}`; },
      cv: () => { S.openCv(); return "opening cv.pdf…"; },
      clear: () => { out.innerHTML = ""; return ""; }
    };
    input.addEventListener("keydown", (ev) => {
      ev.stopPropagation();                              // keep r / R for typing here
      if (ev.key !== "Enter") return;
      const v = input.value.trim(); input.value = "";
      print(`<span class="id-pr">$</span> ${e(v)}`);
      const [cmd, arg] = v.toLowerCase().split(/\s+/);
      if (cmd === "open" && arg) { const p = S.projects.find((x) => x.id.startsWith(arg) || x.name.en.toLowerCase().startsWith(arg)); if (p) { go("#id-p-" + p.id); print(`→ ${slug(p)}.dart`); } else print(`open: no such project '${e(arg)}'`); return; }
      const r = cmds[cmd]; const res = r ? r() : `command not found: ${e(cmd || "")}. try <b>help</b>`;
      if (res) print(res);
    });
    print(`<span class="id-ok">✓</span> ${ar ? "اكتب" : "type"} <b>help</b> ${ar ? "عشان تشوف الأوامر" : "to see the commands"}`);

    // the explorer and tab follow the file you are reading; the status bar shows a line number
    const tab = root.querySelector("#idTab"), pos = root.querySelector("#idPos");
    root.querySelectorAll(".id-file[id]").forEach((sec) => {
      const f = files.find((x) => "id-" + x.id === sec.id);
      ScrollTrigger.create({ trigger: sec, start: "top 40%", end: "bottom 40%", onToggle: (st) => {
        if (!st.isActive || !f) return;
        tab.textContent = f.name;
        root.querySelectorAll(".id-tree a").forEach((a) => a.classList.toggle("is-on", a.dataset.f === f.id));
      } });
    });
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => { pos.textContent = "Ln " + (1 + Math.round(st.progress * 412)); } });

    if (!S.canAnimate) return;
    // each file's lines type in, a few at a time, the first time you reach it
    root.querySelectorAll(".id-file").forEach((sec) => {
      gsap.from(sec.querySelectorAll(".ln"), { opacity: 0, x: -8, duration: .05, stagger: .035, ease: "steps(1)", scrollTrigger: { trigger: sec, start: "top 85%", once: true } });
    });
    root.querySelectorAll(".id-phones img, .id-aboutimg").forEach((im, i) => gsap.from(im, { y: 30, opacity: 0, duration: .6, ease: "power3.out", delay: (i % 3) * .1, scrollTrigger: { trigger: im, start: "top 92%", once: true } }));
  }

  function intro(root) {
    gsap.timeline()
      .from(root.querySelector(".id-side"), { xPercent: -100, duration: .5, ease: "power3.out" })
      .from(root.querySelector(".id-title"), { yPercent: -100, duration: .4, ease: "power3.out" }, 0)
      .from(root.querySelector(".id-status"), { yPercent: 100, duration: .4, ease: "power3.out" }, 0)
      .from(root.querySelectorAll(".id-tree li"), { opacity: 0, x: -10, duration: .3, stagger: .04 }, .3);
  }

  window.MOOD_SITES.ide = { render, intro };
})();
