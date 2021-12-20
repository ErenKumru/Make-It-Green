import * as THREE from 'https://cdn.skypack.dev/three@0.135.0';
export default {

  uniforms:  THREE.UniformsUtils.merge([
    THREE.UniformsLib.lights,
    THREE.UniformsLib.fog,{
        color: {
                value: new THREE.Color("white")
            }
    },
    THREE.UniformsLib[ "ambient" ],
    
  ]),

  vertexShader: `
    #include <common>
    #include <fog_pars_vertex>
    #include <shadowmap_pars_vertex>

    void main() {
      vec3 transformedNormal = vec3(0,1,0);
      #include <begin_vertex>
      #include <project_vertex>
      #include <worldpos_vertex>
      #include <shadowmap_vertex>
       
      #include <fog_vertex>
    }
  `,

  fragmentShader: `
    #include <common>
    #include <packing>
    #include <fog_pars_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>
    #include <dithering_pars_fragment>
    
    uniform vec3 color;
    void main() {
      // CHANGE THAT TO YOUR NEEDS
      // ------------------------------
      vec3 finalColor = color;
      vec3 shadowColor = vec3(0, 0, 0);
      float shadowPower = 0.5;
      // ------------------------------
      
      // it just mixes the shadow color with the frag color
      gl_FragColor = vec4( mix(finalColor, shadowColor, (1.0 - getShadowMask() ) * shadowPower), 1.0);

      #include <fog_fragment>
      #include <dithering_fragment>
    }
  `
};