import * as THREE from '../build/three.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';
import BasicCustomShader from '../shaders/BasicCustomShader.js'
import { OrbitControls } from './jsm/libs/OrbitControls.js';

var camera, scene, renderer;
var raycaster, clickMouse, mouseMove, draggable, objectToRotate;
var keyboard={};
var cameraMovementSpeed = 0.1;
var pointLight,ambientLight,spotLight,light1,light1Helper;
var currentlyDisplayingTree;


// Add every object to this array
var sceneObjects = [];
function main(){
     
    // SCENES
    scene = new THREE.Scene();
   
    
    //LIGHTS
    initLights();
       
    //CAMERA
    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(0,1,-10);
    sceneObjects.push(camera);
    
    
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
	const found = intersect(clickMouse);;
        if(found.length > 0 && found[0].object.userData.draggable){
            console.log(found[0].object.position);
            draggable = found[0].object;
            objectToRotate = found[0].object;
            console.log("found draggable " + draggable.userData.name);
        }
    });
    window.addEventListener('mousemove', event => {
        mouseMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouseMove.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });

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
    createAppleTree(new THREE.Vector3( 1, 0, -2 ));
    createPoplarTree(new THREE.Vector3( 1, 0, -2 ));

    

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

    
    var animate = function () {
        
        dragObject();
        controls.update();
        
        requestAnimationFrame( animate );
        renderer.render( scene, camera );

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
            if(draggable != null){
                rotateAboutXAxis(draggable,0.1);
            }
            else{
                
            }
        }
        if(event.key ==	"ArrowLeft"){
            if(draggable != null){
                rotateAboutXAxis(draggable,-0.1);
            }
            else{
                
            }
        }
        if(event.key ==	"ArrowUp"){
            if(draggable != null){
                rotateAboutYAxis(draggable,0.1);
            }
            else{
                
            }
        }
        if(event.key ==	"ArrowDown"){
            if(draggable != null){
                rotateAboutYAxis(draggable,-0.1);
            }
            else{
                
            }
        }
    });
}
function initLights(){
    // LIGHTS
    // Ambient light for general illumination
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    //sceneDisplay.add(ambientLight);
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
    
    const rotation = panel.addFolder('Rotate');
    var rotateAboutXPositiveButton = { rotateAboutXPositive:function(){ rotateAboutXAxis(objectToRotate,0.1); }};
    rotation.add(rotateAboutXPositiveButton,'rotateAboutXPositive').name("X+");
    
    var rotateAboutXNegativeButton = { rotateAboutXNegative:function(){ rotateAboutXAxis(objectToRotate,-0.1); }};
    rotation.add(rotateAboutXNegativeButton,'rotateAboutXNegative').name("X-");
    
    var rotateAboutYPositiveButton = { rotateAboutYPositive:function(){ rotateAboutYAxis(objectToRotate,0.1); }};
    rotation.add(rotateAboutYPositiveButton,'rotateAboutYPositive').name("Y+");
    
    var rotateAboutYNegative = { rotateAboutYNegative:function(){ rotateAboutYAxis(objectToRotate,-0.1); }};
    rotation.add(rotateAboutYNegative,'rotateAboutYNegative').name("Y-");
    
     var rotateAboutZPositiveButton = { rotateAboutZPositive:function(){ rotateAboutZAxis(objectToRotate,0.1); }};
    rotation.add(rotateAboutZPositiveButton,'rotateAboutZPositive').name("Z+");
    
    var rotateAboutZNegative = { rotateAboutZNegative:function(){ rotateAboutZAxis(objectToRotate,-0.1); }};
    rotation.add(rotateAboutZNegative,'rotateAboutZNegative').name("Z-");
    
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
function rotateAboutXAxis(object, rad){
    if(object != null){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
                child.rotateOnAxis(new THREE.Vector3(1,0,0),rad);
            }
        });
   }
   
}
function rotateAboutYAxis(object, rad){
    if(object != null){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
                child.rotateOnAxis(new THREE.Vector3(0,1,0),rad);
            }
        });
    }
    
}
function rotateAboutZAxis(object, rad){
    if(object != null){
        object.traverse( function (child){
            if ( child instanceof THREE.Mesh ){
                child.rotateOnAxis(new THREE.Vector3(0,0,1),rad);
            }
        });
    }
    
}

main();		
