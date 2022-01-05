import * as THREE from '../build/three.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import BasicCustomShader from '../shaders/BasicCustomShader.js'
import ShadowShader from '../shaders/ShadowShader.js';
import { OrbitControls } from './jsm/libs/OrbitControls.js';
import { PointerLockControls } from './jsm/libs/PointerLockControls.js';
import * as Shaders from "../shaders/Shaders";

//Enable camera rotation with p button
//Move camera right-left, forward-backward with arrow keys
//Move camera up-down with page up-down keys
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();

var camera, scene, renderer, controls;
var raycaster, clickMouse, mouseMove, draggable, selectedObject;
var keyboard={};
var cameraMovementSpeed = 0.1;
var pointLight,ambientLight,spotLight,light1,light1Helper, directionalLight;
var currentlyDisplayingTree;

// Loading manager
var loadingManager = null;
var RESOURCES_LOADED = false;

// loaded models
var cactusModel, poplarTreeModel, pineTreeModel, appleTreeModel, fenceModel;

// Add every object to this array
var sceneObjects = [];
function main(){
     
    // SCENES
    scene = new THREE.Scene();
       
    
    //LIGHTS
    initLights();
    
    //CAMERA
    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0,5,10);
    sceneObjects.push(camera);
    
    // Loading Manager
    loadingManager = new THREE.LoadingManager();
    // LOAD MODELS 
    loadModels();
    
    loadingManager.onLoad = function(){
            console.log("loaded all resources");
            RESOURCES_LOADED = true;
            // add models to the scene
            onResourcesLoaded();
    };
    
    // LOAD MODELS 
    //loadModels();
    //console.log(cactusModel);
    //sceneDisplay.add(camera);  
    //displayCactus(new THREE.Vector3( 1, -1, -1 ));
    
    //RAYCAST
    raycaster = new THREE.Raycaster();
    clickMouse = new THREE.Vector2();
    mouseMove = new THREE.Vector2();
    window.addEventListener('click', event => {
        if(draggable){
            console.log("dropping draggable "+ draggable.userData.name);
            draggable = null;
            return;
        } 
        
        clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( clickMouse, camera );
        
        // calculate objects intersecting the picking ray
	const found = intersect(clickMouse);
        if(found.length > 0 && found[0].object.parent.userData.draggable){
            draggable = found[0].object.parent;
            selectedObject = found[0].object.parent;
        }
        /*if(found.length > 0 && found[0].object.userData.draggable){
            console.log(found[0].object.position);
            draggable = found[0].object;
            selectedObject = found[0].object;
            console.log("found draggable " + draggable.userData.name); 
        } */
    });
    window.addEventListener('mousemove', event => {
        mouseMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouseMove.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });
    
    // To resize the window
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'wheel', onMouseWheel, false );
    
    //RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xA6CBD8);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; //Shadow
    renderer.shadowMapSoft = true; // Shadow
    renderer.shadowMap.type = THREE.PCFShadowMap; //Shadow
    document.body.appendChild(renderer.domElement);
    
    // KEY EVENT
    keyEvents();
    
    // Input Panel
    createPanel();
    
  /*  const controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = 0.9 * Math.PI / 2;
				controls.enableZoom = true;
    
    controls.update();  */
    
    controls = new PointerLockControls( camera, renderer.domElement );
 
    
    // const material = new THREE.ShaderMaterial({
    //     vertexShader: vertexShader3,
    //     fragmentShader: fragmentShader3,
    //     uniforms:{
    //         color1: {
    //             value: new THREE.Color("purple")
    //         },
    //         color2: {
    //             value: new THREE.Color("red")
    //         }
    //     }
    // });

    //Shadow material
    // const basicCustomShaderMaterial = new THREE.ShaderMaterial({
    //   ...BasicCustomShader,
    //   fog: true,
    //   lights: true,
    //   dithering: true,
    // });

    //-----------------NEW SHADER TEST STARTS-------------------------------------------------------------------------//
    //soil land block created via buildTwistMaterial
    // var time = 0;
    // var geometry = new THREE.BoxGeometry(2, 2, 2);
    // var soilLand = new THREE.Mesh(geometry, buildTwistMaterial(5, time));
    // soilLand.name = "soilLand";
    // soilLand.userData.draggable = true;
    // soilLand.castShadow = true;
    // soilLand.receiveShadow = true;
    // soilLand.position.y += 1;
    // soilLand.position.z -= 3;
    // soilLand.position.x -= 3;
    // scene.add(soilLand);
    // sceneObjects.push(soilLand);

    // //stone cube custom phong shader parameters
    // var Ka = new THREE.Vector3(0.53, 0.55, 0.55); //stone gray color
    // var Kd = new THREE.Vector3(0.55, 0.55, 0.55); //stone gray light reflecting face color
    // var Ks = new THREE.Vector3(0.6, 0.6, 0.6); //reflected light color (gray to white)
    // var lightIntensity = new THREE.Vector4(0.4, 0.4, 0.4, 1.0);
    // var lightPosition = new THREE.Vector4(0.0, 20000.0, 0.0, 1.0);
    // var shininess = 25; //diffusing (unfocused)

    // //stone cube block created via CustomPhongShader
    // var angle = 0;
    // var stoneCubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    // var stoneCube = new THREE.Mesh(stoneCubeGeometry, CustomPhongShader(Ka, Kd, Ks, lightIntensity, lightPosition, shininess));
    // stoneCube.userData.draggable = true;
    // stoneCube.castShadow = true;
    // stoneCube.position.y += 1;
    // stoneCube.position.z -= 3;
    // stoneCube.position.x += 3;
    // scene.add(stoneCube);
    // sceneObjects.push(stoneCube);
    //-----------------NEW SHADER TEST ENDS---------------------------------------------------------------------------//

    // add pine tree to scene
    /*  createPine(new THREE.Vector3( 0, 0, 0 ));
    
    // add cactus to scene
    createCactus(new THREE.Vector3( 1, 0, -1 ));
    createAppleTree(new THREE.Vector3( 1, 0, -2 ));
    createPoplarTree(new THREE.Vector3( 1, 0, -2 ));  */
    
  /*  appleTreeGLTF(new THREE.Vector3( -5, 0, 2 ));
    poplarTreeGLTF(new THREE.Vector3( -2, 0, 2 ));
    pineTreeGLTF(new THREE.Vector3( 2, 0, 2 ));
    cactusGLTF(new THREE.Vector3( 2, 0, 2 )); */
    
    // PLANE
    createPlanes();
    /*const geometry_plane = new THREE.PlaneBufferGeometry(40, 40, 20, 20);
    const material_plane = new THREE.MeshStandardMaterial({
        color: new THREE.Color("green"),
    });
    const plane = new THREE.Mesh(geometry_plane, material_plane);
    plane.material.needsUpdate = true; 
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    plane.castShadow = true;
    plane.userData.draggable = false;
    plane.userData.ground = true;
    scene.add(plane);
    sceneObjects.push(plane); */


    var animate = function () {

        cameraControls();

        if(twist) {
            twistScene();
        }

        dayAndNightCycle();

    /*    if(moveRight){
            camera.position.x += 1.0;
        }
        if(moveLeft){
            camera.position.x -= 1.0;
        }
        if(moveForward){
            camera.position.z -= 1.0;
        }
        if(moveBackward){
            camera.position.z += 1.0;
        }
        if(moveUp){
            camera.position.y += 1.0;
        }
        if(moveDown){
            camera.position.y -= 1.0;
        } */
        requestAnimationFrame( animate );
        render();

    };

    function render() {

        renderer.render( scene, camera );

    }

    animate();
}

var timePassed;
function dayAndNightCycle() {
    timePassed = performance.now() / 37500;
    directionalLight.position.y = Math.sin(timePassed) * 30;
    directionalLight.position.x = Math.cos(timePassed) * 30 - directionalLight.position.y;
    directionalLight.position.z = Math.cos(timePassed) * 30;
    directionalLight.intensity = Math.max(Math.sin(timePassed), 0);
    if(directionalLight.position.y <= 0) {
        directionalLight.intensity = 0;
        timePassed = performance.now() / 12500;
    }
    else if(directionalLight.position.y > 0) timePassed = performance.now() / 37500;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function keyEvents(){
        window.addEventListener("keydown", function(event){ 
            switch ( event.code ) {
                case 'ArrowUp':
		case 'KeyW':
                    moveForward = true;
                    break;
		case 'ArrowLeft':
		case 'KeyA':                    
                    moveLeft = true;
		    break;
		case 'ArrowDown':
		case 'KeyS':
                    moveBackward = true;
                    break;
		case 'ArrowRight':
		case 'KeyD':
                    moveRight = true;
                    break;
                case 'PageUp':
                    moveUp = true;
                    camera.position.y += 0.5;
                    break;
                case 'PageDown':
                    moveDown = true;
                    camera.position.y -= 0.5;
                    break;
                case 'KeyP':
                    if(!controls.isLocked){
                        controls.lock();
                    }
                    else{
                        controls.unlock();
                    }
                    break;
                    
        }
    });
        window.addEventListener("keyup", function(event){
            switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                    moveLeft = false;
                    break;

            case 'ArrowDown':
            case 'KeyS':
                    moveBackward = false;
                    break;

            case 'ArrowRight':
            case 'KeyD':
                    moveRight = false;
                    break;
            case 'PageUp':
                moveUp = false;
                break;
            case 'PageDown':
                moveDown = false;
                break;

            }
        });
}
function initLights(){
    // LIGHTS
    // Ambient light for general illumination
    ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    //sceneDisplay.add(ambientLight);
    sceneObjects.push(ambientLight);
    
    // point light
    // pointLight = new THREE.PointLight(0xffffff, 0.5, 120);
    // pointLight.position.set(-3, 60, -3);
    // pointLight.castShadow = true;
    // pointLight.shadow.camera.near = 0.1;
    // pointLight.shadow.camera.far = 64;
    // scene.add(new THREE.CameraHelper(pointLight.shadow.camera)); // Help show light properties in the scene
    // scene.add(pointLight);
    // sceneObjects.push(pointLight);

    // directional light
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-3, 20, -3);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 64;
    directionalLight.shadow.camera.top += 80;
    directionalLight.shadow.camera.bottom -= 80;
    directionalLight.shadow.camera.right += 80;
    directionalLight.shadow.camera.left -= 80;
    directionalLight.shadow.mapSize.width = 2048; // Shadow Quality
    directionalLight.shadow.mapSize.height = 2048; // Shadow Quality
    directionalLight.shadow.bias = 0.0001;
    scene.add(new THREE.CameraHelper(directionalLight.shadow.camera)); // Help show light properties in the scene
    scene.add(directionalLight);
    sceneObjects.push(directionalLight);
    
    // Spotlight for specific illumination
    spotLight = new THREE.SpotLight(0xAAAAAA);
    spotLight.position.set(0, 4, 0);
    spotLight.castShadow = true;
    spotLight.shadow.bias = 0.0001;
    spotLight.shadow.mapSize.width = 2048; // Shadow Quality
    spotLight.shadow.mapSize.height = 2048; // Shadow Quality
    scene.add(new THREE.CameraHelper(spotLight.shadow.camera)); // Help show light properties in the scene
    scene.add(spotLight.target);
    scene.add(spotLight);
    sceneObjects.push(spotLight);
}

//-----------------DECISION TREE TEST STARTS----------------------------------------------------------------------//
//Import DecisionTree
var DecisionTree = require('decision-tree');

//Create training data
//Test data is compared to this data to check accuracy
//Predictions are made on this data to give results
var training_data = [
    {"temperature": "cold", "water": "wet", "tree": "Apple"},
    {"temperature": "cold", "water": "dry", "tree": "Pine"},
    {"temperature": "warm", "water": "dry", "tree": "Cactus"},
    {"temperature": "warm", "water": "wet", "tree": "Poplar"},
];

//Used to check the accuracy of the model
var test_data = [
    {"temperature": "cold", "water": "wet", "tree": "Apple"},
    {"temperature": "cold", "water": "dry", "tree": "Pine"},
    {"temperature": "warm", "water": "dry", "tree": "Cactus"},
    {"temperature": "warm", "water": "wet", "tree": "Poplar"},
];

var class_name = "tree";
var features = ["temperature", "water"];

var dt = new DecisionTree(class_name, features);

dt.train(training_data);

var accuracy = dt.evaluate(test_data);
console.log("Decision Tree Test Data Accuracy:", accuracy, "Expected: 1");

var predicted_class;
var predictionCount = 0;

function setTemperature(temperatureInput) {
    if (-45 <= temperatureInput && temperatureInput <= 10) {
        return "cold";
    }
    else if (10 < temperatureInput && temperatureInput <= 70) {
        return "warm";
    }

    console.log("Given temperature value", temperatureInput, "is not in the value range!");
    return null;
}

function setWater(waterInput) {
    if (100 <= waterInput && waterInput <= 550) {
        return "dry";
    }
    else if (550 < waterInput && waterInput <= 1000) {
        return "wet";
    }

    console.log("Given water value", waterInput, "is not in the value range!");
    return null;
}

//According to given values predicts and returns the prediction
function predictTree(temperatureInput, waterInput) {
    //Set prediction values
    var temperature = setTemperature(temperatureInput);
    var water = setWater(waterInput);

    //Do prediction
    if (temperature != null && water != null) {
        return dt.predict({
            temperature: temperature,
            water: water
        });
    }

    console.log("Some prediction value is wrong. Continuing without predicting!")
    return null;
}

//When called (from the UI) handles everything about prediction
function handlePrediction(temperatureInput, waterInput) {
    //Predict the tree according to given values
    predicted_class = predictTree(temperatureInput, waterInput);

    if (predicted_class != null) {
        predictionCount++;
        console.log("Prediction (" + predictionCount + "):", predicted_class);

        //TODO: Call tree instantiation and algorithm animation function here
        //TODO: Call point system function here
    }
}

/* Import/Export trained model
//To export (save) trained model for future use
var treeJson = dt.toJSON();
console.log("treeJson: ", treeJson);
//Create a new model
var treeJson = dt.toJSON();
var preTrainedDecisionTree = new DecisionTree(treeJson);
//Alternately, you can also import a previously trained model on an existing tree instance,
assuming the features & class are the same:
var treeJson = dt.toJSON();
dt.import(treeJson);
*/
//-----------------DECISION TREE TEST ENDS------------------------------------------------------------------------//
var twist = false;

function createPanel(){
    const panel = new GUI({ width: 310 } );
    const parameters ={
        temperature:15,
        water: 120,
        humidity:0,
        light:0,
    };
    panel.add(parameters, 'temperature', -45, 70, 1).name('Temperature');
    panel.add(parameters, 'water', 100, 1000, 1).name('Water (in ml)');
    panel.add(parameters, 'humidity', 0, 0, 1).name('Humidity');
    panel.add(parameters, 'light', 0, 0, 1).name('Light');

    const objectSettings = {
        'X Rotation':0.0,
        'Y Rotation':0.0,
        'Z Rotation':0.0,
    }
    
    const object = panel.addFolder('Object Settings');
    const cameraTilt = panel.addFolder('Camera Rotate Z');
    // OBJECT ROTATION
    object.add(objectSettings,'X Rotation',0,Math.PI * 2).onChange( function(val){
         rotateAboutXAxis(selectedObject,val);
    });
    object.add(objectSettings, 'Y Rotation',0,Math.PI * 2).onChange( function(val){
         rotateAboutYAxis(selectedObject,val);
    });
    object.add(objectSettings, 'Z Rotation',0,Math.PI * 2).onChange( function(val){
         rotateAboutZAxis(selectedObject,val);
    });
    object.close();
    
    // OBJECT TRANSDORM
    var moveForward = { moveForward:function(){ transformOnY(selectedObject,1); }};
    object.add(moveForward,'moveForward').name("Move it forward");
    var moveBackward = { moveBackward:function(){ transformOnY(selectedObject,-1); }};
    object.add(moveBackward,'moveBackward').name("Move it backward");
    var moveRight = { moveRight:function(){ transformOnX(selectedObject,1); }};
    object.add(moveRight,'moveRight').name("Move it right");
    var moveLeft = { moveLeft:function(){ transformOnX(selectedObject,-1); }};
    object.add(moveLeft,'moveLeft').name("Move it left");
    var moveUp = { moveUp:function(){ transformOnZ(selectedObject,-1); }};
    object.add(moveUp,'moveUp').name("Move it up");
    var moveDown = { moveDown:function(){ transformOnZ(selectedObject,1); }};
    object.add(moveDown,'moveDown').name("Move it down");
    
    cameraTilt.add(camera.rotation,"z",0,Math.PI * 2);

    //Take inputs from UI and call when prediction button is clicked
    var predictionButton = {
        add:function(){
            console.log("Start Prediction button clicked.");
            handlePrediction(parameters.temperature, parameters.water);
        }
    };
    panel.add(predictionButton,'add').name("Start Prediction");

    //Shaders
    var isDefaultMaterial = true;
    var defaultMaterials = [];
    var count = 0;
    var switchShadersButton = {
        add:function() {
            console.log("switchShadersButton is clicked");
            sceneObjects.forEach(function(obj) {
                if(obj.name === "plane") {
                    if(isDefaultMaterial) {
                        defaultMaterials[count] = obj.material;
                        count++;
                        obj.material = new THREE.MeshStandardMaterial({
                            color: obj.material.color,
                            map: obj.material.map
                        });
                    }
                    else {
                        obj.material = defaultMaterials[count];
                        count++;
                    }
                }
                else if(obj.name === "tree") {
                    obj.traverse( function( node ) {
                        if ( node.isMesh ) {
                            if(isDefaultMaterial) {
                                defaultMaterials[count] = node.material;
                                count++;
                                node.material = Shaders.buildTwistMaterial(
                                    18, performance.now, node.material.color, node.material.map
                                )
                                twist = true;
                            }
                            else {
                                node.material = defaultMaterials[count];
                                count++;
                            }
                        }
                    });
                }
                else if(obj.name === "fence") {
                    obj.traverse( function( node ) {
                        if ( node.isMesh ) {
                            if(isDefaultMaterial) {
                                defaultMaterials[count] = node.material;
                                count++;
                                node.material = new THREE.MeshStandardMaterial({
                                    color: node.material.color,
                                    map: node.material.map
                                });
                            }
                            else {
                                node.material = defaultMaterials[count];
                                count++;
                            }
                        }
                    });
                }
            });
            isDefaultMaterial = !isDefaultMaterial;
            count = 0;
        }
    }
    panel.add(switchShadersButton, 'add').name("Switch Shaders");

    //Shadows
    //Turn ON and OFF directional light's Shadows (sun)
    var toggleShadowsButton = {
        add:function() {
            console.log("toggleShadowsButton is clicked");
            directionalLight.castShadow = !directionalLight.castShadow;
            spotLight.castShadow = !spotLight.castShadow;
        }
    }
    panel.add(toggleShadowsButton, 'add').name("Toggle Shadows");

    //Shadow Quality
    var q = panel.add( { q: "Medium" }, 'q', [ "Low", "Medium", "High" ] ).name( 'Shadow Quality' );
    var shadowQuality = {
        add:function () {
            var quality;
            if(q.object.q === "Low")  quality = 1024;
            else if(q.object.q === "Medium") quality = 2048;
            else if(q.object.q === "High") quality = 4096;

            directionalLight.shadow.map.dispose()
            directionalLight.shadow.map = null
            directionalLight.shadow.mapSize.width = quality; // Shadow Quality
            directionalLight.shadow.mapSize.height = quality; // Shadow Quality
        }
    }
    panel.add(shadowQuality, 'add').name("Change Shadow Quality");
}

function twistScene() {
    scene.traverse( function ( child ) {
        // if ( child.isMesh ) {
        //     if(child.name === "plane") {
        //         const shader = child.material.userData.shader;
        //         if ( shader ) {
        //             shader.uniforms.time.value = performance.now() / 1000;
        //         }
        //     }
        //     else if(child.name === "tree") {
        //         child.traverse( function( node ) {
        //             if ( node.isMesh ) {
        //                 const s = node.material.userData.shader;
        //                 if(s) {
        //                     s.uniforms.time.value = performance.now() / 1000;
        //                 }
        //             }
        //         });
        //     }
        // }
        if(child.name === "tree") {
            child.traverse( function( node ) {
                if ( node.isMesh ) {
                    const s = node.material.userData.shader;
                    if(s) {
                        s.uniforms.time.value = performance.now() / 1000;
                    }
                }
            });
        }
    });
}

function intersect(pos) {
  raycaster.setFromCamera(pos, camera);
  return raycaster.intersectObjects(sceneObjects, true);
}

function dragObject(){
    if(draggable != null){
       
        const found = intersect(mouseMove);
        if(found.length > 0){
            for( let o of found){
                if(o.object.userData.ground){
                    continue;
                }
                draggable.position.x = o.point.x;
                draggable.position.z = o.point.z;
            }
        }
    }
}


function createCactus(position) {
    const objLoader = new OBJLoader();
    var mtlLoader = new MTLLoader();
    mtlLoader.load("./models/cactus/cactus.mtl", function(materials){
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
        objLoader.load("./models/cactus/cactus.obj", function(mesh){       
            //scene.add(mesh);
            mesh.traverse( function (child){
                if ( child instanceof THREE.Mesh ){
                    child.geometry.scale( 2, 2, 2 );
                     // set position
                    child.position.x = position.x;
                    child.position.y = position.y;
                    child.position.z = position.z;
                    
                    child.userData.draggable = true;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    scene.add(child);
                    sceneObjects.push(child);
                }
                    
            });
        });
    }); 
}

function createPine(position) {
    const objLoader = new OBJLoader();
    var mtlLoader = new MTLLoader();
    mtlLoader.load("./models/pine/pine.mtl", function(materials){
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
        objLoader.load("./models/pine/pine.obj", function(mesh){       
            //scene.add(mesh);
            mesh.traverse( function (child){
                if ( child instanceof THREE.Mesh ){
                    // set position
                    child.position.x = position.x;
                    child.position.y = position.y;
                    child.position.z = position.z;
                    
                    // draggable object
                    child.userData.draggable = true;
                    
                    // shadows
                    child.castShadow = true;
                    child.receiveShadow = true;
                    scene.add(child);
                    sceneObjects.push(child);
                }       
            });
        });
    }); 
}
function createAppleTree(position) {
   const objLoader = new OBJLoader();
    var mtlLoader = new MTLLoader();
    mtlLoader.load("./models/apple_tree/AppleTree3.mtl", function(materials){
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
        objLoader.load("./models/apple_tree/AppleTree3.obj", function(mesh){       
            //scene.add(mesh);
            mesh.traverse( function (child){
                if ( child instanceof THREE.Mesh ){
                    // set position
                    child.position.x = position.x;
                    child.position.y = position.y;
                    child.position.z = position.z;
                    
                    // draggable object
                    child.userData.draggable = true;
                    
                    // shadows
                    child.castShadow = true;
                    child.receiveShadow = true;
                    scene.add(child);
                    sceneObjects.push(child);
                }
                    
            });
        });
    }); 
}
function createPoplarTree(position) {
    const objLoader = new OBJLoader();
    var mtlLoader = new MTLLoader();
    mtlLoader.load("./models/white_poplar_tree/poplar_tree.mtl", function(materials){
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
           
        objLoader.load("./models/white_poplar_tree/poplar_tree.obj", function(mesh){    
            //scene.add(mesh);
            mesh.traverse( function (child){
                if ( child instanceof THREE.Mesh ){
                    // set position
                    child.position.x = position.x;
                    child.position.y = position.y;
                    child.position.z = position.z;
                    
                    // draggable object
                    child.userData.draggable = true;
                    
                    // shadows
                    child.castShadow = true;
                    child.receiveShadow = true;
                    scene.add(child);
                    sceneObjects.push(child);
                }
                    
            });
        });
     
    }); 
}

// GLTF LOAD FUNCTIONS
function appleTreeGLTF(){
    const loader = new GLTFLoader(loadingManager);
    loader.load('./models/apple_tree/AppleTree.gltf', function(gltf){
        const mesh = gltf.scene;
         // Cast and recieve shadow
        mesh.traverse( function( node ) {
            if ( node.isMesh ) {
                node.material = new THREE.MeshToonMaterial({
                    color: node.material.color,
                    map: node.material.map
                });

                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        mesh.name = "tree";
        mesh.children[0].userData.draggable = true;
        appleTreeModel = mesh;
    /*    mesh.position.set(position.x, position.y, position.z);
        sceneObjects.push(mesh);
        scene.add(mesh);
        console.log(mesh);*/
    });
}
function poplarTreeGLTF(){
    const loader = new GLTFLoader(loadingManager);
    loader.load('./models/white_poplar_tree/poplar_tree.gltf', function(gltf){
        const mesh = gltf.scene;
         // Cast and recieve shadow
        mesh.traverse( function( node ) {
            if ( node.isMesh ) {
                node.material = new THREE.MeshToonMaterial({
                    color: node.material.color,
                    map: node.material.map
                });

                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        mesh.name = "tree";
        mesh.children[0].userData.draggable = true;
        //mesh.rotation.y = 1.0;        // to make it look better;
        poplarTreeModel = mesh;
    /*    mesh.position.set(position.x, position.y, position.z);
        sceneObjects.push(mesh);
        scene.add(mesh);
        console.log(mesh); */
    });
}
function pineTreeGLTF(){
    const loader = new GLTFLoader(loadingManager);
    loader.load('./models/pine/pine.gltf', function(gltf){
        const mesh = gltf.scene;    
        // Cast and recieve shadow
        mesh.traverse( function( node ) {
            if ( node.isMesh ) {
                node.material = new THREE.MeshToonMaterial({
                    color: node.material.color,
                    map: node.material.map
                });

                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        mesh.name = "tree";
        mesh.children[0].userData.draggable = true;
        pineTreeModel = mesh;
    /*    mesh.position.set(position.x, position.y, position.z);
        sceneObjects.push(mesh);
        scene.add(mesh);
        console.log(mesh); */
    });
}
function cactusGLTF(){
    const loader = new GLTFLoader(loadingManager);
    loader.load('./models/cactus/cactus.gltf', function(gltf){
        const mesh = gltf.scene;     
         // Cast and recieve shadow
        mesh.traverse( function( node ) {
            if ( node.isMesh ) {
                node.material = new THREE.MeshToonMaterial({
                    color: node.material.color,
                    map: node.material.map
                });

                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        mesh.name = "tree";
        mesh.children[0].userData.draggable = true;
        cactusModel = mesh;
    /*    mesh.position.set(position.x, position.y, position.z);
        sceneObjects.push(mesh);
        scene.add(mesh);
        console.log(mesh); */
    });
    
}
function fenceGLTF(){
    const loader = new GLTFLoader(loadingManager);
    loader.load('./models/fence/fence.gltf', function(gltf){
        const mesh = gltf.scene;     
        mesh.rotation.y = Math.PI / 2;
         // Cast and recieve shadow
        mesh.traverse( function( node ) {
            if ( node.isMesh ) {
                node.material = new THREE.MeshToonMaterial({
                    color: 0xE16D0D,
                    map: node.material.map
                });

                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        mesh.name = "fence";
        mesh.children[0].userData.draggable = true;
        // var newMaterial = new THREE.MeshStandardMaterial({color: 0xE16D0D});
        // mesh.traverse((object) => {
        //     if(object.isMesh){
        //         object.material = newMaterial;
        //     }
        // });
        fenceModel = mesh;
    });
}
function rotateAboutXAxis(object, rad){
    if(object != null){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
               child.rotation.x = rad;
            }
        });
   }
}
function rotateAboutYAxis(object, rad){
    if(object != null){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
                 child.rotation.y = rad;
            }
        });
    } 
}
function rotateAboutZAxis(object, rad){
    if(object != null){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
                child.rotation.z = rad;
            }
        });
    }  
}

function transformOnX(object, amount){
    if(object != null && object.userData.draggable){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
               child.position.x += amount;
            }
        });
   }
}
function transformOnY(object, amount){
    if(object != null && object.userData.draggable){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
                 child.position.y += amount;
            }
        });
    } 
}
function transformOnZ(object, amount){
    if(object != null && object.userData.draggable){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
                child.position.z += amount;
            }
        }); 
    }  
}


function onMouseWheel( event ) {
  camera.position.z += event.deltaY * 0.01; // move camera along z-axis
}

function cameraControls(){
    const delta = 0.005;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    
    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );

}
function loadModels(){
    appleTreeGLTF();
    poplarTreeGLTF();
    cactusGLTF();
    pineTreeGLTF();
    fenceGLTF();
}

function addCactus(position){
    var newCactus = cactusModel.clone();
    newCactus.position.set(position.x, position.y, position.z);
    sceneObjects.push(newCactus);
    scene.add(newCactus); 
}
function addAppleTree(position){
    var newAppleTree = appleTreeModel.clone();
    newAppleTree.position.set(position.x, position.y, position.z);
    sceneObjects.push(newAppleTree);
    scene.add(newAppleTree); 
}
function addPoplarTree(position){
    var newPoplarTree = poplarTreeModel.clone();
    newPoplarTree.position.set(position.x, position.y, position.z);
    sceneObjects.push(newPoplarTree);
    scene.add(newPoplarTree); 
}
function addPineTree(position){
    var newPineTree = pineTreeModel.clone();
    pineTreeModel.position.set(position.x, position.y, position.z);
    sceneObjects.push(newPineTree);
    scene.add(newPineTree); 
}

function addFence(position){
    var fence = fenceModel.clone();
    fenceModel.position.set(position.x, position.y, position.z);
    sceneObjects.push(fence);
    scene.add(fence); 
}

function onResourcesLoaded(){
    // X should be between -80 -40
    addAppleTree(new THREE.Vector3( -77, 0, 20 ));
    addAppleTree(new THREE.Vector3( -55, 0, 14 ));
    addAppleTree(new THREE.Vector3( -64, 0, 12 ));
    addAppleTree(new THREE.Vector3( -45, 0, 34 ));
    addAppleTree(new THREE.Vector3( -57, 0, 45 ));
    
    addCactus(new THREE.Vector3( -5, 0, 2 ));
    addPineTree(new THREE.Vector3( -3, 0, 5 ));
    addPoplarTree(new THREE.Vector3( 0, 0, 2 ));
  
     //addFence(new THREE.Vector3( 0, 0, 20 ));
    //addFence(new THREE.Vector3( 0, 0, 20 ));
    for(let i = -45; i < 50; i += 6){
        addFence(new THREE.Vector3( 0, 0, i  ));
    }
    
}

function createPlanes(){
    // PLANE 1
    const geometry_plane = new THREE.PlaneBufferGeometry(40, 100, 20, 20);
    const material_plane1 = new THREE.MeshToonMaterial({
        color: new THREE.Color(0x0D2903),
    });
    const plane1 = new THREE.Mesh(geometry_plane, material_plane1);
    plane1.name = "plane";
    plane1.material.needsUpdate = true; 
    plane1.rotation.x = -Math.PI / 2;
    plane1.position.y = 0;
    plane1.position.x = -60;
    plane1.receiveShadow = true;
    plane1.userData.draggable = false;
    plane1.userData.ground = true;
    scene.add(plane1);
    sceneObjects.push(plane1);
    
    // PLANE 2
    const material_plane2 = new THREE.MeshToonMaterial({
        color: new THREE.Color("white"),
    });
    const plane2 = new THREE.Mesh(geometry_plane, material_plane2);
    plane2.name = "plane";
    plane2.material.needsUpdate = true; 
    plane2.rotation.x = -Math.PI / 2;
    plane2.position.y = 0;
    plane2.position.x = -20;
    plane2.receiveShadow = true;
    plane2.userData.draggable = false;
    plane2.userData.ground = true;
    scene.add(plane2);
    sceneObjects.push(plane2);
    
    // PLANE 3
    const material_plane3 = new THREE.MeshToonMaterial({
        color: new THREE.Color(0xF8C471),
    });
    const plane3 = new THREE.Mesh(geometry_plane, material_plane3);
    plane3.name = "plane";
    plane3.material.needsUpdate = true; 
    plane3.rotation.x = -Math.PI / 2;
    plane3.position.y = 0;
    plane3.position.x = 20;
    plane3.receiveShadow = true;
    plane3.userData.draggable = false;
    plane3.userData.ground = true;
    scene.add(plane3);
    sceneObjects.push(plane3);
    
     // PLANE 4
    const material_plane4 = new THREE.MeshToonMaterial({
        color: new THREE.Color("green"),
    });
    const plane4 = new THREE.Mesh(geometry_plane, material_plane4);
    plane4.name = "plane";
    plane4.material.needsUpdate = true; 
    plane4.rotation.x = -Math.PI / 2;
    plane4.position.y = 0;
    plane4.position.x = 60;
    plane4.receiveShadow = true;
    plane4.userData.draggable = false;
    plane4.userData.ground = true;
    scene.add(plane4);
    sceneObjects.push(plane4);
    
    // BIG PLANE
    const geometry_plane5 = new THREE.PlaneBufferGeometry(1000, 1000, 20, 20);
    const material_plane5 = new THREE.MeshToonMaterial({
        color: new THREE.Color(0x442903),
    });
    const plane5 = new THREE.Mesh(geometry_plane5, material_plane5);
    plane5.name = "plane";
    plane5.material.needsUpdate = true; 
    plane5.rotation.x = -Math.PI / 2;
    plane5.position.y = -0.1;
    plane5.position.x = 0;
    plane5.receiveShadow = true;
    plane5.userData.draggable = false;
    plane5.userData.ground = true;
    scene.add(plane5);
    sceneObjects.push(plane5);
    
}
main();		
