// Orbit camera controller

class Camera {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.distance = options.distance || 150;
        this.minDistance = options.minDistance || 5;
        this.maxDistance = options.maxDistance || 600;
        this.theta = options.theta || Math.PI / 4;
        this.phi = options.phi || Math.PI / 4;
        this.minPhi = 0.1;
        this.maxPhi = Math.PI - 0.1;
        this.target = options.target || [0, 0, 0];
        this.rotateSpeed = 0.005;
        this.zoomSpeed = 0.1;

        this._isDragging = false;
        this._lastX = 0;
        this._lastY = 0;
        this.viewMatrix = Mat4.create();
        this.projectionMatrix = Mat4.create();

        this._setupEvents();
        this._updateView();
    }

    _startDrag(x, y) {
        this._isDragging = true;
        this._lastX = x;
        this._lastY = y;
    }

    _endDrag() {
        this._isDragging = false;
    }

    _drag(x, y) {
        if (!this._isDragging) return;
        this.theta -= (x - this._lastX) * this.rotateSpeed;
        this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi - (y - this._lastY) * this.rotateSpeed));
        this._lastX = x;
        this._lastY = y;
        this._updateView();
    }

    _zoom(delta) {
        this.distance *= 1 + delta * this.zoomSpeed;
        this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
        this._updateView();
    }

    _setupEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', e => this._startDrag(e.clientX, e.clientY));
        window.addEventListener('mouseup', () => this._endDrag());
        window.addEventListener('mousemove', e => this._drag(e.clientX, e.clientY));

        this.canvas.addEventListener('wheel', e => {
            e.preventDefault();
            this._zoom(e.deltaY > 0 ? 1 : -1);
        }, { passive: false });

        // Touch events
        this.canvas.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                e.preventDefault();
                this._startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        window.addEventListener('touchend', () => this._endDrag());

        window.addEventListener('touchmove', e => {
            if (e.touches.length === 1) {
                e.preventDefault();
                this._drag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    _updateView() {
        const pos = Vec3.fromSpherical(this.distance, this.phi, this.theta);
        Vec3.add(pos, pos, this.target);
        Mat4.lookAt(this.viewMatrix, pos, this.target, [0, 1, 0]);
    }

    updateProjection(aspect) {
        Mat4.perspective(this.projectionMatrix, Math.PI / 4, aspect, 0.1, 2000);
    }

    getPosition() {
        const pos = Vec3.fromSpherical(this.distance, this.phi, this.theta);
        return Vec3.add(pos, pos, this.target);
    }
}
