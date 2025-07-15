import { MAP_SIZE } from '../Constants.js';
import {
	getPxFromX,
	getPxFromY,
} from '../../utils/convertCoordsToPixels.function.js';
export class Canvas {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		const canvasWidth = window.innerWidth;
		const canvasHeight = window.innerHeight;
		this.canvas.width = canvasWidth;
		this.canvas.height = canvasHeight;
		this.cameraPositionX = 0;
		this.cameraPositionY = 0;
		this.cameraPositionXMax = getPxFromX(MAP_SIZE.width + 1) - canvasWidth;
		this.cameraPositionYMax = getPxFromY(MAP_SIZE.height + 1) - canvasHeight;

		this.setupKeyEvents();
	}

	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}

	setupKeyEvents() {
		this.canvas.setAttribute('tabindex', '0');
		this.canvas.addEventListener('click', () => {
			this.canvas.focus();
		});
		this.canvas.addEventListener('keydown', (e) => {
			const directions = {
				ArrowLeft: 'left',
				ArrowUp: 'up',
				ArrowDown: 'down',
				ArrowRight: 'right',
			};
			if (e.code in directions) {
				this.moveCameraPosition(directions[e.code]);
			}
		});
	}

	moveCameraPosition(direction) {
		const movementSpeed = 20;
		switch (direction) {
			case 'up':
				const newPositionUp = this.cameraPositionY - movementSpeed;
				this.cameraPositionY = newPositionUp > 0 ? newPositionUp : 0;
				break;
			case 'down':
				const newPositionDown = this.cameraPositionY + movementSpeed;
				this.cameraPositionY =
					newPositionDown < this.cameraPositionYMax
						? newPositionDown
						: this.cameraPositionYMax;
				break;
			case 'left':
				const newPositionLeft = this.cameraPositionX - movementSpeed;
				this.cameraPositionX = newPositionLeft > 0 ? newPositionLeft : 0;
				break;
			case 'right':
				const newPositionRight = this.cameraPositionX + movementSpeed;
				this.cameraPositionX =
					newPositionRight < this.cameraPositionXMax
						? newPositionRight
						: this.cameraPositionXMax;
				break;
			default:
				break;
		}
	}

	drawBackground() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	draw(infoToDraw) {
		this.drawBackground();
		infoToDraw.grid.forEach((drawInfo) => this.drawByAction(drawInfo));
	}

	drawByAction(drawInfo) {
		const ctx = this.ctx;
		const x = drawInfo.x - this.cameraPositionX;
		const y = drawInfo.y - this.cameraPositionY;

		switch (drawInfo.action) {
			case 'fillRect':
				ctx.fillStyle = drawInfo.fillStyle;
				ctx.fillRect(x, y, drawInfo.width, drawInfo.height);
				break;
			case 'strokeRect':
				ctx.strokeStyle = drawInfo.strokeStyle;
				ctx.strokeRect(x, y, drawInfo.width, drawInfo.height);

				break;
			case 'fillText':
				ctx.font = drawInfo.font;
				ctx.textAlign = drawInfo.textAlign;
				ctx.textBaseline = drawInfo.textBaseline;
				ctx.fillStyle = drawInfo.fillStyle;
				ctx.fillText(drawInfo.text, x, y);
				break;
			case 'drawImage':
				const { image, sx, sy, sWidth, sHeight, width, height } = drawInfo;

				if (sWidth && sHeight) {
					ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
				} else if (width && height) {
					ctx.drawImage(image, x, y, width, height);
				} else {
					ctx.drawImage(image, x, y);
				}
				break;
			default:
				break;
		}
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
