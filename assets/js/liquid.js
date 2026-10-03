/* Liquid paint image: a full-resolution photo poured onto the page like thick wet paint.
   Behind it a glossy paint blob drips down; the photo itself fills in from the top with drips,
   ripples like water under the pointer, and can "melt" (drips stretch) as you scroll.
   Live WebGL (Three.js), sharp at any size. */
(function () {
  "use strict";
  if (typeof window.THREE === "undefined") return;
  const T = window.THREE;

  const FRAG = `
    precision highp float;
    uniform sampler2D uTex;
    uniform vec2 uRes;          // canvas size in px
    uniform vec4 uRect;         // photo rect in px: x, y (from bottom-left), w, h
    uniform float uReveal;      // 0 → 1: paint pours in, then the photo
    uniform float uMelt;        // 0 → 1: drips stretch (scroll)
    uniform float uTime;
    uniform vec2 uMouse;        // px, bottom-left origin
    uniform float uHover;
    uniform vec3 uC1, uC2, uC3; // paint colours
    uniform float uPaint;       // 1 = draw the paint blob
    uniform float uMask;        // 1 = the photo lives inside the paint shape (portrait in a splash)
    varying vec2 vUv;

    float hash(float n){ return fract(sin(n)*43758.5453123); }
    float noise(float x){ float i=floor(x), f=fract(x); f=f*f*(3.-2.*f); return mix(hash(i), hash(i+1.), f); }
    float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
      float a=hash(i.x+i.y*57.), b=hash(i.x+1.+i.y*57.), c=hash(i.x+(i.y+1.)*57.), d=hash(i.x+1.+(i.y+1.)*57.);
      return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
    float ease(float t){ return t<.5 ? 4.*t*t*t : 1.-pow(-2.*t+2.,3.)/2.; }

    // paint field: a wobbling blob around the head/shoulders plus drips that run down from it
    float paintField(vec2 px){
      vec2 c = vec2(uRect.x + uRect.z*.5, uRect.y + uRect.w*.7);
      float R = min(uRect.z, uRect.w) * .36;
      if (uMask > .5) { c = uRes * vec2(.5, .56); R = min(uRes.x, uRes.y) * .29; }
      float a = clamp(uReveal / .55, 0., 1.);
      vec2 d = px - c;
      if (uMask > .5) d.y *= .72;           // a taller splash for a portrait
      float ang = atan(d.y, d.x);
      float wob = 1. + .1*sin(ang*2. + 1.3 + uTime*.6) + .06*sin(ang*5. - uTime*.9) + .03*sin(ang*11. + uTime*1.5);
      float blob = (R * .85 * ease(a) * wob) / max(length(d), 1.);
      // splash droplets that merge into the main blob like metaballs
      for (int s = 0; s < 7; s++) {
        float fs = float(s);
        float an = fs * 2.399 + .6;
        float dist = R * (1.05 + .35 * hash(fs*4.1)) * ease(clamp((uReveal - .05*fs) / .6, 0., 1.));
        vec2 sp = c + vec2(cos(an), sin(an)*.85) * dist + vec2(sin(uTime*.8 + fs), cos(uTime*.7 + fs*2.)) * R*.03;
        float sr = R * (.1 + .12 * hash(fs*9.7)) * ease(a);
        blob += sr / max(length(px - sp), 1.) * .55;
      }
      // drips: thin tapered streams of different lengths running down from the blob
      float span = R * 2.0, cols = 9., cw = span / cols;
      float k0 = floor((px.x - (c.x - span*.5)) / cw);
      float drips = 0.;
      for (int o = -1; o <= 1; o++) {
        float k = k0 + float(o);
        if (k < 0. || k > cols - 1.) continue;
        float cx = c.x - span*.5 + (k + .5) * cw + (hash(k*7.1) - .5) * cw * .5;
        float lenN = hash(k*3.7 + 1.);
        float grow = ease(clamp((uReveal - .2 - hash(k*1.3)*.25) / .6, 0., 1.));
        float len = R * (.2 + 1.6*lenN*lenN) * grow * (1. + uMelt*2.4) * (1. - uMask*.45);
        float top = c.y - R*.45 - abs(cx - c.x) * .25;
        float yy = top - px.y;
        float w0 = R * (.035 + .045*hash(k*5.3));
        float w = w0 * (1. - .35 * clamp(yy / max(len, 1.), 0., 1.));
        float dx = abs(px.x - cx);
        drips += smoothstep(-w0, w0, yy) * smoothstep(len + w0, len - w0, yy) * smoothstep(w, w*.4, dx) * 1.3;
        drips += smoothstep(w0 * 1.7, w0 * .5, length(vec2(dx, (yy - len) * 1.1))) * 1.3 * step(R*.05, len);
      }
      return blob + drips;
    }

    void main(){
      vec2 px = vUv * uRes;

      // water ripple under the pointer, plus a slow idle swell
      vec2 md = px - uMouse; float dist = length(md);
      float ripple = sin(dist*.09 - uTime*6.) * exp(-dist*.012) * uHover;
      vec2 disp = (md / max(dist, 1.)) * ripple * 7. + vec2(sin(px.y*.02 + uTime*1.2), cos(px.x*.018 + uTime)) * 1.2;

      // ---------- paint layer (glossy, lit like a 3D liquid) ----------
      vec4 col = vec4(0.);
      if (uPaint > .5) {
        float f = paintField(px + disp*.6);
        float fw = fwidth(f) * 1.2;
        float m = smoothstep(1. - fw, 1. + fw, f);
        float h = smoothstep(.9, 2.2, f);
        vec3 nrm = normalize(vec3(-dFdx(h)*28., -dFdy(h)*28., 1.));
        vec3 L = normalize(vec3(-.4, .6, .7));
        float diff = clamp(dot(nrm, L), 0., 1.);
        float spec = pow(clamp(dot(reflect(-L, nrm), vec3(0.,0.,1.)), 0., 1.), 40.);
        float g = clamp((px.y - uRect.y) / uRect.w, 0., 1.);
        vec3 base = mix(uC1, uC2, g) ;
        base = mix(base, uC3, smoothstep(.55, 1., n2(px*.006 + uTime*.05)) * .35);
        vec3 paint = base * (.72 + .38*diff) + vec3(1.)*spec*.85;
        col = vec4(paint, m);
      }

      // ---------- photo layer: poured in from the top with drips, melts on scroll ----------
      vec2 puv = (px - uRect.xy) / uRect.zw;
      float pr = clamp((uReveal - .25) / .75, 0., 1.);
      float dripEdge = 1. - ease(pr) * 1.25 + (noise(puv.x*9.) * .18 + noise(puv.x*23.)*.06) * (1. - pr*.6);
      float melt = uMelt * (.15 + .5*noise(puv.x*7. + 2.)) ;
      vec2 suv = puv + disp / uRect.zw;
      suv.y += melt * smoothstep(1., .2, puv.y);          // the lower part sags downward as it melts
      vec4 tex = texture2D(uTex, suv);
      float inside = step(0., suv.x) * step(suv.x, 1.) * step(0., suv.y) * step(suv.y, 1.);
      float shown = smoothstep(dripEdge - .015, dripEdge + .015, puv.y);
      float pa = smoothstep(.35, .75, tex.a) * inside * shown;
      if (uMask > .5) {
        // the photo fills the splash; a thin glossy paint rim stays around it
        float f2 = paintField(px + disp*.6);
        float fw2 = fwidth(f2) * 1.2;
        pa = inside * smoothstep(1.16 - fw2, 1.16 + fw2, f2);
        float sh = smoothstep(1.16, 1.6, f2);
        vec3 n2v = normalize(vec3(-dFdx(sh)*22., -dFdy(sh)*22., 1.));
        float gl = pow(clamp(dot(reflect(-normalize(vec3(-.4,.6,.7)), n2v), vec3(0.,0.,1.)), 0., 1.), 30.);
        tex.rgb += gl * .35 * (1. - sh);
      }
      // wet sheen along the pouring edge
      float rim = smoothstep(.05, 0., abs(puv.y - dripEdge)) * (1. - pr);
      vec3 photo = tex.rgb + rim * .25 * (1. - uMask);

      vec3 rgb = mix(col.rgb, photo, pa);
      float alpha = max(col.a, pa);
      gl_FragColor = vec4(rgb, alpha);
    }`;

  function create(container, opts) {
    const canvas = document.createElement("canvas");
    canvas.className = "liquid";
    container.appendChild(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false });
    renderer.setClearColor(0, 0);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const hex = (h) => new T.Color(h);
    const uniforms = {
      uTex: { value: null }, uRes: { value: new T.Vector2(1, 1) }, uRect: { value: new T.Vector4(0, 0, 1, 1) },
      uReveal: { value: 0 }, uMelt: { value: 0 }, uTime: { value: 0 },
      uMouse: { value: new T.Vector2(-1e4, -1e4) }, uHover: { value: 0 },
      uC1: { value: hex(opts.c1 || "#2F5BEA") }, uC2: { value: hex(opts.c2 || "#54C5F8") }, uC3: { value: hex(opts.c3 || "#F5A524") },
      uPaint: { value: opts.paint === false ? 0 : 1 }, uMask: { value: opts.mask ? 1 : 0 }
    };
    const mat = new T.ShaderMaterial({
      uniforms, transparent: true, fragmentShader: FRAG,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      extensions: { derivatives: true }
    });
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));

    let img = null, W = 1, H = 1;
    const fit = opts.fit || "contain-bottom";
    function layout() {
      W = container.clientWidth; H = container.clientHeight;
      renderer.setSize(W, H, false);
      uniforms.uRes.value.set(W * dpr, H * dpr);
      if (!img) return;
      const ar = img.naturalWidth / img.naturalHeight;
      const pad = opts.pad || 0;
      let w, h, x, y;
      if (fit === "splash") {
        // size the photo so its edges stay hidden under the paint; face and table sit inside the splash
        const R = Math.min(W, H) * .29, cy = H * .56;
        h = R * 4.4; w = h * ar; x = W / 2 - w / 2; y = cy - h * .48;
      } else if (fit === "cover") {
        w = W; h = W / ar; if (h < H) { h = H; w = H * ar; }
        x = (W - w) / 2; y = (H - h) / 2;
      } else {
        h = H * (opts.height || .92); w = h * ar;
        if (w > W * (1 - pad * 2)) { w = W * (1 - pad * 2); h = w / ar; }
        x = (W - w) / 2; y = 0;
      }
      uniforms.uRect.value.set(x * dpr, y * dpr, w * dpr, h * dpr);
    }
    const ready = new Promise((resolve) => {
      new T.TextureLoader().load(opts.src, (tex) => {
        tex.colorSpace = T.SRGBColorSpace;
        tex.minFilter = T.LinearMipmapLinearFilter; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        uniforms.uTex.value = tex; img = tex.image; layout(); resolve();
      });
    });
    new ResizeObserver(layout).observe(container);

    let hoverTarget = 0;
    const mouseTarget = new T.Vector2(-1e4, -1e4);
    function point(e) {
      const r = canvas.getBoundingClientRect();
      mouseTarget.set((e.clientX - r.left) * dpr, (r.bottom - e.clientY) * dpr);
      if (uniforms.uMouse.value.x < -9000) uniforms.uMouse.value.copy(mouseTarget);
      hoverTarget = 1;
    }
    container.addEventListener("pointermove", point);
    container.addEventListener("pointerdown", point);
    container.addEventListener("pointerleave", () => { hoverTarget = 0; });

    let visible = true, last = performance.now();
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(container);
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!visible || !img) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      uniforms.uTime.value += dt;
      uniforms.uMouse.value.lerp(mouseTarget, 1 - Math.exp(-dt * 10));
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * (1 - Math.exp(-dt * 4));
      renderer.render(scene, camera);
    })(last);

    return {
      ready,
      set reveal(v) { uniforms.uReveal.value = v; }, get reveal() { return uniforms.uReveal.value; },
      set melt(v) { uniforms.uMelt.value = v; }, get melt() { return uniforms.uMelt.value; }
    };
  }

  window.LiquidImage = {
    supported() {
      try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
      catch (e) { return false; }
    },
    create
  };
})();
