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

class CharacterAnimation {
	constructor(spriteSheetSrc, frameWidth, frameHeight, frameMax, animationRow) {
		this.spriteSheet = new Image();
		this.spriteSheet.src = spriteSheetSrc;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.frameMax = frameMax;
		this.animationRow = animationRow;

		this.frameIndex = 0;
		this.frameTimer = 0;
		this.frameDelay = 10;
		this.currentAction = 'idle';
	}

	updateFrame() {
		this.frameTimer++;
		if (this.frameTimer >= this.frameDelay) {
			this.frameIndex = (this.frameIndex + 1) % this.frameMax;
			this.frameTimer = 0;
		}
	}

	setAction(action) {
		this.currentAction = action;
		this.frameIndex = 0; // Reiniciar el índice del fotograma cuando cambie la acción
	}

	getAnimationRow() {
		if (this.currentAction in this.animationRow) {
			return this.animationRow[this.currentAction];
		}
		return 0; // Fila por defecto si no se encuentra la acción
	}

	draw(ctx, x, y, width, height) {
		if (!this.spriteSheet.complete) return; // Esperar a que la hoja de sprites esté cargada

		ctx.drawImage(
			this.spriteSheet,
			this.frameIndex * this.frameWidth,
			this.getAnimationRow() * this.frameHeight,
			this.frameWidth,
			this.frameHeight,
			x,
			y,
			width,
			height
		);
	}
}

class Character {
	constructor(grid) {
		this.grid = grid;
		this.gridX = Math.floor(grid.gridWidth / 2);
		this.gridY = Math.floor(grid.gridHeight / 2);
		this.characterX = this.grid.getPxFromX(this.gridX);
		this.characterY = this.grid.getPxFromY(this.gridY);
		this.targetX = this.characterX;
		this.targetY = this.characterY;

		this.speed = 2;

		// Configurar la animación
		this.animation = new CharacterAnimation(
			CHARACTER_SPRITE,
			64, // frameWidth
			64, // frameHeight
			4, // frameMax
			{
				walking_down: 0,
				walking_left: 1,
				walking_right: 2,
				walking_up: 3,
			}
		);

		this.state = 'idle';
		this.stateTimer = 0;
		this.stateDuration = this.getRandomDuration();
		this.direction = null;

		// Cola de tareas
		this.taskQueue = [];
	}

	getRandomDuration() {
		return Math.floor(Math.random() * 120) + 60; // Genera una duración entre 60 y 180 ms
	}

	updateFrame() {
		this.animation.updateFrame();
	}

	// Generar tareas aleatorias para el personaje
	generateRandomTasks() {
		// Tarea de 'idle' corto
		this.taskQueue.push({
			action: 'idle',
			duration: this.getRandomDuration(), // Aleatorio
		});

		// Tarea de 'move' a una celda aleatoria
		this.generateRandomMovementTask();

		// Otro 'idle' corto después de moverse
		this.taskQueue.push({
			action: 'idle',
			duration: this.getRandomDuration(),
		});
	}

	// Función para obtener las casillas válidas adyacentes
	getValidAdjacentCells() {
		const validCells = [];

		// Direcciones posibles (arriba, abajo, izquierda, derecha)
		const directions = [
			{ dx: 0, dy: -1, direction: 'up' }, // Arriba
			{ dx: 0, dy: 1, direction: 'down' }, // Abajo
			{ dx: -1, dy: 0, direction: 'left' }, // Izquierda
			{ dx: 1, dy: 0, direction: 'right' }, // Derecha
		];

		// Revisamos cada dirección
		for (const { dx, dy, direction } of directions) {
			const newX = this.gridX + dx;
			const newY = this.gridY + dy;

			// Si la casilla es válida, la añadimos a la lista
			if (this.grid.isValidCell(newX, newY)) {
				validCells.push({
					targetX: newX,
					targetY: newY,
					direction: direction,
				});
			}
		}

		return validCells;
	}

	// Generar tareas para moverse hasta una casilla válida aleatoria
	generateRandomMovementTask() {
		// Obtenemos las casillas válidas adyacentes
		const validCells = this.getValidAdjacentCells();

		// Si hay casillas válidas, seleccionamos una aleatoria
		if (validCells.length > 0) {
			const randomCell =
				validCells[Math.floor(Math.random() * validCells.length)];

			// Generamos tareas de movimiento hacia la casilla seleccionada
			this.taskQueue.push(
				...this.generateMovementTasks(randomCell.targetX, randomCell.targetY)
			);
		}
	}
	// Generar tareas para moverse hasta un destino
	generateMovementTasks(targetX, targetY) {
		const tasks = [];

		// Mover horizontalmente (si es necesario)
		if (this.gridX !== targetX) {
			const directionX = targetX > this.gridX ? 'right' : 'left';
			tasks.push({
				action: 'move',
				direction: directionX,
				targetX: targetX,
				targetY: this.gridY,
			});
		}

		// Mover verticalmente (si es necesario)
		if (this.gridY !== targetY) {
			const directionY = targetY > this.gridY ? 'down' : 'up';
			tasks.push({
				action: 'move',
				direction: directionY,
				targetX: this.gridX,
				targetY: targetY,
			});
		}

		return tasks;
	}

	// Función que procesa la cola de tareas
	processTaskQueue() {
		if (this.taskQueue.length > 0) {
			const currentTask = this.taskQueue.shift();

			// Si la tarea es 'idle', hacer nada por el tiempo dado
			if (currentTask.action === 'idle') {
				this.state = 'idle';
				this.stateDuration = currentTask.duration;
				this.stateTimer = 0;
			}

			// Si la tarea es 'move', mover al personaje en la dirección indicada
			if (currentTask.action === 'move') {
				this.state = 'moving';
				this.stateDuration = currentTask.duration;
				this.stateTimer = 0;
				this.direction = currentTask.direction;
				this.targetX = currentTask.targetX;
				this.targetY = currentTask.targetY;
				this.animation.setAction(`walking_${this.direction}`);
			}
		}
	}

	doSomething() {
		this.stateTimer++;

		// Generar nuevas tareas cuando no haya tareas pendientes
		if (this.state === 'idle' && this.taskQueue.length === 0) {
			this.generateRandomTasks();
		}

		// Procesar la cola de tareas
		if (this.stateDuration - this.stateTimer <= 0) {
			this.processTaskQueue();
		}

		// Ejecutar la acción según el estado
		if (this.state === 'moving') {
			this.tryMoveToTarget();
		}

		this.updateFrame();
	}

	// Función para mover al personaje hacia su destino
	tryMoveToTarget() {
		const moveSpeed = this.speed; // Controlar la velocidad de movimiento en píxeles
		let newX = this.characterX;
		let newY = this.characterY;

		// Calcular la posición objetivo en píxeles
		const targetPxX = this.grid.getPxFromX(this.targetX);
		const targetPxY = this.grid.getPxFromY(this.targetY);

		// Mover en el eje X
		if (this.characterX !== targetPxX) {
			const deltaX = targetPxX - this.characterX;
			const moveDeltaX =
				Math.sign(deltaX) * Math.min(Math.abs(deltaX), moveSpeed); // Mueve en pasos pequeños
			newX = this.characterX + moveDeltaX;
		}

		// Mover en el eje Y
		if (this.characterY !== targetPxY) {
			const deltaY = targetPxY - this.characterY;
			const moveDeltaY =
				Math.sign(deltaY) * Math.min(Math.abs(deltaY), moveSpeed); // Mueve en pasos pequeños
			newY = this.characterY + moveDeltaY;
		}

		// Si hemos llegado a la casilla de destino, actualizamos el estado
		if (Math.abs(newX - targetPxX) < 0.1 && Math.abs(newY - targetPxY) < 0.1) {
			newX = targetPxX;
			newY = targetPxY;
			this.gridX = this.targetX; // Actualizamos la posición en el grid
			this.gridY = this.targetY;
			this.state = 'idle'; // El personaje ha llegado a su destino
			this.stateDuration = 0;
		}

		// Actualizamos las posiciones en píxeles
		this.characterX = newX;
		this.characterY = newY;
	}

	draw(ctx) {
		if (!this.animation) return;

		const characterWidth = this.grid.cellSize;
		const characterHeight = this.grid.cellSize;

		this.animation.draw(
			ctx,
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
		this.characters = [new Character(this.grid)];

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
