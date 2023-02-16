function UpdateTimeBoard(bestTimes) {
    let timeboard = document.getElementById("timeboard");
    timeboard.innerHTML = "";
    for (let i = 0; i < bestTimes.length; i++) {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(bestTimes[i]));
        timeboard.appendChild(li);
    }
}