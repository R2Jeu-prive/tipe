class Car{
    //RB18 https://www.motorsdb.com/fiche-technique/auto/49483/Red-Bull-Racing-RB18-2022.html
    //https://f1chronicle.com/how-much-horsepower-does-an-f1-car-have/#How-much-horsepower-do-F1-cars-have
    static g = 9.81
    static m = 795;
    static roadFricCoef = 2;
    static horsePower = 914;

    static maxAcceleration = 3*9.81; //in m/s²
    static maxDecceleration = -4*9.81; //in m/s²

    static MaxSpeed(curve){
        //return 1/(0.01+curve);
        return Math.sqrt(this.roadFricCoef*9.81/curve); //in m/s
        //return pi / 2;//in m/s
    }
}