/* Hero 3D playground (Three.js).
   A sharp cut-out photo sits in a real 3D space with glossy objects around it, each one a skill:
   the Flutter logo, a phone running Lamma, a map pin, a chat bubble, a store star, a tests badge
   and a code tag. Everything reacts: the camera follows the pointer (parallax), objects dodge the
   cursor and spring back, hovering shows what each one means, clicking spins it and pops confetti,
   the phone switches screens and the Flutter logo breaks apart and snaps back together. */
(function () {
  "use strict";
  if (typeof window.THREE === "undefined") return;
  const T = window.THREE;

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const elastic = (t) => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1;

  function glossy(color, extra) {
    return new T.MeshPhysicalMaterial(Object.assign({ color, roughness: .18, metalness: .05, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.1 }, extra || {}));
  }
  function extrude(shape, depth, bevel) {
    const g = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 32 });
    g.center();
    return g;
  }
  function poly(pts) { const s = new T.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s; }
  function roundRect(w, h, r) {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  /* ---------------------------------------------------------------- the objects */
  function flutterLogo() {
    const g = new T.Group(), s = 2.3 / 181, cx = 83, cy = 101;
    const P = (arr) => poly(arr.map(([x, y]) => [(x - cx) * s, (cy - y) * s]));
    const parts = [
      [[37.7, 128.9], [9.8, 101], [100.4, 10.4], [156.2, 10.4]], "#54C5F8",
      [[156.2, 94], [100.4, 94], [79.5, 114.9], [107.4, 142.8]], "#54C5F8",
      [[79.5, 114.9], [51.6, 142.8], [79.5, 170.7], [107.4, 142.8]], "#29B6F6",
      [[79.5, 170.7], [100.4, 191.6], [156.2, 191.6], [107.4, 142.8]], "#01579B"
    ];
    const pieces = [];
    for (let i = 0; i < parts.length; i += 2) {
      const geo = new T.ExtrudeGeometry(P(parts[i]), { depth: .22, bevelEnabled: true, bevelThickness: .05, bevelSize: .04, bevelSegments: 5 });
      geo.translate(0, 0, -.11);
      const m = new T.Mesh(geo, glossy(parts[i + 1]));
      m.userData.home = new T.Vector3(); m.userData.vel = new T.Vector3();
      g.add(m); pieces.push(m);
    }
    g.userData.pieces = pieces;
    return g;
  }

  function phone(screens) {
    const g = new T.Group();
    const body = new T.Mesh(extrude(roundRect(1.02, 2.1, .17), .09, .035),
      new T.MeshPhysicalMaterial({ color: "#14161c", roughness: .25, metalness: .6, clearcoat: 1, clearcoatRoughness: .1 }));
    g.add(body);
    const mats = [];
    const loader = new T.TextureLoader();
    const scr = new T.Mesh(new T.PlaneGeometry(.92, 2.0), new T.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }));
    scr.position.z = .085;
    // rounded screen corners via an alpha map drawn on a canvas
    const c = document.createElement("canvas"); c.width = 92; c.height = 200;
    const x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, 92, 200); x.fillStyle = "#fff";
    x.beginPath(); x.roundRect(0, 0, 92, 200, 13); x.fill();
    scr.material.alphaMap = new T.CanvasTexture(c); scr.material.transparent = true;
    g.add(scr);
    const notch = new T.Mesh(new T.CapsuleGeometry(.035, .16, 4, 12), new T.MeshBasicMaterial({ color: "#000" }));
    notch.rotation.z = Math.PI / 2; notch.position.set(0, .9, .09); g.add(notch);
    screens.forEach((src, i) => loader.load(src, (t) => {
      t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; mats[i] = t;
      if (i === 0) { scr.material.map = t; scr.material.needsUpdate = true; }
    }));
    let cur = 0;
    g.userData.next = () => {
      const n = (cur + 1) % screens.length;
      if (!mats[n]) return; cur = n;
      scr.material.map = mats[n]; scr.material.needsUpdate = true;
    };
    return g;
  }

  function mapPin() {
    const s = new T.Shape();
    s.moveTo(0, -.62);
    s.bezierCurveTo(-.14, -.34, -.4, -.08, -.4, .2);
    s.absarc(0, .2, .4, Math.PI, 0, true);
    s.bezierCurveTo(.4, -.08, .14, -.34, 0, -.62);
    const hole = new T.Path(); hole.absarc(0, .2, .15, 0, Math.PI * 2, false); s.holes.push(hole);
    return new T.Mesh(extrude(s, .2, .07), glossy("#EA4335"));
  }

  function chatBubble() {
    const g = new T.Group();
    const s = roundRect(1.15, .78, .26);
    const tail = poly([[-.36, -.3], [-.5, -.6], [-.1, -.36]]);
    const b = new T.Mesh(extrude(s, .16, .06), glossy("#ffffff", { roughness: .3 }));
    const t = new T.Mesh(extrude(tail, .16, .06), b.material); t.position.set(-.3, -.33, 0);
    g.add(b, t);
    const dot = new T.SphereGeometry(.075, 24, 16), dm = glossy("#2F5BEA");
    [-.27, 0, .27].forEach((xx, i) => { const d = new T.Mesh(dot, dm); d.position.set(xx, 0, .14); d.userData.i = i; g.add(d); });
    g.userData.dots = g.children.slice(2);
    return g;
  }

  function star() {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .23 : .52; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    return new T.Mesh(extrude(poly(pts), .16, .07), glossy("#F5A524"));
  }

  function checkBadge() {
    const g = new T.Group();
    const disc = new T.Mesh(new T.CylinderGeometry(.46, .46, .2, 64), glossy("#22C55E"));
    disc.rotation.x = Math.PI / 2; g.add(disc);
    const ck = new T.Mesh(extrude(poly([[-.26, .02], [-.15, .13], [-.06, .04], [.17, .27], [.28, .16], [-.06, -.18]]), .08, .03), glossy("#ffffff"));
    ck.position.z = .14; g.add(ck);
    return g;
  }

  function codeTag() {
    const g = new T.Group(), m = glossy("#8B6FE8");
    const left = poly([[-.36, 0], [.02, .38], [.14, .26], [-.12, 0], [.14, -.26], [.02, -.38]]);
    const l = new T.Mesh(extrude(left, .16, .04), m); l.position.x = -.48;
    const r = l.clone(); r.rotation.y = Math.PI; r.position.x = .48;
    const sl = new T.Mesh(extrude(poly([[.1, .46], [.22, .46], [-.1, -.46], [-.22, -.46]]), .16, .04), m);
    g.add(l, r, sl);
    return g;
  }

  /* ---------------------------------------------------------------- environment */
  function makeEnv(renderer) {
    const env = new T.Scene();
    const room = new T.Mesh(new T.BoxGeometry(20, 20, 20), new T.MeshBasicMaterial({ color: "#5d6474", side: T.BackSide }));
    env.add(room);
    const panel = (w, h, pos, col, k) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(k) }));
      m.position.copy(pos); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(10, 4, new T.Vector3(-4, 7, 6), "#ffffff", 6);
    panel(4, 8, new T.Vector3(8, 1, 3), "#cfe0ff", 3);
    panel(6, 3, new T.Vector3(-8, -2, -4), "#ffd9a0", 2.5);
    panel(12, 2, new T.Vector3(0, -8, 4), "#ffffff", 1.5);
    const pm = new T.PMREMGenerator(renderer);
    const tex = pm.fromScene(env, .04).texture;
    pm.dispose();
    return tex;
  }

  /* ---------------------------------------------------------------- create */
  function create(container, opts) {
    const canvas = document.createElement("canvas");
    canvas.className = "scene3d";
    container.appendChild(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0, 0);

    const scene = new T.Scene();
    scene.environment = makeEnv(renderer);
    const camera = new T.PerspectiveCamera(30, 1, .1, 100);
    const key = new T.DirectionalLight("#ffffff", 1.6); key.position.set(-3, 5, 6); scene.add(key);
    scene.add(new T.HemisphereLight("#ffffff", "#c9d4ff", .7));

    const world = new T.Group(); scene.add(world);

    // the photo: a sharp plane in the middle of the space
    const photoMat = new T.MeshBasicMaterial({ transparent: true, toneMapped: false, opacity: 0, alphaTest: .02 });
    const photo = new T.Mesh(new T.PlaneGeometry(1, 1), photoMat);
    world.add(photo);
    let photoH = 5.5, photoReady = false;
    new T.TextureLoader().load(opts.photo, (t) => {
      t.colorSpace = T.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      photoMat.map = t; photoMat.needsUpdate = true;
      const ar = t.image.width / t.image.height;
      photo.scale.set(photoH * ar, photoH, 1);
      photoReady = true;
    });
    const photoBase = new T.Vector3(.1, -.2, 0);
    photo.position.copy(photoBase);

    // objects: [mesh, base position, base rotation, scale, label key, click action]
    const logo = flutterLogo();
    const ph = phone(opts.screens || []);
    const bubble = chatBubble();
    const items = [
      { mesh: logo, pos: [-1.75, 1.25, -2.2], rot: [.1, .3, -.05], s: 1, tip: "flutter", spinY: .25 },
      { mesh: ph, pos: [1.95, -.95, 1.1], rot: [-.08, -.42, .12], s: .95, tip: "phone", spinY: 0 },
      { mesh: mapPin(), pos: [-2.15, -.55, .9], rot: [0, .3, 0], s: .8, tip: "maps", spinY: .6 },
      { mesh: bubble, pos: [1.95, 1.45, .2], rot: [.05, -.35, .04], s: .8, tip: "chat", spinY: 0 },
      { mesh: star(), pos: [-.95, 2.45, .6], rot: [0, 0, .2], s: .62, tip: "store", spinY: .8 },
      { mesh: checkBadge(), pos: [2.45, .35, -.9], rot: [0, -.4, 0], s: .78, tip: "tests", spinY: .4 },
      { mesh: codeTag(), pos: [-1.35, -1.95, 1.5], rot: [-.1, .35, -.06], s: .62, tip: "code", spinY: .3 }
    ];
    // little floating "widgets"
    const pal = ["#2F5BEA", "#54C5F8", "#F5A524", "#8B6FE8", "#22C55E", "#ffffff"];
    const geos = [new T.BoxGeometry(.2, .2, .2), new T.SphereGeometry(.11, 24, 16), new T.TorusGeometry(.12, .045, 16, 40), new T.OctahedronGeometry(.13)];
    const confettiPos = [[-2.8, 2.1, -1.6], [.6, 2.75, -1.4], [2.9, 2.3, -1.8], [3.1, -1.6, -.6], [-3.1, .6, -1.2], [-.4, -2.4, 2.2], [1.1, -2.3, .4], [-2.6, -1.9, -.4], [.9, 1.0, 2.1], [-1.0, .4, 2.3], [3.2, -.4, 1.5], [-3.3, -.9, 1.4], [.3, 3.2, .6], [2.3, 2.9, .9]];
    confettiPos.forEach((p, i) => items.push({ mesh: new T.Mesh(geos[i % 4], glossy(pal[i % pal.length])), pos: p, rot: [i, i * .7, 0], s: 1, tip: null, spinY: .5 + (i % 3) * .3, small: true }));

    const pickables = [];
    items.forEach((it, i) => {
      it.base = new T.Vector3(...it.pos);
      it.off = new T.Vector3(); it.vel = new T.Vector3();
      it.spin = new T.Vector3(); it.acc = new T.Vector3();
      it.scale = 1; it.scaleT = 1; it.phase = i * 1.37;
      it.from = new T.Vector3((Math.random() - .5) * 8, (Math.random() - .5) * 6, -9 - Math.random() * 6);
      it.delay = it.small ? .55 + Math.random() * .7 : .25 + i * .12;
      it.mesh.scale.setScalar(0);
      world.add(it.mesh);
      if (it.tip) it.mesh.traverse((o) => { if (o.isMesh) { o.userData.item = it; pickables.push(o); } });
    });

    // confetti burst pool
    const burstGeo = new T.SphereGeometry(.05, 12, 8);
    const bursts = [];
    for (let i = 0; i < 48; i++) {
      const m = new T.Mesh(burstGeo, glossy(pal[i % pal.length])); m.visible = false;
      m.userData = { vel: new T.Vector3(), life: 0 }; scene.add(m); bursts.push(m);
    }
    function burst(at) {
      let n = 0;
      for (const b of bursts) {
        if (b.visible) continue;
        b.visible = true; b.position.copy(at); b.userData.life = 1;
        b.userData.vel.set((Math.random() - .5) * 5, Math.random() * 4 + 1, (Math.random() - .2) * 4);
        if (++n >= 14) break;
      }
    }

    /* ---------------- layout */
    let W = 1, H = 1;
    function layout() {
      W = container.clientWidth; H = container.clientHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      // keep a 7.2 x 6.4 world box in view at any aspect ratio
      const tanh = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
      camera.userData.dist = Math.max(3.2 / tanh, 3.6 / tanh / camera.aspect) ;
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(layout).observe(container); layout();

    /* ---------------- pointer */
    const ptr = new T.Vector2(0, 0), ptrS = new T.Vector2(0, 0), ptrPx = new T.Vector2(-1e4, -1e4);
    let inside = false, hovered = null, tipTimer = 0;
    const ray = new T.Raycaster();
    const coarse = matchMedia("(pointer: coarse)").matches;
    const tipEl = opts.tip;
    function setPtr(e) {
      const r = canvas.getBoundingClientRect();
      ptrPx.set(e.clientX - r.left, e.clientY - r.top);
      ptr.set(ptrPx.x / r.width * 2 - 1, -(ptrPx.y / r.height * 2 - 1));
    }
    function pick() {
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      return hit ? hit.object.userData.item : null;
    }
    // follow the pointer everywhere for parallax, but only dodge/hover inside the stage
    window.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width * 2 - 1, ny = -((e.clientY - r.top) / r.height * 2 - 1);
      ptrS.set(Math.max(-1.5, Math.min(1.5, nx)), Math.max(-1.5, Math.min(1.5, ny)));
    }, { passive: true });
    container.addEventListener("pointermove", (e) => {
      setPtr(e); inside = true;
      if (e.pointerType === "mouse") { hovered = pick(); container.style.cursor = hovered ? "pointer" : ""; }
    });
    container.addEventListener("pointerleave", () => { inside = false; ptrPx.set(-1e4, -1e4); if (!coarse) hovered = null; container.style.cursor = ""; });
    container.addEventListener("click", (e) => {
      setPtr(e);
      const it = pick();
      if (!it) { // empty space: send a shockwave through every object
        items.forEach((o) => { o.vel.x += (o.base.x - (ptr.x * 3)) * .9; o.vel.y += (o.base.y - ptr.y * 2.5) * .9; o.spin.y += o.small ? 6 : 9; });
        return;
      }
      hit(it);
      if (coarse) { hovered = it; tipTimer = 2.4; }
    });
    function hit(it) {
      it.spin.y += 16 + Math.random() * 4;
      it.vel.z += 4; it.scaleT = 1.25;
      const wp = new T.Vector3(); it.mesh.getWorldPosition(wp); burst(wp);
      if (it.mesh === ph) ph.userData.next();
      if (it.mesh === logo) logo.userData.pieces.forEach((p) => p.userData.vel.set((Math.random() - .5) * 9, (Math.random() - .5) * 9, Math.random() * 7));
      if (opts.onHit) opts.onHit(it.tip);
    }

    /* ---------------- loop */
    let visible = true, last = performance.now(), time = 0, introT = -1, exit = 0;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(container);
    const tmp = new T.Vector3(), lookAt = new T.Vector3(0, .1, 0);
    const reduced = !!opts.reduced;

    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
      time += dt;
      if (introT >= 0) introT += dt;
      const it0 = reduced ? 99 : Math.max(0, introT);

      // camera parallax
      const k = 1 - Math.exp(-dt * 3);
      camera.position.x += (ptrS.x * 1.1 - camera.position.x) * k;
      camera.position.y += (.15 + ptrS.y * .7 - camera.position.y) * k;
      camera.position.z = camera.userData.dist * (1 + exit * .25);
      camera.lookAt(lookAt);

      // photo rises in
      if (photoReady) {
        const p = easeOut(clamp01((it0 - .05) / 1.1));
        photoMat.opacity = p * (1 - exit * .6);
        photo.position.set(photoBase.x, photoBase.y - (1 - p) * .9 - exit * .8, photoBase.z);
      }

      // the objects
      const hoverTip = hovered && hovered.tip;
      items.forEach((it) => {
        const p = clamp01((it0 - it.delay) / 1.1);
        const e = easeOut(p);
        // dodge the pointer (screen space → world)
        if (inside && !reduced) {
          it.mesh.getWorldPosition(tmp); tmp.project(camera);
          const sx = (tmp.x + 1) / 2 * W, sy = (1 - tmp.y) / 2 * H;
          const dx = sx - ptrPx.x, dy = sy - ptrPx.y, d = Math.hypot(dx, dy), R = it.small ? 120 : 150;
          if (d < R && d > .1) {
            const f = Math.pow(1 - d / R, 2) * (it.small ? 40 : 18);
            it.vel.x += dx / d * f * dt; it.vel.y -= dy / d * f * dt;
          }
        }
        // spring home
        it.vel.addScaledVector(it.off, -38 * dt).multiplyScalar(Math.exp(-dt * 5));
        it.off.addScaledVector(it.vel, dt);
        const bob = reduced ? 0 : Math.sin(time * 1.1 + it.phase) * (it.small ? .12 : .08);
        it.mesh.position.set(
          it.from.x + (it.base.x * (1 + exit * .9) - it.from.x) * e + it.off.x,
          it.from.y + (it.base.y * (1 + exit * .6) - it.from.y) * e + it.off.y + bob,
          it.from.z + (it.base.z + exit * 2.5 - it.from.z) * e + it.off.z
        );
        // spin: the small widgets tumble forever; the skill objects spin when hit, then settle facing you
        it.spin.multiplyScalar(Math.exp(-dt * 2.2));
        it.acc.x += it.spin.x * dt; it.acc.y += it.spin.y * dt;
        if (it.small) { if (!reduced) { it.acc.x += it.spinY * .6 * dt; it.acc.y += it.spinY * dt; } }
        else if (Math.abs(it.spin.y) < 3) {
          const home = Math.round(it.acc.y / (Math.PI * 2)) * Math.PI * 2;
          it.acc.y += (home - it.acc.y) * (1 - Math.exp(-dt * 4));
        }
        const wob = reduced ? 0 : Math.sin(time * .8 + it.phase) * .14;
        const look = it.small ? 0 : 1;
        it.mesh.rotation.set(
          it.rot[0] + it.acc.x - ptrS.y * .25 * look + wob * .5,
          it.rot[1] + it.acc.y + ptrS.x * .35 * look + wob,
          it.rot[2] + wob * .3 + exit * (it.small ? 2 : .6)
        );
        it.scaleT += (((hoverTip && hovered === it) ? 1.18 : 1) - it.scaleT) * (1 - Math.exp(-dt * 6));
        it.scale = elastic(p) * it.s * it.scaleT * (1 - exit * .3);
        it.mesh.scale.setScalar(Math.max(it.scale, 0.0001));
      });

      // flutter pieces: break apart on click, snap back with a spring
      logo.userData.pieces.forEach((pc) => {
        const u = pc.userData;
        u.vel.addScaledVector(pc.position, -30 * dt).multiplyScalar(Math.exp(-dt * 4.5));
        pc.position.addScaledVector(u.vel, dt);
        pc.rotation.z = pc.position.x * .4; pc.rotation.x = pc.position.y * .3;
      });
      // typing dots
      bubble.userData.dots.forEach((d) => { d.position.y = Math.max(0, Math.sin(time * 6 - d.userData.i * .9)) * .1; });

      // confetti
      bursts.forEach((b) => {
        if (!b.visible) return;
        const u = b.userData; u.life -= dt * 1.1;
        if (u.life <= 0) { b.visible = false; return; }
        u.vel.y -= 9 * dt; b.position.addScaledVector(u.vel, dt); b.scale.setScalar(u.life);
      });

      // tooltip follows the hovered object
      if (coarse && tipTimer > 0) { tipTimer -= dt; if (tipTimer <= 0) hovered = null; }
      if (tipEl) {
        if (hoverTip) {
          hovered.mesh.getWorldPosition(tmp); tmp.project(camera);
          const x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H;
          tipEl.style.transform = `translate(${x}px, ${y - 64 * hovered.scale}px) translate(-50%, -100%)`;
          if (tipEl.dataset.key !== hoverTip) { tipEl.dataset.key = hoverTip; tipEl.textContent = opts.label(hoverTip); }
          tipEl.classList.add("is-on");
        } else tipEl.classList.remove("is-on");
      }

      renderer.render(scene, camera);
    }
    camera.position.set(0, .15, 14);
    requestAnimationFrame(frame);

    return {
      start() { if (introT < 0) introT = 0; },
      set exit(v) { exit = v; }, get exit() { return exit; },
      relabel() { if (tipEl) tipEl.dataset.key = ""; },
      poke() { const it = items[1 + Math.floor(Math.random() * 6)]; hit(it); }
    };
  }

  window.HeroScene = {
    supported() {
      try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
      catch (e) { return false; }
    },
    create
  };
})();
