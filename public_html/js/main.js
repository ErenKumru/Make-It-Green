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
	const found = intersect(clickMouse);
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

    //-----------------NEW SHADER TEST STARTS-------------------------------------------------------------------------//

    //BlandMap shader (Needs textures)
    // var texture = new THREE.TextureLoader().load( "./img/grass.jpg" );
    // console.log(texture);
    //
    // var testBox = CreateGround();
    // scene.add(testBox);
    // sceneObjects.push(testBox);
    // Creates the ground
    // function CreateGround(material) {
    //     var uniforms = THREE.UniformsUtils.merge([
    //         THREE.UniformsLib["common"],
    //         THREE.UniformsLib["aomap"],
    //         THREE.UniformsLib["lightmap"],
    //         THREE.UniformsLib["emissivemap"],
    //         THREE.UniformsLib["bumpmap"],
    //         THREE.UniformsLib["normalmap"],
    //         THREE.UniformsLib["displacementmap"],
    //         THREE.UniformsLib["gradientmap"],
    //         THREE.UniformsLib["fog"],
    //         THREE.UniformsLib["lights"],
    //         {
    //             emissive: { type: "c", value: new THREE.Color(0x000000) },
    //             specular: { type: "c", value: new THREE.Color(0x111111) },
    //             shininess: { type: "f", value: 30 },
    //
    //             TextureBackground: { type: "t", value: null },
    //             TextureR: { type: "t", value: null },
    //             TextureG: { type: "t", value: null },
    //             TextureB: { type: "t", value: null },
    //             TextureBlendMap: { type: "t", value: null },
    //         }]);
    //
    //     var shaderMaterial;
    //     try {
    //         shaderMaterial = new THREE.ShaderMaterial({
    //             lights: true,
    //             uniforms: uniforms,
    //             vertexShader: BlendMapVertexShader,
    //             fragmentShader: BlendMapFragmentShader
    //         });
    //     } catch (e) {
    //         alert("Error 'CreateGround' : GPU Shader couldn't compile");
    //     }
    //
    //     // shaderMaterial.uniforms.TextureBlendMap.value = _TextureBlendMap;
    //     // shaderMaterial.uniforms.TextureBackground.value = _TextureSand;
    //     // shaderMaterial.uniforms.TextureR.value = _TextureClay;
    //     // shaderMaterial.uniforms.TextureG.value = _TextureClay;
    //     // shaderMaterial.uniforms.TextureB.value = _TextureRock;
    //
    //     var geometry = new THREE.BoxGeometry(2, 2, 2);
    //     var mesh = new THREE.Mesh(geometry, shaderMaterial);
    //
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     mesh.geometry.y += 0.5;
    //     mesh.geometry.x += 5;
    //
    //     return mesh;
    // }
    //
    // const BlendMapVertexShader = [
    //     "#define PHONG",
    //
    //     "varying vec3 vViewPosition;",
    //     "varying vec2 vUv;",
    //
    //     "#ifndef FLAT_SHADED",
    //
    //     "varying vec3 vNormal;",
    //
    //     "#endif",
    //
    //
    //     THREE.ShaderChunk["common"],
    //     THREE.ShaderChunk["uv_pars_vertex"],
    //     THREE.ShaderChunk["uv2_pars_vertex"],
    //     THREE.ShaderChunk["displacementmap_pars_vertex"],
    //     THREE.ShaderChunk["envmap_pars_vertex"],
    //     THREE.ShaderChunk["color_pars_vertex"],
    //     THREE.ShaderChunk["morphtarget_pars_vertex"],
    //     THREE.ShaderChunk["skinning_pars_vertex"],
    //     THREE.ShaderChunk["shadowmap_pars_vertex"],
    //     THREE.ShaderChunk["logdepthbuf_pars_vertex"],
    //     THREE.ShaderChunk["clipping_planes_pars_vertex"],
    //
    //     "void main() {",
    //     THREE.ShaderChunk["uv_vertex"],
    //     THREE.ShaderChunk["uv2_vertex"],
    //     THREE.ShaderChunk["color_vertex"],
    //
    //     THREE.ShaderChunk["beginnormal_vertex"],
    //     THREE.ShaderChunk["morphnormal_vertex"],
    //     THREE.ShaderChunk["skinbase_vertex"],
    //     THREE.ShaderChunk["skinnormal_vertex"],
    //     THREE.ShaderChunk["defaultnormal_vertex"],
    //
    //     "#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED",
    //
    //     "vNormal = normalize( transformedNormal );",
    //
    //     "#endif",
    //     THREE.ShaderChunk["begin_vertex"],
    //     THREE.ShaderChunk["displacementmap_vertex"],
    //     THREE.ShaderChunk["morphtarget_vertex"],
    //     THREE.ShaderChunk["skinning_vertex"],
    //     THREE.ShaderChunk["project_vertex"],
    //     THREE.ShaderChunk["logdepthbuf_vertex"],
    //     THREE.ShaderChunk["clipping_planes_vertex"],
    //
    //     "vUv = uv;",
    //     "vViewPosition = - mvPosition.xyz;",
    //
    //     THREE.ShaderChunk["worldpos_vertex"],
    //     THREE.ShaderChunk["envmap_vertex"],
    //     THREE.ShaderChunk["shadowmap_vertex"],
    //
    //     "}",
    // ].join("\n");
    //
    // const BlendMapFragmentShader = [
    //     "#define PHONG",
    //
    //     "varying vec2 vUv;",
    //
    //     "uniform vec3 diffuse;",
    //     "uniform vec3 emissive;",
    //     "uniform vec3 specular;",
    //     "uniform float shininess;",
    //     "uniform float opacity;",
    //
    //     "uniform sampler2D TextureBlendMap;",
    //     "uniform sampler2D TextureBackground;",
    //     "uniform sampler2D TextureR;",
    //     "uniform sampler2D TextureG;",
    //     "uniform sampler2D TextureB;",
    //
    //     THREE.ShaderChunk["common"],
    //     THREE.ShaderChunk["packing"],
    //     THREE.ShaderChunk["color_pars_fragment"],
    //     THREE.ShaderChunk["uv_pars_fragment"],
    //     THREE.ShaderChunk["uv2_pars_fragment"],
    //     THREE.ShaderChunk["map_pars_fragment"],
    //     THREE.ShaderChunk["alphamap_pars_fragment"],
    //     THREE.ShaderChunk["aomap_pars_fragment"],
    //     THREE.ShaderChunk["lightmap_pars_fragment"],
    //     THREE.ShaderChunk["emissivemap_pars_fragment"],
    //     THREE.ShaderChunk["envmap_pars_fragment"],
    //     THREE.ShaderChunk["fog_pars_fragment"],
    //     THREE.ShaderChunk["bsdfs"],
    //     THREE.ShaderChunk["lights_pars"],
    //     THREE.ShaderChunk["lights_phong_pars_fragment"],
    //     THREE.ShaderChunk["shadowmap_pars_fragment"],
    //     THREE.ShaderChunk["bumpmap_pars_fragment"],
    //     THREE.ShaderChunk["normalmap_pars_fragment"],
    //     THREE.ShaderChunk["specularmap_pars_fragment"],
    //     THREE.ShaderChunk["logdepthbuf_pars_fragment"],
    //     THREE.ShaderChunk["clipping_planes_pars_fragment"],
    //
    //     "void main() {",
    //
    //     THREE.ShaderChunk["clipping_planes_fragment"],
    //     "// THIS IS CUSTOM CODE TO OVERRIDE THE DIFFUSE COLOR WITH BLENDMAP TEXTURES",
    //     "vec4 cBlend = texture2D(TextureBlendMap, vUv);",
    //     "float bText = 1.0 - (cBlend.r + cBlend.g + cBlend.b);",
    //     "vec2 tiledCoords = vUv * 40.0;",
    //     "vec4 cBack = texture2D(TextureBackground, tiledCoords) * bText;",
    //     "vec4 cR = texture2D(TextureR, tiledCoords) * cBlend.r;",
    //     "vec4 cG = texture2D(TextureG, tiledCoords) * cBlend.g;",
    //     "vec4 cB = texture2D(TextureB, tiledCoords) * cBlend.b;",
    //     "vec4 cTot = cBack + cR + cG + cB;",
    //
    //     "vec4 diffuseColor = vec4( diffuse, opacity );",
    //     "diffuseColor.r = cTot.r;",
    //     "diffuseColor.g = cTot.g;",
    //     "diffuseColor.b = cTot.b;",
    //     "ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
    //     "vec3 totalEmissiveRadiance = emissive;",
    //
    //     THREE.ShaderChunk["logdepthbuf_fragment"],
    //     THREE.ShaderChunk["map_fragment"],
    //     THREE.ShaderChunk["color_fragment"],
    //     THREE.ShaderChunk["alphamap_fragment"],
    //     THREE.ShaderChunk["alphatest_fragment"],
    //     THREE.ShaderChunk["specularmap_fragment"],
    //     THREE.ShaderChunk["normal_flip"],
    //     THREE.ShaderChunk["normal_fragment"],
    //     THREE.ShaderChunk["emissivemap_fragment"],
    //
    //     "// accumulation",
    //     THREE.ShaderChunk["lights_phong_fragment"],
    //     THREE.ShaderChunk["lights_template"],
    //
    //     "// modulation",
    //     THREE.ShaderChunk["aomap_fragment"],
    //
    //     "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;",
    //
    //     THREE.ShaderChunk["envmap_fragment"],
    //
    //     "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
    //
    //     THREE.ShaderChunk["premultiplied_alpha_fragment"],
    //     THREE.ShaderChunk["tonemapping_fragment"],
    //     THREE.ShaderChunk["encodings_fragment"],
    //     THREE.ShaderChunk["fog_fragment"],
    //     "}",
    // ].join("\n");

    //twist material, modified phong shader (reflects lights, receives shadows)
    //amount = altitude of the motion
    //time = variant of the motion (time passed is a consistent landslide like, Math.random() is a earthquake like)
    function buildTwistMaterial( amount, time ) {
        const material2 = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x743E0C) //soil color
        });

        material2.onBeforeCompile = function ( shader ) {
            shader.uniforms.time = { value: time };

            shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    `float theta = sin( time + position.y ) / ${ amount.toFixed( 1 ) };`,
                    'float c = cos( theta );',
                    'float s = sin( theta );',
                    'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
                    'vec3 transformed = vec3( position ) * m;',
                    'vNormal = vNormal * m;'
                ].join( '\n' )
            );
            material2.userData.shader = shader;
        };

        // Make sure WebGLRenderer doesnt reuse a single program
        material2.customProgramCacheKey = function () {
            return amount;
        };

        return material2;
    }

    //soil land block created via buildTwistMaterial
    var time = 0;
    var geometry = new THREE.BoxGeometry(2, 2, 2);
    var soilLand = new THREE.Mesh(geometry, buildTwistMaterial(5, time));
    soilLand.name = "soilLand";
    soilLand.userData.draggable = true;
    soilLand.castShadow = true;
    soilLand.receiveShadow = true;
    soilLand.position.y += 1;
    soilLand.position.z -= 3;
    soilLand.position.x -= 3;
    scene.add(soilLand);
    sceneObjects.push(soilLand);

    //custom phong shader (reflects light, no shadows)
    //
    function CustomPhongShader(Ka, Kd, Ks, LInt, LPos, S) {
        return new THREE.ShaderMaterial({
            uniforms: {
                Ka: {value: Ka}, //object's color
                Kd: {value: Kd}, //light reflecting surface's color (blends with object's color)
                Ks: {value: Ks}, //reflected light color
                LightIntensity: {value: LInt}, //intensity of the light
                LightPosition: {value: LPos}, //position of the light
                Shininess: {value: S} //shininess of the object (higher is more focused and metallic)
            },
            vertexShader: `
      varying vec3 Normal;
      varying vec3 Position;

      void main() {
        Normal = normalize(normalMatrix * normal);
        Position = vec3(modelViewMatrix * vec4(position, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
            fragmentShader: `
      varying vec3 Normal;
      varying vec3 Position;

      uniform vec3 Ka;
      uniform vec3 Kd;
      uniform vec3 Ks;
      uniform vec4 LightPosition;
      uniform vec3 LightIntensity;
      uniform float Shininess;

      vec3 phong() {
        vec3 n = normalize(Normal);
        vec3 s = normalize(vec3(LightPosition) - Position);
        vec3 v = normalize(vec3(-Position));
        vec3 r = reflect(-s, n);

        vec3 ambient = Ka;
        vec3 diffuse = Kd * max(dot(s, n), 0.0);
        vec3 specular = Ks * pow(max(dot(r, v), 0.0), Shininess);

        return LightIntensity * (ambient + diffuse + specular);
      }

      void main() {
        gl_FragColor = vec4(phong(), 1.0);
      }
    `
        });
    }

    //stone cube custom phong shader parameters
    var Ka = new THREE.Vector3(0.53, 0.55, 0.55); //stone gray color
    var Kd = new THREE.Vector3(0.55, 0.55, 0.55); //stone gray light reflecting face color
    var Ks = new THREE.Vector3(0.6, 0.6, 0.6); //reflected light color (gray to white)
    var lightIntensity = new THREE.Vector4(0.4, 0.4, 0.4, 1.0);
    var lightPosition = new THREE.Vector4(0.0, 20000.0, 0.0, 1.0);
    var shininess = 25; //diffusing (unfocused)

    //stone cube block created via CustomPhongShader
    var angle = 0;
    var stoneCubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    var stoneCube = new THREE.Mesh(stoneCubeGeometry, CustomPhongShader(Ka, Kd, Ks, lightIntensity, lightPosition, shininess));
    stoneCube.userData.draggable = true;
    stoneCube.castShadow = true;
    stoneCube.position.y += 1;
    stoneCube.position.z -= 3;
    stoneCube.position.x += 3;
    scene.add(stoneCube);
    sceneObjects.push(stoneCube);

    //-----------------NEW SHADER TEST ENDS---------------------------------------------------------------------------//


    //-----------------DECISION TREE TEST STARTS----------------------------------------------------------------------//
//Import DecisionTree
    var DecisionTree = require('decision-tree');

//Create training data
//Test data is compared to this data to check accuracy
//Predictions are made on this data to give results
    var training_data = [
        {"color":"blue", "shape":"square", "liked":false},
        {"color":"red", "shape":"square", "liked":false},
        {"color":"blue", "shape":"circle", "liked":true},
        {"color":"red", "shape":"circle", "liked":true},
        {"color":"blue", "shape":"hexagon", "liked":false},
        {"color":"red", "shape":"hexagon", "liked":false},
        {"color":"yellow", "shape":"hexagon", "liked":true},
        {"color":"yellow", "shape":"circle", "liked":true}
    ];

//Used to check the accuracy of the model
    var test_data = [
        {"color":"blue", "shape":"hexagon", "liked":false},
        {"color":"red", "shape":"hexagon", "liked":false},
        {"color":"yellow", "shape":"hexagon", "liked":true},
        {"color":"yellow", "shape":"circle", "liked":true}
    ];

    var class_name = "liked";


    var features = ["color", "shape"];

    var dt = new DecisionTree(class_name, features);


    dt.train(training_data);


    var predicted_class = dt.predict({
        color: "blue",
        shape: "hexagon"
    });


    var accuracy = dt.evaluate(test_data);


    console.log("dt:", dt);
    console.log("predicted_class:", predicted_class);
    console.log("Accuracy:", accuracy);

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

        //buildTwistMaterial twist test
        scene.traverse( function ( child ) {
            if ( child.isMesh && child.name === "soilLand" ) {
                const shader = child.material.userData.shader;
                if ( shader ) {
                    shader.uniforms.time.value = performance.now() / 1000;
                }
            }
        });
        //rotation test for custom phong shader
        angle += 0.01;
        stoneCube.rotation.y = angle;


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
            
        if(event.key === "ArrowRight"){
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
