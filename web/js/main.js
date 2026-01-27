// Solar System Application

class SolarSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.bodies = [];
        this.textures = {};
        this.time = 0;
        this.lastTime = 0;
        this.timeScale = 0.5;
        this.init();
    }

    async init() {
        try {
            // Initialize WebGL
            const gl = GL.init(this.canvas);

            // Create renderer and camera
            this.renderer = new Renderer(gl);
            this.renderer.init();
            this.camera = new Camera(this.canvas);

            // Load all textures
            this.textures = await TextureLoader.loadAll(gl, SOLAR_SYSTEM.textures);

            // Create celestial bodies
            for (const config of SOLAR_SYSTEM.bodies) {
                const body = new CelestialBody({
                    ...config,
                    texture: this.textures[config.texture],
                    ringTexture: config.ringTexture ? this.textures[config.ringTexture] : null
                });
                this.bodies.push(body);
            }

            // Setup resize handler
            window.addEventListener('resize', () => this.resize());
            this.resize();

            // Hide loading, start loop
            document.getElementById('loading')?.classList.add('hidden');
            this.lastTime = performance.now();
            this.loop();

        } catch (error) {
            console.error('Initialization failed:', error);
            const loading = document.getElementById('loading');
            if (loading) loading.innerHTML = `<p style="color:#f00">Error: ${error.message}</p>`;
        }
    }

    resize() {
        GL.resizeCanvas(this.canvas);
        GL.context.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.camera.updateProjection(this.canvas.width / this.canvas.height);
    }

    loop() {
        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;
        this.time += dt;

        // Update bodies
        for (const body of this.bodies) {
            body.update(dt, this.timeScale);
        }

        // Render
        const view = this.camera.viewMatrix;
        const proj = this.camera.projectionMatrix;

        this.renderer.clear();
        this.renderer.renderSkybox(this.textures.stars, view, proj);

        for (const body of this.bodies) {
            this.renderer.renderBody(body, view, proj, this.time);
        }

        requestAnimationFrame(() => this.loop());
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => new SolarSystem('glCanvas'));
