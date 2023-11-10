let {Point} = require("./point");

function cubeRoot(x){
    var y = Math.pow(Math.abs(x), 1/3);
    return x < 0 ? -y : y;
}

function solveCubic(a, b, c, d) {
    if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
        a = b; b = c; c = d;
        if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
            a = b; b = c;
            if (Math.abs(a) < 1e-8) // Degenerate case
                return [];
            return [-b/a];
        }

        var D = b*b - 4*a*c;
        if (Math.abs(D) < 1e-8)
            return [-b/(2*a)];
        else if (D > 0)
            return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)];
        return [];
    }

    // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
    var p = (3*a*c - b*b)/(3*a*a);
    var q = (2*b*b*b - 9*a*b*c + 27*a*a*d)/(27*a*a*a);
    var roots;

    if (Math.abs(p) < 1e-8) { // p = 0 -> t^3 = -q -> t = -q^1/3
        roots = [cubeRoot(-q)];
    } else if (Math.abs(q) < 1e-8) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
        roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
    } else {
        var D = q*q/4 + p*p*p/27;
        if (Math.abs(D) < 1e-8) {       // D = 0 -> two roots
            roots = [-1.5*q/p, 3*q/p];
        } else if (D > 0) {             // Only one real root
            var u = cubeRoot(-q/2 - Math.sqrt(D));
            roots = [u - p/(3*u)];
        } else {                        // D < 0, three roots, but needs to use complex numbers/trigonometric solution
            var u = 2*Math.sqrt(-p/3);
            var t = Math.acos(3*q/p/u)/3;  // D < 0 implies p < 0 and acos argument in [-1..1]
            var k = 2*Math.PI/3;
            roots = [u*Math.cos(t), u*Math.cos(t-k), u*Math.cos(t-2*k)];
        }
    }

    // Convert back from depressed cubic
    for (var i = 0; i < roots.length; i++)
        roots[i] -= b/(3*a);

    return roots;
}

function mod(x,n){
    //return x % n in [0,n-1]
    return ((x % n) + n) % n;
}

/**
 * @param {Point} a 
 * @param {Point} b 
 * @param {Point} c 
 * @param {Number} pxToMetersRatio 
 */
function signedCurvatureBetween(a, b, c, pxToMetersRatio){
    //https://en.wikipedia.org/wiki/Menger_curvature#Definition
    //https://math.stackexchange.com/questions/2511452/how-do-i-calculate-the-signed-area-of-a-triangle-in-3d-space
    let ab = a.DistTo(b)*pxToMetersRatio;
    let bc = b.DistTo(c)*pxToMetersRatio;
    let ca = c.DistTo(a)*pxToMetersRatio;

    let signedTiangleArea = 0.5*((b.x*c.y-c.x*b.y) - (a.x*c.y-c.x*a.y) + (a.x*b.y-b.x*a.y))*pxToMetersRatio*pxToMetersRatio;
    return 4*signedTiangleArea/(ab*bc*ca);
}

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

module.exports = {solveCubic, mod, cubeRoot, signedCurvatureBetween, hexMix};