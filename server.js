var http = require('http');
var fs = require('fs');
let allowedURLsRegex = [/^\/2\.0\/(index|frame)\.(html|css)$/g,/^\/2\.0\/js\/[a-zA-Z]+\.js$/g,/^\/google_earth_fetcher\/villeneuve(|_dezoom_[1-5])\/[0-9_]+\.png$/g,/^\/favicon.ico$/g];
let contentTypes = {"html" : "text/html", "css" : "text/css", "js" : "text/javascript", "png" : "image/png", "ico" : "image/x-icon"};

function getContentType(url){
    let parts = url.split(".");
    return contentTypes[parts[parts.length-1]];
}

http.createServer(function (req, res) {
    if(req.url == "/"){
        res.writeHead(302, {'Location':'/2.0/index.html'});
        return res.end();
    }else if(allowedURLsRegex.find(exp => req.url.match(exp)) != null){
        fs.readFile(__dirname +  req.url, function(err, data) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.write("404 Not Found");
                return res.end();
            } 
            res.writeHead(200, {'Content-Type': getContentType(req.url)});
            res.write(data);
            return res.end();
        });
    }else{
        res.writeHead(403, {'Content-Type': 'text/html'});
        res.write("403 Forbidden");
        res.end();
    }
}).listen(80);

console.log("TIPE Server Running on localhost:80");
