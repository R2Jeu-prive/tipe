const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const mime = require('mime');

let routes = [];
routes.push(["/","/www/index.html"]);
routes.push(["/canvasManager.js","/www/js/canvasManager.js"]);
routes.push(["/carManager.js","/www/js/carManager.js"]);
routes.push(["/constants.js","/www/js/constants.js"]);
routes.push(["/genManager.js","/www/js/genManager.js"]);
routes.push(["/main.js","/www/js/main.js"]);
routes.push(["/pointClass.js","/www/js/pointClass.js"]);
routes.push(["/tracks.js","/www/js/tracks.js"]);
routes.push(["/trajClass.js","/www/js/trajClass.js"]);
routes.push(["/uiManager.js","/www/js/uiManager.js"]);

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
