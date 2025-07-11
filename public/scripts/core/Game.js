import { CELL_SIZE, DEBUG_MODE, TEAM_COLORS_ENUM } from './Constants.js';
import { Grid } from '../grid/Grid.js';
import { Character } from './../entities/Character.js';
import { Team } from './Team.js';

export class Game {
	constructor(canvas) {
		this.canvas = canvas;
	}

	start() {
		this.grid = new Grid(this.canvas.width, this.canvas.height, CELL_SIZE);
		this.teams = [
			new Team(this.grid, TEAM_COLORS_ENUM.BLUE, 4),
			new Team(this.grid, TEAM_COLORS_ENUM.RED, 4),
		];

		this.step();
	}

	generateFrame() {
		this.canvas.draw();
		this.grid.draw(this.canvas.ctx);
		this.teams.forEach((team) => team.draw(this.canvas.ctx));

		// Debug Mode Overlay
		if (DEBUG_MODE) {
			this.generateDebugInfo();
		}
	}

	step() {
		this.teams.forEach((team) => team.manageTeamActions());
		this.generateFrame();
		requestAnimationFrame(this.step.bind(this));
	}

	generateDebugInfo() {
		const info = this.teams.flatMap((team) => team.generateDebugInfo());

		this.canvas.drawDebugOverlay(info);
	}
}
