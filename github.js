var scene = new THREE.Scene();
scene.name = 'Scene';

let container = document.getElementById('container'), 
    renderer, 
    camera, 
    pokeball,
    isShaking = false,
    isDragging = false,
    isHovering = false,
    raycaster = new THREE.Raycaster(),
    mouse = new THREE.Vector2(),
    clock = new THREE.Clock(),
    targetRotation = { x: 0, y: 0, z: 0 },
    controls;

function init() {

    let vw = window.innerWidth, 
        vh = window.innerHeight;

    // Enhanced renderer with better shadows and tone mapping
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(vw, vh);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    camera = new THREE.PerspectiveCamera(45, vw / vh, 1, 1000);
    camera.position.z = 80;
    camera.position.x = -30;
    camera.position.y = 20;
    camera.lookAt(scene.position);
    camera.name = 'Camera';
    scene.add(camera);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1; // Increased for smoother camera movement
    controls.rotateSpeed = 0.8; // Adjusted for better control
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 40; // Prevent zooming too close
    controls.maxDistance = 120; // Prevent zooming too far away
    controls.autoRotate = false; // Will be enabled when not interacting

    container.appendChild(renderer.domElement);
    
    // Add enhanced event listeners for smoother interaction
    container.addEventListener('mousedown', onPointerDown, false);
    container.addEventListener('touchstart', onPointerDown, false);
    container.addEventListener('mousemove', onPointerMove, false);
    container.addEventListener('touchmove', onPointerMove, false);
    container.addEventListener('mouseup', onPointerUp, false);
    container.addEventListener('touchend', onPointerUp, false);
    container.addEventListener('mouseleave', onPointerUp, false);
    container.addEventListener('mouseenter', onPointerEnter, false);
    
    window.addEventListener('resize', onResize, false);

}

function onResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);    

}

function createEnvironmentMap() {
    // Create subtle environment map for reflections
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    cubeRenderTarget.texture.type = THREE.HalfFloatType;
    
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Create a simple gradient environment
    const envScene = new THREE.Scene();
    const gradientTexture = createGradientTexture();
    const skyMaterial = new THREE.MeshBasicMaterial({ 
        map: gradientTexture,
        side: THREE.BackSide 
    });
    const skySphere = new THREE.Mesh(
        new THREE.SphereGeometry(100, 32, 32),
        skyMaterial
    );
    envScene.add(skySphere);
    
    // Render environment to cube map
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    cubeCamera.update(renderer, envScene);
    
    // Create PMREM from rendered cube
    const envMap = pmremGenerator.fromCubemap(cubeRenderTarget.texture).texture;
    pmremGenerator.dispose();
    
    return envMap;
}

function createGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#444466');
    gradient.addColorStop(1, '#AAAACC');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function drawPokeball() {

    let pokeball_size = 20, 
        pokeball_segments = 64; // Increased segment count for smoother sphere

    pokeball = new THREE.Group();
    pokeball.name = 'Pokeball';
    
    // Create environment map for reflections
    const envMap = createEnvironmentMap();

    /**
     * Upper side - Enhanced materials
     */
    let ballUpGeom = new THREE.SphereGeometry(pokeball_size, pokeball_segments, pokeball_segments, 0, Math.PI * 2, 0, (Math.PI / 2) * 0.97), 
        ballUpClosingGeom = new THREE.CircleGeometry(pokeball_size, pokeball_segments);
    
    // Create red material with proper PBR properties
    let ballUpMat = new THREE.MeshStandardMaterial({
        color: 0xdd0000,
        metalness: 0.1,
        roughness: 0.2,
        envMap: envMap,
        envMapIntensity: 0.8,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2
    });
    
    ballUpMat.side = THREE.DoubleSide;

    let ballUp = new THREE.Mesh(ballUpGeom, ballUpMat);
    ballUp.name = 'Pokeball upper side';
    ballUp.castShadow = true;
    ballUp.receiveShadow = true;

    // Closing
    let ballUpClosing = new THREE.Mesh(ballUpClosingGeom, ballUpMat);
    ballUpClosing.rotateX(THREE.Math.degToRad(90));
    ballUpClosing.position.set(0, pokeball_size - pokeball_size * 0.95, 0);
    ballUpClosing.name = 'Pokeball upper closing';
    ballUpClosing.castShadow = true;
    ballUpClosing.receiveShadow = true;

    /**
     * Lower side - Enhanced materials
     */
    let ballDownGeom = new THREE.SphereGeometry(pokeball_size, pokeball_segments, pokeball_segments, 0, Math.PI * 2, (Math.PI / 2) * 1.03, Math.PI / 2), 
        ballDownClosingGeom = new THREE.CircleGeometry(pokeball_size, pokeball_segments);
    
    // Create white material with proper PBR properties
    let ballDownMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.2,
        envMap: envMap,
        envMapIntensity: 0.8,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2
    });
    
    ballDownMat.side = THREE.DoubleSide;

    let ballDown = new THREE.Mesh(ballDownGeom, ballDownMat);
    ballDown.name = 'Pokeball Lower side';
    ballDown.castShadow = true;
    ballDown.receiveShadow = true;

    // Closing
    let ballDownClosing = new THREE.Mesh(ballDownClosingGeom, ballDownMat);
    ballDownClosing.rotateX(THREE.Math.degToRad(90));
    ballDownClosing.position.set(0, -(pokeball_size - pokeball_size * 0.95), 0);
    ballDownClosing.name = 'Pokeball lower closing';
    ballDownClosing.castShadow = true;
    ballDownClosing.receiveShadow = true;

    /**
     * Inner side
     */
    let ballInnerGeom = new THREE.SphereGeometry(pokeball_size * 0.95, pokeball_segments, pokeball_segments), 
        ballInnerMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.1,
            roughness: 0.8
        });

    let ballInner = new THREE.Mesh(ballInnerGeom, ballInnerMat);
    ballInner.name = 'Pokeball inner side';

    /**
     * Divider band
     */
    let dividerGeom = new THREE.TorusGeometry(pokeball_size * 0.97, 0.8, 16, 100);
    let dividerMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.3,
        roughness: 0.6,
        envMap: envMap,
        envMapIntensity: 0.5
    });
    
    let divider = new THREE.Mesh(dividerGeom, dividerMat);
    divider.name = 'Divider band';
    divider.rotation.x = Math.PI / 2;
    divider.castShadow = true;
    divider.receiveShadow = true;

    /**
     * Opening - Enhanced to make middle part more prominent
     */
    let opening = new THREE.Group();
    opening.name = 'Opening';

    // Outer ring - black border
    let openingOuterGeom = new THREE.CylinderGeometry(6.5, 6.5, 2.5, pokeball_segments);
    let openingOuterMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.3,
        roughness: 0.6,
        envMap: envMap,
        envMapIntensity: 0.5
    });

    let openingOuter = new THREE.Mesh(openingOuterGeom, openingOuterMat);
    openingOuter.name = 'Outer';
    openingOuter.castShadow = true;
    openingOuter.receiveShadow = true;

    // Middle - white circle
    let openingMiddleGeom = new THREE.CylinderGeometry(5, 5, 2.5, pokeball_segments);
    let openingMiddleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.2,
        envMap: envMap,
        envMapIntensity: 0.8,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2
    });

    let openingMiddle = new THREE.Mesh(openingMiddleGeom, openingMiddleMat);
    openingMiddle.name = 'Middle';
    openingMiddle.position.y = 0.35;
    openingMiddle.castShadow = true;
    openingMiddle.receiveShadow = true;

    // Inner button part - Changed to white with dark border
    let buttonGeom = new THREE.SphereGeometry(3.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    let buttonMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Changed back to white
        metalness: 0.2,  
        roughness: 0.15,
        envMap: envMap,
        envMapIntensity: 1.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    
    let button = new THREE.Mesh(buttonGeom, buttonMat);
    button.position.y = 1.0;
    button.name = 'Button';
    button.userData.isButton = true; // Mark this as a button for interaction checks
    button.castShadow = true;
    button.receiveShadow = true;

    // Dark border ring around the white button
    let buttonRingGeom = new THREE.TorusGeometry(3.3, 0.35, 16, 48);
    let buttonRingMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.4,
        roughness: 0.5,
        envMap: envMap,
        envMapIntensity: 0.7
    });
    
    let buttonRing = new THREE.Mesh(buttonRingGeom, buttonRingMat);
    buttonRing.rotation.x = Math.PI / 2;
    buttonRing.position.y = 0.9;
    buttonRing.name = 'ButtonRing';
    buttonRing.userData.isButton = true; // Also mark as button for interaction
    buttonRing.castShadow = true;
    buttonRing.receiveShadow = true;
    
    // Add a highlight ring around the button for better visibility
    const highlightRingGeom = new THREE.TorusGeometry(3.5, 0.15, 16, 32);
    const highlightRingMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 0.2,
        envMap: envMap,
        envMapIntensity: 1.5,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
    });
    
    const highlightRing = new THREE.Mesh(highlightRingGeom, highlightRingMat);
    highlightRing.rotation.x = Math.PI / 2;
    highlightRing.position.y = 0.95;
    highlightRing.name = 'HighlightRing';
    highlightRing.userData.isButton = true; // Also mark as button for interaction
    
    // Add button pulsing animation
    animateButtonPulse(button, highlightRing);

    opening.rotateX(THREE.Math.degToRad(90));
    opening.position.set(0, 0, pokeball_size * 0.97);

    opening.add(openingOuter);
    opening.add(openingMiddle);
    opening.add(button);
    opening.add(buttonRing);
    opening.add(highlightRing);

    // Add subtle highlights and details
    addSurfaceDetails(pokeball_size, pokeball);

    // Putting all together
    pokeball.add(ballUp);
    pokeball.add(ballUpClosing);
    pokeball.add(ballDown);
    pokeball.add(ballDownClosing);
    pokeball.add(ballInner);
    pokeball.add(divider);
    pokeball.add(opening);

    // Add interactivity properties to the pokeball
    pokeball.userData.interactable = true;
    
    // Initial smooth animation to introduce the pokeball
    gsapIntro();

    scene.add(pokeball);
}

/**
 * Animates the button with a subtle pulsing effect to make it more noticeable
 * @param {Object} button - The button mesh to animate
 * @param {Object} ring - The highlight ring around the button
 */
function animateButtonPulse(button, ring) {
    if (typeof gsap !== 'undefined') {
        // Create a subtle pulsing effect for the button
        gsap.to([button.scale, ring.scale], {
            x: 1.1, 
            y: 1.1, 
            z: 1.1,
            duration: 1,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });
        
        // Also pulse the emissive intensity
        gsap.to(button.material, {
            emissiveIntensity: 0.4,
            duration: 1.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });
    }
}

function gsapIntro() {
    // Add a subtle intro animation if GSAP is available
    if (typeof gsap !== 'undefined') {
        pokeball.scale.set(0.1, 0.1, 0.1);
        pokeball.rotation.y = -Math.PI;
        
        gsap.to(pokeball.scale, {
            x: 1, y: 1, z: 1,
            duration: 1.2,
            ease: "elastic.out(1, 0.5)"
        });
        
        gsap.to(pokeball.rotation, {
            y: 0,
            duration: 1.5,
            ease: "power2.out"
        });
    }
}

function addSurfaceDetails(size, pokeball) {
    // Add subtle seam along the divider
    const seamGeom = new THREE.TorusGeometry(size * 0.97 + 0.05, 0.05, 8, 100);
    const seamMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.1,
        roughness: 0.7,
        transparent: true,
        opacity: 0.6
    });
    
    // Upper seam
    const upperSeam = new THREE.Mesh(seamGeom, seamMat);
    upperSeam.rotation.x = Math.PI / 2;
    upperSeam.position.y = 0.4;
    
    // Lower seam
    const lowerSeam = new THREE.Mesh(seamGeom, seamMat);
    lowerSeam.rotation.x = Math.PI / 2;
    lowerSeam.position.y = -0.4;
    
    pokeball.add(upperSeam);
    pokeball.add(lowerSeam);
}

function setupLight() {
    // Add an improved lighting setup for more realistic look

    // Ambient light - softer
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    ambientLight.name = 'Ambient Light';
    scene.add(ambientLight);

    // Key light
    let keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.name = 'Key Light';
    keyLight.position.set(30, 20, 50);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 200;
    keyLight.shadow.camera.right = 50;
    keyLight.shadow.camera.left = -50;
    keyLight.shadow.camera.top = 50;
    keyLight.shadow.camera.bottom = -50;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill light
    let fillLight = new THREE.DirectionalLight(0xaaccff, 0.3);
    fillLight.name = 'Fill Light';
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // Rim light
    let rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.name = 'Rim Light';
    rimLight.position.set(0, -30, -40);
    scene.add(rimLight);
}

function onPointerMove(event) {
    // Prevent default behavior for touch events
    if (event.type.startsWith('touch')) {
        event.preventDefault();
    }
    
    // Update mouse position
    updateMousePosition(event);
    
    // Handle pokeball dragging
    if (isDragging && pokeball) {
        // Disable orbit controls during drag
        controls.enabled = false;
        
        // Calculate drag rotation based on mouse movement
        // The rotation is smoothed for better handling
        const dragSpeed = 0.01;
        targetRotation.y += dragSpeed * (mouse.x * 10);
        targetRotation.x += dragSpeed * (mouse.y * 5);
        
        // Clamp rotation to prevent flipping
        targetRotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, targetRotation.x));
        
        return;
    }
    
    // Check for hover state when not dragging
    checkPokeballHover();
}

function updateMousePosition(event) {
    if (event.type.startsWith('touch')) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
}

function checkPokeballHover() {
    // Update the picking ray
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersection with pokeball
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    let hovering = false;
    for (let i = 0; i < intersects.length; i++) {
        // Check if we're hovering over the pokeball
        let object = intersects[i].object;
        let parent = object.parent;
        
        while (parent) {
            if (parent.name === 'Pokeball') {
                hovering = true;
                break;
            }
            parent = parent.parent;
        }
        
        if (hovering) break;
    }
    
    // Handle hover state changes
    if (hovering && !isHovering) {
        // Just started hovering
        isHovering = true;
        document.body.style.cursor = 'pointer';
        
        // Subtle hover effect animation
        if (typeof gsap !== 'undefined') {
            gsap.to(pokeball.scale, {
                x: 1.05, y: 1.05, z: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    } else if (!hovering && isHovering) {
        // Just stopped hovering
        isHovering = false;
        document.body.style.cursor = 'auto';
        
        // Reset to normal scale if not dragging
        if (!isDragging && typeof gsap !== 'undefined') {
            gsap.to(pokeball.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }
}

function onPointerDown(event) {
    // Prevent default behavior
    event.preventDefault();
    
    // Update mouse position
    updateMousePosition(event);
    
    // Update the picking ray
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersection with pokeball
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        // Find if we intersected any part of the pokeball
        let hitPokeball = false;
        for (let i = 0; i < intersects.length; i++) {
            let object = intersects[i].object;
            let parent = object.parent;
            
            while (parent) {
                if (parent.name === 'Pokeball') {
                    hitPokeball = true;
                    break;
                }
                parent = parent.parent;
            }
            
            if (hitPokeball) break;
        }
        
        // If we hit the pokeball
        if (hitPokeball) {
            // Start dragging
            isDragging = true;
            
            // Store current rotation as target
            targetRotation.x = pokeball.rotation.x;
            targetRotation.y = pokeball.rotation.y;
            targetRotation.z = pokeball.rotation.z;
            
            // Disable auto-rotation during interaction
            controls.autoRotate = false;
            
            // If not already shaking, enable potential for shake
            if (!isShaking) {
                // We'll let the pointer up event decide if this is a tap/click or drag
                pokeball.userData.pointerDownTime = clock.getElapsedTime();
            }
        }
    }
}

function onPointerUp(event) {
    // If we were dragging
    if (isDragging) {
        // Check if this was a short tap/click (less than 200ms)
        const pointerUpTime = clock.getElapsedTime();
        const pointerDownTime = pokeball.userData.pointerDownTime || 0;
        const tapDuration = pointerUpTime - pointerDownTime;
        
        if (tapDuration < 0.2 && !isShaking) {
            // This was a quick tap, trigger shake animation
            startShakeAnimation();
        } else {
            // This was a drag, do a subtle settle animation
            if (typeof gsap !== 'undefined') {
                // Settle the pokeball with a slight bounce
                gsap.to(pokeball.rotation, {
                    x: Math.round(pokeball.rotation.x / (Math.PI/8)) * (Math.PI/8),
                    z: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.5)"
                });
                
                // Reset scale to normal
                gsap.to(pokeball.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        }
        
        // Re-enable controls after a short delay
        setTimeout(() => {
            controls.enabled = true;
            
            // Enable auto-rotation if not hovering
            if (!isHovering) {
                controls.autoRotate = true;
            }
        }, 100);
    }
    
    // End dragging state
    isDragging = false;
}

function onPointerEnter(event) {
    // Turn off auto-rotation when mouse enters the scene
    controls.autoRotate = false;
}

function startShakeAnimation() {
    if (isShaking) return;
    
    isShaking = true;
    
    // Store original rotation
    const originalRotation = {
        x: pokeball.rotation.x,
        y: pokeball.rotation.y,
        z: pokeball.rotation.z
    };
    
    // Enhanced animation parameters for smoother shake
    const shakeDuration = 1.2; // slightly longer for smoother feel
    const shakeIntensity = 0.15; // reduced for smoother feel
    const numShakes = 7; // increased for more natural shake
    
    // Start time
    const startTime = clock.getElapsedTime();
    
    // Create shake animation function with easing
    function shakeUpdate() {
        const elapsed = clock.getElapsedTime() - startTime;
        const progress = Math.min(elapsed / shakeDuration, 1.0);
        
        if (progress < 1.0) {
            // Use easing function for more natural motion
            const easeOutQuad = t => t * (2 - t);
            const decay = easeOutQuad(1.0 - progress);
            
            // Use smoother sine wave for more natural oscillation
            const shakeAmount = Math.sin(progress * Math.PI * 2 * numShakes) * shakeIntensity * decay;
            
            // Apply rotation with natural variation
            pokeball.rotation.x = originalRotation.x + shakeAmount * 0.3;
            pokeball.rotation.z = originalRotation.z + shakeAmount;
            
            // Add subtle scale pulsing for more lively feel
            const scalePulse = 1 + Math.abs(shakeAmount) * 0.1;
            pokeball.scale.set(scalePulse, scalePulse, scalePulse);
            
            // Continue animation
            requestAnimationFrame(shakeUpdate);
        } else {
            // Animation complete, smoothly restore original state
            if (typeof gsap !== 'undefined') {
                gsap.to(pokeball.rotation, {
                    x: originalRotation.x,
                    z: originalRotation.z,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                gsap.to(pokeball.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 0.3,
                    ease: "power2.out",
                    onComplete: () => {
                        isShaking = false;
                    }
                });
            } else {
                // Fallback if gsap not available
                pokeball.rotation.x = originalRotation.x;
                pokeball.rotation.z = originalRotation.z;
                pokeball.scale.set(1, 1, 1);
                isShaking = false;
            }
        }
    }
    
    // Start the shake animation
    shakeUpdate();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update the clock
    clock.getDelta();
    
    // Smooth rotation interpolation for pokeball when dragging
    if (pokeball && isDragging) {
        // Smoothly interpolate current rotation to target rotation
        pokeball.rotation.x += (targetRotation.x - pokeball.rotation.x) * 0.1;
        pokeball.rotation.y += (targetRotation.y - pokeball.rotation.y) * 0.1;
    }
    // Subtle automatic rotation when not interacting
    else if (pokeball && !isShaking && !isDragging && !isHovering) {
        pokeball.rotation.y += 0.002;
    }
    
    // Update OrbitControls
    if (controls) {
        controls.update();
    }
    
    renderer.render(scene, camera);
}

// Add script for GSAP if available in index.html
function addGSAPIfNeeded() {
    if (typeof gsap === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
        script.async = true;
        document.head.appendChild(script);
    }
}

// Initialize everything
init();
setupLight();
drawPokeball();
addGSAPIfNeeded();
animate();
