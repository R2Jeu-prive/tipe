//https://codepen.io/chambaz/pen/EyNeNw
function hexMix(colorFrom, colorTo, ratio) {
	const hex = function(x) {
		x = x.toString(16);
		return (x.length == 1) ? '0' + x : x;
	};

	let r = Math.ceil(parseInt(colorTo.substring(0, 2), 16) * ratio + parseInt(colorFrom.substring(0, 2), 16) * (1 - ratio)),
		g = Math.ceil(parseInt(colorTo.substring(2, 4), 16) * ratio + parseInt(colorFrom.substring(2, 4), 16) * (1 - ratio)),
		b = Math.ceil(parseInt(colorTo.substring(4, 6), 16) * ratio + parseInt(colorFrom.substring(4, 6), 16) * (1 - ratio));

	return hex(r) + hex(g) + hex(b);
}