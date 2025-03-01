// Import the module version of Three.js from your node_modules folder
// import * as THREE from './node_modules/three/build/three.module.js';
import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer;
let pointsObject=null;
let boxEdges=null;
let controls=null;
let pivot = null;         // Pivot group for the bounding box.


// Shared variables for the orientation indicator.
let axisScene, axisCamera, axisGroup;

const coeff1 = [1, 0, 0]; // Coefficients for the first CSV column.
const coeff2 = [0, 1, 0]; // Coefficients for the second CSV column.
const coeff3 = [0, 0, 1]; // Coefficients for the third CSV column.



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
  camera.up.set(0, 1, 0);

  // Create a WebGL renderer with antialiasing and set its size
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1); // White background.
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);

   // --- Set Up OrbitControls for mouse interaction ---
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // for smooth controls


  loadCSV('initial_data.csv')
    .then(rows => {
      createPoints(rows);
      if (pointsObject) {
        createBoundingBoxFromPoints();
        // createAxisLabels();
        // Set OrbitControls target to the pivot (box center)
        if (pivot) {
          controls.target.copy(pivot.position);
          controls.update();
        }
      } else {
        console.error("No points were created from CSV data.");
      }
    })
    .catch(err => {
      console.error('Error loading CSV data:', err);
    });


  createOrientationIndicator();

  animate();
}

// // Function to update the cube's scale using slider values
// function updateCubeScale() {
//   const scaleX = document.getElementById('sliderX').value;
//   const scaleY = document.getElementById('sliderY').value;
//   const scaleZ = document.getElementById('sliderZ').value;
//   cube.scale.set(scaleX, scaleY, scaleZ);
// }

// Load the CSV file from the specified URL and parse it.
function loadCSV(url) {
  return fetch(url)
    .then(response => response.text())
    .then(data => {
      // Split into lines and remove empty lines.
      const lines = data.split('\n').filter(line => line.trim().length > 0);
      // Remove the header.
      lines.shift();
      // Parse each line into an array of numbers.
      const rows = lines.map(line => line.split(',').map(Number));
      // Randomly choose 100 points.
      const selectedRows = [];
      while (selectedRows.length < 100 && rows.length > 0) {
        const index = Math.floor(Math.random() * rows.length);
        selectedRows.push(rows.splice(index, 1)[0]);
      }
      return selectedRows;
    });
}

// Create points based on the CSV data and your coefficient vectors.
function createPoints(rows) {
  const positions = [];
  rows.forEach(row => {
    // Assume each row has at least three columns: v1, v2, v3.
    const v1 = row[0], v2 = row[1], v3 = row[2];
    // Compute the 3D coordinate via the linear combination:
    // x = v1 * coeff1[0] + v2 * coeff2[0] + v3 * coeff3[0]
    // y = v1 * coeff1[1] + v2 * coeff2[1] + v3 * coeff3[1]
    // z = v1 * coeff1[2] + v2 * coeff2[2] + v3 * coeff3[2]
    const x = v1 * coeff1[0] + v2 * coeff2[0] + v3 * coeff3[0];
    const y = v1 * coeff1[1] + v2 * coeff2[1] + v3 * coeff3[1];
    const z = v1 * coeff1[2] + v2 * coeff2[2] + v3 * coeff3[2];
    positions.push(x, y, z);
  });

  // Create a BufferGeometry and add the computed positions as an attribute.
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  // Create a PointsMaterial for the points.
  const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 1.0 });

  // Create the Points object and add it to the scene.
  pointsObject = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(pointsObject);
}


// Create a bounding box (drawn as edges) that exactly encloses the data points.
function createBoundingBoxFromPoints() {
  // Compute the bounding box from the points' geometry.
  const geometry = pointsObject.geometry;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox; // THREE.Box3 object.

  // Compute the center and size of the bounding box.
  const boxCenter = new THREE.Vector3();
  box.getCenter(boxCenter);
  const boxSize = new THREE.Vector3();
  box.getSize(boxSize);

  // Create a box geometry that matches the size of the bounding box.
  const boundingBoxGeometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
  boundingBoxGeometry.center();

  const edgesGeometry = new THREE.EdgesGeometry(boundingBoxGeometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  boxEdges = new THREE.LineSegments(edgesGeometry, lineMaterial);
  // Position the edges at the center of the bounding box.
  pivot = new THREE.Group();
  pivot.add(boxEdges);
  pivot.position.copy(boxCenter);
  scene.add(pivot);

  // scene.add(boxEdges);

  // --- Set Camera Position Based on Box Size and Position ---
  // Determine the largest dimension of the bounding box.
  const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z);
  // Choose a distance factor (e.g., 2.5 times the max dimension) so the box fits in view.
  const distance = maxDimension * 1.5;
  // Position the camera along the Z-axis relative to the box center.
  camera.position.set(boxCenter.x, boxCenter.y, boxCenter.z+ distance);
  // Ensure the camera looks directly at the center of the box.
  camera.lookAt(boxCenter);
  controls.target.copy(boxCenter);
  controls.update();
}

// Create a separate scene for the orientation indicator in the lower left corner.
function createOrientationIndicator() {
  // Create a new scene for the axis indicator.
  axisScene = new THREE.Scene();
  
  // Create an orthographic camera for the indicator.
  const size = 100;
  axisCamera = new THREE.OrthographicCamera(-size, size, size, -size, 0.1, 1000);

  axisCamera.up.set(0, 1, 0);
  axisCamera.position.set(0, 0, 200);
  axisCamera.lookAt(0,0,0);
  
  // axisCamera = new THREE.PerspectiveCamera(
  //   75,
  //   window.innerWidth / window.innerHeight,
  //   0.1,
  //   150
  // );
  // axisCamera.position.set(100, 0, 0);
  // axisCamera.lookAt(0,0,0);
  
  // Create a group to hold the axis arrows.
  axisGroup = new THREE.Group();
  
  // Define arrow length.
  const arrowLength = 40;
  // Create three ArrowHelpers for the X, Y, and Z axes.
  const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), arrowLength, 0xff0000, arrowLength * 0.2, arrowLength * 0.1);
  const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), arrowLength, 0x00ff00, arrowLength * 0.2, arrowLength * 0.1);
  const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), arrowLength, 0x0000ff, arrowLength * 0.2, arrowLength * 0.1);
  axisGroup.add(arrowX);
  axisGroup.add(arrowY);
  axisGroup.add(arrowZ);
  
  // Add labels at the arrow tips.
  const tipX = new THREE.Vector3(1.3*arrowLength, 0, 0);
  const tipY = new THREE.Vector3(0, 1.3*arrowLength, 0);
  const tipZ = new THREE.Vector3(0, 0, 1.3*arrowLength);
  const labelX = createTextSprite("X", { fontsize: 16, scale: { x: 16, y: 16, z: 16 } });
  labelX.position.copy(tipX);
  axisGroup.add(labelX);
  const labelY = createTextSprite("Y", { fontsize: 16, scale: { x: 16, y: 16, z: 16 }});
  labelY.position.copy(tipY);
  axisGroup.add(labelY);
  const labelZ = createTextSprite("Z", { fontsize: 16 , scale: { x: 16, y: 16, z: 16 }});
  labelZ.position.copy(tipZ);
  axisGroup.add(labelZ);
  
  // Add the axis group to the indicator scene.
  axisScene.add(axisGroup);
}


// Create a simple sprite with text to be used as an axis label.
function createTextSprite(message, parameters) {
  parameters = parameters || {};
  const fontface = parameters.fontface || "Arial";
  const fontsize = parameters.fontsize || 24;
  const borderThickness = parameters.borderThickness || 4;
  const borderColor = parameters.borderColor || { r:0, g:0, b:0, a:1.0 };
  const backgroundColor = parameters.backgroundColor || { r:255, g:255, b:255, a:1.0 };

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = fontsize + "px " + fontface;
  const metrics = context.measureText(message);
  const textWidth = metrics.width;
  canvas.width = textWidth + borderThickness * 2;
  canvas.height = fontsize * 1.4 + borderThickness * 2;
  context.font = fontsize + "px " + fontface;
  
  // Draw background.
  context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
  context.fillRect(0, 0, canvas.width, canvas.height);
  // Draw text.
  context.fillStyle = "rgba(0, 0, 0, 1.0)";
  context.fillText(message, borderThickness, fontsize + borderThickness);
  
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  // Adjust the sprite's scale (you may change these values as needed).
  if (parameters.scale) {
    sprite.scale.set(parameters.scale.x, parameters.scale.y, parameters.scale.z);
  } else {
    sprite.scale.set(2, 1, 1);
  }
  
  return sprite;
}

// // Add axis labels near the positive faces of the bounding box.
// function createAxisLabels() {
//   // Recompute the bounding box from the points.
//   const geometry = pointsObject.geometry;
//   geometry.computeBoundingBox();
//   const box = geometry.boundingBox;
//   const boxCenter = new THREE.Vector3();
//   box.getCenter(boxCenter);
  
//   // For the x-axis: place the label a little past the maximum x.
//   const xLabel = createTextSprite("X");
//   xLabel.position.set(box.max.x + 0.2, boxCenter.y, boxCenter.z);
//   scene.add(xLabel);
  
//   // For the y-axis: place the label a little past the maximum y.
//   const yLabel = createTextSprite("Y");
//   yLabel.position.set(boxCenter.x, box.max.y + 0.2, boxCenter.z);
//   scene.add(yLabel);
  
//   // For the z-axis: place the label a little past the maximum z.
//   const zLabel = createTextSprite("Z");
//   zLabel.position.set(boxCenter.x, boxCenter.y, box.max.z + 0.2);
//   scene.add(zLabel);
// }

// Animation loop: rotates the cube and renders the scene
function animate() {
  requestAnimationFrame(animate);


  // Synchronize the orientation indicator's rotation with the main scene's pivot.
  controls.update();  // Update mouse controls.

   // --- Update the HUD orientation ---
  // Here, we copy the main camera's quaternion to the HUD's axis group so that the arrow indicator reflects
  // the same orientation as the camera. This makes the arrow HUD "rotate" along with your camera movements.
  if (axisGroup &&  camera) {
    const rotationMatrix = new THREE.Matrix4().extractRotation(camera.matrixWorldInverse);
    axisGroup.setRotationFromMatrix(rotationMatrix);
  }

  renderer.clear(); // Clear the previous frame
  // Render the main scene.
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  
  // Render the orientation indicator in the lower left corner.
  // First, clear the depth buffer so the overlay appears on top.
  renderer.clearDepth();
  // Define the indicator viewport (e.g., 150x150 pixels in the lower left).
  const indicatorSize = 300;
  renderer.setViewport(10, 10, indicatorSize, indicatorSize);
  renderer.render(axisScene, axisCamera);
  
  // Restore the full viewport.
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  // scene.rotation.y += 0.01;
  // renderer.render(scene, camera);
}

// Adjust the scene if the window is resized
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize the scene
init();