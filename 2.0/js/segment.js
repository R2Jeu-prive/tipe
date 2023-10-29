class Segment{

    /**
    @param latExt {Point} extTrackPoint
    @param latInt {Point} intTrackPoint
    @param b1 {Point} @param b2 {Point}
    @returns lateral value on lateral latExt-latInt intersected with segment b1-b2 
    */
    static Intersection(latExt, latInt, b1, b2) {
        //algo from https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
        if (latExt.x - latInt.x == b1.x - b2.x && latExt.y - latInt.y == b1.y - b2.y) {
            console.error("trying to calc intersection for two parallel segments");
            return null;
        }
        let a = latInt.Minus(latExt);
        let b = b2.Minus(b1);
        let t = b1.Minus(latExt).Cross(b) / a.Cross(b);
        let u = b1.Minus(latExt).Cross(a) / a.Cross(b);
        if (u >= 0 && u <= 1 && t >= 0 && t <= 1) {
            return t;
        }
        return null;
    }

    /**
     * @param {Point} zeroPoint point at lateral 0
     * @param {Point} onePoint point at lateral 1
     * @param {Number} lateral lateral requested between 0 and 1
     * @returns point at given lateral
     */
    static CalcPointAtLateral(zeroPoint, onePoint, lateral){
        return onePoint.Scale(lateral).Plus(zeroPoint.Scale(1-lateral));
    }
}