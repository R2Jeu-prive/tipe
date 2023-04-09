pi = Math.PI;
ds = pi / 64;

function rand() {
    return Math.random();
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
