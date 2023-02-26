const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const mime = require('mime');

let routes = [];
routes.push(["/","/www/index.html"]);
routes.push(["/js/canvasManager.js","/www/js/canvasManager.js"]);
routes.push(["/js/carManager.js","/www/js/carManager.js"]);
routes.push(["/js/constants.js","/www/js/constants.js"]);
routes.push(["/js/genManager.js","/www/js/genManager.js"]);
routes.push(["/js/main.js","/www/js/main.js"]);
routes.push(["/js/pointClass.js","/www/js/pointClass.js"]);
routes.push(["/js/tracks.js","/www/js/tracks.js"]);
routes.push(["/js/trajClass.js","/www/js/trajClass.js"]);
routes.push(["/js/uiManager.js","/www/js/uiManager.js"]);

routes.push(["/css/style.css","/www/css/style.css"]);

for (let route of routes) {
	router.get(route[0], function(req, res){
		res.set('Content-Type', mime.getType(route[1].split(".")[1]));
		res.sendFile(path.join(__dirname, route[1]));
	})
	app.use(route[0], router);
}

let server = app.listen(80, function(){
  console.log("Web server is running on port 80");
  console.log("to end press Ctrl + C");
});
