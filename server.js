import { Engine } from "./server_scripts/engine.js";
import { SaveSystem } from "./server_scripts/saveSystem.js";
import { TaskManager } from "./server_scripts/taskManager.js";
import 'dotenv/config'
import * as http from 'http';
import * as https from 'https';
import * as fs from "fs";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var engine = new Engine();
var saveSystem = new SaveSystem();
var taskManager = new TaskManager();

engine.saveSystem = saveSystem;
engine.taskManager = taskManager;
taskManager.engine = engine;
taskManager.saveSystem = saveSystem;
saveSystem.engine = engine;
saveSystem.taskManager = taskManager;
taskManager.HandleTasks();

let allowedURLs = [
    {regex:/^\/index\.(html|css)$/g, prefix:"/www"},
    {regex:/^\/common_classes\/[a-zA-Z]+\.js$/g, prefix:"/"},
    {regex:/^\/client_scripts\/[a-zA-Z]+\.js$/g, prefix:"/"},
    {regex:/^\/favicon\.ico$/g, prefix:"/www"},
    {regex:/^\/google_earth_fetcher\/villeneuve(|_dezoom_[1-5])\/[0-9_]+\.png$/g, prefix:""},
];
let contentTypes = {"html" : "text/html", "css" : "text/css", "js" : "text/javascript", "png" : "image/png", "ico" : "image/x-icon"};

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
        let validURL = false;
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
                    console.log(err);
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
            try{
                const data = JSON.parse(dataBuffer.toString());
                if(data.password != process.env.PASSWORD){
                    res.writeHead(401, {'Content-Type': 'text/html'});
                    res.write("Wrong Password");
                    return res.end();
                }
                if(req.url == "/cleartasks"){
                    taskManager.ClearTasks();
                    res.writeHead(200);
                    return res.end();
                }
                if(req.url == "/addtasks"){
                    if(taskManager.ParseCheckAndAddTasks(data.taskList)){
                        res.writeHead(200);
                        return res.end();
                    }else{
                        res.writeHead(400);//syntax error in commands given
                        return res.end();
                    }
                }
            }
            catch (err){
                console.warn("weird request");
                res.writeHead(400)
                return res.end();
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