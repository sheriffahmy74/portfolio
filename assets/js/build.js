/* "From code to your pocket": a scroll-driven 3D story (Three.js + cannon-es physics).
   1. A laptop types real Flutter code as you scroll.
   2. A phone flies out of the laptop screen and its top opens.
   3. My apps and the tools I use rain into the phone and pile up with real physics.
   4. The phone closes. Drag to tilt and shake it, hover a tile to read it, click to flick it. */
(function () {
  "use strict";
  if (typeof window.THREE === "undefined" || typeof window.CANNON === "undefined") return;
  const T = window.THREE, C = window.CANNON;

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const map = (v, a, b) => clamp01((v - a) / (b - a));
  const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ------------------------------------------------------------ tile artwork (canvas) */
  const ART = 256;
  function tileCanvas(bg) {
    const c = document.createElement("canvas"); c.width = c.height = ART;
    const x = c.getContext("2d");
    if (typeof bg === "string") { x.fillStyle = bg; x.fillRect(0, 0, ART, ART); }
    else { const g = x.createLinearGradient(0, 0, ART, ART); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); x.fillStyle = g; x.fillRect(0, 0, ART, ART); }
    return [c, x];
  }
  function label(x, text, color, size, y) {
    x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `800 ${size}px "Plus Jakarta Sans", system-ui, sans-serif`;
    x.fillText(text, ART / 2, y == null ? ART / 2 : y);
  }
  function drawFlutter(x, s, ox, oy) {
    const P = (pts, col) => { x.fillStyle = col; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo : x.moveTo).call(x, ox + a * s, oy + b * s)); x.closePath(); x.fill(); };
    P([[37.7, 128.9], [9.8, 101], [100.4, 10.4], [156.2, 10.4]], "#54C5F8");
    P([[156.2, 94], [100.4, 94], [79.5, 114.9], [107.4, 142.8]], "#54C5F8");
    P([[79.5, 114.9], [51.6, 142.8], [79.5, 170.7], [107.4, 142.8]], "#29B6F6");
    P([[79.5, 170.7], [100.4, 191.6], [156.2, 191.6], [107.4, 142.8]], "#01579B");
  }
  function loadImg(src) { return new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }

  // each tile: name shown on hover, and how to paint its face
  const TILES = [
    { name: "Lamma · group outings", draw: async (x) => {
      const i = await loadImg("assets/img/brand/lamma-wordmark.svg");
      if (i) { const t = document.createElement("canvas"); t.width = t.height = ART; const tx = t.getContext("2d");
        tx.drawImage(i, 38, 52, 180, 157); tx.globalCompositeOperation = "source-in"; tx.fillStyle = "#fff"; tx.fillRect(0, 0, ART, ART); x.drawImage(t, 0, 0); }
      else label(x, "Lamma", "#fff", 60);
    }, bg: ["#8E2A3A", "#5E1622"] },
    { name: "Nabdy · healthcare super-app", draw: async (x) => { const i = await loadImg("assets/img/nabdy/icon.png"); if (i) x.drawImage(i, 0, 0, ART, ART); else label(x, "Nabdy", "#fff", 60); }, bg: "#4B2A86" },
    { name: "Task Manager", draw: (x) => {
      x.strokeStyle = "#fff"; x.lineWidth = 16; x.lineCap = "round"; x.lineJoin = "round";
      x.beginPath(); x.moveTo(62, 130); x.lineTo(100, 168); x.lineTo(190, 80); x.stroke();
    }, bg: ["#3B6CF6", "#1E40AF"] },
    { name: "Gym app", draw: (x) => {
      x.fillStyle = "#F5A524"; x.fillRect(70, 118, 116, 20);
      [[46, 88, 26, 80], [184, 88, 26, 80], [28, 104, 18, 48], [210, 104, 18, 48]].forEach(([a, b, w, h]) => { x.beginPath(); x.roundRect(a, b, w, h, 6); x.fill(); });
    }, bg: "#16181D" },
    { name: "E-Commerce app", draw: (x) => {
      x.fillStyle = "#fff"; x.beginPath(); x.roundRect(64, 96, 128, 110, 16); x.fill();
      x.strokeStyle = "#fff"; x.lineWidth = 14; x.beginPath(); x.arc(128, 98, 34, Math.PI, 0); x.stroke();
    }, bg: ["#F59E0B", "#EA580C"] },
    { name: "Rick & Morty explorer", draw: (x) => {
      const g = x.createRadialGradient(128, 128, 10, 128, 128, 110); g.addColorStop(0, "#E8FFB0"); g.addColorStop(.5, "#7ED957"); g.addColorStop(1, "#1F7A3A");
      x.fillStyle = g; x.beginPath(); x.arc(128, 128, 100, 0, 7); x.fill();
      x.strokeStyle = "rgba(255,255,255,.7)"; x.lineWidth = 6; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(128, 128, 30 + k * 18, k, k + 3.6); x.stroke(); }
    }, bg: "#0F2A1A" },
    { name: "Flutter", draw: (x) => drawFlutter(x, .92, 52, 36), bg: "#ffffff" },
    { name: "Dart", draw: (x) => label(x, "Dart", "#fff", 74), bg: ["#0175C2", "#02569B"] },
    { name: "Bloc / Cubit", draw: (x) => label(x, "Bloc", "#fff", 74), bg: ["#13B9FD", "#0B7FB0"] },
    { name: "Supabase", draw: (x) => {
      x.fillStyle = "#3ECF8E"; x.beginPath(); x.moveTo(140, 30); x.lineTo(60, 150); x.lineTo(124, 150); x.lineTo(112, 226); x.lineTo(196, 104); x.lineTo(132, 104); x.closePath(); x.fill();
    }, bg: "#1C1C1C" },
    { name: "Firebase", draw: (x) => {
      x.fillStyle = "#FFA000"; x.beginPath(); x.moveTo(70, 200); x.lineTo(100, 40); x.lineTo(130, 110); x.closePath(); x.fill();
      x.fillStyle = "#FFCA28"; x.beginPath(); x.moveTo(70, 200); x.lineTo(160, 70); x.lineTo(190, 200); x.lineTo(128, 232); x.closePath(); x.fill();
    }, bg: "#2C3440" },
    { name: "Google Maps", draw: (x) => {
      x.fillStyle = "#EA4335"; x.beginPath(); x.arc(128, 104, 60, Math.PI * .85, Math.PI * .15); x.lineTo(128, 218); x.closePath(); x.fill();
      x.fillStyle = "#fff"; x.beginPath(); x.arc(128, 104, 24, 0, 7); x.fill();
    }, bg: "#ffffff" },
    { name: "Clean Architecture", draw: (x) => label(x, "{ }", "#fff", 110, 122), bg: ["#8B6FE8", "#5B3FCB"] },
    { name: "746+ tests passing", draw: (x) => { label(x, "746+", "#fff", 70, 108); label(x, "tests", "rgba(255,255,255,.8)", 38, 172); }, bg: ["#22C55E", "#15803D"] },
    { name: "Realtime chat", draw: (x) => {
      x.fillStyle = "#fff"; x.beginPath(); x.roundRect(44, 64, 168, 112, 34); x.fill(); x.beginPath(); x.moveTo(78, 170); x.lineTo(62, 210); x.lineTo(112, 172); x.fill();
      x.fillStyle = "#2F5BEA"; [92, 128, 164].forEach((a) => { x.beginPath(); x.arc(a, 120, 12, 0, 7); x.fill(); });
    }, bg: ["#54C5F8", "#2F5BEA"] },
    { name: "Paymob payments", draw: (x) => { x.fillStyle = "#fff"; x.beginPath(); x.roundRect(40, 76, 176, 110, 16); x.fill(); x.fillStyle = "#0E1B2C"; x.fillRect(40, 100, 176, 22); x.fillStyle = "#F5A524"; x.fillRect(60, 144, 50, 18); }, bg: ["#0E1B2C", "#1D3557"] },
    { name: "Push notifications (FCM)", draw: (x) => {
      x.fillStyle = "#fff"; x.beginPath(); x.moveTo(128, 50); x.bezierCurveTo(80, 50, 76, 96, 76, 130); x.lineTo(60, 172); x.lineTo(196, 172); x.lineTo(180, 130); x.bezierCurveTo(180, 96, 176, 50, 128, 50); x.fill();
      x.beginPath(); x.arc(128, 188, 18, 0, Math.PI); x.fill(); x.fillStyle = "#EF4444"; x.beginPath(); x.arc(176, 70, 22, 0, 7); x.fill();
    }, bg: ["#F59E0B", "#D97706"] },
    { name: "App Store & Google Play", draw: (x) => {
      x.fillStyle = "#F5A524"; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 40 : 92; x.lineTo(128 + Math.cos(a) * r, 132 + Math.sin(a) * r); } x.closePath(); x.fill();
    }, bg: "#0E1B2C" },
    { name: "GitHub Actions CI", draw: (x) => { label(x, "CI", "#fff", 92, 118); x.fillStyle = "#22C55E"; x.beginPath(); x.arc(196, 196, 22, 0, 7); x.fill(); }, bg: ["#24292F", "#0D1117"] },
    { name: "go_router", draw: (x) => { label(x, "go_", "#fff", 70, 112); label(x, "router", "rgba(255,255,255,.85)", 40, 172); }, bg: ["#2F5BEA", "#1E3A8A"] },
    { name: "Dio · REST", draw: (x) => label(x, "Dio", "#0E1B2C", 80), bg: ["#FDE68A", "#F5A524"] },
    { name: "Arabic & English (RTL)", draw: (x) => { label(x, "ع", "#fff", 96, 108); label(x, "EN", "rgba(255,255,255,.85)", 44, 186); }, bg: ["#0EA5A4", "#0F766E"] }
  ];

  function glossy(color, o) {
    return new T.MeshPhysicalMaterial(Object.assign({ color, roughness: .22, metalness: .05, clearcoat: 1, clearcoatRoughness: .08 }, o || {}));
  }
  function roundRectShape(w, h, r) {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  // a U (bottom) or ∩ (top) piece of the phone frame; sgn = -1 bottom, +1 top
  function framePiece(W, H, R, w, h, r, yc, sgn) {
    const s = new T.Shape(), Y = (v) => v * sgn;
    s.moveTo(-W / 2, Y(yc)); s.lineTo(-W / 2, Y(H / 2 - R)); s.quadraticCurveTo(-W / 2, Y(H / 2), -W / 2 + R, Y(H / 2));
    s.lineTo(W / 2 - R, Y(H / 2)); s.quadraticCurveTo(W / 2, Y(H / 2), W / 2, Y(H / 2 - R)); s.lineTo(W / 2, Y(yc));
    s.lineTo(w / 2, Y(yc)); s.lineTo(w / 2, Y(h / 2 - r)); s.quadraticCurveTo(w / 2, Y(h / 2), w / 2 - r, Y(h / 2));
    s.lineTo(-w / 2 + r, Y(h / 2)); s.quadraticCurveTo(-w / 2, Y(h / 2), -w / 2, Y(h / 2 - r)); s.lineTo(-w / 2, Y(yc));
    s.closePath();
    return s;
  }

  function makeEnv(renderer) {
    const env = new T.Scene();
    env.add(new T.Mesh(new T.BoxGeometry(20, 20, 20), new T.MeshBasicMaterial({ color: "#59606e", side: T.BackSide })));
    const panel = (w, h, p, col, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(k) })); m.position.copy(p); m.lookAt(0, 0, 0); env.add(m); };
    panel(10, 4, new T.Vector3(-4, 7, 6), "#ffffff", 6);
    panel(4, 8, new T.Vector3(8, 1, 3), "#cfe0ff", 3);
    panel(6, 3, new T.Vector3(-8, -2, -4), "#ffd9a0", 2.5);
    panel(12, 2, new T.Vector3(0, -8, 4), "#ffffff", 1.5);
    const pm = new T.PMREMGenerator(renderer); const t = pm.fromScene(env, .04).texture; pm.dispose(); return t;
  }

  /* ------------------------------------------------------------ the code on the laptop */
  const CODE = [
    [["kw", "void "], ["fn", "main"], ["p", "() => "], ["fn", "runApp"], ["p", "("], ["kw", "const "], ["ty", "Lamma"], ["p", "());"]],
    [],
    [["kw", "class "], ["ty", "Lamma "], ["kw", "extends "], ["ty", "StatelessWidget "], ["p", "{"]],
    [["p", "  "], ["kw", "const "], ["ty", "Lamma"], ["p", "({"], ["kw", "super"], ["p", ".key});"]],
    [],
    [["p", "  "], ["an", "@override"]],
    [["p", "  "], ["ty", "Widget "], ["fn", "build"], ["p", "("], ["ty", "BuildContext "], ["p", "context) {"]],
    [["p", "    "], ["kw", "return "], ["ty", "MaterialApp"], ["p", ".router("]],
    [["p", "      routerConfig: "], ["p", "router,"]],
    [["p", "      theme: "], ["ty", "AppTheme"], ["p", ".light,"]],
    [["p", "      locale: "], ["kw", "const "], ["ty", "Locale"], ["p", "("], ["st", "'ar'"], ["p", "),"]],
    [["p", "    );"]],
    [["p", "  }"]],
    [["p", "}"]],
    [],
    [["cm", "// flutter build ipa && flutter build appbundle"]]
  ];
  const COL = { kw: "#C792EA", fn: "#82AAFF", ty: "#FFCB6B", p: "#D6DEEB", an: "#F78C6C", st: "#C3E88D", cm: "#697098" };
  const TOTAL = CODE.reduce((n, l) => n + l.reduce((m, [, t]) => m + t.length, 0) + 1, 0);

  /* ------------------------------------------------------------ create */
  function create(container, opts) {
    const canvas = document.createElement("canvas"); canvas.className = "build3d"; container.appendChild(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    const dpr = Math.min(window.devicePixelRatio || 1, 2); renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.setClearColor(0, 0);
    const scene = new T.Scene(); scene.environment = makeEnv(renderer);
    const camera = new T.PerspectiveCamera(32, 1, .1, 100);
    const key = new T.DirectionalLight("#fff", 1.5); key.position.set(-3, 6, 6); scene.add(key);
    scene.add(new T.HemisphereLight("#ffffff", "#c9d4ff", .65));

    /* ---------- laptop */
    const laptop = new T.Group(); scene.add(laptop);
    const alu = new T.MeshPhysicalMaterial({ color: "#cfd4dc", metalness: .65, roughness: .28, clearcoat: .6 });
    const baseGeo = new T.ExtrudeGeometry(roundRectShape(4.2, 2.8, .18), { depth: .12, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 4 });
    baseGeo.rotateX(-Math.PI / 2); baseGeo.translate(0, -.12, 0);
    const base = new T.Mesh(baseGeo, alu); laptop.add(base);
    // keyboard + trackpad
    const kb = document.createElement("canvas"); kb.width = 1024; kb.height = 400; const kx = kb.getContext("2d");
    kx.fillStyle = "#b9bec7"; kx.fillRect(0, 0, 1024, 400);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) { kx.fillStyle = "#23262d"; kx.beginPath(); kx.roundRect(40 + c * 68, 20 + r * 72, 60, 62, 9); kx.fill(); }
    const kbTex = new T.CanvasTexture(kb); kbTex.colorSpace = T.SRGBColorSpace;
    const keys = new T.Mesh(new T.PlaneGeometry(3.7, 1.45), new T.MeshStandardMaterial({ map: kbTex, roughness: .6 }));
    keys.rotation.x = -Math.PI / 2; keys.position.set(0, .041, -.45); laptop.add(keys);
    const pad = new T.Mesh(new T.PlaneGeometry(1.3, .8), new T.MeshPhysicalMaterial({ color: "#c3c8d0", roughness: .2, clearcoat: 1 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(0, .041, .82); laptop.add(pad);
    // lid hinged at the back edge
    const lid = new T.Group(); lid.position.set(0, .03, -1.36); laptop.add(lid);
    const lidGeo = new T.ExtrudeGeometry(roundRectShape(4.2, 2.75, .18), { depth: .08, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 4 });
    lidGeo.translate(0, 1.375, -.1);
    lid.add(new T.Mesh(lidGeo, alu));
    const bez = new T.Mesh(new T.PlaneGeometry(4.08, 2.63), new T.MeshBasicMaterial({ color: "#0b0d12" })); bez.position.set(0, 1.375, .002); lid.add(bez);
    const code = document.createElement("canvas"); code.width = 1280; code.height = 800; const cx = code.getContext("2d");
    const codeTex = new T.CanvasTexture(code); codeTex.colorSpace = T.SRGBColorSpace; codeTex.anisotropy = 8;
    const screen = new T.Mesh(new T.PlaneGeometry(3.86, 2.41), new T.MeshBasicMaterial({ map: codeTex, toneMapped: false }));
    screen.position.set(0, 1.39, .004); lid.add(screen);
    lid.rotation.x = -.16;

    let typed = -1, blink = 0, cursorShown = true;
    function drawCode(n, cursorOn) {
      cx.fillStyle = "#0F1222"; cx.fillRect(0, 0, 1280, 800);
      cx.fillStyle = "#171B30"; cx.fillRect(0, 0, 1280, 56);
      ["#FF5F57", "#FEBC2E", "#28C840"].forEach((c, i) => { cx.fillStyle = c; cx.beginPath(); cx.arc(34 + i * 30, 28, 9, 0, 7); cx.fill(); });
      cx.fillStyle = "#8A93B8"; cx.font = "500 24px ui-monospace, Menlo, Consolas, monospace"; cx.fillText("lib/main.dart", 150, 36);
      cx.font = "500 29px ui-monospace, Menlo, Consolas, monospace";
      let left = n, y = 104, curX = 96, curY = 104;
      CODE.forEach((line, li) => {
        cx.fillStyle = "#3B4261"; cx.fillText(String(li + 1).padStart(2, " "), 24, y);
        let x = 96;
        for (const [k, t] of line) {
          if (left <= 0) break;
          const s = t.slice(0, left); left -= s.length;
          cx.fillStyle = COL[k]; cx.fillText(s, x, y); x += cx.measureText(s).width;
        }
        if (left > 0) { left -= 1; curX = 96; curY = y + 42; }       // line finished: cursor to the next line
        else if (curY <= y) { curX = x; curY = y; }
        y += 42;
      });
      if (cursorOn) { cx.fillStyle = "#54C5F8"; cx.fillRect(curX + 2, curY - 26, 14, 34); }
      codeTex.needsUpdate = true;
    }

    /* ---------- phone (the glass) */
    const W = 2.4, H = 4.6, R = .38, D = .8, wIn = 2.1, hIn = 4.3, rIn = .24, YC = H / 2 - .55;
    const phone = new T.Group(); scene.add(phone);
    const frameMat = new T.MeshPhysicalMaterial({ color: "#1b1f27", metalness: .75, roughness: .25, clearcoat: 1, clearcoatRoughness: .1 });
    const fOpts = { depth: D, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 5, curveSegments: 24 };
    const lower = new T.Mesh(new T.ExtrudeGeometry(framePiece(W, H, R, wIn, hIn, rIn, YC, -1), fOpts), frameMat);
    lower.position.z = -D / 2; phone.add(lower);
    const lidPivot = new T.Group(); lidPivot.position.set(0, YC, -D / 2); phone.add(lidPivot);
    const topGeo = new T.ExtrudeGeometry(framePiece(W, H, R, wIn, hIn, rIn, YC, 1), fOpts); topGeo.translate(0, -YC, 0);
    const topPiece = new T.Mesh(topGeo, frameMat); lidPivot.add(topPiece);
    const back = new T.Mesh(new T.ExtrudeGeometry(roundRectShape(W - .04, H - .04, R), { depth: .06, bevelEnabled: false }),
      new T.MeshPhysicalMaterial({ color: "#11151f", roughness: .35, metalness: .2, clearcoat: .8 }));
    back.position.z = -D / 2 + .02; phone.add(back);
    // a soft glow on the back so the tiles pop
    const glowC = document.createElement("canvas"); glowC.width = glowC.height = 256; const gx = glowC.getContext("2d");
    const gg = gx.createRadialGradient(128, 150, 10, 128, 128, 170); gg.addColorStop(0, "rgba(84,197,248,.55)"); gg.addColorStop(1, "rgba(47,91,234,0)");
    gx.fillStyle = gg; gx.fillRect(0, 0, 256, 256);
    const glow = new T.Mesh(new T.PlaneGeometry(wIn, hIn), new T.MeshBasicMaterial({ map: new T.CanvasTexture(glowC), transparent: true, depthWrite: false, toneMapped: false }));
    glow.position.z = -D / 2 + .1; phone.add(glow);
    const glass = new T.Mesh(new T.ExtrudeGeometry(roundRectShape(W, H, R), { depth: .01, bevelEnabled: false }),
      new T.MeshPhysicalMaterial({ color: "#ffffff", roughness: .04, metalness: 0, transparent: true, opacity: .14, clearcoat: 1, envMapIntensity: 2.2, depthWrite: false }));
    glass.position.z = D / 2 + .02; glass.renderOrder = 5; phone.add(glass);
    const island = new T.Mesh(new T.CapsuleGeometry(.07, .34, 4, 12), new T.MeshBasicMaterial({ color: "#000" }));
    island.rotation.z = Math.PI / 2; island.position.set(0, H / 2 - .22, D / 2 + .04); phone.add(island);

    /* ---------- physics: a 2D world inside the phone */
    const world = new C.World({ gravity: new C.Vec3(0, -14, 0) });
    world.allowSleep = false;
    world.defaultContactMaterial.friction = .35; world.defaultContactMaterial.restitution = .22;
    const tank = new C.Body({ type: C.Body.KINEMATIC });
    const wallT = .3;
    tank.addShape(new C.Box(new C.Vec3(wallT / 2, H, 1)), new C.Vec3(-wIn / 2 - wallT / 2, 0, 0));
    tank.addShape(new C.Box(new C.Vec3(wallT / 2, H, 1)), new C.Vec3(wIn / 2 + wallT / 2, 0, 0));
    tank.addShape(new C.Box(new C.Vec3(wIn, wallT / 2, 1)), new C.Vec3(0, -hIn / 2 - wallT / 2, 0));
    // rounded bottom corners
    const cr = new C.Box(new C.Vec3(.22, .05, 1));
    tank.addShape(cr, new C.Vec3(-wIn / 2 + .08, -hIn / 2 + .08, 0), new C.Quaternion().setFromEuler(0, 0, -Math.PI / 4));
    tank.addShape(cr, new C.Vec3(wIn / 2 - .08, -hIn / 2 + .08, 0), new C.Quaternion().setFromEuler(0, 0, Math.PI / 4));
    const lidShapeIndex = tank.shapes.length;
    tank.addShape(new C.Box(new C.Vec3(wIn, wallT / 2, 1)), new C.Vec3(0, hIn / 2 + wallT / 2, 0));
    world.addBody(tank);
    let lidSolid = true;
    function setLidSolid(on) {
      if (on === lidSolid) return; lidSolid = on;
      tank.shapes[lidShapeIndex].collisionResponse = on;
    }

    /* ---------- the falling tiles */
    const TS = .5, tileGeo = new T.ExtrudeGeometry(roundRectShape(TS, TS, .11), { depth: .24, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 4, curveSegments: 10 });
    tileGeo.translate(0, 0, -.12);
    { // planar UVs on the faces
      const p = tileGeo.attributes.position, uv = tileGeo.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + TS / 2) / TS, (p.getY(i) + TS / 2) / TS);
    }
    const pal = ["#2F5BEA", "#54C5F8", "#F5A524", "#8B6FE8", "#22C55E", "#EF4444"];
    const items = [];
    const pickables = [];
    TILES.forEach((t, i) => {
      const [cv, x] = tileCanvas(t.bg);
      const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
      Promise.resolve(t.draw(x)).then(() => { tex.needsUpdate = true; });
      const side = glossy(Array.isArray(t.bg) ? t.bg[1] : t.bg);
      const face = new T.MeshPhysicalMaterial({ map: tex, roughness: .25, clearcoat: 1, clearcoatRoughness: .1 });
      const m = new T.Mesh(tileGeo, [face, side]);
      items.push({ mesh: m, name: t.name, shape: new C.Box(new C.Vec3(TS / 2 + .02, TS / 2 + .02, .2)), scale: 1 });
    });
    // a few glossy marbles between the tiles
    const ballGeo = new T.SphereGeometry(.17, 32, 20);
    for (let i = 0; i < 6; i++) items.push({ mesh: new T.Mesh(ballGeo, glossy(pal[i % pal.length])), name: null, shape: new C.Sphere(.17), scale: 1 });
    // shuffle so apps and tools mix (fixed order: first app tiles stay early)
    const order = [0, 6, 1, 22, 9, 2, 7, 23, 3, 10, 13, 24, 4, 11, 8, 25, 5, 12, 14, 26, 15, 16, 27, 17, 18, 28, 19, 20, 29, 21];
    const queue = order.filter((i) => items[i]).map((i) => items[i]);
    items.forEach((it) => { if (!queue.includes(it)) queue.push(it); });
    queue.forEach((it, i) => {
      it.body = null; it.mesh.visible = false; phone.add(it.mesh);
      it.seed = i;
      if (it.name) { it.mesh.userData.item = it; pickables.push(it.mesh); }
    });
    let dropped = 0;
    function spawn(it) {
      const r = Math.sin(it.seed * 12.9898) * 43758.5453; const rnd = r - Math.floor(r);
      const b = new C.Body({ mass: it.name ? 1 : .6, shape: it.shape, linearDamping: .05, angularDamping: .1 });
      b.linearFactor.set(1, 1, 0); b.angularFactor.set(0, 0, 1);
      // spawn above the phone in its local frame, then into world space
      const lx = (rnd - .5) * (wIn - .7), ly = hIn / 2 + 1.1 + (it.seed % 3) * .5;
      const q = tank.quaternion, v = q.vmult(new C.Vec3(lx, ly, 0));
      b.position.set(tank.position.x + v.x, tank.position.y + v.y, 0);
      b.quaternion.setFromEuler(0, 0, (rnd - .5) * 2);
      b.velocity.set((rnd - .5) * 1.5, -2 - rnd * 2, 0);
      b.angularVelocity.set(0, 0, (rnd - .5) * 8);
      world.addBody(b); it.body = b; it.mesh.visible = true; it.pop = 0;
    }
    function despawn(it) { if (it.body) world.removeBody(it.body); it.body = null; it.mesh.visible = false; }

    /* ---------- layout + pointer */
    let Wpx = 1, Hpx = 1;
    function layout() {
      Wpx = container.clientWidth; Hpx = container.clientHeight;
      renderer.setSize(Wpx, Hpx, false); camera.aspect = Wpx / Hpx; camera.updateProjectionMatrix();
    }
    new ResizeObserver(layout).observe(container); layout();
    const tanh = Math.tan(T.MathUtils.degToRad(16));
    const fitDist = (w, h) => Math.max(h / 2 / tanh, w / 2 / tanh / camera.aspect);

    const ptr = new T.Vector2(), ptrS = new T.Vector2(), ray = new T.Raycaster();
    let hovered = null, dragging = false, dragX = 0, tiltT = 0, tilt = 0, tipT = 0;
    const coarse = matchMedia("(pointer: coarse)").matches;
    function setPtr(e) { const r = canvas.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)); }
    function pick() { ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(pickables, false).find((x) => x.object.visible); return h ? h.object.userData.item : null; }
    container.addEventListener("pointermove", (e) => {
      setPtr(e); ptrS.copy(ptr);
      if (dragging) { tiltT = Math.max(-.55, Math.min(.55, (e.clientX - dragX) / 260)); return; }
      if (e.pointerType === "mouse") { hovered = pick(); container.style.cursor = hovered ? "pointer" : "grab"; }
    });
    container.addEventListener("pointerdown", (e) => {
      setPtr(e);
      const it = pick();
      if (it && it.body) { flick(it); hovered = it; if (coarse) tipT = 2.2; return; }
      if (e.pointerType === "mouse") { dragging = true; dragX = e.clientX; container.style.cursor = "grabbing"; }
      else shake();
    });
    window.addEventListener("pointerup", () => { if (dragging) { dragging = false; tiltT = 0; container.style.cursor = ""; } });
    container.addEventListener("pointerleave", () => { if (!dragging) { hovered = null; ptrS.set(0, 0); } });
    function flick(it) {
      it.body.velocity.y += 7 + Math.random() * 3; it.body.velocity.x += (Math.random() - .5) * 4;
      it.body.angularVelocity.z += (Math.random() - .5) * 18; it.pop = 1;
    }
    function shake() { items.forEach((it) => { if (it.body) { it.body.velocity.y += 4 + Math.random() * 4; it.body.velocity.x += (Math.random() - .5) * 5; it.body.angularVelocity.z += (Math.random() - .5) * 10; } }); }

    /* ---------- loop */
    let progress = 0, visible = false, last = performance.now(), time = 0;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(container);
    const Z = new T.Vector3(0, 0, 1), tmpV = new T.Vector3(), camPos = new T.Vector3(), camLook = new T.Vector3(), lidWorld = new T.Vector3();
    const N = queue.length;

    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; time += dt;
      const p = progress;

      // 1. typing
      const n = Math.round(ease(map(p, .02, .3)) * TOTAL);
      blink += dt;
      const on = Math.floor(blink * 2.2) % 2 === 0;
      if (n !== typed || on !== cursorShown) { typed = n; cursorShown = on; drawCode(n, on); }

      // 2. laptop steps back, phone flies out of the screen
      const out = ease(map(p, .3, .48));
      laptop.position.set(0, lerp(-.9, -7.5, out), lerp(0, -4, out));
      laptop.visible = out < .995;
      laptop.rotation.x = lerp(.05, .5, out);
      laptop.scale.setScalar(lerp(1, .7, out));
      lid.rotation.x = lerp(-.16, -1.2, map(p, .38, .5));
      screen.getWorldPosition(lidWorld);
      const ps = lerp(.12, 1, out);
      phone.position.set(lerp(lidWorld.x, 0, out), lerp(lidWorld.y, .05, out), lerp(lidWorld.z, 0, out));
      phone.scale.setScalar(ps);
      phone.visible = out > .001;
      // the phone flips once on its way out
      const flip = (1 - out) * Math.PI * 2;
      // 3. the top opens, tiles rain in, 4. the top closes
      const open = map(p, .48, .53) * (1 - map(p, .9, .95));
      lidPivot.rotation.x = -open * 1.9;
      setLidSolid(open < .5);

      // tilt from dragging, plus a gentle idle sway
      tilt += (tiltT - tilt) * (1 - Math.exp(-dt * 6));
      const sway = Math.sin(time * .7) * .03;
      phone.rotation.set(-ptrS.y * .12, flip + ptrS.x * .25, tilt + sway);
      // drive the kinematic tank to match the visual phone (only the in-plane tilt matters)
      tank.position.set(phone.position.x, phone.position.y, 0);
      const ang = tilt + sway;

      // how many tiles should be in the phone right now
      const want = out < .99 ? 0 : Math.round(map(p, .5, .8) * N);
      while (dropped < want) spawn(queue[dropped++]);
      while (dropped > want) despawn(queue[--dropped]);

      if (dropped && dt > 0) {
        // turn the walls with a real angular velocity so the tiles get pushed, not teleported
        const e0 = new C.Vec3(); tank.quaternion.toEuler(e0);
        tank.angularVelocity.set(0, 0, (ang - e0.z) / dt);
        world.step(1 / 60, dt, 4);
      } else { tank.quaternion.setFromEuler(0, 0, ang); tank.angularVelocity.set(0, 0, 0); }
      // copy physics into the phone's local frame
      for (let i = 0; i < dropped; i++) {
        const it = queue[i], b = it.body; if (!b) continue;
        // when the top closes, anything still above it pops away
        if (lidSolid && p > .9 && b.position.y - phone.position.y > hIn / 2 - .1) { despawn(it); continue; }
        // keep runaways in play
        if (b.position.y < phone.position.y - 6 || Math.abs(b.position.x - phone.position.x) > 4) { b.position.set(phone.position.x, phone.position.y + hIn / 2 + 1, 0); b.velocity.set(0, 0, 0); }
        tmpV.set(b.position.x - phone.position.x, b.position.y - phone.position.y, 0).divideScalar(ps);
        // undo the phone's tilt so the local position lands inside the glass
        tmpV.applyAxisAngle(Z, -ang);
        it.mesh.position.set(tmpV.x, tmpV.y, it.name ? .02 : .05);
        const e = new C.Vec3(); b.quaternion.toEuler(e);
        it.mesh.rotation.set(0, 0, e.z - ang);
        it.pop = Math.max(0, (it.pop || 0) - dt * 3);
        const hov = hovered === it ? 1.15 : 1;
        it.scale += (hov + it.pop * .25 - it.scale) * (1 - Math.exp(-dt * 10));
        it.mesh.scale.setScalar(it.scale);
      }

      // camera: close on the code, then pull back to frame the phone
      const dLap = fitDist(4.8, 3.4), dPh = fitDist(3.4, 6.2);
      camPos.set(ptrS.x * .5, lerp(1.6, .35, out) + ptrS.y * .3, lerp(dLap * 1.04, dPh, out));
      camLook.set(0, lerp(.1, .05, out), lerp(-1, 0, out));
      camera.position.lerp(camPos, 1 - Math.exp(-dt * 5)); camera.lookAt(camLook);

      // tooltip
      if (coarse && tipT > 0) { tipT -= dt; if (tipT <= 0) hovered = null; }
      if (opts.tip) {
        if (hovered && hovered.body) {
          hovered.mesh.getWorldPosition(tmpV); tmpV.project(camera);
          opts.tip.style.transform = `translate(${(tmpV.x + 1) / 2 * Wpx}px, ${(1 - tmpV.y) / 2 * Hpx - 40}px) translate(-50%, -100%)`;
          if (opts.tip.dataset.key !== hovered.name) { opts.tip.dataset.key = hovered.name; opts.tip.textContent = hovered.name; }
          opts.tip.classList.add("is-on");
        } else opts.tip.classList.remove("is-on");
      }
      renderer.render(scene, camera);
    }
    camera.position.set(0, 1.6, 8);
    drawCode(0, true);
    requestAnimationFrame(frame);

    return {
      set progress(v) { progress = v; }, get progress() { return progress; },
      shake
    };
  }

  window.BuildScene = {
    supported() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } },
    create
  };
})();
