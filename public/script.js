const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 64; // Tamaño de cada celda en píxeles
const CHARACTER_SPRITE = 'assets/characters/spritesheet_1.png'; // Ruta de la hoja de sprites del personaje

class Grid {
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
				const cx = this.toCanvasX(x);
				const cy = this.toCanvasY(y);

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
			}
		}
	}

	toCanvasX(gridX) {
		return gridX * this.cellSize + this.gridHorizontalPadding;
	}
	toCanvasY(gridY) {
		return gridY * this.cellSize + this.gridVerticalPadding;
	}

	isValidCell(x, y) {
		return (
			x >= 0 &&
			y >= 0 &&
			x < this.gridWidth &&
			y < this.gridHeight &&
			this.cells[x][y].walkable &&
			!this.cells[x][y].isOccupied
		);
	}

	occupyCell(x, y) {
		if (this.isValidCell(x, y)) {
			this.cells[x][y].isOccupied = true;
		}
	}

	vacateCell(x, y) {
		if (x >= 0 && y >= 0 && x < this.gridWidth && y < this.gridHeight) {
			this.cells[x][y].isOccupied = false;
		}
	}
}

class Terrain {
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
		for (let x = 0; x < this.gridWidth; x++) {
			cells[x] = [];
			for (let y = 0; y < this.gridHeight; y++) {
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
					nx < this.gridWidth &&
					ny < this.gridHeight &&
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

		for (let x = 0; x < this.gridWidth; x++) {
			for (let y = 0; y < this.gridHeight; y++) {
				if (this.cells[x][y].type !== 'grass') continue;

				for (const [dx, dy] of directions) {
					const nx = x + dx;
					const ny = y + dy;
					if (
						nx >= 0 &&
						ny >= 0 &&
						nx < this.gridWidth &&
						ny < this.gridHeight &&
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
		for (let x = 0; x < this.gridWidth; x++) {
			for (let y = 0; y < this.gridHeight; y++) {
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

class Character {
	constructor(grid, spriteSheetSrc) {
		this.grid = grid;

		// Celda inicial
		this.gridX = Math.floor(grid.gridWidth / 2);
		this.gridY = Math.floor(grid.gridHeight / 2);

		this.spriteSheet = new Image();
		this.spriteSheet.src = spriteSheetSrc;
		this.spriteSheet.onload = () => {
			this.characterX = this.grid.toCanvasX(this.gridX);
			this.characterY = this.grid.toCanvasY(this.gridY);
			this.targetX = this.characterX;
			this.targetY = this.characterY;
		};

		// Tamaño de sprites
		this.frameWidth = 64;
		this.frameHeight = 64;
		this.frameMax = 4;
		this.frameIndex = 0;
		this.frameDelay = 10;
		this.frameTimer = 0;

		this.speed = 4; // px por frame
		this.moveCooldown = 4000;
		this.lastMoveTime = 0;

		this.actions = {
			walkingDown: 0,
			walkingLeft: 1,
			walkingRight: 2,
			walkingUp: 3,
		};
		this.currentAction = 'walkingDown';

		this.state = 'idle';
		this.stateTimer = 0;
		this.stateDuration = this.getRandomDuration();
		this.direction = null;
	}

	getRandomDuration() {
		return Math.floor(Math.random() * 120) + 60;
	}

	updateFrame() {
		this.frameTimer++;
		if (this.frameTimer >= this.frameDelay) {
			this.frameIndex = (this.frameIndex + 1) % this.frameMax;
			this.frameTimer = 0;
		}
	}

	doSomething() {
		const now = Date.now();
		this.stateTimer++;

		if (
			this.state !== 'moving' &&
			this.stateTimer >= this.stateDuration &&
			now - this.lastMoveTime >= this.moveCooldown
		) {
			this.stateTimer = 0;
			this.stateDuration = this.getRandomDuration();
			this.lastMoveTime = now;

			if (this.state === 'idle') {
				this.state = 'moving';
				const directions = ['up', 'down', 'left', 'right'];
				this.direction =
					directions[Math.floor(Math.random() * directions.length)];
			} else {
				this.state = 'idle';
				this.direction = null;
			}
		}

		if (this.state === 'moving' && this.direction) {
			this.tryStartMove(this.direction);
		}

		this.continueMoving();
		this.updateFrame();
	}

	tryStartMove(direction) {
		let newX = this.gridX;
		let newY = this.gridY;

		switch (direction) {
			case 'up':
				newY--;
				this.currentAction = 'walkingUp';
				break;
			case 'down':
				newY++;
				this.currentAction = 'walkingDown';
				break;
			case 'left':
				newX--;
				this.currentAction = 'walkingLeft';
				break;
			case 'right':
				newX++;
				this.currentAction = 'walkingRight';
				break;
		}

		if (this.grid.isValidCell(newX, newY)) {
			this.grid.vacateCell(this.gridX, this.gridY);
			this.grid.occupyCell(newX, newY);

			this.gridX = newX;
			this.gridY = newY;
			this.targetX = this.grid.toCanvasX(newX);
			this.targetY = this.grid.toCanvasY(newY);
			this.state = 'moving';
		}
	}

	continueMoving() {
		const dx = this.targetX - this.characterX;
		const dy = this.targetY - this.characterY;

		if (Math.abs(dx) <= this.speed && Math.abs(dy) <= this.speed) {
			this.characterX = this.targetX;
			this.characterY = this.targetY;
			this.state = 'idle';
			return;
		}

		const angle = Math.atan2(dy, dx);
		this.characterX += Math.cos(angle) * this.speed;
		this.characterY += Math.sin(angle) * this.speed;
	}

	draw(ctx) {
		//const scale = 2;
		const characterWidth = this.grid.cellSize; //this.frameWidth * scale;
		const characterHeight = this.grid.cellSize; //this.frameHeight * scale;

		ctx.drawImage(
			this.spriteSheet,
			this.frameIndex * this.frameWidth,
			this.actions[this.currentAction] * this.frameHeight,
			this.frameWidth,
			this.frameHeight,
			this.characterX,
			this.characterY,
			characterWidth,
			characterHeight
		);
	}
}

class Canvas {
	constructor(canvas, ctx) {
		this.canvas = canvas;
		this.ctx = ctx;
	}

	start() {
		const canvasWidth = window.innerWidth;
		const canvasHeight = window.innerHeight;
		this.canvas.width = canvasWidth;
		this.canvas.height = canvasHeight;

		this.grid = new Grid(canvasWidth, canvasHeight, CELL_SIZE);
		this.characters = [new Character(this.grid, CHARACTER_SPRITE)];

		this.frame();
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.grid.draw(this.ctx);
		this.characters.forEach((character) => character.draw(this.ctx));
		requestAnimationFrame(this.frame.bind(this));
	}

	frame() {
		this.characters.forEach((character) => character.doSomething());
		this.draw();
	}
}

const canvasInstance = new Canvas(canvas, ctx);
canvasInstance.start();
