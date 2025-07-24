import { MAP_SIZE } from '../Constants.js';
import { Camera } from './Camera.js';
import { Hud } from './Hud.js';
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
		this.hud = new Hud(this.width, this.height, this.ctx);
	}

	drawBackground() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	draw(infoToDraw) {
		this.drawBackground();
		infoToDraw.grid.forEach((drawInfo) => this.drawInCanvas(drawInfo));
		this.drawInScreen(infoToDraw.hud);
	}

	drawByAction(drawInfo) {
		const ctx = this.ctx;
		const { x, y, width, height } = drawInfo;

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

	drawInCanvas(drawInfo) {
		const width = this.camera.applyZoom(drawInfo.width);
		const height = this.camera.applyZoom(drawInfo.height);
		const x = this.camera.toCameraRelativeX(drawInfo.x);
		const y = this.camera.toCameraRelativeY(drawInfo.y);

		this.drawByAction({ ...drawInfo, x, y, width, height });
	}

	drawInScreen(info) {
		if (!info || info.length === 0) return;

		const drawInfo = this.hud.generateHudDrawInfo(info);

		drawInfo.forEach((item) => {
			this.drawByAction(item);
		});
	}
}
