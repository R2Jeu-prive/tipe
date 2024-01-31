import * as Utils from "./utils.js"

export class Car{
    constructor(){
        this.mass; //in kg
        this.roadFrictionCoef;
        this.airDragCoef;
        this.g = 9.81; //m/s²
        this.numOfGears; //number of gears possible
        this.angularMassJ; //mass of inertia of wheels and other in kg.m²
        this.speedOfGear = []; //array of speeds in km/h at each gear when engine is at 1000RPM
        this.wheelRadius; //wheel radius in m
        this.engineRPMs = []; //array of RPMs at which we have a torque datapoint (must be in ascending order)
        this.engineTorques = []; //array of torques corresponding to engineRPMs in N.m

        this.engineRadiusAtGear = [];
    }

    Init(){
        for(let i = 0; i < this.numOfGears; i++){
            engineRadiusAtGear[i] = 3*this.speedOfGear[i]/(3.6*100*Math.PI);
        }
    }

    /**
     * 
     * @param {Float} s_ speed of car in m/s
     * @param {Int} gear gearId used
     * @returns engine rotation speed 
     */
    GetEngineRotSpeed(s_, gear){
        let engineRotSpeed = s_/engineRadiusAtGear[gear];
        return engineRotSpeed;
    }

    GetTorque(engineRotSpeed){
        let engineRPM = engineRotSpeed*30/Math.PI;
        let [i, j] = Utils.findBoundingIndexes(engineRPM, this.engineRPMs);
        if(i == -1 && j == -1){
            return 0;// outside operating range
        }
        if(i == j){
            return this.engineTorques[i];
        }
        let torqueSlope = (this.engineTorques[j] - this.engineTorques[i])/(this.engineRPMs[j] - this.engineRPMs[i]);
        let torque = this.engineTorques[i] + torqueSlope*(engineRPM - this.engineRPMs[i]);
        return torque;
    }
}
