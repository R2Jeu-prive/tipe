class Server{
    static async RequestTrack(){
        let response = await fetch("/track", {
            method: "GET"
        })
        return response.json();
    }

    static async RequestState(){
        let response = await fetch("/state", {
            method: "GET"
        });
        return response.json();
    }

    static GetPassword(){
        return document.getElementById("password").value;
    }

    /*static async OrderStart(){
        let response = await fetch("/start", {
            method: "POST",
            body: JSON.stringify({password: this.GetPassword()})
        });
        let notifs = {403:"Incorrect Password",409:"Engine Already Running",200:"Engine Started"};
        alert(notifs[response.status]);
    }

    static async OrderStop(){
        let response = await fetch("/stop", {
            method: "POST",
            body: JSON.stringify({password: this.GetPassword()})
        });
        let notifs = {403:"Incorrect Password",409:"Engine Already Stopped",200:"Engine Stopped"};
        alert(notifs[response.status]);
    }*/

    static async OrderClearTasks(){
        let response = await fetch("/cleartasks", {
            method: "POST",
            body:JSON.stringify({password:this.GetPassword()})
        });
        let notifs = {403:"Incorrect Password", 200:"Tasks Clear"};
        if(response.status == 200){
            console.log(notifs[response.status]);
        }else{
            alert(notifs[response.status]);
        }
    }

    static async OrderAddTasks(){
        let taskList = document.getElementById("new-tasks").value;
        let response = await fetch("/addtasks", {
            method: "POST",
            body:JSON.stringify({password:this.GetPassword(), taskList:taskList})
        });
        let notifs = {403:"Incorrect Password", 409:"Syntax Error", 200:"Tasks Added"};
        if(response.status == 200){
            console.log(notifs[response.status]);
        }else{
            alert(notifs[response.status]);
        }
    }
}