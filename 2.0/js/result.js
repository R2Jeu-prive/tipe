class Result{
    static successRate = {};
    static successRateText;
    
    static Init(){
        this.successRateText = document.getElementById("successRate");
        this.successRate["global"] = [0,0];//how many 5-mutations are actually better in eval
        this.successRate["canWind"] = [0,0];//how many wind mutations successfully rebuild
    }

    /**
     * @param {String} mutationType
     * @param {Boolean} success 
     */
    static StoreMutationResult(mutationType, success){
        this.successRate[mutationType][1] += 1;
        if(success){
            this.successRate[mutationType][0] += 1;
        }
    }

    static ShowBestEval(bestEval){
        document.getElementById("bestEval").innerHTML = bestEval;
    }

    static ShowSuccessRates(){
        this.successRateText.innerHTML = (Math.round(this.successRate["global"][0]*100/this.successRate["global"][1])) + "%\n" + (Math.round(this.successRate["canWind"][0]*100/this.successRate["canWind"][1])) + "%";
        this.successRate["global"] = [0,0];
        this.successRate["canWind"] = [0,0];
    }
}
