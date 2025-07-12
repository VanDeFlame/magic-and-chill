import { Character } from '../entities/Character.js';

export class Team {
	constructor(grid, color, initialMembersQuantity) {
		this.color = color;
		this.grid = grid;
		this._members = new Map();
		this.points = 0;

		this.addNumberOfMembers(initialMembersQuantity);
	}

	addMage() {
		const id = this.membersQuantity;
		this._members.set(id, new Character(this.grid, this));
	}

	addPoints() {
		this.points++;

		if (this.points % 20 === 0) {
			this.addMage();
		}
	}

	get members() {
		return new Array(this._members.values());
	}

	get membersQuantity() {
		return this._members.size;
	}

	addNumberOfMembers(quantity) {
		for (let i = 0; i < quantity; i++) {
			this.addMage();
		}
	}

	manageTeamActions() {
		this._members.forEach((member) => member.doSomething());
	}

	draw(ctx) {
		this._members.forEach((character) => character.draw(ctx));
	}

	generateDebugInfo() {
		const info = [
			`<= TEAM ${this.color} =>`,
			`Points #: ${this.points}`,
			`Characters #: ${this.membersQuantity}`,
		];
		info.push('');

		this._members.forEach((member, i) =>
			info.push(`== character ${i} ==`, ...member.generateDebugInfo())
		);
		info.push('', '');
		return info;
	}
}
