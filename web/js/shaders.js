// GLSL Shader definitions with program configurations

const Shaders = (() => {
    // Reusable shader snippets
    const BASIC_VERTEX = `
        attribute vec3 aPosition;
        attribute vec2 aTexCoord;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec2 vTexCoord;
        varying vec3 vPosition;

        void main() {
            vTexCoord = aTexCoord;
            vec4 mvPosition = uModelViewMatrix * vec4(aPosition, 1.0);
            vPosition = mvPosition.xyz;
            gl_Position = uProjectionMatrix * mvPosition;
        }
    `;

    const TEXTURE_FRAGMENT = `
        precision mediump float;
        uniform sampler2D uTexture;
        varying vec2 vTexCoord;

        void main() {
            gl_FragColor = texture2D(uTexture, vTexCoord);
        }
    `;

    // Program definitions with inline shaders
    return {
        planet: {
            vertex: `
                attribute vec3 aPosition;
                attribute vec3 aNormal;
                attribute vec2 aTexCoord;
                uniform mat4 uModelViewMatrix;
                uniform mat4 uModelMatrix;
                uniform mat4 uProjectionMatrix;
                uniform mat3 uNormalMatrix;
                varying vec3 vNormal;
                varying vec2 vTexCoord;
                varying vec3 vWorldPosition;

                void main() {
                    vNormal = uNormalMatrix * aNormal;
                    vTexCoord = aTexCoord;
                    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
                }
            `,
            fragment: `
                precision mediump float;
                uniform sampler2D uTexture;
                uniform float uAmbient;
                varying vec3 vNormal;
                varying vec2 vTexCoord;
                varying vec3 vWorldPosition;

                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 lightDir = normalize(-vWorldPosition);
                    float diff = max(dot(normal, lightDir), 0.0);
                    float light = uAmbient + (1.0 - uAmbient) * diff;
                    vec4 texColor = texture2D(uTexture, vTexCoord);
                    gl_FragColor = vec4(texColor.rgb * light, texColor.a);
                }
            `,
            uniforms: ['uModelViewMatrix', 'uModelMatrix', 'uProjectionMatrix', 'uNormalMatrix', 'uTexture', 'uAmbient'],
            attribs: ['aPosition', 'aNormal', 'aTexCoord']
        },

        sun: {
            vertex: BASIC_VERTEX,
            fragment: `
                precision mediump float;
                uniform sampler2D uTexture;
                uniform float uTime;
                varying vec2 vTexCoord;

                void main() {
                    vec4 texColor = texture2D(uTexture, vTexCoord);
                    float pulse = 1.0 + 0.1 * sin(uTime * 2.0);
                    gl_FragColor = vec4(texColor.rgb * pulse * 1.2, 1.0);
                }
            `,
            uniforms: ['uModelViewMatrix', 'uProjectionMatrix', 'uTexture', 'uTime'],
            attribs: ['aPosition', 'aTexCoord']
        },

        ring: {
            vertex: BASIC_VERTEX,
            fragment: `
                precision mediump float;
                uniform sampler2D uTexture;
                uniform float uAmbient;
                varying vec2 vTexCoord;

                void main() {
                    vec4 texColor = texture2D(uTexture, vTexCoord);
                    gl_FragColor = vec4(texColor.rgb * uAmbient, texColor.a);
                }
            `,
            uniforms: ['uModelViewMatrix', 'uProjectionMatrix', 'uTexture', 'uAmbient'],
            attribs: ['aPosition', 'aTexCoord']
        },

        skybox: {
            vertex: `
                attribute vec3 aPosition;
                attribute vec2 aTexCoord;
                uniform mat4 uViewMatrix;
                uniform mat4 uProjectionMatrix;
                varying vec2 vTexCoord;

                void main() {
                    vTexCoord = aTexCoord;
                    mat4 viewRotation = uViewMatrix;
                    viewRotation[3] = vec4(0.0, 0.0, 0.0, 1.0);
                    gl_Position = uProjectionMatrix * viewRotation * vec4(aPosition, 1.0);
                }
            `,
            fragment: TEXTURE_FRAGMENT,
            uniforms: ['uViewMatrix', 'uProjectionMatrix', 'uTexture'],
            attribs: ['aPosition', 'aTexCoord']
        }
    };
})();

// Alias for backward compatibility
const ShaderConfig = Shaders;
