export function calculateTextWidth({
	text,
	fontSize,
	ctx,
	fontFamily = 'Arial',
	scaleFactor = 0.5,
	cache,
}) {
	if (typeof text !== 'string' || text.length === 0) return 0;
	if (!fontSize || fontSize <= 0) return 0;

	const key = `${fontSize}px|${fontFamily}|${text}`;
	if (cache?.has(key)) return cache.get(key);

	let width;
	if (ctx && typeof ctx.measureText === 'function') {
		ctx.font = `${fontSize}px ${fontFamily}`;
		width = ctx.measureText(text).width;
	} else {
		width = text.length * fontSize * scaleFactor;
	}

	cache?.set?.(key, width);
	return width;
}

export function calculateArrayTextWidth({
	texts,
	fontSize,
	ctx,
	fontFamily = 'Arial',
	scaleFactor = 0.5,
	cache,
}) {
	if (!Array.isArray(texts) || texts.length === 0) return 0;

	return Math.max(
		...texts.map((text) =>
			calculateTextWidth({
				text,
				fontSize,
				ctx,
				fontFamily,
				scaleFactor,
				cache,
			})
		)
	);
}
