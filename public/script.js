const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Character {
	prevMovement = 0; // Variable para almacenar el movimiento anterior
	constructor(areaMaxWidth, areaMaxHeight, assets) {
		this.sprite = new Image();
		this.sprite.src = assets;
		this.speed = 15; // Velocidad de movimiento del personaje
		const aspectRatio = this.sprite.width / this.sprite.height;
		const characterWidth = areaMaxWidth / 8; // Ancho del personaje
		const characterHeight = characterWidth / aspectRatio; // Alto del personaje basado en el ancho y la relación de aspecto
		this.characterX = areaMaxWidth / 2 - characterWidth / 2; // Posición inicial en X
		this.characterY = areaMaxHeight / 2 - characterHeight / 2; // Posición inicial en Y
		this.characterWidth = characterWidth; // Ancho del personaje
		this.characterHeight = characterHeight; // Alto del personaje
		this.areaMaxWidth = areaMaxWidth; // Ancho máximo del área de movimiento
		this.areaMaxHeight = areaMaxHeight; // Ancho máximo del área de movimiento
	}

	doSomething() {
		let action = this.prevMovement; // Inicializar la acción con el movimiento anterior
		const randomNumber = Math.floor(Math.random() * 100); // Generar un número aleatorio entre 0 y 3

		if (randomNumber < 5) {
			action = randomNumber; // Si el número es menor que 5, usarlo como acción
		} else if (randomNumber < 25) {
			action = 0;
		} else {
			action = this.prevMovement;
		}
		this.prevMovement = action; // Actualizar el movimiento anterior
		switch (action) {
			case 0:
				break; // No hacer nada
			case 1:
				this.move('up'); // Mover hacia arriba
				break;
			case 2:
				this.move('down'); // Mover hacia abajo
				break;
			case 3:
				this.move('left'); // Mover hacia la izquierda
				break;
			case 4:
				this.move('right'); // Mover hacia la derecha
				break;
		}
	}

	moveUp(speed) {
		if (this.characterY > 0) {
			this.characterY -= speed;
		}
	}

	moveDown(speed) {
		if (this.characterY < this.areaMaxHeight - this.characterHeight) {
			this.characterY += speed;
		}
	}

	moveLeft(speed) {
		if (this.characterX > 0) {
			this.characterX -= speed;
		}
	}

	moveRight(speed) {
		if (this.characterX < this.areaMaxWidth - this.characterWidth) {
			this.characterX += speed;
		}
	}

	move(direction) {
		const speed = Math.floor(Math.random() * this.speed + 1); // Generar un número aleatorio entre 0 y la velocidad máxima
		switch (direction) {
			case 'up':
				this.moveUp(speed);
				break;
			case 'down':
				this.moveDown(speed);
				break;
			case 'left':
				this.moveLeft(speed);
				break;
			case 'right':
				this.moveRight(speed);
				break;
		}
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
				'assets/characters/character_1.webp'
			),
			new Character(
				canvasWidth,
				canvasHeight,
				'assets/characters/character_2.webp'
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
		this.ctx.drawImage(
			character.sprite,
			character.characterX,
			character.characterY,
			character.characterWidth,
			character.characterHeight
		); // Posición del personaje
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
