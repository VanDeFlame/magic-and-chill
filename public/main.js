import { Canvas } from './scripts/core/canvas/Canvas.js';
import { Game } from './scripts/core/Game.js';

GameCanvasHtml.width = window.innerWidth;
GameCanvasHtml.height = window.innerHeight;

const canvasInstance = new Canvas(GameCanvasHtml);
const game = new Game(canvasInstance);
game.start();
