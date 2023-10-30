window.onload = () => {
    document.addEventListener("mousedown", UI.MouseDown.bind(this));
    document.addEventListener("mousemove", UI.MouseMove.bind(this));
    document.addEventListener("mouseup", UI.MouseUp.bind(this));
    document.addEventListener("keydown", UI.KeyDown.bind(this));
    document.addEventListener("contextmenu", e => e.shiftKey ? e.preventDefault() : false);

    Track.Init(Villeneuve);
    Canvas.Init();
    Canvas.DrawBack();
    Canvas.DrawBorder();
    Evolution.Init();
    Result.Init();
}