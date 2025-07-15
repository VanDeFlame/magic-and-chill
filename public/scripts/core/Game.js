import { DEBUG_MODE } from './Constants.js';
import { Grid } from '../grid/Grid.js';
import { Character } from './../entities/Character.js';

export class Game {
	constructor(canvas) {
		this.canvas = canvas;
	}

	start() {
		this.grid = new Grid(this.canvas);
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
		this.canvas.draw({
			grid: [
				...this.grid.generateDrawInfo(),
				...this.characters.flatMap((character) => character.generateDrawInfo()),
			],
			hud: this.generateDebugInfo(),
		});
	}

	step() {
		this.characters.forEach((character) => character.doSomething());
		this.generateFrame();
		requestAnimationFrame(this.step.bind(this));
	}

	generateDebugInfo() {
		if (!DEBUG_MODE) return [];
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
