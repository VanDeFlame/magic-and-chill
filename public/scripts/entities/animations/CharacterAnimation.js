export class CharacterAnimation {
	constructor(spriteSheetSrc, frameWidth, frameHeight, frameMax, animationRow) {
		this.spriteSheet = new Image();
		this.spriteSheet.src = spriteSheetSrc;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.frameMax = frameMax;
		this.animationRow = animationRow;

		this.frameIndex = 0;
		this.frameTimer = 0;
		this.frameDelay = 10;
		this.currentAction = 'idle';
	}

	updateFrame() {
		this.frameTimer++;
		if (this.frameTimer >= this.frameDelay) {
			this.frameIndex = (this.frameIndex + 1) % this.frameMax;
			this.frameTimer = 0;
		}
	}

	setAction(action) {
		this.currentAction = action;
		this.frameIndex = 0; // Reiniciar el índice del fotograma cuando cambie la acción
	}

	getAnimationRow() {
		if (this.currentAction in this.animationRow) {
			return this.animationRow[this.currentAction];
		}
		return 0; // Fila por defecto si no se encuentra la acción
	}

	draw(ctx, x, y, width, height) {
		if (!this.spriteSheet.complete) return; // Esperar a que la hoja de sprites esté cargada

		ctx.drawImage(
			this.spriteSheet,
			this.frameIndex * this.frameWidth,
			this.getAnimationRow() * this.frameHeight,
			this.frameWidth,
			this.frameHeight,
			x,
			y,
			width,
			height
		);
	}
}
