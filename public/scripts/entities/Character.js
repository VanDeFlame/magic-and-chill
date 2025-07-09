import { CharacterAnimation } from './animations/CharacterAnimation.js';
import { CHARACTER_SPRITE, CHARACTER_SPRITE_2 } from './../core/Constants.js';

export class Character {
	constructor(grid) {
		this.grid = grid;
		const { x: validSpawnX, y: validSpawnY } = grid.getRandomValidCell();
		this.moveToGridCell(validSpawnX, validSpawnY, true);
		this.characterX = this.grid.getPxFromX(this.gridX);
		this.characterY = this.grid.getPxFromY(this.gridY);
		this.targetX = this.characterX;
		this.targetY = this.characterY;

		this.speed = 2;

		// Configurar la animación
		this.animation = new CharacterAnimation(
			Math.random() >= 0.5 ? CHARACTER_SPRITE : CHARACTER_SPRITE_2,
			128, // frameWidth
			128, // frameHeight
			4, // frameMax
			{
				idle_down: 0,
				idle_left: 1,
				idle_right: 2,
				idle_up: 3,
				walking_down: 4,
				walking_left: 5,
				walking_right: 6,
				walking_up: 7,
				dancing: 8,
			}
		);

		this.state = 'idle';
		this.stateTimer = 0;
		this.stateDuration = this.getRandomDuration();
		this.direction = 'down';

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
		if (Math.random() < 0.1) {
			this.taskQueue.push({
				action: 'dancing',
				duration: this.getRandomDuration(), // Aleatorio
			});
		} else {
			this.generateRandomMovementTask();
		}

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
		if (!this.taskQueue.length) return;
		const currentTask = this.taskQueue.shift();

		switch (currentTask.action) {
			// Si la tarea es 'idle', hacer nada por el tiempo dado
			case 'idle': {
				this.state = 'idle';
				this.stateDuration = currentTask.duration;
				this.stateTimer = 0;
				this.animation.setAction(`idle_${this.direction}`);
				break;
			}
			case 'dancing': {
				this.state = 'dancing';
				this.stateDuration = currentTask.duration;
				this.stateTimer = 0;
				this.animation.setAction(`dancing`);
				break;
			}
			// Si la tarea es 'move', mover al personaje en la dirección indicada
			case 'move': {
				if (!this.grid.isValidCell(currentTask.targetX, currentTask.targetY)) {
					this.taskQueue.unshift(
						{
							action: 'idle',
							duration: this.getRandomDuration(), // Aleatorio
						},
						currentTask
					); // Reinsertar la tarea de movimiento
					break;
				}
				this.state = 'moving';
				this.stateDuration = currentTask.duration;
				this.stateTimer = 0;
				this.direction = currentTask.direction;
				this.targetX = currentTask.targetX;
				this.targetY = currentTask.targetY;
				this.animation.setAction(`walking_${this.direction}`);
				this.grid.occupyCell(this.targetX, this.targetY); // Ocupamos la celda de destino
				break;
			}
		}
	}

	moveToGridCell(x, y, occupy = false) {
		this.gridX = x;
		this.gridY = y;
		if (occupy) {
			this.grid.occupyCell(x, y); // Ocupamos la celda de destino
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
			this.grid.vacateCell(this.gridX, this.gridY); // Liberamos la celda anterior
			newX = targetPxX;
			newY = targetPxY;
			this.moveToGridCell(this.targetX, this.targetY); // Actualizamos la posición en el grid
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
