var http = require('http');
var url = require('url');
var fs = require('fs');
var crypto = require('crypto');
var sqlite3 = require('sqlite3').verbose();

var port = 24468;

var db;
var db_file = 'database.db';
var db_exists;

init_db(start_server);

function try_login(user, pass)
{

}

function hash_password(pass, salt)
{
  var hash = crypto.createHash('sha256');
  hash.update(pass);
  hash.update(salt);
  return hash.digest('hex');
}

function login_user(user_email, user_pass)
{
  console.log('user: ' + user_email + ' is trying to log in with pass: ' + user_pass);

  var statement = 'SELECT * FROM users WHERE email = (?)';
  db.get(statement, user_email, function (err, row) {
    if (row == null) {
      console.log('the user email is not in the db');
    }
    else {
      var hashed_user_pass = hash_password(user_pass, row.salt);   
      if (hashed_user_pass == row.password) {
        console.log("the user passwords is correct")
      }
      else {
        console.log("the user passwords is incorrect")
      }
    }
  });
}

function create_user(user_email, user_pass, callback)
{
  console.log('Creating a user with email: ' + user_email + ' and password: ' + user_pass);
  db.all('SELECT * FROM users WHERE email = (?)', user_email, function (err, rows) {
      if (rows.length == 0) { // if user doesn't already exit
        console.log('no user found with email: ' + user_email);
        var salt = crypto.randomBytes(16).toString('hex');
        var secret = crypto.randomBytes(16).toString('hex');
        var hashed_pass = hash_password(user_pass, salt);    
        var stmt = 'INSERT INTO users (email,password,secret,salt) VALUES (?,?,?,?)';
        db.run(stmt, user_email, hashed_pass, secret, salt, callback);
      }
      else { // don't create use if they exist
        console.log('user already exists, cant create');
        callback();
      }
    });
}

function init_db(callback) {

  db_exists = fs.existsSync(db_file);
  db = new sqlite3.Database(db_file);

  if (!db_exists) {
    console.log('creating db and user table');
    db.serialize(function () {
      db.run(
        "CREATE TABLE users (" +
        " id INTEGER PRIMARY KEY AUTOINCREMENT," +
        " email TEXT," +
        " password TEXT," +
        " secret TEXT," +
        " salt TEXT)",
        callback);
    });
  }
  else {
    console.log('found exisiting db');
    callback();
  }
}

function start_server() {

  create_user("test@user.com", "hunter2", function () {
    login_user("test@user.com", "hunter3");
    login_user("test@user.com", "blah");
    login_user("test@user.com", "hunter2");
  });

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
    else if (req_url.pathname == '/login') {
      fs.readFile('./login.html', function (err, data) {
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
      console.log('this is the ' + file_name);
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
}
