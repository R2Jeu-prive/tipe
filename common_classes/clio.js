import { Car } from "./car.js";

export class Clio{
    static mass = 1200; //in kg
    static roadFrictionCoef = 0.8;
    static airDragCoef = 0.31;
    static g = 9.81; //earth gravity in m/s²
    static theoricalMaxSpeed = 60; //max theorical speed in m/s (this speed is to cap values, it will not be reached)
    static numOfGears = 6; //number of gears
    static angularMassJ = 10; //mass of inertia of wheels in kg.m²
    static speedOfGear = [7.4, 12.5, 19.2, 27.2, 35.5, 44.8]; //array of speeds in km/h at each gear when engine is at 1000RPM
    static wheelRadius = 0.299; //wheel radius in m
    //array of RPMs at which we have a torque datapoint (must be in ascending order)
    static engineRPMs = [1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100, 5200, 5300, 5400, 5500, 5600, 5700, 5800, 5900, 6000];
    //array of torques corresponding to engineRPMs in N.m
    static engineTorques = [78.4, 93.9, 107.8, 120, 130.6, 139.6, 146.9, 152.7, 156.7, 159.2, 160.0, 160.0, 159.9, 159.7, 159.4, 159.1, 158.7, 158.3, 157.7, 157.1, 156.4, 155.7, 154.9, 154.0, 153.0, 152.0, 150.9, 149.7, 148.5, 147.1, 145.8, 144.3, 142.8, 141.2, 139.5, 137.7, 135.9, 134.0, 132.1, 130.1, 128.0, 125.5, 123.0, 120.7, 118.5, 116.3, 113.8, 110.4, 106.3, 101.5, 96.0];
}