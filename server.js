let {Track} = require("./common_classes/track");
let {Villeneuve} = require("./common_classes/villeneuve");
let {Traj} = require("./common_classes/traj");
let {Task} = require
let {Engine} = require("./server_scripts/engine");

require('dotenv').config();
var http = require("http");
var https = require("https");
var fs = require('fs');

let allowedURLs = [
    {regex:/^\/index\.(html|css)$/g, prefix:"/www"},
    {regex:/^\/js\/[a-zA-Z]+\.js$/g, prefix:"/www"},
    {regex:/^\/favicon\.ico$/g, prefix:"/www"},
    {regex:/^\/google_earth_fetcher\/villeneuve(|_dezoom_[1-5])\/[0-9_]+\.png$/g, prefix:""},
    {regex:/^\/common_classes\/[a-zA-Z]+\.js/g, prefix:""}
];
let contentTypes = {"html" : "text/html", "css" : "text/css", "js" : "text/javascript", "png" : "image/png", "ico" : "image/x-icon"};

let engine = new Engine();

function getContentType(url){
    let parts = url.split(".");
    return contentTypes[parts[parts.length-1]];
}

function handleRequest(req, res){
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
        if(req.url == "/track"){
            res.writeHead(200, {'Content-Type':"application/json"});
            res.write(JSON.stringify(Track));
            return res.end();
        }
        let validURL = true;
        let urlPrefix = "";
        for(let i = 0; i < allowedURLs.length; i++){
            if(req.url.match(allowedURLs[i].regex) != null){
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
        let chunks = [];
        req.on("data", (chunk) => {
            chunks.push(chunk);
        });
        req.on("end", () => {
            const dataBuffer = Buffer.concat(chunks);
            const data = JSON.parse(dataBuffer.toString());//TODO Protect from weird packets crash with try catch ?
            if(data.password != process.env.PASSWORD){
                res.writeHead(403, {'Content-Type': 'text/html'});
                res.write("Wrong Password");
                return res.end();
            }
            if(req.url == "/start"){
                if(engine.Start()){
                    res.writeHead(200);
                    return res.end();
                }else{
                    res.writeHead(409);//engine already running
                    return res.end();
                }
            }
            if(req.url == "/stop"){
                if(engine.Stop()){
                    res.writeHead(200);
                    return res.end();
                }else{
                    res.writeHead(409);//engine already running
                    return res.end();
                }
            }
            if(req.url == "/cleartasks"){
                if(engine.ClearTasks()){
                    res.writeHead(200);
                    return res.end();
                }else{
                    res.writeHead(409);//engine is running so can't change tasks
                    return res.end();
                }
            }
            if(req.url == "/addtasks"){
                if(engine.AddTasks(data.taskList)){
                    res.writeHead(200);
                    return res.end();
                }else{
                    res.writeHead(409);//engine is running so can't change tasks
                    return res.end();
                }
            }
        })
    }
}

if(process.argv.length == 3 && process.argv[2] == "--nossl"){
    http.createServer(handleRequest).listen(80);
    console.log("http server running on port 80");
}else{
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/r2jeu.fr/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/r2jeu.fr/fullchain.pem')
    };
    https.createServer(options, handleRequest).listen(443);
    console.log("https server running on port 443");
}