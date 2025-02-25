// Import the module version of Three.js from your node_modules folder
import * as THREE from './node_modules/three/build/three.module.js';

let scene, camera, renderer, cube;

// Initialize the scene, camera, renderer, and cube
function init() {
  // Create a new scene
  scene = new THREE.Scene();

  // Create a perspective camera (FOV, aspect ratio, near, far)
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Create a WebGL renderer with antialiasing and set its size
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create a cube with BoxGeometry and MeshNormalMaterial
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Attach event listeners to the slider controls
  document.getElementById('sliderX').addEventListener('input', updateCubeScale);
  document.getElementById('sliderY').addEventListener('input', updateCubeScale);
  document.getElementById('sliderZ').addEventListener('input', updateCubeScale);

  // Start the animation loop
  animate();
}

// Function to update the cube's scale using slider values
function updateCubeScale() {
  const scaleX = document.getElementById('sliderX').value;
  const scaleY = document.getElementById('sliderY').value;
  const scaleZ = document.getElementById('sliderZ').value;
  cube.scale.set(scaleX, scaleY, scaleZ);
}

// Animation loop: rotates the cube and renders the scene
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

// Adjust the scene if the window is resized
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize the scene
init();