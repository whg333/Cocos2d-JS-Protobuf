var cache = {};
var port = 3000;

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var open = require("open");

var ProtoBuf = require('protobufjs');
//console.log(ProtoBuf);
//console.log(__dirname);
var TestProtobuf = ProtoBuf.loadProtoFile(path.join(__dirname, './protobuf/TestProtobuf.proto')).build('TestProtobuf'),
    TestProto = TestProtobuf.TestProto;
//console.log(TestProto);

var BufferHelper = require('bufferhelper');

var server = http.createServer(function(request, response){
    var filePath = false;
    if(request.url == '/'){
        filePath = 'index.html';
    }else if(request.method === 'POST' && request.url.lastIndexOf('proto') != -1){
        //BufferHelper参考链接 http://www.infoq.com/cn/articles/nodejs-about-buffer/
        var bufferHelper = new BufferHelper();
        request.on("data", function (chunk) {
            bufferHelper.concat(chunk);
        });
        request.on('end', function () {
            var buffer = bufferHelper.toBuffer();
            var testProtoData = TestProto.decode(buffer);
            //console.log(testProtoData);
            response.writeHead(200, {'Content-Type': 'application/x-protobuf'});
            response.end(testProtoData.toBuffer());
        });

        return;
    }else{
        filePath = request.url;
    }

    var absPath = './'+filePath;
    serveStatic(response, cache, absPath);
});

server.listen(port, function(){
    console.log('Server listening on porn '+port);
    open("http://localhost:"+port);
});

function serveStatic(response, cache, absPath){
    if(cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    }else{
        fs.exists(absPath, function(exists){
            if(!exists){
                send404(response);
                return;
            }

            fs.readFile(absPath, function(err, data){
                if(err){
                    send404(response);
                    return;
                }

                cache[absPath] = data;
                sendFile(response, absPath, data);
            });
        });
    }
}

function send404(response){
    response.writeHead(404, {'content-type':'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContens){
    response.writeHead(200, {'content-type':mime.lookup(path.basename(filePath))});
    response.end(fileContens);
}