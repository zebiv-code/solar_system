// WebGL utility functions and shader program management

const GL = {
    context: null,

    init(canvas) {
        this.context = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!this.context) throw new Error('WebGL not supported');
        return this.context;
    },

    resizeCanvas(canvas) {
        const { clientWidth: w, clientHeight: h } = canvas;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            return true;
        }
        return false;
    },

    isPowerOf2: (v) => (v & (v - 1)) === 0
};

// Shader program factory with automatic uniform/attribute discovery
class ShaderProgram {
    constructor(gl, vertexSrc, fragmentSrc, uniformNames, attribNames) {
        this.gl = gl;
        this.program = this._createProgram(vertexSrc, fragmentSrc);
        this.uniforms = this._getLocations(uniformNames, gl.getUniformLocation.bind(gl));
        this.attribs = this._getLocations(attribNames, gl.getAttribLocation.bind(gl));
    }

    _compileShader(type, source) {
        const { gl } = this;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compile error: ' + error);
        }
        return shader;
    }

    _createProgram(vertexSrc, fragmentSrc) {
        const { gl } = this;
        const vs = this._compileShader(gl.VERTEX_SHADER, vertexSrc);
        const fs = this._compileShader(gl.FRAGMENT_SHADER, fragmentSrc);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
        }
        return program;
    }

    _getLocations(names, fn) {
        const locs = {};
        for (const name of names) {
            locs[name] = fn(this.program, name);
        }
        return locs;
    }

    use() {
        this.gl.useProgram(this.program);
        return this;
    }

    setMatrix4(name, value) {
        this.gl.uniformMatrix4fv(this.uniforms[name], false, value);
        return this;
    }

    setMatrix3(name, value) {
        this.gl.uniformMatrix3fv(this.uniforms[name], false, value);
        return this;
    }

    setVec3(name, value) {
        this.gl.uniform3fv(this.uniforms[name], value);
        return this;
    }

    setFloat(name, value) {
        this.gl.uniform1f(this.uniforms[name], value);
        return this;
    }

    setInt(name, value) {
        this.gl.uniform1i(this.uniforms[name], value);
        return this;
    }
}

// Texture loader
const TextureLoader = {
    load(gl, url) {
        return new Promise((resolve, reject) => {
            const texture = gl.createTexture();
            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                if (GL.isPowerOf2(image.width) && GL.isPowerOf2(image.height)) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                resolve(texture);
            };
            image.onerror = () => reject(new Error('Failed to load texture: ' + url));
            image.src = url;
        });
    },

    async loadAll(gl, pathMap) {
        const entries = Object.entries(pathMap);
        const textures = await Promise.all(entries.map(([, path]) => this.load(gl, path)));
        return Object.fromEntries(entries.map(([name], i) => [name, textures[i]]));
    }
};

// Mesh class for geometry with buffers
class Mesh {
    constructor(gl, geometry) {
        this.gl = gl;
        this.numIndices = geometry.indices.length;
        this.buffers = {
            position: this._createBuffer(geometry.positions),
            texCoord: this._createBuffer(geometry.texCoords),
            index: this._createBuffer(geometry.indices, gl.ELEMENT_ARRAY_BUFFER)
        };
        if (geometry.normals) {
            this.buffers.normal = this._createBuffer(geometry.normals);
        }
    }

    _createBuffer(data, type = this.gl.ARRAY_BUFFER) {
        const { gl } = this;
        const buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, data, gl.STATIC_DRAW);
        return buffer;
    }

    bindAttribute(attribLoc, bufferName, size) {
        if (attribLoc === -1 || !this.buffers[bufferName]) return this;
        const { gl } = this;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[bufferName]);
        gl.enableVertexAttribArray(attribLoc);
        gl.vertexAttribPointer(attribLoc, size, gl.FLOAT, false, 0, 0);
        return this;
    }

    draw(program) {
        const { gl } = this;
        this.bindAttribute(program.attribs.aPosition, 'position', 3)
            .bindAttribute(program.attribs.aNormal, 'normal', 3)
            .bindAttribute(program.attribs.aTexCoord, 'texCoord', 2);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
        return this;
    }
}
