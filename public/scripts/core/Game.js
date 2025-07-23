import { DEBUG_MODE } from './Constants.js';
import { Grid } from '../grid/Grid.js';
import { Character } from './../entities/Character.js';
import EventManager from '../events/eventManager.js';

export class Game {
	constructor(canvas) {
		this.canvas = canvas;
		EventManager.setupCanvasEvents();
	}

	start() {
		this.grid = new Grid(this.canvas.camera);
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

		const infoToDraw = {
			positionHorizontal: 'right',
			positionVertical: 'top',
			fontSize: 10,
			color: 'black',
			background: 'rgba(255, 255, 255, 0.8)',
		};

		const charactersInfo = this.characters.map((character) => ({
			...infoToDraw,
			width: 225,
			texts: [
				`Grid: [${character.gridX}, ${character.gridY}] -> [${character.targetX}, ${character.targetY}]`,
				`X: ${Math.floor(character.characterX)}, Y: ${Math.floor(
					character.characterY
				)}`,
				`State: ${character.state} - Duration: ${character.stateDuration} ms`,
				`Animation: ${character.animation.currentAction}`,
				`Task Queue: ${character.taskQueue.length}`,
			],
		}));

		const gameInfo = [
			`Canvas Size: ${this.canvas.width}x${this.canvas.height}`,
			`Grid Size: ${this.grid.gridWidth}x${this.grid.gridHeight}`,
			`Characters #: ${this.characters.length}`,
		];

		return [
			{
				...infoToDraw,
				positionHorizontal: 'left',
				texts: gameInfo,
			},
			...charactersInfo,
			{
				...infoToDraw,
				positionVertical: 'middle',
				positionHorizontal: 'right',
				texts: gameInfo,
			},
		];
	}
}
