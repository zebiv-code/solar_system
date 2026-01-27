// Geometry generation utilities

const Geometry = {
    createSphere(radius, latBands, longBands) {
        const positions = [], normals = [], texCoords = [], indices = [];

        for (let lat = 0; lat <= latBands; lat++) {
            const theta = (lat * Math.PI) / latBands;
            const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= longBands; lon++) {
                const phi = (lon * 2 * Math.PI) / longBands;
                const x = Math.cos(phi) * sinTheta, y = cosTheta, z = Math.sin(phi) * sinTheta;

                positions.push(radius * x, radius * y, radius * z);
                normals.push(x, y, z);
                texCoords.push(lon / longBands, lat / latBands);
            }
        }

        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < longBands; lon++) {
                const first = lat * (longBands + 1) + lon;
                const second = first + longBands + 1;
                indices.push(first, second, first + 1, second, second + 1, first + 1);
            }
        }

        return {
            positions: new Float32Array(positions),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices)
        };
    },

    createRing(innerRadius, outerRadius, segments) {
        const positions = [], texCoords = [], indices = [];

        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments;
            const cos = Math.cos(angle), sin = Math.sin(angle);
            positions.push(innerRadius * cos, 0, innerRadius * sin);
            texCoords.push(0, i / segments);
            positions.push(outerRadius * cos, 0, outerRadius * sin);
            texCoords.push(1, i / segments);
        }

        for (let i = 0; i < segments; i++) {
            const base = i * 2;
            // Double-sided
            indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
            indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
        }

        return {
            positions: new Float32Array(positions),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices)
        };
    },

    createSkybox(radius) {
        const sphere = this.createSphere(radius, 32, 32);
        // Invert for inside viewing
        for (let i = 0; i < sphere.normals.length; i++) sphere.normals[i] *= -1;
        for (let i = 0; i < sphere.indices.length; i += 3) {
            [sphere.indices[i + 1], sphere.indices[i + 2]] = [sphere.indices[i + 2], sphere.indices[i + 1]];
        }
        return sphere;
    }
};
