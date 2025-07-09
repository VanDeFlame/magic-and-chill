import { CELL_SIZE, DEBUG_MODE } from './Constants.js';
import { Grid } from '../grid/Grid.js';
import { Character } from './../entities/Character.js';

export class Game {
	constructor(canvas) {
		this.canvas = canvas;
	}

	start() {
		this.grid = new Grid(this.canvas.width, this.canvas.height, CELL_SIZE);
		this.characters = [
			new Character(this.grid),
			new Character(this.grid),
			new Character(this.grid),
			new Character(this.grid),
			new Character(this.grid),
			new Character(this.grid),
			new Character(this.grid),
			new Character(this.grid),
		];

		this.step();
	}

	generateFrame() {
		this.canvas.draw();
		this.grid.draw(this.canvas.ctx);
		this.characters.forEach((character) => character.draw(this.canvas.ctx));

		// Debug Mode Overlay
		if (DEBUG_MODE) {
			this.generateDebugInfo();
		}
	}

	step() {
		this.characters.forEach((character) => character.doSomething());
		this.generateFrame();
		requestAnimationFrame(this.step.bind(this));
	}

	generateDebugInfo() {
		const info = this.characters.flatMap((character) => [
			`Grid: [${character.gridX}, ${character.gridY}] -> [${character.targetX}, ${character.targetY}]`,
			`X: ${Math.floor(character.characterX)}, Y: ${Math.floor(
				character.characterY
			)}`,
			`State: ${character.state} - Duration: ${character.stateDuration} ms`,
			`Animation: ${character.animation.currentAction}`,
			`Task Queue: ${character.taskQueue.length}`,
			'',
		]);

		info.unshift(`Characters #: ${this.characters.length}`, '');

		this.canvas.drawDebugOverlay(info);
	}
}
