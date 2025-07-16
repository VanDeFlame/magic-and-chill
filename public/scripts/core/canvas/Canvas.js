import { MAP_SIZE } from '../Constants.js';
import {
	getPxFromX,
	getPxFromY,
} from '../../utils/convertCoordsToPixels.function.js';
import { clamp } from '../../utils/clamp.function.js';
import EventManager from '../../events/eventManager.js';

export class Canvas {
	constructor(gameCanvasHtml) {
		this.gameCanvasHtml = gameCanvasHtml;
		this.ctx = gameCanvasHtml.getContext('2d');
		this.width = gameCanvasHtml.width;
		this.height = gameCanvasHtml.height;
		this.cameraPositionX = 0;
		this.cameraPositionY = 0;
		this.cameraZoom = 1;
		this.maxCanvasAreaX = getPxFromX(MAP_SIZE.width + 1);
		this.maxCanvasAreaY = getPxFromY(MAP_SIZE.height + 1);

		EventManager.setupCameraEvents(this);
	}

	get cameraWidth() {
		const zoomFactor = 1 / this.cameraZoom;
		return this.width * zoomFactor;
	}
	get cameraHeight() {
		const zoomFactor = 1 / this.cameraZoom;
		return this.height * zoomFactor;
	}
	get cameraPositionXEnd() {
		return this.cameraPositionX + this.cameraWidth;
	}
	get cameraPositionYEnd() {
		return this.cameraPositionY + this.cameraHeight;
	}
	get cameraPositionXMax() {
		return this.maxCanvasAreaX - this.cameraWidth;
	}
	get cameraPositionYMax() {
		return this.maxCanvasAreaY - this.cameraHeight;
	}

	moveCameraPosition({ deltaX, deltaY }) {
		if (typeof deltaX === 'number') {
			const newPositionHorizontal = this.cameraPositionX + deltaX;
			this.cameraPositionX = clamp(
				newPositionHorizontal,
				0,
				this.cameraPositionXMax
			);
		}
		if (typeof deltaY === 'number') {
			const newPositionVertical = this.cameraPositionY + deltaY;
			this.cameraPositionY = clamp(
				newPositionVertical,
				0,
				this.cameraPositionYMax
			);
		}
	}
	changeCameraZoom(zoomAction) {
		const ZoomActionEnum = {
			in: 1,
			reset: 0,
			out: -1,
		};
		const minZoom = 0.75;
		const maxZoom = 4;

		switch (zoomAction) {
			case ZoomActionEnum.reset:
				this.cameraZoom = 1;
				break;
			case ZoomActionEnum.in:
				this.cameraZoom = clamp(this.cameraZoom * 2, this.cameraZoom, maxZoom);
				break;
			case ZoomActionEnum.out:
				this.cameraZoom = clamp(
					this.cameraZoom * 0.75,
					minZoom,
					this.cameraZoom
				);
				break;
			default:
				break;
		}

		this.moveCameraPosition({ deltaX: 0, deltaY: 0 });
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
		const zoom = this.cameraZoom;
		const width = drawInfo.width * zoom;
		const height = drawInfo.height * zoom;
		const x = (drawInfo.x - this.cameraPositionX) * zoom;
		const y = (drawInfo.y - this.cameraPositionY) * zoom;

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
