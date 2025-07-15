import { Canvas } from './scripts/core/canvas/Canvas.js';
import { Game } from './scripts/core/Game.js';

const canvas = document.getElementById('canvas');

const canvasInstance = new Canvas(canvas);
const game = new Game(canvasInstance);
game.start();
