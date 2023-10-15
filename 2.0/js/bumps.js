class BumpFunction{
    constructor(_normalisedFunction){
        //_normalisedFunction is a pair smooth bump function: f(0) = 1, f(1) = 0
        this.maxSemiWidth = 256;//has to be power of 2
        this.val = [];//stores values from i=0 to i=256 to avoid heavy computation every time
        for(let i = 0; i <= this.maxSemiWidth; i++){
            this.val.push(_normalisedFunction(i/this.maxSemiWidth));
        }
        console.log(_normalisedFunction(0));
    }

    GetValue(i,semiWidth){
        //i in [-semiWidth, semiWidth]
        //semiWidth : info about the current bump we're building
        return this.val[Math.abs(i)*this.maxSemiWidth/semiWidth];
    }
}

class TriangleBump extends BumpFunction{
    constructor(){
        super(function(x){return 1-x});
    }

    static base = new TriangleBump();
}

class CosBump extends BumpFunction{
    constructor(){
        super(function(x){return 0.5 + 0.5*Math.cos(x*pi)});
    }

    static base = new CosBump();
}

class SmoothSquare extends BumpFunction{
    constructor(_delta){
        super(function(x){return 0.5 + (0.5*Math.atan(Math.cos(pi*x)/_delta)/Math.atan(1/_delta))});
        this.delta = _delta;
    }

    static hard = new SmoothSquare(0.2);
    static soft = new SmoothSquare(0.6);
}

class PoweredSmoothSquare extends BumpFunction{
    constructor(_delta,_k){
        super(function(x){return Math.pow(0.5 + (0.5*Math.atan(Math.cos(pi*x)/_delta)/Math.atan(1/_delta)), _k)});
        this.delta = _delta;
        this.k = _k;
    }

    static base = new PoweredSmoothSquare(0.5, 3);
}