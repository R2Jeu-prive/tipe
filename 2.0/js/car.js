class Car{
    //RB18 https://www.motorsdb.com/fiche-technique/auto/49483/Red-Bull-Racing-RB18-2022.html
    //https://f1chronicle.com/how-much-horsepower-does-an-f1-car-have/#How-much-horsepower-do-F1-cars-have
    static g = 9.81
    static m = 795;
    static roadFricCoef = 1.5;
    static horsePower = 914;

    static maxAcceleration = 1.45*Car.g; //in m/s²
    static maxDecceleration = -4*Car.g; //in m/s²

    static MaxSpeed(curve){
        //return 1/(0.01+curve);
        return Math.sqrt(this.roadFricCoef*Car.g/curve); //in m/s
        //return pi / 2;//in m/s
    }

    static DebugShowMaxSpeed(){
        for(let i = 0; i < Track.intPoints.length; i++){
            let maxSpeed = this.MaxSpeed(Family.children[0].absCurves[i]);
            console.log(maxSpeed);
            Canvas.ctxFore.fillStyle = "#ffffff";
            Canvas.ctxFore.fillRect(i, 0.01*maxSpeed, 1, 1);
        }
    }
}