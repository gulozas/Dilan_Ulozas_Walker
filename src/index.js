import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./styles.css";

let scene, camera, renderer;
let geometry, material, cube;
let colour, intensity, light;
let ambientLight;
let walker;
let orbit;

let listener, sound, audioLoader;
const colors = [];

for (let i = 0; i < 10; i++) {
  const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  colors.push(randomColor);
}

console.log(colors);

let clock, delta, interval;

let startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

// clock generator to ensure we can clamp some operations at different timed rates if needed
clock = new THREE.Clock();
delta = 0;
interval = 1 / 12; // 12 fps

function init() {
  // remove overlay
  let overlay = document.getElementById("overlay");
  overlay.remove();

  //create our scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfdfdf);
  //create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  //specify our renderer and add it to our document
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //create the orbit controls instance so we can use the mouse move around our scene
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableZoom = true;

  // lighting
  colour = 0xffffff;
  intensity = 1;
  light = new THREE.DirectionalLight(colour, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // create a box to spin

  geometry = new THREE.DodecahedronGeometry();
  material = new THREE.MeshNormalMaterial(); // Change this from normal to Phong in step 5
  cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  //sound for single source and single listener

  listener = new THREE.AudioListener();
  camera.add(listener);
  sound = new THREE.PositionalAudio(listener);

  audioLoader = new THREE.AudioLoader();
  audioLoader.load(
    "sounds/514153__edwardszakal__beep-buzz.mp3",
    function (buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(10);
      sound.setRolloffFactor(0.9);
      sound.playbackRate = 10;
      sound.offset = 0.1;
      sound.setDirectionalCone(180, 230, 0.1);
      sound.setLoop(false);
      sound.setVolume(0.5);
    }
  );
  walker = new Walker(0, 0, 0);
  play();
}

class Walker {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.dotGeometry = new THREE.DodecahedronGeometry();
  }

  step() {
    let choice = THREE.MathUtils.randInt(0, 5); // six possible choices
    if (choice == 0) {
      this.x += 0.5; // right
    } else if (choice === 1) {
      this.x -= 0.5; // left
    } else if (choice === 2) {
      this.y += 0.5; // up
    } else if (choice === 3) {
      this.y -= 0.5; // down
    } else if (choice === 4) {
      this.z += 0.5; // fore
    } else {
      this.z -= 0.5; // back
    }
    {
      sound.isPlaying = false;
      sound.offset = 0.0 + Math.random() * 0.05;
      sound.setVolume(0.8 + Math.random() * 0.1);
      sound.duration = 0.1;
      sound.play();

      this.dotMaterial = new THREE.MeshLambertMaterial({});
      this.dotMaterial.color = new THREE.Color(colors);

      this.dot = new THREE.Mesh(this.dotGeometry, this.dotMaterial);
      this.dot.translateX(this.x);
      this.dot.translateY(this.y);
      this.dot.translateZ(this.z);
      scene.add(this.dot);
    }
  }
}

// stop animating (not currently used)
function stop() {
  renderer.setAnimationLoop(null);
}

// simple render function

function render() {
  renderer.render(scene, camera);
}

// start animating

function play() {
  //using the new setAnimationLoop method which means we are WebXR ready if need be
  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

function update() {
  orbit.update();
  //update stuff in here
  delta += clock.getDelta();

  if (delta > interval) {
    walker.step();
    delta = delta % interval;
  }
}
