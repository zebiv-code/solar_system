// Matrix and vector math utilities

const Vec3 = {
    create(x = 0, y = 0, z = 0) {
        return [x, y, z];
    },

    fromSpherical(distance, phi, theta) {
        return [
            distance * Math.sin(phi) * Math.cos(theta),
            distance * Math.cos(phi),
            distance * Math.sin(phi) * Math.sin(theta)
        ];
    },

    add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    },

    transformMat4(out, a, m) {
        const x = a[0], y = a[1], z = a[2];
        out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
        out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
        out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
        return out;
    }
};

const Mat4 = {
    create() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    },

    perspective(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
        out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
        return out;
    },

    lookAt(out, eye, center, up) {
        const zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
        let len = 1 / Math.sqrt(zx * zx + zy * zy + zz * zz);
        const z0 = zx * len, z1 = zy * len, z2 = zz * len;

        const xx = up[1] * z2 - up[2] * z1;
        const xy = up[2] * z0 - up[0] * z2;
        const xz = up[0] * z1 - up[1] * z0;
        len = Math.sqrt(xx * xx + xy * xy + xz * xz);
        len = len ? 1 / len : 0;
        const x0 = xx * len, x1 = xy * len, x2 = xz * len;

        const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;

        out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
        out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
        out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
        out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
        out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
        out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
        out[15] = 1;
        return out;
    },

    multiply(out, a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        for (let i = 0; i < 4; i++) {
            const bi = i * 4;
            const b0 = b[bi], b1 = b[bi + 1], b2 = b[bi + 2], b3 = b[bi + 3];
            out[bi] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[bi + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[bi + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[bi + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        }
        return out;
    },

    translate(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        if (out !== a) {
            for (let i = 0; i < 12; i++) out[i] = a[i];
        }
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        return out;
    },

    rotateX(out, a, rad) {
        const s = Math.sin(rad), c = Math.cos(rad);
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        if (out !== a) { out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3]; out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]; }
        out[4] = a10 * c + a20 * s; out[5] = a11 * c + a21 * s; out[6] = a12 * c + a22 * s; out[7] = a13 * c + a23 * s;
        out[8] = a20 * c - a10 * s; out[9] = a21 * c - a11 * s; out[10] = a22 * c - a12 * s; out[11] = a23 * c - a13 * s;
        return out;
    },

    rotateY(out, a, rad) {
        const s = Math.sin(rad), c = Math.cos(rad);
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        if (out !== a) { out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7]; out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]; }
        out[0] = a00 * c - a20 * s; out[1] = a01 * c - a21 * s; out[2] = a02 * c - a22 * s; out[3] = a03 * c - a23 * s;
        out[8] = a00 * s + a20 * c; out[9] = a01 * s + a21 * c; out[10] = a02 * s + a22 * c; out[11] = a03 * s + a23 * c;
        return out;
    },

    rotateZ(out, a, rad) {
        const s = Math.sin(rad), c = Math.cos(rad);
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        if (out !== a) { out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11]; out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]; }
        out[0] = a00 * c + a10 * s; out[1] = a01 * c + a11 * s; out[2] = a02 * c + a12 * s; out[3] = a03 * c + a13 * s;
        out[4] = a10 * c - a00 * s; out[5] = a11 * c - a01 * s; out[6] = a12 * c - a02 * s; out[7] = a13 * c - a03 * s;
        return out;
    },

    scale(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        out[0] = a[0] * x; out[1] = a[1] * x; out[2] = a[2] * x; out[3] = a[3] * x;
        out[4] = a[4] * y; out[5] = a[5] * y; out[6] = a[6] * y; out[7] = a[7] * y;
        out[8] = a[8] * z; out[9] = a[9] * z; out[10] = a[10] * z; out[11] = a[11] * z;
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
        return out;
    }
};

