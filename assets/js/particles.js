/* Particle portrait: thousands of points sampled from the cut-out photo fly in and assemble
   into Sherif, scatter away from the pointer, and morph into the Flutter mark as `morph` → 1.
   Live WebGL (Three.js), so it renders sharp at any screen size. */
(function () {
  "use strict";
  if (typeof window.THREE === "undefined") return;
  const T = window.THREE;

  // Flutter mark (SVG viewBox 166 × 202) as three polygons with their colours
  const MARK = [
    { p: [[9.8, 101], [100.4, 10.4], [156.1, 10.4], [37.7, 128.9]], c: [0.33, 0.77, 0.97] },
    { p: [[100.4, 93.6], [156.1, 93.6], [79.5, 170.3], [51.6, 142.4]], c: [0.16, 0.6, 0.95] },
    { p: [[79.5, 170.7], [107.4, 142.9], [156.2, 191.7], [100.5, 191.7]], c: [0.02, 0.29, 0.66] }
  ];
  function inPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  function sample(img, step) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const pts = [];
    for (let y = 0; y < c.height; y += step) {
      for (let x = 0; x < c.width; x += step) {
        const jx = x, jy = y;
        const k = (jy * c.width + jx) * 4;
        if (d[k + 3] < 140) continue;
        pts.push([jx / c.width, jy / c.height, d[k] / 255, d[k + 1] / 255, d[k + 2] / 255]);
      }
    }
    return { pts, aspect: c.width / c.height, cols: c.width / step };
  }

  function create(container, opts) {
    const canvas = document.createElement("canvas");
    canvas.className = "particles";
    container.appendChild(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setClearColor(0, 0);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);

    const uniforms = {
      uAssemble: { value: 0 }, uMorph: { value: 0 }, uTime: { value: 0 },
      uMouse: { value: new T.Vector2(-9999, -9999) }, uRadius: { value: 90 },
      uSize: { value: 2.4 * dpr }, uOpacity: { value: 1 }
    };
    const mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms,
      vertexShader: `
        attribute vec3 aStart; attribute vec3 aPhoto; attribute vec3 aLogo;
        attribute vec3 aColP; attribute vec3 aColL; attribute float aRand;
        uniform float uAssemble, uMorph, uTime, uRadius, uSize;
        uniform vec2 uMouse;
        varying vec3 vCol; varying float vA;
        float ease(float t){ return t<.5 ? 4.*t*t*t : 1.-pow(-2.*t+2.,3.)/2.; }
        void main(){
          float a = ease(clamp((uAssemble - aRand*.35) / .65, 0., 1.));
          float m = ease(clamp((uMorph - aRand*.3) / .7, 0., 1.));
          vec3 p = mix(aStart, aPhoto, a);
          // a swirl on the way between photo and mark
          vec3 mid = mix(aPhoto, aLogo, .5) + vec3(sin(aRand*40.)*120., cos(aRand*33.)*120., 0.) * sin(m*3.14159);
          p = mix(p, mix(mix(aPhoto, mid, m), mix(mid, aLogo, m), m), step(.0001, uMorph));
          // breathing + pointer repulsion
          p.xy += vec2(sin(uTime*1.3 + aRand*20.), cos(uTime*1.1 + aRand*17.)) * (1.2 + 3.*m);
          vec2 d = p.xy - uMouse; float dist = length(d);
          float push = smoothstep(uRadius, 0., dist);
          p.xy += normalize(d + 1e-4) * push * uRadius * .4;
          vCol = mix(aColP, aColL, m);
          vA = .08 + .92 * a;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
          gl_PointSize = uSize * (1. + push * 1.2) * (.85 + aRand*.3);
        }`,
      fragmentShader: `
        varying vec3 vCol; varying float vA; uniform float uOpacity;
        void main(){
          vec2 c = gl_PointCoord - .5; float r = length(c);
          if (r > .5) discard;
          gl_FragColor = vec4(vCol, vA * uOpacity * smoothstep(.5, .42, r));
        }`
    });
    const geo = new T.BufferGeometry();
    const points = new T.Points(geo, mat);
    scene.add(points);

    let W = 1, H = 1, data = null;
    function layout() {
      W = container.clientWidth; H = container.clientHeight;
      renderer.setSize(W, H, false);
      camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      uniforms.uRadius.value = Math.max(50, Math.min(W, H) * .11);
      if (data) build();
    }

    function build() {
      const { pts, aspect } = data;
      const n = pts.length;
      // portrait fills the box height (or width on narrow boxes), anchored to the bottom
      const ph = Math.min(H * .98, (W * .92) / aspect), pw = ph * aspect;
      const lh = Math.min(H, W) * .78, lw = lh * 166 / 202;
      const start = new Float32Array(n * 3), photo = new Float32Array(n * 3), logo = new Float32Array(n * 3);
      const colP = new Float32Array(n * 3), colL = new Float32Array(n * 3), rand = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const [u, v, r, g, b] = pts[i];
        photo[i * 3] = (u - .5) * pw + (Math.random() - .5) * .6;
        photo[i * 3 + 1] = -H / 2 + (1 - v) * ph + (Math.random() - .5) * .6;
        photo[i * 3 + 2] = 0;
        colP[i * 3] = r; colP[i * 3 + 1] = g; colP[i * 3 + 2] = b;
        // start: a wide swirl around the box
        // start: a spinning galaxy in the middle of the box
        const arm = (i % 3) * 2.094, rr = Math.pow(Math.random(), .6) * Math.min(W, H) * .48;
        const ang = arm + rr * .018 + (Math.random() - .5) * .9;
        start[i * 3] = Math.cos(ang) * rr; start[i * 3 + 1] = Math.sin(ang) * rr * .9 + H * .05; start[i * 3 + 2] = 0;
        // logo: rejection-sample a point inside one of the three pieces
        let x, y, piece;
        for (;;) {
          x = Math.random() * 166; y = Math.random() * 202;
          piece = MARK.findIndex((m) => inPoly(x, y, m.p));
          if (piece >= 0) break;
        }
        logo[i * 3] = (x / 166 - .5) * lw;
        logo[i * 3 + 1] = (.5 - y / 202) * lh + H * .02;
        logo[i * 3 + 2] = 0;
        const mc = MARK[piece].c, k = .85 + Math.random() * .3;
        colL[i * 3] = mc[0] * k; colL[i * 3 + 1] = mc[1] * k; colL[i * 3 + 2] = mc[2] * k;
        rand[i] = Math.random();
      }
      geo.setAttribute("position", new T.BufferAttribute(photo, 3));
      geo.setAttribute("aStart", new T.BufferAttribute(start, 3));
      geo.setAttribute("aPhoto", new T.BufferAttribute(photo, 3));
      geo.setAttribute("aLogo", new T.BufferAttribute(logo, 3));
      geo.setAttribute("aColP", new T.BufferAttribute(colP, 3));
      geo.setAttribute("aColL", new T.BufferAttribute(colL, 3));
      geo.setAttribute("aRand", new T.BufferAttribute(rand, 1));
      // point size follows the sampling density so the portrait reads as a solid image
      uniforms.uSize.value = Math.max(1.8, (pw / data.cols) * 2.1) * dpr;
      geo.computeBoundingSphere();
      geo.boundingSphere.radius = 1e5;
    }

    // pointer (mouse and touch) in canvas space
    const target = new T.Vector2(-9999, -9999);
    function point(e) {
      const r = canvas.getBoundingClientRect();
      target.set(e.clientX - r.left - W / 2, H / 2 - (e.clientY - r.top));
    }
    container.addEventListener("pointermove", point);
    container.addEventListener("pointerdown", point);
    container.addEventListener("pointerleave", () => target.set(-9999, -9999));

    const ready = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const area = (container.clientWidth * container.clientHeight) || 300000;
        const step = opts.step || (area > 300000 ? 2 : 3);
        data = sample(img, step);
        layout();
        resolve(data.pts.length);
      };
      img.src = opts.src;
    });
    new ResizeObserver(layout).observe(container);

    let raf = 0, last = performance.now(), visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(container);
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!visible || !data) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      uniforms.uTime.value += dt;
      const m = uniforms.uMouse.value;
      if (target.x < -9000) m.lerp(new T.Vector2(-9999, -9999), 1);
      else if (m.x < -9000) m.copy(target);
      else m.lerp(target, 1 - Math.exp(-dt * 12));
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(loop);

    return {
      ready,
      set assemble(v) { uniforms.uAssemble.value = v; },
      get assemble() { return uniforms.uAssemble.value; },
      set morph(v) { uniforms.uMorph.value = v; },
      get morph() { return uniforms.uMorph.value; },
      stop() { cancelAnimationFrame(raf); }
    };
  }

  window.ParticlePortrait = {
    supported() {
      try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
      catch (e) { return false; }
    },
    create
  };
})();
