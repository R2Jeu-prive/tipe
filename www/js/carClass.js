class Car{
    constructor(){
        //RB18 https://www.motorsdb.com/fiche-technique/auto/49483/Red-Bull-Racing-RB18-2022.html
        //https://f1chronicle.com/how-much-horsepower-does-an-f1-car-have/#How-much-horsepower-do-F1-cars-have
        this.g = 9.81
        this.m = 795;
        this.roadFricCoef = 2;
        this.horsePower = 914;

        /*this.maxAcceleration = Infinity
        this.maxDecceleration = -Infinity*/
        this.maxAcceleration = 2*9.81; //in m/s²
        this.maxDecceleration = -2*9.81; //in m/s²
    };

    MaxSpeed(curve){
        //return 1/(0.01+curve);
        return Math.sqrt(this.roadFricCoef*9.81/curve); //in m/s
        //return pi / 2;//in m/s
    }
}