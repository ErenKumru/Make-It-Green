//import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
//import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'

/*
import * as THREE from 'https://cdn.skypack.dev/three@0.135.0';
import { GUI } from '../Libs/lil-gui.module.min.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js';
*/
import * as THREE from '../build/three.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';
import BasicCustomShader from '../shaders/BasicCustomShader.js'
import { OrbitControls } from './jsm/libs/OrbitControls.js';

var camera, scene, renderer;
var raycaster, clickMouse, mouseMove, draggable;
var keyboard={};
var cameraMovementSpeed = 0.1;
var pointLight,ambientLight,spotLight,light1,light1Helper;

// Add every object to this array
var sceneObjects = [];
function main(){
    
    // SCENE
    scene = new THREE.Scene();
    
    //LIGHTS
    initLights();
       
    //CAMERA
    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0,1,-10);
    scene.add(camera);
    sceneObjects.push(camera);
    //camera.lookAt(0,0,0);

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
	const found = intersect(clickMouse);;
        if(found.length > 0 && found[0].object.userData.draggable){
            draggable = found[0].object;
            console.log("found draggable " + draggable.userData.name);
        }
    });
    window.addEventListener('mousemove', event => {
        mouseMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouseMove.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });

    //RENDERER
    const renderer = new THREE.WebGLRenderer();
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
    
    const controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = 0.9 * Math.PI / 2;
				controls.enableZoom = true;
    controls.update();

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader3,
        fragmentShader: fragmentShader3,
        uniforms:{
            color1: {
                value: new THREE.Color("purple")
            },
            color2: {
                value: new THREE.Color("red")
            }
        }
    });

    //Shadow material
    const basicCustomShaderMaterial = new THREE.ShaderMaterial({
      ...BasicCustomShader,
      fog: true,
      lights: true,
      dithering: true,
    });


    // add pine tree to scene
    createPine(new THREE.Vector3( 0, 0, 0 ));
    
    // add cactus to scene
    createCactus(new THREE.Vector3( 1, 0, -1 ));
    
    
    // BOX
    var box = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            material); 
    box.position.y += 0.5;
    box.receiveShadow = true;
    box.castShadow = true;
    box.userData.draggable = true;
    box.userData.name = "1";
    scene.add(box);
    sceneObjects.push(box);
    var box2 = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            material); 
    box2.position.y += 0.5;
    box2.position.x -= 1.5;
    box2.receiveShadow = true;
    box2.castShadow = true;
    box2.userData.draggable = true;
    box2.userData.name = "2";
    scene.add(box2);
    sceneObjects.push(box2);
    

    // PLANE
    const geometry_plane = new THREE.PlaneBufferGeometry(100, 100, 20, 20);
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
    sceneObjects.push(plane);
    // for debug
    console.log(sceneObjects[0].userData.draggable);
    console.log(basicCustomShaderMaterial.uniforms);
    console.log(basicCustomShaderMaterial.uniforms.color.value);
    var animate = function () {
        
        dragObject();
        controls.update();
        renderer.render( scene, camera );
        requestAnimationFrame( animate );
        
        
    };

    animate(); 
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function keyEvents(){
       
        window.addEventListener("keydown", function(event){
            
        if(event.key ==	"ArrowRight"){
            //spotLight.target.translateX(1.0);
            spotLight.position.x += 1;
            }
    });
}
function initLights(){
    // LIGHTS
    // Ambient light for general illumination
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    sceneObjects.push(ambientLight);
    
    // point light
    pointLight = new THREE.PointLight(0xffffff, 0.5, 18);
    pointLight.position.set(-3, 6, -3);
    pointLight.castShadow = true;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 25;
    scene.add(pointLight);  
    sceneObjects.push(pointLight);
    
    // Spotlight for specific illumination
    spotLight = new THREE.SpotLight(0xAAAAAA);
    spotLight.position.set(0, 4, 0);
    spotLight.castShadow = true;
    spotLight.shadow.bias = 0.0001;
    spotLight.shadow.mapSize.width = 2048; // Shadow Quality
    spotLight.shadow.mapSize.height = 2048; // Shadow Quality
    scene.add(spotLight);
    sceneObjects.push(spotLight);
}

function createPanel(){
    const panel = new GUI( { width: 310 } );
    const parameters ={
        temperature:15,
        water: 120,
        humidty:0,
        light:0,
    };
    panel.add(parameters, 'temperature', -45, 70, 1).name('Temperature');
    panel.add(parameters, 'water', 100, 1000, 1).name('Water (in ml)');
    panel.add(parameters, 'humidty', 0, 0, 1).name('Humidty');
    panel.add(parameters, 'light', 0, 0, 1).name('Light');
    var obj = { add:function(){ console.log("clicked") }};
    panel.add(obj,'add');
}

function intersect(pos) {
  raycaster.setFromCamera(pos, camera);
  return raycaster.intersectObjects(sceneObjects, true);
}

function dragObject(){
    if(draggable != null){
       
        const found = intersect(mouseMove);;
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
const onProgress = function ( xhr ) {

					if ( xhr.lengthComputable ) {

						const percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

					}

				};
const onError = function () { };

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

function createAppleTree() {
    const objLoader = new OBJLoader();
    var mtlLoader = new MTLLoader();
    mtlLoader.load("./models/apple_tree/apple_tree.mtl", function(materials){
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
        objLoader.load("./models/apple_tree/apple_tree.obj", function(mesh){       
            mesh.traverse( function (child){
                if ( child instanceof THREE.Mesh ){
                    
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
main();		
