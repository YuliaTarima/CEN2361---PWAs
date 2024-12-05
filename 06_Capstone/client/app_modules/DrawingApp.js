// Drawing App to manage canvas interactions

class DrawingApp {
    constructor() {
        console.log('DrawingApp loaded!');
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.setupCanvas();
        this.addEventListeners();
        this.setupTouchEvents();
    }

    // Resize the canvas and configure settings
    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.ctx.strokeStyle = document.getElementById('colorPicker').value;
            this.ctx.lineWidth = document.getElementById('brushSize').value;
            this.ctx.lineCap = 'round';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    // Add touch support for canvas
    setupTouchEvents() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    // Add event listeners for drawing actions
    addEventListeners() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        document.getElementById('colorPicker').addEventListener('change', (e) => {
            this.ctx.strokeStyle = e.target.value;
        });

        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.ctx.lineWidth = e.target.value;
        });

        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        });

        document.getElementById('downloadDrawing').addEventListener('click', this.downloadDrawing.bind(this));
    }

    // Start drawing on canvas
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    // Draw lines on the canvas
    draw(e) {
        if (!this.isDrawing) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    // Stop drawing on the canvas
    stopDrawing() {
        this.isDrawing = false;
    }

    // Download the current drawing
    downloadDrawing() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const link = document.createElement('a');
        link.download = `drawing-${timestamp}.jpg`;
        link.href = this.canvas.toDataURL('image/jpeg');
        link.click();
    }
}
export default DrawingApp;