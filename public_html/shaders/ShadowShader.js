/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


vertexShader3 = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
`;
fragmentShader3 = `
    uniform vec3 color1;
    uniform vec3 color2;

    varying vec2 vUv;

    void main() {
        gl_FragColor = vec4(mix(color1, color2, vUv.y), .1);
    }
`;

fragmentShader4 =  `
    #include <common>
    #include <packing>
    #include <fog_pars_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>
    #include <dithering_pars_fragment>

    void main() {
      // CHANGE THAT TO YOUR NEEDS
      // ------------------------------
      vec3 finalColor = vec3(0, 0.75, 0);
      vec3 shadowColor = vec3(0, 0, 0);
      float shadowPower = 0.5;
      // ------------------------------
      
      // it just mixes the shadow color with the frag color
      gl_FragColor = vec4( mix(finalColor, shadowColor, (1.0 - getShadowMask() ) * shadowPower), 1.0);

      #include <fog_fragment>
      #include <dithering_fragment>
    }
  `
vertexShader4= `
    #include <common>
    #include <fog_pars_vertex>
    #include <shadowmap_pars_vertex>

    void main() {
      #include <begin_vertex>
      #include <project_vertex>
      #include <worldpos_vertex>
      #include <shadowmap_vertex>
      #include <fog_vertex>
    }
  `;

vertexShaderShadow= `
    varying vec2 vertexUV;
     
            
    void main(){
        vertexUV = uv;
        gl_Position = projectionMatrix * 
        modelViewMatrix * vec4(position, 1.0);
    }
  `;
fragmentShaderShadow= `
    uniform sampler2D grassTexture;
    uniform vec4 color;
    uniform vec3 diffuse;
    uniform float opacity;
    varying vec2 vertexUV;
            
            
            void main(){                
    /*if(color == vec4(0,0,0,0))
        gl_FragColor = texture2D( grassTexture, vertexUV );
    else
        gl_FragColor = color; */
    gl_FragColor = vec4( diffuse, opacity );
    }
  `;

