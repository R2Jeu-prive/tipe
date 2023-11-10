class Server{
    static async RequestTrack(){
        let response = await fetch("/track", {
            method: "GET"
        })
        return response.json();
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