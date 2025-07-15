import { Terrain } from './Terrain.js';
import { DEBUG_MODE, MAP_SIZE, CELL_SIZE } from './../core/Constants.js';
import {
	getXFromPX,
	getYFromPX,
	getPxFromY,
	getPxFromX,
} from '../utils/convertCoordsToPixels.function.js';

export class Grid {
	constructor(canvas) {
		this.canvas = canvas;
		this.cellSize = CELL_SIZE;
		this.gridWidth = MAP_SIZE.width;
		this.gridHeight = MAP_SIZE.height;

		const terrain = new Terrain(this.gridWidth, this.gridHeight);
		this.cells = terrain.cells;
	}

	generateDrawInfo() {
		// this.drawTerrain(ctx);
		const cameraX = getXFromPX(this.canvas.cameraPositionX);
		const cameraY = getYFromPX(this.canvas.cameraPositionY);
		const cameraWidth = getXFromPX(
			this.canvas.width + this.canvas.cameraPositionX
		);
		const cameraHeight = getYFromPX(
			this.canvas.height + this.canvas.cameraPositionY
		);

		const cellsInfo = [];
		const cameraX2 = cameraX === 0 ? 0 : cameraX - 1;
		const cameraY2 = cameraY === 0 ? 0 : cameraY - 1;
		for (let x = cameraX2; x <= cameraWidth; x++) {
			for (let y = cameraY2; y <= cameraHeight; y++) {
				cellsInfo.push(...this.generateDrawInfoCell(x, y));
			}
		}

		return cellsInfo;
	}

	generateDrawInfoCell(x, y) {
		const cell = this.cells[x][y];
		const cellSize = this.cellSize;
		const paddingCenter = cellSize / 2;
		const pxX = getPxFromX(x);
		const pxY = getPxFromY(y);

		const drawInfoTemplate = {
			font: `${cellSize * 0.6}px serif`,
			textAlign: 'center',
			textBaseline: 'middle',
			x: pxX,
			y: pxY,
			width: cellSize,
			height: cellSize,
		};

		const drawInfo = [
			{
				...drawInfoTemplate,
				fillStyle: cell.color,
				action: 'fillRect',
			},
			{
				...drawInfoTemplate,
				strokeStyle: 'rgba(49, 45, 45, 0.4)',
				action: 'strokeRect',
			},
		];

		// emoji
		if (cell.emoji) {
			drawInfo.push({
				...drawInfoTemplate,
				fillStyle: 'black',
				text: cell.emoji,
				x: pxX + paddingCenter,
				y: pxY + paddingCenter,
				action: 'fillText',
			});
		}

		if (DEBUG_MODE) {
			if (cell.isOccupied) {
				drawInfo.push({
					...drawInfoTemplate,
					fillStyle: 'rgba(200, 45, 45, 0.4)',
					action: 'fillRect',
				});
			}

			drawInfo.push(
				{
					...drawInfoTemplate,
					font: `${cellSize * 0.2}px serif`,
					fillStyle: 'black',
					action: 'fillText',
					text: `[${x}, ${y}]`,
					x: pxX + paddingCenter,
					y: pxY + paddingCenter - cellSize * 0.3,
				},
				{
					...drawInfoTemplate,
					font: `${cellSize * 0.2}px serif`,
					fillStyle: 'black',
					action: 'fillText',
					text: cell.type,
					x: pxX + paddingCenter,
					y: pxY + paddingCenter + cellSize * 0.3,
				}
			);
		}

		return drawInfo;
	}

	// drawTerrain(ctx) {
	// 	ctx.font = `${this.cellSize * 0.6}px serif`;
	// 	ctx.textAlign = 'center';
	// 	ctx.textBaseline = 'middle';

	// 	for (let x = 0; x < this.gridWidth; x++) {
	// 		for (let y = 0; y < this.gridHeight; y++) {
	// 			const cell = this.cells[x][y];
	// 			const cx = this.getPxFromX(x);
	// 			const cy = this.getPxFromY(y);

	// 			// fondo
	// 			ctx.fillStyle = cell.color;
	// 			ctx.fillRect(cx, cy, this.cellSize, this.cellSize);

	// 			// borde
	// 			ctx.strokeStyle = 'rgba(49, 45, 45, 0.4)';
	// 			ctx.strokeRect(cx, cy, this.cellSize, this.cellSize);

	// 			// emoji
	// 			if (cell.emoji) {
	// 				ctx.fillStyle = 'black';
	// 				ctx.fillText(
	// 					cell.emoji,
	// 					cx + this.cellSize / 2,
	// 					cy + this.cellSize / 2
	// 				);
	// 			}

	// 			if (DEBUG_MODE) {
	// 				if (cell.isOccupied) {
	// 					ctx.fillStyle = 'rgba(200, 45, 45, 0.4)';
	// 					ctx.fillRect(cx, cy, this.cellSize, this.cellSize);
	// 				}

	// 				const defaultFont = ctx.font;
	// 				ctx.font = `${this.cellSize * 0.2}px serif`;
	// 				ctx.fillStyle = 'black';
	// 				ctx.fillText(
	// 					`[${x}, ${y}]`,
	// 					cx + this.cellSize / 2,
	// 					cy + this.cellSize / 2 - this.cellSize * 0.3
	// 				);
	// 				ctx.fillText(
	// 					cell.type,
	// 					cx + this.cellSize / 2,
	// 					cy + this.cellSize / 2 + this.cellSize * 0.3
	// 				);
	// 				ctx.font = defaultFont; // Restaurar fuente por defecto
	// 				ctx.fillStyle = 'normal'; // Restaurar color por defecto
	// 			}
	// 		}
	// 	}
	// }

	isValidCell(x, y, ignoreOccupied = false) {
		return (
			x >= 0 &&
			y >= 0 &&
			x < this.gridWidth &&
			y < this.gridHeight &&
			this.cells[x][y].walkable &&
			(ignoreOccupied || !this.cells[x][y].isOccupied)
		);
	}

	occupyCell(x, y) {
		if (this.isValidCell(x, y, true)) {
			this.cells[x][y].isOccupied = true;
		}
	}

	vacateCell(x, y) {
		if (this.isValidCell(x, y, true)) {
			this.cells[x][y].isOccupied = false;
		}
	}

	getRandomValidCell(ignoreOccupied = false, maxAttempts = 100) {
		for (let i = 0; i < maxAttempts; i++) {
			const x = Math.floor(Math.random() * this.gridWidth);
			const y = Math.floor(Math.random() * this.gridHeight);

			if (this.isValidCell(x, y, ignoreOccupied)) {
				return { x, y };
			}
		}

		return null; // no encontró ninguna válida
	}
}
