import { Canvas } from './scripts/core/canvas/Canvas.js';
import { Game } from './scripts/core/Game.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const canvasInstance = new Canvas(canvas, ctx);
const game = new Game(canvasInstance);
game.start();
