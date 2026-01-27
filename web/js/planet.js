// Celestial body class

class CelestialBody {
    constructor(config) {
        Object.assign(this, {
            name: '',
            radius: 1,
            orbitRadius: 0,
            orbitSpeed: 0,
            rotationSpeed: 0,
            tilt: 0,
            type: 'planet',  // 'star', 'planet', 'ring'
            texture: null,
            ringTexture: null
        }, config);

        this.orbitAngle = Math.random() * Math.PI * 2;
        this.rotationAngle = 0;
        this.position = [0, 0, 0];
        this.modelMatrix = Mat4.create();
        this.ringModelMatrix = Mat4.create();
    }

    update(dt, timeScale) {
        const t = dt * timeScale;
        this.orbitAngle += this.orbitSpeed * t;
        this.rotationAngle += this.rotationSpeed * t;

        if (this.orbitRadius > 0) {
            this.position[0] = Math.cos(this.orbitAngle) * this.orbitRadius;
            this.position[1] = 0;
            this.position[2] = Math.sin(this.orbitAngle) * this.orbitRadius;
        }

        // Build model matrix: translate -> tilt -> rotate -> scale
        const m = this.modelMatrix;
        Mat4.translate(m, Mat4.create(), this.position);
        if (this.tilt) Mat4.rotateZ(m, m, this.tilt);
        Mat4.rotateY(m, m, this.rotationAngle);
        Mat4.scale(m, m, [this.radius, this.radius, this.radius]);

        // Ring matrix (no scale, separate tilt)
        if (this.ringTexture) {
            const rm = this.ringModelMatrix;
            Mat4.translate(rm, Mat4.create(), this.position);
            if (this.tilt) Mat4.rotateZ(rm, rm, this.tilt);
            Mat4.rotateX(rm, rm, Math.PI * 0.075);
        }
    }
}

// Solar system configuration
// Orbital radii in AU (scaled x10), speeds follow Kepler's laws (Earth = 0.5)
const SOLAR_SYSTEM = {
    bodies: [
        { name: 'Sun', radius: 2.5, orbitRadius: 0, orbitSpeed: 0, rotationSpeed: 0.1, type: 'star', texture: 'sun' },
        { name: 'Mercury', radius: 0.4, orbitRadius: 3.87, orbitSpeed: 2.07, rotationSpeed: 0.02, tilt: 0.03, texture: 'mercury' },
        { name: 'Venus', radius: 0.9, orbitRadius: 7.23, orbitSpeed: 0.81, rotationSpeed: -0.01, tilt: 2.64, texture: 'venus' },
        { name: 'Earth', radius: 1, orbitRadius: 10, orbitSpeed: 0.5, rotationSpeed: 1, tilt: 0.41, texture: 'earth' },
        { name: 'Mars', radius: 0.5, orbitRadius: 15.24, orbitSpeed: 0.27, rotationSpeed: 0.95, tilt: 0.44, texture: 'mars' },
        { name: 'Jupiter', radius: 2.5, orbitRadius: 52.03, orbitSpeed: 0.042, rotationSpeed: 2.4, tilt: 0.05, texture: 'jupiter' },
        { name: 'Saturn', radius: 2.2, orbitRadius: 95.37, orbitSpeed: 0.017, rotationSpeed: 2.2, tilt: 0.47, texture: 'saturn', ringTexture: 'saturnRing' },
        { name: 'Uranus', radius: 1.5, orbitRadius: 191.9, orbitSpeed: 0.006, rotationSpeed: 1.4, tilt: 1.71, texture: 'uranus' },
        { name: 'Neptune', radius: 1.4, orbitRadius: 300.7, orbitSpeed: 0.003, rotationSpeed: 1.5, tilt: 0.49, texture: 'neptune' }
    ],

    textures: {
        sun: 'textures/sun.jpg',
        mercury: 'textures/mercury.jpg',
        venus: 'textures/venus.jpg',
        earth: 'textures/earth.jpg',
        mars: 'textures/mars.jpg',
        jupiter: 'textures/jupiter.jpg',
        saturn: 'textures/saturn.jpg',
        saturnRing: 'textures/saturn-ring.png',
        uranus: 'textures/uranus.jpg',
        neptune: 'textures/neptune.jpg',
        stars: 'textures/stars.jpg'
    }
};
