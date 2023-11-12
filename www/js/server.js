a = 10;

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

    static async OrderStart(){
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
    }

    /*static RequestStart(){
        fetch("/command", {
            method: "POST",
            body: JSON.stringify({
                command: "startEngine",
                password: document.getElementById("password").value
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
    }*/
}