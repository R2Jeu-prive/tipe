class Result{
    static numOfMutates = 0;
    static numOfSuccess = 0;
    static lastUpdate = Date.now();
    static StoreMutateSuccess(success){
        this.numOfMutates += 1;
        if(success){this.numOfSuccess += 1;}

        if(Date.now() - this.lastUpdate > 200){//update every second ~
            document.getElementById("successRate").innerHTML = Math.round((this.numOfSuccess * 100 / this.numOfMutates)) + " %";
            this.numOfMutates = 0;
            this.numOfSuccess = 0;
            this.lastUpdate = Date.now();
        }
    }
}
