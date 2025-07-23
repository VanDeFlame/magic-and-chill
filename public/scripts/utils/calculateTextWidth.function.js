export function calculateTextWidth(
	text,
	fontSize,
	ctx,
	fontFamily = 'Arial',
	scaleFactor = 0.5
) {
	if (typeof text !== 'string' || text.length === 0) return 0;
	if (!fontSize || fontSize <= 0) return 0;

	if (ctx && typeof ctx.measureText === 'function') {
		ctx.font = `${fontSize}px ${fontFamily}`;
		return ctx.measureText(text).width;
	}

	return text.length * fontSize * scaleFactor;
}

export function calculateArrayTextWidth(
	texts,
	fontSize,
	ctx,
	fontFamily = 'Arial',
	scaleFactor = 0.5
) {
	if (!Array.isArray(texts) || texts.length === 0) return 0;

	return Math.max(
		...texts.map((text) =>
			calculateTextWidth(text, fontSize, ctx, fontFamily, scaleFactor)
		)
	);
}
