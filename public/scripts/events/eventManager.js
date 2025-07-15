const MouseClickEnum = {
	LEFT: 0,
	MIDDLE: 1,
	RIGHT: 2,
};

class EventManager {
	constructor(gameCanvasHtml) {
		this.gameCanvasHtml = gameCanvasHtml;
		this.isMiddleButtonPressed = false;
		this.mouseLastPosition = null;
		document.addEventListener('mouseup', (e) => {
			this.stopTrackingMouse();
		});
	}

	stopTrackingMouse = () => {
		this.isMiddleButtonPressed = false;
		this.setMouseLastPosition(null);
	};

	setMouseLastPosition(mousePosition) {
		if (!mousePosition) {
			this.mouseLastPosition = null;
			return;
		}
		this.mouseLastPosition = {
			x: mousePosition.clientX,
			y: mousePosition.clientY,
		};
	}

	setupCanvasEvents() {
		this.gameCanvasHtml.setAttribute('tabindex', '0');
		this.gameCanvasHtml.addEventListener('click', () => {
			this.gameCanvasHtml.focus();
		});
	}

	setupCameraEvents(cameraInstance) {
		const keyToAction = {
			ArrowLeft: 'moveLeft',
			ArrowUp: 'moveUp',
			ArrowDown: 'moveDown',
			ArrowRight: 'moveRight',
		};

		// Numpad con NumLock desactivado (direcciones)
		const numpadDirectionalKeys = {
			End: 'moveLeftDown', // Numpad1
			ArrowDown: 'moveDown', // Numpad2
			PageDown: 'moveRightDown', // Numpad3
			ArrowLeft: 'moveLeft', // Numpad4
			Clear: null, // Numpad5
			ArrowRight: 'moveRight', // Numpad6
			Home: 'moveLeftUp', // Numpad7
			ArrowUp: 'moveUp', // Numpad8
			PageUp: 'moveRightUp', // Numpad9
		};

		const actionHandlers = {
			moveLeft: () =>
				cameraInstance.moveCameraPosition({ deltaX: -20, deltaY: 0 }),
			moveUp: () =>
				cameraInstance.moveCameraPosition({ deltaX: 0, deltaY: -20 }),
			moveDown: () =>
				cameraInstance.moveCameraPosition({ deltaX: 0, deltaY: 20 }),
			moveRight: () =>
				cameraInstance.moveCameraPosition({ deltaX: 20, deltaY: 0 }),
			moveLeftUp: () =>
				cameraInstance.moveCameraPosition({ deltaX: -20, deltaY: -20 }),
			moveRightUp: () =>
				cameraInstance.moveCameraPosition({ deltaX: 20, deltaY: -20 }),
			moveLeftDown: () =>
				cameraInstance.moveCameraPosition({ deltaX: -20, deltaY: 20 }),
			moveRightDown: () =>
				cameraInstance.moveCameraPosition({ deltaX: 20, deltaY: 20 }),
		};

		this.gameCanvasHtml.addEventListener('keydown', (e) => {
			let action = keyToAction[e.code];

			// Si es un numpad con NumLock apagado
			if (
				!action &&
				e.code.startsWith('Numpad') &&
				e.key in numpadDirectionalKeys
			) {
				action = numpadDirectionalKeys[e.key];
			}

			if (action && actionHandlers[action]) {
				actionHandlers[action]();
				e.preventDefault(); // prevenís scroll o zoom por defecto
			}
		});

		this.gameCanvasHtml.addEventListener('mousedown', (e) => {
			if (e.button === MouseClickEnum.MIDDLE) {
				this.isMiddleButtonPressed = true;
				this.setMouseLastPosition(e);
				e.preventDefault();
			}
		});

		this.gameCanvasHtml.addEventListener('mousemove', (e) => {
			if (!this.isMiddleButtonPressed || !this.mouseLastPosition) return;

			const deltaX = this.mouseLastPosition.x - e.clientX;
			const deltaY = this.mouseLastPosition.y - e.clientY;

			cameraInstance.moveCameraPosition({ deltaX, deltaY });
			this.setMouseLastPosition(e);
		});

		this.gameCanvasHtml.addEventListener('mouseup', (e) => {
			if (e.button === MouseClickEnum.MIDDLE) {
				this.stopTrackingMouse();
			}
		});
	}
}

export default new EventManager(GameCanvasHtml);
