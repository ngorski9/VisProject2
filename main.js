// Import the module version of Three.js from your node_modules folder
// import * as THREE from './node_modules/three/build/three.module.js';
import * as THREE from 'three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer;
let pointsObject=null;
let boxEdges=null;
let controls=null;
let pivot = null;         // Pivot group for the bounding box.
let rows = null


let selectedNormalizedRows = [];
let selectedOriginalRows = []; //Selected rows for tooltip display.

// Shared variables for the orientation indicator.
let axisScene, axisCamera, axisGroup;

let csvHeader = [];
let normalizedData = [];       // All rows from initial_data_normalized.csv.
let originalCSVData = [];      // All rows from initial_data.csv.





let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.01;

let ambientLight, directionalLight;


// Create a tooltip element.
const tooltip = document.createElement('div');
tooltip.style.position = "absolute";
tooltip.style.backgroundColor = "rgba(255,255,255,0.8)";
tooltip.style.padding = "4px 8px";
tooltip.style.border = "1px solid #000";
tooltip.style.borderRadius = "4px";
tooltip.style.pointerEvents = "none";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

function loadCSVWithHeader(url) {
  return fetch(url)
    .then(response => response.text())
    .then(data => {
      const lines = data.split('\n').filter(line => line.trim().length > 0);
      const header = lines.shift().split(','); // extract header
      const rows = lines.map(line => line.split(',').map(Number));
      return { header, rows };
    });
}

// // Load the CSV file from the specified URL and parse it.
// function loadCSV(url) {
//   return fetch(url)
//     .then(response => response.text())
//     .then(data => {
//       // Split into lines and remove empty lines.
//       const lines = data.split('\n').filter(line => line.trim().length > 0);
//       // Remove the header.
//       csvHeader = lines.shift().split(',');
//       // Parse each line into an array of numbers.
//       rows = lines.map(line => line.split(',').map(Number));
//       // Randomly choose 100 points.
//       selectedRows = [];
//       while (selectedRows.length < 100 && rows.length > 0) {
//         const index = Math.floor(Math.random() * rows.length);
//         selectedRows.push(rows.splice(index, 1)[0]);
//       }
//       return selectedRows;
//     });
// }


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

  Promise.all([
    loadCSVWithHeader('initial_data_normalized.csv'),
    loadCSVWithHeader('initial_data.csv')
  ])
    .then(([normalizedResult, originalResult]) => {
      // Use normalized data for point positions.
      normalizedData = normalizedResult.rows;
      // Use original CSV header and data for display.
      csvHeader = originalResult.header;
      originalCSVData = originalResult.rows;

      // Randomly select 100 rows (assuming both files have the same order).
      selectedNormalizedRows = [];
      selectedOriginalRows = [];
      // We'll work on copies so as not to disturb the original arrays.
      let normCopy = normalizedData.slice();
      let origCopy = originalCSVData.slice();
      let idx = 0;
      while (selectedNormalizedRows.length < normCopy.length && normCopy.length > 0) {
        selectedNormalizedRows.push(normCopy.splice(idx, 1)[0]);
        selectedOriginalRows.push(origCopy.splice(idx, 1)[0]);
        idx += 1
      }

      createPoints(selectedNormalizedRows);
      if (pointsObject) {
        createBoundingBoxFromPoints();
        if (pivot) {
          controls.target.copy(pivot.position);
          controls.update();
        }
      } else {
        console.error("No points were created from CSV data.");
      }
    })
    .catch(err => {
      console.error('Error loading CSV files:', err);
    });


  // loadCSV('initial_data_normalized.csv')
  //   .then(rows => {
  //     createPoints(rows);
  //     if (pointsObject) {
  //       createBoundingBoxFromPoints();
  //       // createAxisLabels();
  //       // Set OrbitControls target to the pivot (box center)
  //       if (pivot) {
  //         controls.target.copy(pivot.position);
  //         controls.update();
  //       }
  //     } else {
  //       console.error("No points were created from CSV data.");
  //     }
  //   })
  //   .catch(err => {
  //     console.error('Error loading CSV data:', err);
  //   });


  createOrientationIndicator();

  // Add the mousemove event listener for hover.
  document.addEventListener('mousemove', onMouseMove, false);


  // Create lights in the scene:
  ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  // Initially position the light at the camera's position:
  directionalLight.position.copy(camera.position);
  // Set its target to a point in front of the camera.
  // (You must add the target to the scene.)
  directionalLight.target.position.copy(camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3())));
  scene.add(directionalLight);
  scene.add(directionalLight.target);



  animate();
}

function project_row(row){
  if( animationCounter == 0 ){
    const x = row[selectors[0][0]] * coeffs[0][0] + row[selectors[0][1]] * coeffs[0][1] + row[selectors[0][2]] * coeffs[0][2]
    const y = row[selectors[1][0]] * coeffs[1][0] + row[selectors[1][1]] * coeffs[1][1] + row[selectors[1][2]] * coeffs[1][2]
    const z = row[selectors[2][0]] * coeffs[2][0] + row[selectors[2][1]] * coeffs[2][1] + row[selectors[2][2]] * coeffs[2][2]
    return [x,y,z]
  } else {
    const x1 = row[selectors[0][0]] * coeffs[0][0] + row[selectors[0][1]] * coeffs[0][1] + row[selectors[0][2]] * coeffs[0][2]
    const y1 = row[selectors[1][0]] * coeffs[1][0] + row[selectors[1][1]] * coeffs[1][1] + row[selectors[1][2]] * coeffs[1][2]
    const z1 = row[selectors[2][0]] * coeffs[2][0] + row[selectors[2][1]] * coeffs[2][1] + row[selectors[2][2]] * coeffs[2][2]

    const x2 = row[selectors_old[0][0]] * coeffs[0][0] + row[selectors_old[0][1]] * coeffs[0][1] + row[selectors_old[0][2]] * coeffs[0][2]
    const y2 = row[selectors_old[1][0]] * coeffs[1][0] + row[selectors_old[1][1]] * coeffs[1][1] + row[selectors_old[1][2]] * coeffs[1][2]
    const z2 = row[selectors_old[2][0]] * coeffs[2][0] + row[selectors_old[2][1]] * coeffs[2][1] + row[selectors_old[2][2]] * coeffs[2][2]

    const x = (animationCounter / animation_length) * x2 + (1.0 - animationCounter / animation_length) * x1
    const y = (animationCounter / animation_length) * y2 + (1.0 - animationCounter / animation_length) * y1
    const z = (animationCounter / animation_length) * z2 + (1.0 - animationCounter / animation_length) * z1
    return [x,y,z]
  }

}

// // Function to update the cube's scale using slider values
// function updateCubeScale() {
//   const scaleX = document.getElementById('sliderX').value;
//   const scaleY = document.getElementById('sliderY').value;
//   const scaleZ = document.getElementById('sliderZ').value;
//   cube.scale.set(scaleX, scaleY, scaleZ);
// }



// Create points based on the CSV data and your coefficient vectors.
function createPoints(rows) {

  const count = rows.length;
  // Create a sphere geometry for each point.
  // Adjust the radius and segment counts as needed.
  const sphereGeometry = new THREE.SphereGeometry(0.01, 8, 8);

  // // You can use any material; here we use a basic red material.
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  // const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const instancedMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, count);
  
  // Temporary object to set instance transforms.
  const dummy = new THREE.Object3D();
  
  rows.forEach((row, i) => {
    const projection = project_row(row);
    dummy.position.set(projection[0], projection[1], projection[2]);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
  });



  instancedMesh.instanceMatrix.needsUpdate = true;
  pointsObject = instancedMesh;
  scene.add(pointsObject);

  // // Add lighting so spheres are visible
  // const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  // scene.add(ambientLight);
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  // directionalLight.position.set(1, 1, 1).normalize();
  // scene.add(directionalLight);

  // const positions = [];
  // rows.forEach(row => {
  //   let projection = project_row(row)
  //   positions.push(projection[0], projection[1], projection[2]);
  // });

  // // Create a BufferGeometry and add the computed positions as an attribute.
  // const pointsGeometry = new THREE.BufferGeometry();
  // pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  // // Create a PointsMaterial for the points.
  // const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.01 });

  // // Create the Points object and add it to the scene.
  // pointsObject = new THREE.Points(pointsGeometry, pointsMaterial);
  // scene.add(pointsObject);
}

// Create a bounding box (drawn as edges) that exactly encloses the data points.
function createBoundingBoxFromPoints() {
  const box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1))

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



// Event handler for mouse movement to implement hover functionality.
function onMouseMove(event) {
  // Compute normalized device coordinates (-1 to +1) for the mouse.
  if (!pointsObject) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster using the main camera.
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(pointsObject);
  
  if (intersects.length > 0) {
    const intersect = intersects[0];
    const index = intersect.instanceId;// instanceId;index
    // Use the corresponding CSV row from selectedRows.
    const info = selectedOriginalRows[index];
    const indicesToShow = [...Array(6).keys(), ...selectors.flat()];
    const textParts = [];
    indicesToShow.forEach(i => {
      if (i < csvHeader.length && i < info.length) {
        textParts.push(`${csvHeader[i].trim()}: ${info[i]}`);
      }
    });

    // let text = csvHeader.map((header, i) => header.trim() + ": " + info[i]).join(", ");
    tooltip.innerHTML = textParts.join(", ");
    tooltip.style.display = "block";
    tooltip.style.left = (event.clientX + 10) + "px";
    tooltip.style.top = (event.clientY + 10) + "px";
  } else {
    tooltip.style.display = "none";
  }
}

function updatePointPositions() {
  if (!pointsObject) return;
  
  const dummy = new THREE.Object3D();
  
  // Loop over each selected normalized row.
  for (let i = 0; i < selectedNormalizedRows.length; i++) {
    const row = selectedNormalizedRows[i];
    const [x, y, z] = project_row(row);
    
    dummy.position.set(x, y, z);
    dummy.updateMatrix();
    pointsObject.setMatrixAt(i, dummy.matrix);
  }
  pointsObject.instanceMatrix.needsUpdate = true;
}


// Animation loop: rotates the cube and renders the scene
function animate() {
  requestAnimationFrame(animate);

  if( animationCounter > 0 ){
    animationCounter -= 1;
    if(animationCounter == 0){
      for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            selectors_old[i][j] = selectors[i][j]
        }
    }
    }
  }

  updatePointPositions();
  // if( pointsObject ){
  //   let g = pointsObject.geometry
  //   let p = g.getAttribute("position")
  //   for(let i = 0; i < p.count; ++i){
  //     let row = selectedNormalizedRows[i]

  //     let projection = project_row(row)

  //     // update the positions
  //     p.setXYZ(i,projection[0],projection[1],projection[2])
  //     p.needsUpdate = true
  //   }
  // }

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
  

  // Render the orientation indicator in the lower right corner.
  // First, clear the depth buffer so the overlay appears on top.
  renderer.clearDepth();
  // Define the indicator viewport (e.g., 150x150 pixels in the lower right).
  const indicatorSize = 300;
  renderer.setViewport(window.innerWidth - indicatorSize - 10, 10, indicatorSize, indicatorSize);
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