var express = require('express');
var xss = require('xss-clean');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var https = require('https');
var fs = require('fs');
var app = express();

app.post('/comment', (req, res) => {
  const cleanComment = req.body.comment;
  res.send(`Comment received: ${cleanComment}`);
});

const certDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
    console.warn('Created "certs" directory - please add your key.pem and cert.pem files');
}


var db = mysql.createConnection({
  host: 'localhost',
  database: 'appDatabase',
  port: 3306, // MySQL default port
});

// var app = express();

// app.use(function(req,res,next){
//     req.pool = db;
//     next();
// });

app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // res.setHeader('X-Frame-Options', 'DENY');
    // res.setHeader('X-XSS-Protection', '1; mode=block');
    // res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(xss());


app.use((req, res, next) => {
    req.pool = db;
    next();
});


app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', require('./routes/index'));


// app.listen(port, () => {
//     console.log(`Listening at http://localhost:${port}`);
// });

if (require.main === module) {
    const port = 8080;
    // const certPath = path.join(__dirname, 'certs');

    try {
        const sslOptions = {
            key: fs.readFileSync(path.join(certPath, 'key.pem')),
            cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
            minVersion: 'TLSv1.2'
        };

        https.createServer(sslOptions, app).listen(port, () => {
            console.log(`HTTPS server running at https://localhost:${port}`);
            // console.log(`Static files served from: ${path.join(__dirname, 'public')}`);
        });
    } catch (err) {
        console.error('SSL Error', err);
        process.exit(1);
    }
}



module.exports = app;
