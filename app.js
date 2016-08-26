'use strict';

var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');

var Routing = function (server) {
    var route = {};
    this.get = function (name, requestListener) {
        route[name] = requestListener;
    };
    server.on('request', function (req, res) {
        var urlParams = url.parse(req.url, true);
        var urlPathname = urlParams['pathname'];
        var urlQueryParams = urlParams['query'];
        var requestListener = route[urlPathname];
        if (typeof requestListener == "function") {
            requestListener(req, res, urlQueryParams);
            return;
        }
        res.statusCode = 404;
        res.end('Url path not found: ' + urlPathname);
    });
};

var server = http.createServer();
var routing = new Routing(server);

routing.get('/', function (req, res) {
    res.end('<a href="/download?filename=readme">Download file</a>');
});

routing.get('/download', function (req, res, params) {
    //set cookie
    var referer = req.headers['referer'];
    if (typeof referer == 'string') {
        res.setHeader('Set-Cookie', 'referrer=' + referer);
    }
    res.writeHead(302, {'Location': '/downloaded?' + qs.stringify(params)});
    res.end(':)');
});

routing.get('/downloaded', function (req, res, params) {
    //download file
    var filename = params['filename'] || 'file';
    var mockFile = fs.createReadStream('file.doc');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="'+ filename +'.doc"');
    mockFile.pipe(res);
});

server.listen(8080);
console.log('Server running on http://localhost:8080');
