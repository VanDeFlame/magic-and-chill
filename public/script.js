const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Character {
	constructor(areaMaxWidth, areaMaxHeight, spriteSheetSrc) {
		this.spriteSheet = new Image();
		this.spriteSheet.src = spriteSheetSrc;

		this.spriteSheet.onload = () => {
			this.initCharacterSize(areaMaxWidth, areaMaxHeight);
		};

		this.frameWidth = 64; // Ancho del sprite
		this.frameHeight = 64; // Alto del sprite
		this.frameMax = 4; // Número de frames en la hoja de sprites
		this.frameIndex = 0; // Índice del frame actual
		this.frameDelay = 10; // Velocidad de cambio de frame
		this.frameTimer = 0; // Temporizador para el cambio de frame

		this.actions = {
			walkingDown: 0,
			walkingLeft: 1,
			walkingRight: 2,
			walkingUp: 3,
		}; // Acciones del personaje basadas en la fila del spritesheet
		this.currentAction = 'walkingDown'; // Acción actual del personaje

		this.speed = 50; // Velocidad de movimiento del personaje
		this.areaMaxWidth = areaMaxWidth; // Ancho máximo del área de movimiento
		this.areaMaxHeight = areaMaxHeight; // Ancho máximo del área de movimiento
	}

	initCharacterSize(areaMaxWidth, areaMaxHeight) {
		const scale = 2; // Escalamos los 64px a algo más grande (opcional)
		this.characterWidth = this.frameWidth * scale; // Ancho del personaje
		this.characterHeight = this.frameHeight * scale; // Alto del personaje
		this.characterX = areaMaxWidth / 2 - this.characterWidth / 2; // Posición inicial en X
		this.characterY = areaMaxHeight / 2 - this.characterHeight / 2; // Posición inicial en Y
	}

	updateFrame() {
		this.frameTimer++;
		if (this.frameTimer >= this.frameDelay) {
			this.frameIndex = (this.frameIndex + 1) % this.frameMax;
			this.frameTimer = 0;
		}
	}

	doSomething() {
		const random = Math.floor(Math.random() * 100);
		if (random < 5) this.move('up');
		else if (random < 10) this.move('down');
		else if (random < 15) this.move('left');
		else if (random < 20) this.move('right');

		this.updateFrame();
	}

	move(direction) {
		const speed = Math.floor(Math.random() * this.speed + 1);
		switch (direction) {
			case 'up':
				this.currentAction = 'walkingUp';
				this.characterY = Math.max(0, this.characterY - speed);
				break;
			case 'down':
				this.currentAction = 'walkingDown';
				this.characterY = Math.min(
					this.areaMaxHeight - this.characterHeight,
					this.characterY + speed
				);
				break;
			case 'left':
				this.currentAction = 'walkingLeft';
				this.characterX = Math.max(0, this.characterX - speed);
				break;
			case 'right':
				this.currentAction = 'walkingRight';
				this.characterX = Math.min(
					this.areaMaxWidth - this.characterWidth,
					this.characterX + speed
				);
				break;
		}
	}

	getCurrentSpriteInfo() {
		const frameX = this.frameIndex * this.frameWidth;
		const frameY = this.actions[this.currentAction] * this.frameHeight;

		return {
			spriteSheet: this.spriteSheet,
			spriteX: frameX,
			spriteY: frameY,
			spriteWidth: this.frameWidth,
			spriteHeight: this.frameHeight,
			characterX: this.characterX,
			characterY: this.characterY,
			characterWidth: this.characterWidth,
			characterHeight: this.characterHeight,
		};
	}
}
class Canvas {
	constructor(canvas, ctx) {
		this.canvas = canvas;
		this.ctx = ctx;
	}

	start() {
		const canvasWidth = window.innerWidth; // Ancho del canvas
		const canvasHeight = window.innerHeight; // Alto del canvas
		this.canvas.width = canvasWidth; // Ajustar el ancho del canvas al ancho de la ventana
		this.canvas.height = canvasHeight; // Ajustar la altura del canvas al alto de la ventana
		this.characters = [
			new Character(
				canvasWidth,
				canvasHeight,
				'assets/characters/spritesheet_1.png'
			),
		];

		this.frame(); // Iniciar el bucle de animación
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.characters.forEach((character) => {
			this.drawCharacter(character);
		});
		requestAnimationFrame(this.frame.bind(this)); // Animación continua (aunque esté estático por ahora)
	}

	drawCharacter(character) {
		this.ctx.drawImage(...Object.values(character.getCurrentSpriteInfo())); // Dibuja el personaje en el canvas
	}

	frame() {
		this.characters.forEach((character) => {
			character.doSomething(); // Llamar a la función de movimiento del personaje
		});
		this.draw(); // Llamar a la función de dibujo
	}
}

const canvasInstance = new Canvas(canvas, ctx);
canvasInstance.start();
