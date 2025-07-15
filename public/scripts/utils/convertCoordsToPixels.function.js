import { CELL_SIZE, MAP_SIZE } from '../core/Constants.js';
import { clamp } from './clamp.function.js';

function getCoordFromPx(px) {
	return Math.round(px / CELL_SIZE);
}

function getPxFromCoord(coord) {
	return coord * CELL_SIZE;
}
export function getXFromPX(px) {
	const coordX = getCoordFromPx(px);
	return clamp(coordX, 0, MAP_SIZE.width);
}

export function getYFromPX(px) {
	const coordY = getCoordFromPx(px);
	return clamp(coordY, 0, MAP_SIZE.height);
}

export function getPxFromX(gridX) {
	return getPxFromCoord(gridX);
}
export function getPxFromY(gridY) {
	return getPxFromCoord(gridY);
}
