var http = require('http')
var url = require('url')
var fs = require('fs')
var port = 24468

http.createServer(function (req, res) { 

  var req_url = url.parse(req.url);
  console.log('req url = ' + req_url.pathname);

  if (req_url.pathname == '/') {
    console.log('entering if');
    fs.readFile('./home.html', function (err, data) {
      res.writeHead(200);
      res.write(data);
      res.end();
    });
  }
  else if (req_url.pathname == '/home') {
    fs.readFile('./home.html', function (err, data) {
      res.writeHead(200);
      res.write(data);
      res.end();
    });
  }
  else if (req_url.pathname == '/services') {
    fs.readFile('./services.html', function (err, data) {
      res.writeHead(200);
      res.write(data);
      res.end();
    });
  }

  else if (req_url.pathname == '/stylefile.css') {
    fs.readFile('./stylefile.css', function (err, data) {
      res.writeHead(200);
      res.write(data);
      res.end();
    });
  }
  else if (req_url.pathname == '/jsfile.js') {
    fs.readFile('./jsfile.js', function (err, data) {
      res.writeHead(200);
      res.write(data);
      res.end();
    });
  }
  else if (req_url.pathname.match('/img/')) {
    console.log("requested img");
    var file_name = '.' + req_url.pathname;
    console.log('this is the '+file_name);
    if (fs.existsSync(file_name)) {
      fs.readFile('.' + req_url.pathname, function (err, data) {
        res.writeHead(200);
        res.write(data);
        res.end();
      });
    }
    else {
      res.writeHead(404);
      res.write('<head><body>This is a 404 page.</body></head>');
      res.end();
    }
  }

  else if (req_url.pathname == '/favicon.ico') {
    console.log('send OK with no content 204');
    res.writeHead(204);
    res.end();
  }
  else {
    console.log('page not found, send our 404 page');
    res.writeHead(404);
    res.write('<head><body>This is a 404 page.</body></head>');
    res.end();
  }
  // first client asks for / 
  // second client asks for favicon.ico
}).listen(port, 'localhost'); 
console.log('created the server');
