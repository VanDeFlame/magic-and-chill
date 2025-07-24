import { Terrain } from './Terrain.js';
import { DEBUG_MODE, MAP_SIZE, CELL_SIZE } from './../core/Constants.js';
import {
	getXFromPX,
	getYFromPX,
	getPxFromY,
	getPxFromX,
} from '../utils/convertCoordsToPixels.function.js';

export class Grid {
	constructor(camera) {
		this.camera = camera;
		this.cellSize = CELL_SIZE;
		this.gridWidth = MAP_SIZE.width;
		this.gridHeight = MAP_SIZE.height;

		const terrain = new Terrain(this.gridWidth, this.gridHeight);
		this.cells = terrain.cells;

		// Cache para evitar recalcular la visual del grid
		this.cellTypeTemplateCache = new Map();
		this._lastCameraSnapshot = null;
		this._cachedDrawInfo = [];
	}

	generateDrawInfo() {
		const snapshot = {
			x: this.camera.positionX,
			y: this.camera.positionY,
			zoom: this.camera.zoom,
		};

		// No cambió nada -> usar cache
		if (
			this._lastCameraSnapshot &&
			this._lastCameraSnapshot.x === snapshot.x &&
			this._lastCameraSnapshot.y === snapshot.y &&
			this._lastCameraSnapshot.zoom === snapshot.zoom &&
			!DEBUG_MODE
		) {
			return this._cachedDrawInfo;
		}

		const startX = Math.max(0, getXFromPX(this.camera.positionX) - 1);
		const startY = Math.max(0, getYFromPX(this.camera.positionY) - 1);
		const endX = getXFromPX(this.camera.viewportRight);
		const endY = getYFromPX(this.camera.viewportBottom);

		const cellsInfo = [];

		for (let x = startX; x <= endX; x++) {
			for (let y = startY; y <= endY; y++) {
				cellsInfo.push(...this.generateDrawInfoCell(x, y));
			}
		}

		this._lastCameraSnapshot = snapshot;
		this._cachedDrawInfo = cellsInfo;
		return cellsInfo;
	}

	generateDrawCellTypeTemplate(cell) {
		const key = `${cell.type}|${cell.color}|${cell.emoji || ''}`;
		if (this.cellTypeTemplateCache.has(key)) {
			return this.cellTypeTemplateCache.get(key);
		}

		const cellSize = this.cellSize;
		const paddingCenter = cellSize / 2;
		const baseDrawInfo = [
			{
				fillStyle: cell.color,
				action: 'fillRect',
				width: cellSize,
				height: cellSize,
				x: 0,
				y: 0,
			},
			{
				strokeStyle: 'rgba(49, 45, 45, 0.4)',
				action: 'strokeRect',
				width: cellSize,
				height: cellSize,
				x: 0,
				y: 0,
			},
		];

		if (cell.emoji) {
			baseDrawInfo.push({
				fillStyle: 'black',
				action: 'fillText',
				font: `${cellSize * 0.6}px serif`,
				textAlign: 'center',
				textBaseline: 'middle',
				text: cell.emoji,
				width: cellSize,
				height: cellSize,
				x: paddingCenter,
				y: paddingCenter,
			});
		}

		this.cellTypeTemplateCache.set(key, baseDrawInfo);
		return baseDrawInfo;
	}

	generateDrawCellTypeDebug(x, y, cell) {
		const debugInfo = [];
		const cellSize = this.cellSize;
		const paddingCenter = cellSize / 2;

		if (cell.isOccupied) {
			debugInfo.push({
				fillStyle: 'rgba(200, 45, 45, 0.4)',
				action: 'fillRect',
				width: cellSize,
				height: cellSize,
				x: 0,
				y: 0,
			});
		}

		const baseTextDraw = {
			fillStyle: 'black',
			action: 'fillText',
			font: `${cellSize * 0.2}px serif`,
			textAlign: 'center',
			textBaseline: 'middle',
			width: cellSize,
			height: cellSize,
		};

		debugInfo.push(
			{
				...baseTextDraw,
				text: `[${x}, ${y}]`,
				x: paddingCenter,
				y: paddingCenter + cellSize * -0.3,
			},
			{
				...baseTextDraw,
				text: cell.type,
				x: paddingCenter,
				y: paddingCenter + cellSize * 0.3,
			}
		);

		return debugInfo;
	}

	generateDrawInfoCell(x, y) {
		const cell = this.cells[x][y];
		const pxX = getPxFromX(x);
		const pxY = getPxFromY(y);

		const drawInfo = this.generateDrawCellTypeTemplate(cell).map((item) => ({
			...item,
			x: pxX + item.x,
			y: pxY + item.y,
		}));

		// 🐞 Debug extra
		if (DEBUG_MODE) {
			const debugDraws = this.generateDrawCellTypeDebug(x, y, cell).map(
				(item) => ({
					...item,
					x: pxX + item.x,
					y: pxY + item.y,
				})
			);
			drawInfo.push(...debugDraws);
		}

		return drawInfo;
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
