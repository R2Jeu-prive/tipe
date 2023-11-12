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

//https://www.30secondsofcode.org/js/s/hsl-to-rgb/
function hslToRgb(h, s, l){
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
};

function toHex(num) {
    return  ("0"+(Number(num).toString(16))).slice(-2)
}
