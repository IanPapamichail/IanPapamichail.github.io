/* Hero panel (three.js): a light-blue landscape of soft, layered ridges with a fine surface grain.
   Each layer is its own mesh with its own depth settings (haze, focus, grain). Scrolling drives
   damped springs: far layers sink, near layers scale up, and everything settles with a little
   inertia. Time slowly reshapes the ridges. It never reacts to the pointer.
   Without WebGL or the library, the CSS gradient on .hero-visual stays in place. */
(function () {
  const panel = document.querySelector('.hero-visual'), canvas = $('heroCanvas');
  if (!panel || !canvas) return;
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';

  const VERT = `varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }`;

  const COMMON = `
    float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0 - 2.0*f);
      return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y); }`;

  // @sky-start
  const SKY = `precision highp float;
    varying vec2 vUv;
    uniform float uTime, uAspect;
    ${COMMON}
    void main(){
      float y = vUv.y;
      vec3 top = vec3(0.945, 0.968, 0.99);
      vec3 low = vec3(0.80, 0.875, 0.945);
      vec3 c = mix(low, top, smoothstep(0.25, 1.0, y));
      vec2 p = vec2(vUv.x * uAspect, y);
      vec2 g = p - vec2(uAspect * 0.32, 0.98);
      c += 0.05 * exp(-dot(g, g) * 2.2);                       // soft light from the upper left
      c += (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;
      gl_FragColor = vec4(c, 1.0);
    }`;
  // @sky-end

  // @layer-start
  const LAYER = `precision highp float;
    varying vec2 vUv;
    uniform float uTime, uSeed, uBase, uAmp, uFreq, uTone, uSoft, uGrain, uHaze, uAspect, uShift, uScale;
    uniform vec3 uDeep, uLight;
    ${COMMON}
    float ridge(float x){
      float t = uTime * 0.045;
      return uBase + uAmp * (0.50 * sin(x * uFreq + uSeed + t)
                           + 0.26 * sin(x * uFreq * 2.17 + uSeed * 1.7 - t * 1.3)
                           + 0.12 * sin(x * uFreq * 4.31 + uSeed * 2.9 + t * 0.8)
                           + 0.70 * (vnoise(vec2(x * uFreq * 0.9 + uSeed * 3.0, t * 0.6)) - 0.5));   // breaks the regularity
    }
    void main(){
      vec2 q = vUv;
      q.y -= uShift;
      q = (q - vec2(0.5, 0.0)) / uScale + vec2(0.5, 0.0);        // scale each layer about the bottom centre
      float x = q.x * uAspect;
      float h = ridge(x);
      float e = 0.003;
      float slope = (ridge(x + e) - ridge(x - e)) / (2.0 * e);
      float d = h - q.y;                                         // depth below this layer's ridge line
      float mask = smoothstep(-uSoft, uSoft, d);
      if (mask < 0.002) discard;
      vec2 n = normalize(vec2(-slope, 1.0));
      float lambert = dot(n, normalize(vec2(-0.55, 1.0)));       // light from the upper left
      float rim = exp(-max(d, 0.0) * 30.0);                      // bright crest along the ridge
      float body = smoothstep(0.0, 0.55, d);                     // darker deeper into the hill
      float lit = lambert - 0.8;
      float tone = uTone + 0.24 * lit * (1.0 - 0.6 * body) + 0.14 * rim * (1.0 - uHaze) - 0.10 * body;
      vec2 gp = vec2(x, q.y) * 260.0;                            // fine surface texture, softer when hazy
      float g = vnoise(gp) * 0.6 + vnoise(gp * 2.3 + 7.1) * 0.4;
      tone += (g - 0.5) * uGrain * (0.65 + 0.5 * rim);
      tone += (hash12(gl_FragCoord.xy + uSeed) - 0.5) / 255.0;
      gl_FragColor = vec4(mix(uDeep, uLight, clamp(tone, 0.0, 1.0)), mask);   // tone mapped onto the blue ramp
    }`;
  // @layer-end

  // Back to front. depth: 0 = far, 1 = near. soft: edge blur (focus). haze: how much the crest light is muted.
  // @layers-start
  const LAYERS = [
    { seed: 1.3, base: 0.72, amp: 0.07, freq: 1.9, tone: 0.86, soft: 0.012, grain: 0.020, haze: 0.85, depth: 0.0 },
    { seed: 4.7, base: 0.60, amp: 0.09, freq: 2.4, tone: 0.77, soft: 0.008, grain: 0.030, haze: 0.60, depth: 0.2 },
    { seed: 2.2, base: 0.48, amp: 0.11, freq: 1.7, tone: 0.67, soft: 0.005, grain: 0.045, haze: 0.40, depth: 0.4 },
    { seed: 6.1, base: 0.35, amp: 0.12, freq: 1.35, tone: 0.56, soft: 0.0035, grain: 0.060, haze: 0.22, depth: 0.6 },
    { seed: 3.9, base: 0.21, amp: 0.13, freq: 1.1, tone: 0.42, soft: 0.0025, grain: 0.075, haze: 0.08, depth: 0.8 },
    { seed: 8.4, base: 0.05, amp: 0.10, freq: 0.9, tone: 0.31, soft: 0.022, grain: 0.040, haze: 0.0, depth: 1.0 },
  ];
  // Colour ramp: tone 0 → deep, tone 1 → light. Change these two to recolour the whole landscape.
  const PALETTE = { deep: [0.14, 0.30, 0.50], light: [0.95, 0.975, 1.0] };
  // @layers-end

  const clamp01 = x => Math.min(1, Math.max(0, x));
  const spring = (o, k, v, target, stiff, damp, h) => { o[v] += ((target - o[k]) * stiff - o[v] * damp) * h; o[k] += o[v] * h; };

  let THREE, renderer, scene, camera, skyMat, mats = [], state = [];
  let raf = 0, last = 0, t = 0, lastY = scrollY, vel = 0, inView = true, ready = false;

  function size() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const a = w / h;
    skyMat.uniforms.uAspect.value = a;
    mats.forEach(m => { m.uniforms.uAspect.value = a; });
    if (prefersReducedMotion) draw();
  }

  function targets(p, kick) {
    return LAYERS.map(L => ({
      shift: -p * (1 - L.depth) * 0.2 - kick * 0.015 * (1 - L.depth),   // far layers sink: they move slower than the page
      scale: 1 + p * L.depth * 0.22,                                    // near layers grow as you pass
    }));
  }

  function draw() {
    mats.forEach((m, i) => { m.uniforms.uShift.value = state[i].shift; m.uniforms.uScale.value = state[i].scale; m.uniforms.uTime.value = t; });
    skyMat.uniforms.uTime.value = t;
    renderer.render(scene, camera);
    if (!ready) { ready = true; canvas.classList.add('is-ready'); }
  }

  function progress() {
    const r = panel.getBoundingClientRect();
    return clamp01(scrollY / Math.max(1, r.top + scrollY + r.height));
  }

  function frame(now) {
    raf = 0;
    if (!inView || document.hidden) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const y = scrollY;
    vel += ((y - lastY) / dt - vel) * Math.min(1, dt * 10); lastY = y;
    const tg = targets(progress(), Math.max(-1, Math.min(1, vel / 4000)));
    let acc = dt;
    while (acc > 1e-4) {
      const h = Math.min(acc, 1 / 120);
      state.forEach((s, i) => { spring(s, 'shift', 'vs', tg[i].shift, s.k, s.c, h); spring(s, 'scale', 'vz', tg[i].scale, s.k, s.c, h); });
      acc -= h;
    }
    t += dt;
    draw();
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && inView && !document.hidden) { last = performance.now(); lastY = scrollY; raf = requestAnimationFrame(frame); } };

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));   // full resolution keeps the grain crisp
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new THREE.PlaneGeometry(1, 1);

    skyMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SKY, depthTest: false, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uAspect: { value: 1 } } });
    const sky = new THREE.Mesh(geo, skyMat); sky.renderOrder = 0; sky.frustumCulled = false; scene.add(sky);

    LAYERS.forEach((L, i) => {
      const m = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: LAYER, transparent: true, depthTest: false, depthWrite: false,
        uniforms: {
          uTime: { value: 0 }, uSeed: { value: L.seed }, uBase: { value: L.base }, uAmp: { value: L.amp }, uFreq: { value: L.freq },
          uTone: { value: L.tone }, uSoft: { value: L.soft }, uGrain: { value: L.grain }, uHaze: { value: L.haze },
          uAspect: { value: 1 }, uShift: { value: 0 }, uScale: { value: 1 },
          uDeep: { value: new THREE.Vector3(...PALETTE.deep) }, uLight: { value: new THREE.Vector3(...PALETTE.light) },
        },
      });
      const mesh = new THREE.Mesh(geo, m); mesh.renderOrder = i + 1; mesh.frustumCulled = false; scene.add(mesh);
      mats.push(m);
      const k = 16 + L.depth * 16;                                       // near layers respond faster than far ones
      const rest = prefersReducedMotion ? 0 : -0.22 * (0.35 + L.depth);  // on load the landscape rises into place
      state.push({ shift: rest, vs: 0, scale: 1, vz: 0, k, c: 2 * Math.sqrt(k) * 0.8 });
    });

    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(canvas); else addEventListener('resize', size);

    if (prefersReducedMotion) {                                          // one still frame, redrawn on resize
      const tg = targets(0, 0); state.forEach((s, i) => { s.shift = tg[i].shift; s.scale = tg[i].scale; });
      t = 20; draw();
      return;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { inView = es[0].isIntersecting; if (inView) start(); }).observe(panel);
    }
    document.addEventListener('visibilitychange', start);
    start();
  }

  import(THREE_URL)
    .then(mod => { THREE = mod; try { init(); } catch (e) { console.warn('Hero 3D unavailable:', e); } })
    .catch(e => { console.warn('Hero 3D unavailable:', e); });
})();
