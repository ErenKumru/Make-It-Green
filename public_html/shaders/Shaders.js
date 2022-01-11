import * as THREE from "../build/three.module";

//twist material, modified phong shader (reflects lights, receives shadows)
//amount = altitude of the motion
//time = variant of the motion (time passed is a consistent landslide like, Math.random() is a earthquake like)
export function buildTwistMaterial(amount, time, color, map ) {
    const material2 = new THREE.MeshPhongMaterial({
        // color: new THREE.Color(0x743E0C) //soil color
        color: color,
        map: map
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

    return material2;
}