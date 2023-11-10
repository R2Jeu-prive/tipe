let {Track} = require("./common_classes/track");
let {Villeneuve} = require("./common_classes/villeneuve");
let {Traj} = require("./common_classes/traj");
let {Engine} = require("./server_scripts/engine");

var https = require('https');
var fs = require('fs');
let allowedURLs = [{regex:/^\/index\.(html|css)$/g, prefix:"/www"}, {regex:/^\/favicon\.ico$/g, prefix:"/www"}, {regex:/^\/google_earth_fetcher\/villeneuve(|_dezoom_[1-5])\/[0-9_]+\.png$/g, prefix:""}]
//let allowedWWWs = [/^\/index\.(html|css)$/g,/^\/2\.0\/js\/[a-zA-Z]+\.js$/g,/^\/google_earth_fetcher\/villeneuve(|_dezoom_[1-5])\/[0-9_]+\.png$/g,/^\/favicon.ico$/g];
let contentTypes = {"html" : "text/html", "css" : "text/css", "js" : "text/javascript", "png" : "image/png", "ico" : "image/x-icon"};

let engine = new Engine();

function getContentType(url){
    let parts = url.split(".");
    return contentTypes[parts[parts.length-1]];
}

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/r2jeu.fr/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/r2jeu.fr/fullchain.pem')
};

https.createServer(options, function (req, res) {
    console.log("new request");
    if(req.method == "GET"){
        if(req.url == "/"){
            res.writeHead(302, {'Location':'/index.html'});
            return res.end();
        }
        if(req.url == "/state"){
            res.writeHead(200, {'Content-Type':"application/json"});
            res.write(JSON.stringify(engine.GetState()));
            return res.end();
        }
        let validURL = true;
        let urlPrefix = "";
        for(let i = 0; i < allowedURLs.length; i++){
            if(req.url.match(allowedURLs[i].regex)){
                urlPrefix = allowedURLs[i].prefix;
                validURL = true;
                break;
            }
        }
        if(validURL){
            fs.readFile(__dirname + urlPrefix + req.url, function(err, data) {
                if(err){
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.write("404 Not Found");
                    return res.end();
                } 
                res.writeHead(200, {'Content-Type': getContentType(req.url)});
                res.write(data);
                return res.end();
            });
        }
        else{
            res.writeHead(403, {'Content-Type': 'text/html'});
            res.write("403 Forbidden");
            res.end();
        }
    }else if(req.method == "POST"){
        console.log(req.body);
        res.writeHead(200);
        return res.end();
    }
}).listen(443);

console.log("TIPE Server Running on port 443");
