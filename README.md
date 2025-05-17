# Three.js Pokeball

![Screenshot 2025-05-16 165639](https://github.com/user-attachments/assets/e322361a-e433-4a11-a5b2-53de1a545d05)

A smooth, interactive 3D Pokéball rendered with Three.js, complete with realistic materials, environment reflections, and subtle animations. Click and drag to rotate the Pokéball, scroll to zoom, and tap to trigger a shake animation.

## 📂 Project Structure

```
├── index.html       # Entry point: sets up the canvas and loads dependencies
├── github.js        # Main script: initializes scene, camera, renderer, lights, and Pokéball
        
```

## 🚀 Features

* **Realistic PBR Materials**: Red, white, and black materials use metalness, roughness, clearcoat, and environment maps to simulate real-world reflections.
* **Custom Environment Map**: Procedurally generated gradient sky gives subtle reflections on the sphere.
* **Interactive Controls**: OrbitControls enable smooth rotation and zoom, with damping for natural feel.
* **Hover & Drag Effects**: Scale and cursor change on hover; click‑and‑drag rotates the Pokéball.
* **Shake Animation**: Quick taps trigger a natural shake with easing and decay.
* **GSAP Intro & Pulse**: If GSAP is loaded, you get an elastic intro and pulsing button highlight.
* **Responsive Canvas**: Resizes automatically on window resize.

## ⚙️ Getting Started

1. **Clone the repository**

   ```bash
   git clone (https://github.com/Viverun/pokeball.git)
   ```

2. **Serve the files**

   For local development, you need a simple HTTP server since Three.js modules may require it.

   * **Python 3**

     ```bash
     python -m http.server 8000
     ```

   * **Node.js (http-server)**

     ```bash
     npx http-server -c-1 .
     ```

3. **Open in Browser**

   Navigate to `http://localhost:8000` (or your server's URL). You should see the 3D Pokéball.

## 📦 Dependencies

* [Three.js](https://threejs.org/) (r132)
* [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)
* [Stats.js](https://github.com/mrdoob/stats.js/) (for performance monitoring)
* [GSAP](https://greensock.com/gsap/) (optional for animations)

All external scripts are loaded via CDN links in `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/libs/stats.min.js"></script>
<script src="github.js"></script>
```

(GSAP is dynamically injected if not already present.)

## 📝 Scripts Breakdown

* **init()**: Sets up renderer, camera, controls, and event listeners.
* **createEnvironmentMap()**: Generates a simple gradient sky environment for reflections.
* **drawPokeball()**: Builds the Pokéball geometry (upper, lower, inner, divider, button) with PBR materials.
* **setupLight()**: Adds ambient, key, fill, and rim lights for a realistic look.
* **animate()**: Main render loop for continuous rendering, controls update, and animations.
* **Event Handlers**: `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerEnter`, `onResize` manage user interaction and responsiveness.

## 🔧 Customization

* **Pokéball Size & Detail**: Modify `pokeball_size` and `pokeball_segments` in `drawPokeball()` for different scale or smoothness.
* **Environment Colors**: Change color stops in `createGradientTexture()` for different sky gradients.
* **Animation Parameters**: Tweak durations, intensities, and easing in `animateButtonPulse()` and `startShakeAnimation()`.

## 🎓 Learn More

* [Three.js Fundamentals](https://threejsfundamentals.org/)
* [Three.js Documentation](https://threejs.org/docs/)
* [GSAP Docs](https://greensock.com/docs/)

## 📜 License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.
