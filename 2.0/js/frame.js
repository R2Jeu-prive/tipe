window.onload = () => {
    document.addEventListener("mousedown", GetUV.bind(this));
    let ctx = document.getElementById("canvas").getContext("2d");
    let img = new Image();
    img.addEventListener('load', function() {
        ctx.drawImage(img, 0, 0, 1536, 864);
    });
    img.src = "../video_data/ver_lap_68/5339.jpg";
}

i = 1

function GetUV(e){
    if(e.button != 0){return;}
    let u = e.pageX/1536 - 0.5;
    let v = -e.pageY/1536 + 0.5*864/1536;
    console.log("u" + i + " = [" + u + ", " + v + ", 1]");
    i+=1;
}