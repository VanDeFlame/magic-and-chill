import { MAP_SIZE } from '../Constants.js';
import { Camera } from './Camera.js';
import {
	getPxFromX,
	getPxFromY,
} from '../../utils/convertCoordsToPixels.function.js';

export class Canvas {
	constructor(gameCanvasHtml) {
		this.gameCanvasHtml = gameCanvasHtml;
		this.ctx = gameCanvasHtml.getContext('2d');
		this.width = gameCanvasHtml.width;
		this.height = gameCanvasHtml.height;

		this.camera = new Camera(
			this.width,
			this.height,
			getPxFromX(MAP_SIZE.width + 1),
			getPxFromY(MAP_SIZE.height + 1)
		);
	}

	drawBackground() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	draw(infoToDraw) {
		this.drawBackground();
		infoToDraw.grid.forEach((drawInfo) => this.drawByAction(drawInfo));
	}

	drawByAction(drawInfo) {
		const ctx = this.ctx;
		const width = this.camera.applyZoom(drawInfo.width);
		const height = this.camera.applyZoom(drawInfo.height);
		const x = this.camera.toCameraRelativeX(drawInfo.x);
		const y = this.camera.toCameraRelativeY(drawInfo.y);

		switch (drawInfo.action) {
			case 'fillRect':
				ctx.fillStyle = drawInfo.fillStyle;
				ctx.fillRect(x, y, width, height);
				break;
			case 'strokeRect':
				ctx.strokeStyle = drawInfo.strokeStyle;
				ctx.strokeRect(x, y, width, height);

				break;
			case 'fillText':
				ctx.font = drawInfo.font;
				ctx.textAlign = drawInfo.textAlign;
				ctx.textBaseline = drawInfo.textBaseline;
				ctx.fillStyle = drawInfo.fillStyle;
				ctx.fillText(drawInfo.text, x, y);
				break;
			case 'drawImage':
				const { image, sx, sy, sWidth, sHeight } = drawInfo;

				if (sWidth && sHeight) {
					ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
				} else if (drawImage.width && drawImage.height) {
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
