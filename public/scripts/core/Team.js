import { Character } from '../entities/Character.js';

export class Team {
	constructor(grid, color, initialMembersQuantity) {
		this.color = color;
		this.grid = grid;
		this._members = new Map();

		this.addNumberOfMembers(initialMembersQuantity);
	}

	addMage() {
		const id = this.membersQuantity;
		this._members.set(id, new Character(this.grid, this));
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
			`Characters #: ${this.membersQuantity}`,
		];

		this._members.forEach((member, i) =>
			info.push(`== character ${i} ==`, ...member.generateDebugInfo())
		);
		return info;
	}
}
