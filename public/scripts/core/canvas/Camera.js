import { clamp } from '../../utils/clamp.function.js';
import EventManager from '../../events/eventManager.js';

export class Camera {
	constructor(width, height, maxLimitX, maxLimitY) {
		this._width = width;
		this._height = height;
		this.maxLimitX = maxLimitX;
		this.maxLimitY = maxLimitY;
		this.positionX = 0;
		this.positionY = 0;
		this.zoom = 1;

		EventManager.setupCameraEvents(this);
	}
	get zoomFactor() {
		return 1 / this.zoom;
	}
	get width() {
		return this._width * this.zoomFactor;
	}
	get height() {
		return this._height * this.zoomFactor;
	}
	get viewportRight() {
		return this.positionX + this.width;
	}
	get viewportBottom() {
		return this.positionY + this.height;
	}
	get maxScrollX() {
		return this.maxLimitX - this.width;
	}
	get maxScrollY() {
		return this.maxLimitY - this.height;
	}

	toCameraRelativeX(pxX) {
		return this.applyZoom(pxX - this.positionX);
	}
	toCameraRelativeY(pxY) {
		return this.applyZoom(pxY - this.positionY);
	}
	applyZoom(size) {
		return size * this.zoom;
	}

	moveCameraPosition({ deltaX, deltaY }) {
		if (typeof deltaX === 'number') {
			const newPositionHorizontal = this.positionX + deltaX;
			this.positionX = clamp(newPositionHorizontal, 0, this.maxScrollX);
		}
		if (typeof deltaY === 'number') {
			const newPositionVertical = this.positionY + deltaY;
			this.positionY = clamp(newPositionVertical, 0, this.maxScrollY);
		}
	}
	changeCameraZoom(zoomAction) {
		const ZoomActionEnum = {
			in: 1,
			reset: 0,
			out: -1,
		};
		const minZoom = 0.75;
		const maxZoom = 4;

		switch (zoomAction) {
			case ZoomActionEnum.reset:
				this.zoom = 1;
				break;
			case ZoomActionEnum.in:
				this.zoom = clamp(this.zoom * 2, this.zoom, maxZoom);
				break;
			case ZoomActionEnum.out:
				this.zoom = clamp(this.zoom * 0.75, minZoom, this.zoom);
				break;
			default:
				break;
		}

		this.moveCameraPosition({ deltaX: 0, deltaY: 0 });
	}
}
