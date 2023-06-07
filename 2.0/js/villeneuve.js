class Villeneuve{
    static topleftGoogleEarthTile = [620232, 750141];
    static numOfTiles = [49, 145];

    static DrawTile(u,v,canvasX,canvasY){
        let img = new Image();
        let tileSize = 256*Math.pow(2,UI.zoom);
        let x = u + this.topleftGoogleEarthTile[0];
        let y = v + this.topleftGoogleEarthTile[1];
        img.addEventListener('load', function() {
            Canvas.ctxBack.drawImage(img, canvasX, canvasY, tileSize, tileSize);
        });
        img.src = '../google_earth_fetcher/villeneuve/' + x + '_' + y + '.png';
    }
}