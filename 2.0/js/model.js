class Model{
    constructor(){
        children = [];
        activated = false;
        loopTimeout = -1;
        evaluationModes = [TrajEval.minDist, TrajEval.minCurve, TrajEval.f1Model];
    }
}