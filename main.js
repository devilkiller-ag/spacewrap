import './style.css';
import * as THREE from 'three';

/**
 * Settings 
 */
let LINE_COUNT = 5000;

/**
 * Scene and canvas
 */
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

/**
 * Sizes
 */ 

const sizes = {
  width: innerWidth,
  height: innerHeight
}

window.addEventListener('resize', (event) => {
  // Update sizes
  sizes.width = innerWidth;
  sizes.height = innerHeight;

  // Update camera
  camera.aspect = sizes.width/sizes.height;
  camera.updateProjectionMatrix()

  // Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // If someone moves the window to second display then set the pixel ratio of second display.
})

/**
 * Star Wrap Lines
 */
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * LINE_COUNT), 3));
geometry.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(2 * LINE_COUNT), 1));

const position = geometry.getAttribute('position');
let positionArray = position.array;
const velocity = geometry.getAttribute('velocity');
let velocityArray = velocity.array;

for(let lineIndex = 0; lineIndex < LINE_COUNT; lineIndex++) {
  let x1 = Math.random() * sizes.width - sizes.width/2;
  let y1 = Math.random() * sizes.height - sizes.height/2;
  let z1 = Math.random() * 400 - 200;
  // let x1 = 0+lineIndex, y1 = 0+lineIndex, z1 = 0+lineIndex;
  let x2 = x1, y2 = y1, z2 = z1;

  // Line Start
  positionArray[6*lineIndex] = x1;
  positionArray[6*lineIndex+1] = y1;
  positionArray[6*lineIndex+2] = z1;

  // Line End
  positionArray[6*lineIndex+3] = x2;
  positionArray[6*lineIndex+4] = y2;
  positionArray[6*lineIndex+5] = z2;

  velocityArray[2*lineIndex] = velocityArray[2*lineIndex+1] = 0;
}

// Material
const material = new THREE.LineBasicMaterial({ color: 0xffffff});

// Mesh
const lineMesh = new THREE.LineSegments(geometry, material);
scene.add(lineMesh);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(60, sizes.width/sizes.height, 1, 500);
camera.position.z = 200;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // Some devices have pixel ratio > 1. In those devices rendering is blur and get stairs on sides. To avoid this we set renderer pixel ratio according to that of device. Some devices have pixel ratio greater than 2 (marketing stategy, quality does not increases much after 2 or 3.) But as the pixel ratio increases the workload on GPU also increases to render. So we set upper limit as 2.

/**
 * Animate
 */
const tick = () => {
  for (let lineIndex = 0; lineIndex < LINE_COUNT; lineIndex++) {
    // Update Velocities
    velocityArray[2*lineIndex] += 0.03;
    velocityArray[2*lineIndex+1] += 0.025;

    // Update the line start
    positionArray[6*lineIndex+2] += velocityArray[2*lineIndex];
    // Update the line end
    positionArray[6*lineIndex+5] +=  velocityArray[2*lineIndex+1];

    // Reset the line after it passes camera, i.e, when it goes behind the camera
    if(positionArray[6*lineIndex+5] > 200) {
      var z = Math.random() * 200 - 100;
      positionArray[6*lineIndex+2] = z;
      positionArray[6*lineIndex+5] = z;
      velocityArray[2*lineIndex] = 0;
      velocityArray[2*lineIndex+1] = 0;
    }
  }


  position.needsUpdate = true;
  
  // Renderer
  renderer.render(scene, camera);

  // Call tick again on the next frame
  requestAnimationFrame(tick);
}

tick()