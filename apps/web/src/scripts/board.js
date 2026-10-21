/* board.js — the HiFi board in 3D (HiFi page, Fig. 3). The model is the current layout exported from EasyEDA Pro
   as STEP, converted to glTF (cascadio) and compressed without loss (gltfpack, meshopt): public/assets/pcb/.
   three.js is loaded only when the figure comes near the viewport; until then, and without JavaScript or WebGL,
   the figure shows a still render of the same view. The model never moves on its own: it turns only when the
   reader drags it (no inertia), so there is nothing for prefers-reduced-motion to stop. */
const fig = document.getElementById('fig-board');

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
}

if (fig && webgl()) {
  const stage = fig.querySelector('.board__stage');
  const status = fig.querySelector('.board__status');
  const reset = fig.querySelector('.board__reset');
  let started = false;

  const start = async () => {
    if (started) return;
    started = true;
    status.textContent = 'loading the model…';
    try {
      const [THREE, { GLTFLoader }, { OrbitControls }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/controls/OrbitControls.js'),
        import('three/examples/jsm/libs/meshopt_decoder.module.js'),
        import('three/examples/jsm/environments/RoomEnvironment.js'),
      ]);
      run(THREE, GLTFLoader, OrbitControls, MeshoptDecoder, RoomEnvironment);
    } catch (e) {
      status.textContent = 'still render · the 3D model could not be loaded';
    }
  };

  function run(THREE, GLTFLoader, OrbitControls, MeshoptDecoder, RoomEnvironment) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.92;
    const canvas = renderer.domElement;

    const scene = new THREE.Scene();                     // transparent: the page's paper shows through
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(-0.6, -1, 1.6);                      // from the front-left, above: parts cast readable shading
    scene.add(key);

    const camera = new THREE.PerspectiveCamera(26, 1, 0.001, 10);
    camera.up.set(0, 0, 1);                               // the STEP is Z-up: the board lies in XY
    const controls = new OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableDamping = false;                       // no inertia: the model moves only while it is dragged
    controls.rotateSpeed = 0.7;

    let home = null, radius = 0.05, box = null;
    const render = () => renderer.render(scene, camera);
    controls.addEventListener('change', render);

    const size = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    };

    const view = (az, el, dist, shift) => {               // camera on a sphere around the board's centre
      const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
      camera.position.set(dist * Math.cos(e) * Math.sin(a), -dist * Math.cos(e) * Math.cos(a), dist * Math.sin(e));
      controls.target.set(0, 0, 0);
      if (shift) { camera.position.add(shift); controls.target.add(shift); }
      controls.update();
    };
    const bounds = () => {                                // the model's outline on screen, in NDC
      camera.updateMatrixWorld();
      const p = new THREE.Vector3(), b = [1, -1, 1, -1];
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        p.set(x, y, z).project(camera);
        b[0] = Math.min(b[0], p.x); b[1] = Math.max(b[1], p.x); b[2] = Math.min(b[2], p.y); b[3] = Math.max(b[3], p.y);
      }
      return b;
    };
    const fit = (az, el) => {                             // the board fills ~90% of the frame, centred on screen
      let d = radius * 4;
      for (let i = 0; i < 4; i++) {
        view(az, el, d);
        const [x0, x1, y0, y1] = bounds();
        d *= Math.max((x1 - x0) / 2, (y1 - y0) / 2) / 0.9;
      }
      view(az, el, d);
      const [x0, x1, y0, y1] = bounds();                  // perspective draws the near edge larger: shift to centre
      const h = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d;
      const shift = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar((x0 + x1) / 2 * h * camera.aspect)
        .add(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar((y0 + y1) / 2 * h));
      return { d, shift };
    };

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(fig.dataset.model, (gltf) => {
      const root = gltf.scene;
      root.traverse((o) => {                               // EasyEDA exports every material as fully metallic,
        if (!o.isMesh) return;                             // which renders near-black; restore plastic and metal
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          const c = m.color, spread = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
          const silver = spread < 0.06 && c.r > 0.45;     // pins, shields, the USB-C shell
          m.metalness = silver ? 0.55 : 0;
          m.roughness = silver ? 0.35 : 0.6;
          m.envMapIntensity = 0.85;
        });
      });
      const c = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
      root.position.sub(c);
      scene.add(root);
      box = new THREE.Box3().setFromObject(root);
      radius = box.getBoundingSphere(new THREE.Sphere()).radius;

      stage.appendChild(canvas);
      size();
      const f = fit(24, 40);
      home = { az: 24, el: 40, dist: f.d, shift: f.shift };
      controls.minDistance = radius * 1.4;
      controls.maxDistance = home.dist * 2;
      canvas.tabIndex = 0;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', fig.dataset.label);
      canvas.setAttribute('aria-describedby', status.id);
      view(home.az, home.el, home.dist, home.shift);
      stage.classList.add('is-live');
      status.textContent = 'drag to turn · ctrl + scroll or pinch to zoom · arrow keys when focused';
      reset.hidden = false;
      new ResizeObserver(size).observe(stage);
    }, undefined, () => { status.textContent = 'still render · the 3D model could not be loaded'; });

    // the page keeps scrolling over the model: plain wheel scrolls, ctrl/⌘ + wheel (and trackpad pinch) zooms
    stage.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) e.stopPropagation(); }, { capture: true });
    canvas.style.touchAction = 'pan-y';                   // on a phone a vertical swipe still scrolls the page

    const up = new THREE.Vector3(0, 0, 1);
    canvas.addEventListener('keydown', (e) => {
      const off = camera.position.clone().sub(controls.target);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') off.applyAxisAngle(up, (e.key === 'ArrowLeft' ? 1 : -1) * 0.17);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const right = new THREE.Vector3().crossVectors(off, up).normalize();
        const next = off.clone().applyAxisAngle(right, (e.key === 'ArrowUp' ? -1 : 1) * 0.12);
        if (next.z > radius * 0.2) off.copy(next);        // never below the board's plane
      } else if (e.key === '+' || e.key === '=' || e.key === '-') {
        off.multiplyScalar(e.key === '-' ? 1.12 : 1 / 1.12);
        off.setLength(THREE.MathUtils.clamp(off.length(), controls.minDistance, controls.maxDistance));
      } else return;
      e.preventDefault();
      camera.position.copy(controls.target).add(off);
      controls.update();
    });
    reset.addEventListener('click', () => { if (!home) return; const f = fit(home.az, home.el); view(home.az, home.el, f.d, f.shift); });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' });
    io.observe(fig);
  } else start();
}
