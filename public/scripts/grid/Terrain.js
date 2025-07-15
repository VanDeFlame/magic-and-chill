export class Terrain {
	constructor(gridWidth, gridHeight) {
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.cells = this.createEmptyTerrain();
		this.generateWaterLakes(20);
		this.generateShore();
		this.generateRocks(5);
		this.decorateCells();
	}

	createEmptyTerrain() {
		const cells = [];
		for (let x = 0; x <= this.gridWidth; x++) {
			cells[x] = [];
			for (let y = 0; y <= this.gridHeight; y++) {
				cells[x][y] = {
					type: 'grass',
					walkable: true,
					isOccupied: false,
				};
			}
		}
		return cells;
	}

	generateWaterLakes(maxWaterTiles) {
		const directions = [
			[0, 1], // Abajo
			[1, 0], // Derecha
			[0, -1], // Arriba
			[-1, 0], // Izquierda
		];

		let waterTiles = 0; // Contador de celdas de agua
		let frontier = []; // Celdas que se pueden expandir

		const startX = Math.floor(Math.random() * this.gridWidth);
		const startY = Math.floor(Math.random() * this.gridHeight);
		this.cells[startX][startY].type = 'water';
		this.cells[startX][startY].walkable = false;
		frontier.push([startX, startY]);
		waterTiles++;

		while (frontier.length > 0 && waterTiles < maxWaterTiles) {
			const [x, y] = frontier.shift();

			for (const [dx, dy] of directions) {
				const nx = x + dx;
				const ny = y + dy;

				if (
					nx >= 0 &&
					ny >= 0 &&
					nx <= this.gridWidth &&
					ny <= this.gridHeight &&
					this.cells[nx][ny].type === 'grass'
				) {
					if (Math.random() >= 0.6) continue;

					this.cells[nx][ny].type = 'water';
					this.cells[nx][ny].walkable = false;
					frontier.push([nx, ny]);
					waterTiles++;
					if (waterTiles >= maxWaterTiles) break;
				}
			}
		}
	}

	generateShore() {
		const directions = [
			[0, 1], // Abajo
			[1, 0], // Derecha
			[0, -1], // Arriba
			[-1, 0], // Izquierda
			[-1, -1], // Arriba izquierda
			[1, -1], // Arriba derecha
			[-1, 1], // Abajo izquierda
			[1, 1], // Abajo derecha
		];

		for (let x = 0; x <= this.gridWidth; x++) {
			for (let y = 0; y <= this.gridHeight; y++) {
				if (this.cells[x][y].type !== 'grass') continue;

				for (const [dx, dy] of directions) {
					const nx = x + dx;
					const ny = y + dy;
					if (
						nx >= 0 &&
						ny >= 0 &&
						nx <= this.gridWidth &&
						ny <= this.gridHeight &&
						this.cells[nx][ny].type === 'water'
					) {
						this.cells[x][y].type = 'shore';
						break;
					}
				}
			}
		}
	}

	generateRocks(maxRocks) {
		let attempts = 0;
		while (attempts < maxRocks) {
			attempts++;
			const x = Math.floor(Math.random() * this.gridWidth);
			const y = Math.floor(Math.random() * this.gridHeight);

			if (this.cells[x][y].type === 'grass') {
				this.cells[x][y].type = 'rock';
			}
		}
	}

	decorateCells() {
		for (let x = 0; x <= this.gridWidth; x++) {
			for (let y = 0; y <= this.gridHeight; y++) {
				const cell = this.cells[x][y];
				switch (cell.type) {
					case 'grass':
						cell.color = '#6abe30';
						cell.emoji = '🌿';
						cell.walkable = true;
						break;
					case 'water':
						cell.color = '#3b83bd';
						cell.emoji = '🌊';
						cell.walkable = false;
						break;
					case 'shore':
						cell.color = '#b9d97f';
						cell.emoji = '🏖️';
						cell.walkable = true;
						break;
					case 'rock':
						cell.color = '#666688';
						cell.emoji = '🪨';
						cell.walkable = false;
						break;
					default:
						cell.color = '#ffffff';
						cell.emoji = '';
						cell.walkable = true;
				}
			}
		}
	}
}
