class Model{
    constructor(_activated, modelUIBuildFunction){
        this.children = [];
        this.activated = _activated;
        this.loopTimeout = -1;
        this.evaluationModes = [TrajEval.minDist, TrajEval.minCurve, TrajEval.f1Model];
        
        //CREATE UI
        this.uiElement = modelUIBuildFunction();


        //CREATE FIRST TRAJ
        let firstTraj = new Traj();
        firstTraj.BuildPoints();
        firstTraj.CalcAbsCurve();
        this.children = [firstTraj];
    }


}