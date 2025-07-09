import { DEBUG_MODE } from '../Constants.js';

export class Canvas {
	constructor(canvas, ctx) {
		this.canvas = canvas;
		this.ctx = ctx;

		const canvasWidth = window.innerWidth;
		const canvasHeight = window.innerHeight;
		this.canvas.width = canvasWidth;
		this.canvas.height = canvasHeight;
	}

	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	// Function to draw the debug overlay
	drawDebugOverlay(info) {
		const fontSize = 8;
		this.ctx.font = `${fontSize}px Arial`;
		this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
		this.ctx.fillRect(0, 0, 400, 40 + info.length * 30); // Semi-transparent background
		this.ctx.textAlign = 'start';
		this.ctx.textBaseline = 'top';
		this.ctx.fillStyle = 'black';
		info.map((text, index) => {
			this.ctx.fillText(text, 10, fontSize * 1.5 + index * (fontSize * 1.5));
		});
	}
}
