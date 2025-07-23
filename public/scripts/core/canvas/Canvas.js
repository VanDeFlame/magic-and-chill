import { MAP_SIZE } from '../Constants.js';
import { Camera } from './Camera.js';
import {
	getPxFromX,
	getPxFromY,
} from '../../utils/convertCoordsToPixels.function.js';

const PositionHorizontalEnum = {
	LEFT: 'left',
	CENTER: 'center',
	RIGHT: 'right',
};
const PositionVerticalEnum = {
	TOP: 'top',
	MIDDLE: 'middle',
	BOTTOM: 'bottom',
};

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
		const sectorMap = this.splitHudInfoInSectors(info);
		const sectorMapWithoutLineOverrides =
			this.avoidOverridesInLinesOfSector(sectorMap);

		for (const [key, sector] of sectorMapWithoutLineOverrides.entries()) {
			this.drawTextInSector(sector);
		}
	}

	splitHudInfoInSectors(infoToDraw) {
		const padding = 10;
		const bothSidesPadding = padding * 2;

		const sectorMap = new Map();
		infoToDraw.forEach((info) => {
			if (info.texts.length === 0) return;

			const key = `${info.positionHorizontal}-${info.positionVertical}`;

			if (!sectorMap.has(key)) {
				sectorMap.set(key, { items: [], height: 0, width: 0 });
			}

			const sector = sectorMap.get(key);

			const lineHeight = info.fontSize * 1.5;
			const infoWidth = (info.width ?? 300) + bothSidesPadding;
			const infoHeight = info.texts.length * lineHeight + bothSidesPadding;

			const infoX = this.getHorizontalPositionInScreen(
				info.positionHorizontal,
				infoWidth
			);

			sector.items.push({
				...info,
				height: infoHeight,
				width: infoWidth,
				lineHeight,
				padding,
				x: infoX,
			});

			sector.height += infoHeight;
			sector.width = Math.max(sector.width, infoWidth);
		});
		return sectorMap;
	}

	avoidOverridesInLinesOfSector(sectorMap) {
		for (const [key, sector] of sectorMap.entries()) {
			const [column, row] = key.split('-');

			const rowYStart = this.getVerticalPositionInScreen(row, sector.height);
			let currentRowYStart = rowYStart;

			sector.items = sector.items.map((info) => {
				const y = currentRowYStart;
				currentRowYStart = y + info.height;

				return {
					...info,
					y,
				};
			});
		}
		return sectorMap;
	}

	drawTextInSector(sector) {
		sector.items.forEach((item) => {
			const {
				x,
				y,
				width,
				height,
				texts,
				fontSize,
				color,
				padding,
				lineHeight,
				background,
			} = item;

			if (background) {
				this.drawByAction({
					action: 'fillRect',
					x: x,
					y: y,
					width,
					height,
					fillStyle: background,
				});
			}

			texts.forEach((text, index) =>
				this.drawByAction({
					action: 'fillText',
					text,
					x: x + padding,
					y: y + padding + index * lineHeight,
					fillStyle: color || 'black',
					font: `${fontSize}px Arial`,
					textAlign: 'start',
					textBaseline: 'top',
				})
			);
		});
	}

	getHorizontalPositionInScreen(position, width) {
		switch (position) {
			case PositionHorizontalEnum.LEFT:
				return 10;
			case PositionHorizontalEnum.CENTER:
				return (this.width - width) / 2;
			case PositionHorizontalEnum.RIGHT:
				return this.width - width - 10;
			default:
				return 10;
		}
	}
	getVerticalPositionInScreen(position, height) {
		switch (position) {
			case PositionVerticalEnum.TOP:
				return 10;
			case PositionVerticalEnum.MIDDLE:
				return (this.height - height) / 2;
			case PositionVerticalEnum.BOTTOM:
				return this.height - height - 10;
			default:
				return 10;
		}
	}
}
