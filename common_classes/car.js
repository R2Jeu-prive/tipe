import {findBoundingIndexes} from "./utils.js"
import { Clio } from "./clio.js";

export class Car{
    /**
     * @param {String} name name of the car to create
     */
    constructor(name){
        this.name = name;

        var staticCarClass;
        if(name == "Clio"){staticCarClass = Clio;}
        else{
            console.error("Invalid car name : " + name);
        }
        this.mass; //in kg
        this.roadFrictionCoef;
        this.airDragCoef;
        this.g; //earth gravity in m/s²
        this.theoricalMaxSpeed; //max theorical speed in m/s (this speed is to cap values, it will not be reached)
        this.numOfGears; //number of gears
        this.angularMassJ; //mass of inertia of wheels in kg.m²
        this.speedOfGear = []; //array of speeds in km/h at each gear when engine is at 1000RPM
        this.wheelRadius; //wheel radius in m
        this.engineRPMs = []; //array of RPMs at which we have a torque datapoint (must be in ascending order)
        this.engineTorques = []; //array of torques corresponding to engineRPMs in N.m
        
        this.engineRadiusAtGear = [];

        //copy real values from staticCarClass
        for(let prop in staticCarClass){
            this[prop] = staticCarClass[prop];
        }

        for(let i = 0; i < this.numOfGears; i++){
            this.engineRadiusAtGear[i] = 3*this.speedOfGear[i]/(3.6*100*Math.PI);
        }
    }

    /**
     * 
     * @param {Float} s_ speed of car in m/s
     * @param {Int} gear gearId used
     * @returns engine rotation speed in rad/s
     */
    GetEngineRotSpeed(s_, gear){
        let engineRotSpeed = s_/this.engineRadiusAtGear[gear];
        return engineRotSpeed;
    }

    /**
     * 
     * @param {*} engineRotSpeed engine rotation speed in rad/s
     * @returns {Number} engine torque in N.m at this rotation speed
     */
    GetTorque(engineRotSpeed){
        let engineRPM = engineRotSpeed*30/Math.PI;
        let [i, j] = findBoundingIndexes(engineRPM, this.engineRPMs);
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
