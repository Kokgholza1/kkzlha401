var http = require('http');

http.createServer(function (req, res){
    res.write("En linea");
    res.end();
}).listen(8080);
