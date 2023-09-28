class TrajEval{
    static minDist(traj){
        traj.CalcDists();
        let evaluation = 0;
        for(let i = 1; i < traj.points.length; i++){
            evaluation += traj.dists[i-1];
        }
        traj.evaluation = evaluation;
    }

    static minCurve(traj, power = 2){
        traj.CalcDists();
        traj.CalcAbsCurve();
        let evaluation = 0;
        for(let i = 1; i < traj.points.length; i++){
            evaluation += Math.pow(traj.absCurves[i], pow)*traj.dists[i-1];
        }
        traj.evaluation = evaluation;
    }

    static f1Model(traj){
        traj.CalcDists();
        traj.CalcAbsCurve();
        traj.CalcSpeed();
        let evaluation = 0;
        for(let i = 1; i < traj.points.length; i++){
            evaluation += traj.dists[i-1]/traj.speeds[i];
        }
        traj.evaluation = evaluation;
    }
}