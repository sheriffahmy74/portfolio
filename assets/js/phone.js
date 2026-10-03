/* A procedurally built 3D phone (no model file): metal frame, glass front, Flutter-blue back,
   a live screen texture, and four architecture layers that slide apart when `explode` > 0. */
(function () {
  "use strict";
  if (typeof window.THREE === "undefined") return;
  const T = window.THREE;

  const PW = 1.0, PH = 2.12, DEPTH = 0.1, R = 0.17;   // body
  const SW = 0.912, SH = 2.026, SR = 0.13;            // screen (matches 1080×2400 shots)

  function roundedRect(w, h, r) {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function flat(w, h, r) {
    const g = new T.ShapeGeometry(roundedRect(w, h, r), 18);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
    return g;
  }

  // Small studio environment so the metal and glass have something to reflect.
  function studioEnv(renderer) {
    const scene = new T.Scene();
    const room = new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ color: 0x9aa3ad, side: T.BackSide }));
    scene.add(room);
    const light = (w, h, x, y, z, ry, k, color) => {
      const m = new T.MeshBasicMaterial({ color: color || 0xffffff });
      m.color.multiplyScalar(k);
      const mesh = new T.Mesh(new T.PlaneGeometry(w, h), m);
      mesh.position.set(x, y, z); mesh.rotation.y = ry; mesh.lookAt(0, 0, 0);
      scene.add(mesh);
    };
    light(6, 1.2, 0, 4.5, 2, 0, 6);
    light(1.5, 6, -4.8, 0, 1, 0, 4);
    light(1.5, 6, 4.8, 1, -1, 0, 3, 0xcfe3ff);
    light(5, 1, 0, -4.6, 3, 0, 1.5, 0xffe7b0);
    const pm = new T.PMREMGenerator(renderer);
    const tex = pm.fromScene(scene, 0.04).texture;
    pm.dispose();
    return tex;
  }

  function layerTexture(opts) {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 1138;
    const g = c.getContext("2d");
    const r = 70;
    g.fillStyle = opts.fill;
    g.beginPath(); g.roundRect(4, 4, 504, 1130, r); g.fill();
    g.lineWidth = 6; g.strokeStyle = opts.stroke; g.stroke();
    g.fillStyle = opts.ink;
    g.font = '400 132px "Anton", Impact, "Arial Narrow", sans-serif';
    g.fillText(opts.title, 46, 210);
    g.font = '500 30px "JetBrains Mono", ui-monospace, monospace';
    g.globalAlpha = .8;
    g.fillText(opts.sub, 50, 262);
    g.globalAlpha = 1;
    // code lines
    g.font = '500 25px "JetBrains Mono", ui-monospace, monospace';
    let y = 380;
    opts.code.forEach((line) => {
      g.fillStyle = opts.ink; g.globalAlpha = .9; g.fillText(line, 50, y); y += 46;
    });
    g.globalAlpha = .18; g.fillStyle = opts.ink;
    for (let i = 0; i < 7; i++) { g.beginPath(); g.roundRect(50, y + 30 + i * 62, 220 + ((i * 97) % 200), 22, 11); g.fill(); }
    g.globalAlpha = 1;
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  function create(canvas, screens) {
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new T.Scene();
    scene.environment = studioEnv(renderer);
    const camera = new T.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, 12);

    scene.add(new T.HemisphereLight(0xffffff, 0x8899aa, .55));
    const key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 6); scene.add(key);
    const rim = new T.DirectionalLight(0xbfdcff, 1.1); rim.position.set(-4, 1, -3); scene.add(rim);

    const root = new T.Group();      // positioned/rotated by the page
    scene.add(root);
    const body = new T.Group();      // frame + back (slides back on explode)
    const front = new T.Group();     // glass + screen (slides forward on explode)
    root.add(body, front);

    // frame
    const bevel = 0.022;
    const frameGeo = new T.ExtrudeGeometry(roundedRect(PW - bevel * 2, PH - bevel * 2, R - bevel), {
      depth: DEPTH - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 20
    });
    frameGeo.center();
    const metal = new T.MeshStandardMaterial({ color: 0x2c3138, metalness: .92, roughness: .3 });
    body.add(new T.Mesh(frameGeo, metal));

    // back glass in Flutter blue + camera bump
    const back = new T.Mesh(flat(PW - .05, PH - .05, R - .025), new T.MeshPhysicalMaterial({ color: 0x0468D7, roughness: .38, metalness: .05, clearcoat: 1, clearcoatRoughness: .12 }));
    back.position.z = -DEPTH / 2 - .002; back.rotation.y = Math.PI;
    body.add(back);
    const bumpGeo = new T.ExtrudeGeometry(roundedRect(.44, .44, .12), { depth: .018, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 3, curveSegments: 12 });
    const bump = new T.Mesh(bumpGeo, new T.MeshPhysicalMaterial({ color: 0x0356B3, roughness: .25, clearcoat: 1 }));
    bump.position.set(PW / 2 - .3, PH / 2 - .3, -DEPTH / 2 - .03);
    body.add(bump);
    const lensGlass = new T.MeshPhysicalMaterial({ color: 0x0a0c10, roughness: .05, metalness: .2, clearcoat: 1 });
    const lensRing = new T.MeshStandardMaterial({ color: 0x9aa4b0, metalness: 1, roughness: .2 });
    [[-.1, .1], [-.1, -.1], [.1, .1]].forEach(([dx, dy]) => {
      const ring = new T.Mesh(new T.CylinderGeometry(.078, .078, .03, 32), lensRing);
      ring.rotation.x = Math.PI / 2; ring.position.set(bump.position.x + dx, bump.position.y + dy, -DEPTH / 2 - .045);
      const glass = new T.Mesh(new T.CylinderGeometry(.06, .06, .032, 32), lensGlass);
      glass.rotation.x = Math.PI / 2; glass.position.copy(ring.position); glass.position.z -= .002;
      body.add(ring, glass);
    });
    // side buttons
    const btn = (x, y, h) => { const b = new T.Mesh(new T.BoxGeometry(.022, h, .045), metal); b.position.set(x, y, 0); body.add(b); };
    btn(PW / 2 + .006, .38, .26); btn(-PW / 2 - .006, .5, .15); btn(-PW / 2 - .006, .28, .15);

    // front: black glass, screen (two planes for cross-fades), island, sheen
    const bezel = new T.Mesh(flat(PW - .03, PH - .03, R - .015), new T.MeshPhysicalMaterial({ color: 0x050608, roughness: .12, clearcoat: 1 }));
    bezel.position.z = DEPTH / 2 + .002;
    front.add(bezel);
    const screenGeo = flat(SW, SH, SR);
    const screenA = new T.Mesh(screenGeo, new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
    const screenB = new T.Mesh(screenGeo, new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0 }));
    screenA.position.z = DEPTH / 2 + .004; screenB.position.z = DEPTH / 2 + .005;
    front.add(screenA, screenB);
    const island = new T.Mesh(flat(.27, .078, .039), new T.MeshBasicMaterial({ color: 0x000000 }));
    island.position.set(0, SH / 2 - .085, DEPTH / 2 + .007);
    front.add(island);
    const sheenCanvas = document.createElement("canvas");
    sheenCanvas.width = 256; sheenCanvas.height = 512;
    const sg = sheenCanvas.getContext("2d");
    const grad = sg.createLinearGradient(0, 0, 256, 512);
    grad.addColorStop(0, "rgba(255,255,255,0)"); grad.addColorStop(.42, "rgba(255,255,255,0)");
    grad.addColorStop(.5, "rgba(255,255,255,.55)"); grad.addColorStop(.58, "rgba(255,255,255,0)"); grad.addColorStop(1, "rgba(255,255,255,0)");
    sg.fillStyle = grad; sg.fillRect(0, 0, 256, 512);
    const sheen = new T.Mesh(screenGeo, new T.MeshBasicMaterial({ map: new T.CanvasTexture(sheenCanvas), transparent: true, opacity: .14, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
    sheen.position.z = DEPTH / 2 + .008;
    front.add(sheen);

    // architecture layers between front and back
    const layerDefs = [
      { title: "CUBIT", sub: "presentation · state", fill: "rgba(255,200,61,.94)", stroke: "#101418", ink: "#101418",
        code: ["class MyBookingsCubit", "  extends Cubit<MyBookingsState>", "", "emit(MyBookingsLoaded(list))"], z: .34 },
      { title: "REPOSITORY", sub: "domain · contracts", fill: "rgba(255,255,255,.95)", stroke: "#0468D7", ink: "#0B2A55",
        code: ["abstract interface class", "  BookingRepository", "", "Future<Either<Failure, T>>"], z: -.34 },
      { title: "SUPABASE", sub: "data · server", fill: "rgba(220,235,255,.95)", stroke: "#0B2A55", ink: "#0B2A55",
        code: ["rpc('create_booking_atomic')", "rpc('get_activity_groups')", "", "RLS: auth.uid() = user_id"], z: -.98 }
    ];
    const layers = [];
    function buildLayers() {
      layers.forEach((l) => { front.parent && root.remove(l.mesh); l.mesh.material.map.dispose(); });
      layers.length = 0;
      layerDefs.forEach((d) => {
        const mat = new T.MeshBasicMaterial({ map: layerTexture(d), transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, toneMapped: false });
        const mesh = new T.Mesh(screenGeo, mat);
        mesh.visible = false;
        root.add(mesh);
        layers.push({ mesh, z: d.z });
      });
    }
    buildLayers();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildLayers);

    // screen textures
    const loader = new T.TextureLoader();
    const cache = {};
    function tex(keyName) {
      if (!cache[keyName]) {
        cache[keyName] = new Promise((resolve) => {
          loader.load(screens[keyName], (t) => { t.colorSpace = T.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); resolve(t); }, undefined, () => resolve(null));
        });
      }
      return cache[keyName];
    }
    let currentKey = null, wantedKey = null, fade = null;
    function setScreen(keyName) {
      if (!keyName || keyName === wantedKey) return;
      wantedKey = keyName;
      tex(keyName).then((t) => {
        if (!t || keyName !== wantedKey) return;
        if (!currentKey) { screenA.material.map = t; screenA.material.needsUpdate = true; currentKey = keyName; return; }
        screenB.material.map = t; screenB.material.needsUpdate = true;
        fade = { t: 0, key: keyName, tex: t };
      });
    }

    // state
    const cur = { x: 0, y: 0, h: 300, rx: 0, ry: 0, rz: 0, explode: 0, vis: 1 };
    const tgt = Object.assign({}, cur);
    let first = true, vw = 1, vh = 1;

    function resize() {
      vw = window.innerWidth; vh = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh; camera.updateProjectionMatrix();
    }
    resize();

    function setTarget(s) { Object.assign(tgt, s); if (first) { Object.assign(cur, s); first = false; } }

    const ease = (t) => t * t * (3 - 2 * t);
    function tick(dt, time) {
      const k = 1 - Math.exp(-dt * 9);
      for (const p in tgt) cur[p] += (tgt[p] - cur[p]) * k;

      const visH = 2 * camera.position.z * Math.tan(T.MathUtils.degToRad(camera.fov / 2));
      const u = visH / vh;
      const s = (cur.h * u / PH) * Math.max(0, cur.vis);
      root.visible = s > 0.002;
      root.position.set((cur.x - vw / 2) * u, -(cur.y - vh / 2) * u + Math.sin(time * 1.3) * .03 * (1 - cur.explode), 0);
      root.scale.setScalar(Math.max(s, 0.0001));
      root.rotation.set(cur.rx, cur.ry, cur.rz, "YXZ");

      const e = ease(Math.min(1, Math.max(0, cur.explode)));
      front.position.z = e * .98;
      body.position.z = -e * 1.62;
      layers.forEach((l) => {
        l.mesh.visible = e > 0.01;
        l.mesh.position.z = l.z * e;
        l.mesh.material.opacity = Math.min(1, e * 1.4);
      });

      if (fade) {
        fade.t = Math.min(1, fade.t + dt * 3.2);
        screenB.material.opacity = fade.t;
        if (fade.t >= 1) {
          screenA.material.map = fade.tex; screenA.material.needsUpdate = true;
          screenB.material.opacity = 0; currentKey = fade.key; fade = null;
        }
      }
      renderer.render(scene, camera);
    }

    return { setTarget, setScreen, tick, resize, preload: (keys) => keys.forEach(tex) };
  }

  window.Phone3D = {
    supported() {
      try {
        const c = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
      } catch (e) { return false; }
    },
    create
  };
})();
