// WebGL Renderer - handles all draw calls

class Renderer {
    constructor(gl) {
        this.gl = gl;
        this.programs = {};
        this.meshes = {};
        this._mvMatrix = Mat4.create();
        this._normalMatrix = new Float32Array(9);
    }

    init() {
        const { gl } = this;

        // Create shader programs from config
        for (const [name, config] of Object.entries(ShaderConfig)) {
            this.programs[name] = new ShaderProgram(gl, config.vertex, config.fragment, config.uniforms, config.attribs);
        }

        // Create meshes
        this.meshes.sphere = new Mesh(gl, Geometry.createSphere(1, 48, 48));
        this.meshes.ring = new Mesh(gl, Geometry.createRing(1.3, 2.3, 64));
        this.meshes.skybox = new Mesh(gl, Geometry.createSkybox(1500));

        // Setup GL state
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(0, 0, 0, 1);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    _computeModelView(modelMatrix, viewMatrix) {
        Mat4.multiply(this._mvMatrix, viewMatrix, modelMatrix);
        return this._mvMatrix;
    }

    _bindTexture(texture, unit = 0) {
        const { gl } = this;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    _extractNormalMatrix(modelMatrix) {
        const m = modelMatrix;
        const n = this._normalMatrix;
        n[0] = m[0]; n[1] = m[1]; n[2] = m[2];
        n[3] = m[4]; n[4] = m[5]; n[5] = m[6];
        n[6] = m[8]; n[7] = m[9]; n[8] = m[10];
        return n;
    }

    renderSkybox(texture, viewMatrix, projMatrix) {
        const { gl } = this;
        gl.depthMask(false);
        gl.disable(gl.CULL_FACE);

        this.programs.skybox.use()
            .setMatrix4('uViewMatrix', viewMatrix)
            .setMatrix4('uProjectionMatrix', projMatrix)
            .setInt('uTexture', 0);

        this._bindTexture(texture);
        this.meshes.skybox.draw(this.programs.skybox);

        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);
    }

    renderStar(body, viewMatrix, projMatrix, time) {
        const mv = this._computeModelView(body.modelMatrix, viewMatrix);

        this.programs.sun.use()
            .setMatrix4('uModelViewMatrix', mv)
            .setMatrix4('uProjectionMatrix', projMatrix)
            .setFloat('uTime', time)
            .setInt('uTexture', 0);

        this._bindTexture(body.texture);
        this.meshes.sphere.draw(this.programs.sun);
    }

    renderPlanet(body, viewMatrix, projMatrix) {
        const mv = this._computeModelView(body.modelMatrix, viewMatrix);

        this.programs.planet.use()
            .setMatrix4('uModelViewMatrix', mv)
            .setMatrix4('uModelMatrix', body.modelMatrix)
            .setMatrix4('uProjectionMatrix', projMatrix)
            .setMatrix3('uNormalMatrix', this._extractNormalMatrix(body.modelMatrix))
            .setFloat('uAmbient', 0.15)
            .setInt('uTexture', 0);

        this._bindTexture(body.texture);
        this.meshes.sphere.draw(this.programs.planet);
    }

    renderRing(body, viewMatrix, projMatrix) {
        const { gl } = this;

        // Scale ring to planet size
        const ringMatrix = Mat4.create();
        Mat4.multiply(ringMatrix, body.ringModelMatrix, Mat4.create());
        Mat4.scale(ringMatrix, ringMatrix, [body.radius, body.radius, body.radius]);

        const mv = this._computeModelView(ringMatrix, viewMatrix);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.CULL_FACE);

        this.programs.ring.use()
            .setMatrix4('uModelViewMatrix', mv)
            .setMatrix4('uProjectionMatrix', projMatrix)
            .setFloat('uAmbient', 0.7)
            .setInt('uTexture', 0);

        this._bindTexture(body.ringTexture);
        this.meshes.ring.draw(this.programs.ring);

        gl.disable(gl.BLEND);
        gl.enable(gl.CULL_FACE);
    }

    renderBody(body, viewMatrix, projMatrix, time) {
        if (body.type === 'star') {
            this.renderStar(body, viewMatrix, projMatrix, time);
        } else {
            this.renderPlanet(body, viewMatrix, projMatrix);
        }
        if (body.ringTexture) {
            this.renderRing(body, viewMatrix, projMatrix);
        }
    }
}
