import { CELL_SIZE, MAP_SIZE } from '../core/Constants.js';

function getCoordFromPx(px) {
	return Math.round(px / CELL_SIZE);
}

function getPxFromCoord(coord) {
	return coord * CELL_SIZE;
}
export function getXFromPX(px) {
	const coordX = getCoordFromPx(px);
	if (coordX >= MAP_SIZE.width) {
		return MAP_SIZE.width;
	}

	if (coordX <= 0) {
		return 0;
	}

	return coordX;
}

export function getYFromPX(px) {
	const coordY = getCoordFromPx(px);
	if (coordY >= MAP_SIZE.height) {
		return MAP_SIZE.height;
	}

	if (coordY <= 0) {
		return 0;
	}

	return coordY;
}

export function getPxFromX(gridX) {
	return getPxFromCoord(gridX);
}
export function getPxFromY(gridY) {
	return getPxFromCoord(gridY);
}
