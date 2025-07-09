import { Terrain } from './Terrain.js';
import { DEBUG_MODE } from './../core/Constants.js';

export class Grid {
	constructor(width, height, cellSize) {
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.cellSize = cellSize;
		this.gridWidth = Math.floor(width / cellSize);
		this.gridHeight = Math.floor(height / cellSize);
		this.gridHorizontalPadding = Math.floor((width % cellSize) / 2);
		this.gridVerticalPadding = Math.floor((height % cellSize) / 2);

		const terrain = new Terrain(this.gridWidth, this.gridHeight);
		this.cells = terrain.cells;
	}

	draw(ctx) {
		ctx.font = `${this.cellSize * 0.6}px serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		for (let x = 0; x < this.gridWidth; x++) {
			for (let y = 0; y < this.gridHeight; y++) {
				const cell = this.cells[x][y];
				const cx = this.getPxFromX(x);
				const cy = this.getPxFromY(y);

				// fondo
				ctx.fillStyle = cell.color;
				ctx.fillRect(cx, cy, this.cellSize, this.cellSize);

				// borde
				ctx.strokeStyle = 'rgba(49, 45, 45, 0.4)';
				ctx.strokeRect(cx, cy, this.cellSize, this.cellSize);

				// emoji
				if (cell.emoji) {
					ctx.fillStyle = 'black';
					ctx.fillText(
						cell.emoji,
						cx + this.cellSize / 2,
						cy + this.cellSize / 2
					);
				}

				if (DEBUG_MODE) {
					if (cell.isOccupied) {
						ctx.fillStyle = 'rgba(200, 45, 45, 0.4)';
						ctx.fillRect(cx, cy, this.cellSize, this.cellSize);
					}

					const defaultFont = ctx.font;
					ctx.font = `${this.cellSize * 0.2}px serif`;
					ctx.fillStyle = 'black';
					ctx.fillText(
						`[${x}, ${y}]`,
						cx + this.cellSize / 2,
						cy + this.cellSize / 2 - this.cellSize * 0.3
					);
					ctx.fillText(
						cell.type,
						cx + this.cellSize / 2,
						cy + this.cellSize / 2 + this.cellSize * 0.3
					);
					ctx.font = defaultFont; // Restaurar fuente por defecto
					ctx.fillStyle = 'normal'; // Restaurar color por defecto
				}
			}
		}
	}

	getXFromPx(px) {
		return (px - this.gridHorizontalPadding) / this.cellSize;
	}
	getYFromPX(px) {
		return (px - this.gridVerticalPadding) / this.cellSize;
	}
	getPxFromX(gridX) {
		return gridX * this.cellSize + this.gridHorizontalPadding;
	}
	getPxFromY(gridY) {
		return gridY * this.cellSize + this.gridVerticalPadding;
	}

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
