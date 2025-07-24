import { calculateArrayTextWidth } from '../../utils/calculateTextWidth.function.js';
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

export class Hud {
	constructor(width, height, ctx) {
		this.width = width;
		this.height = height;
		this.ctx = ctx;
		this.padding = 10;
		this.textWidthCache = new Map();
		this.sectorMap = new Map();
	}

	generateEmptySectors() {
		for (const horizontal of Object.values(PositionHorizontalEnum)) {
			for (const vertical of Object.values(PositionVerticalEnum)) {
				this.sectorMap.set(`${horizontal}-${vertical}`, {
					items: [],
					height: 0,
					width: 0,
				});
			}
		}
	}

	generateHudDrawInfo(infoToDraw) {
		this.generateEmptySectors();
		this.splitBySectors(infoToDraw);
		this.avoidOverridesInLinesOfSector();

		const drawInfo = [];

		this.sectorMap.forEach((sector) => {
			drawInfo.push(
				...sector.items.flatMap((item) => this.formatDrawInfo(item))
			);
		});

		return drawInfo;
	}

	splitBySectors(infoToDraw) {
		infoToDraw.forEach((info) => {
			if (info.texts.length === 0) return;

			const key = `${info.positionHorizontal}-${info.positionVertical}`;
			const sector = this.sectorMap.get(key);

			const infoWithSize = this.calculateInfoSize(info);

			sector.items.push(infoWithSize);
			sector.height += infoWithSize.height;
			sector.width = Math.max(sector.width, infoWithSize.width);
		});
	}

	avoidOverridesInLinesOfSector() {
		this.sectorMap.forEach((sector, key) => {
			if (sector.items.length === 0) return;
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
		});
	}

	calculateInfoSize(info) {
		const lineHeight = info.fontSize * 1.5;
		const bothSidesPadding = this.padding * 2;
		const estimatedTextWidth = calculateArrayTextWidth({
			texts: info.texts,
			fontSize: info.fontSize,
			ctx: this.ctx,
			cache: this.textWidthCache,
		});

		const infoWidth = (info.width ?? estimatedTextWidth) + bothSidesPadding;
		const infoHeight = info.texts.length * lineHeight + bothSidesPadding;

		const infoX = this.getHorizontalPositionInScreen(
			info.positionHorizontal,
			infoWidth
		);

		return {
			...info,
			height: infoHeight,
			width: infoWidth,
			lineHeight,
			padding: this.padding,
			x: infoX,
		};
	}

	formatDrawInfo(item) {
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

		const info = texts.map((text, index) => ({
			action: 'fillText',
			text,
			x: x + padding,
			y: y + padding + index * lineHeight,
			fillStyle: color || 'black',
			font: `${fontSize}px Arial`,
			textAlign: 'start',
			textBaseline: 'top',
		}));

		if (background) {
			info.unshift({
				action: 'fillRect',
				x: x,
				y: y,
				width,
				height,
				fillStyle: background,
			});
		}

		return info;
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
