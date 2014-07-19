var express = require('express');

var expressSession = require('express-session');
var serveStatic = require('serve-static');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var highway = require('racer-highway');
var derbyLogin = require('derby-login');
var hooks = require('./hooks');

module.exports = function (store, apps, error, cb) {

  var connectStore = require('connect-mongo')(expressSession);
  var sessionStore = new connectStore({url: process.env.MONGO_URL});

  var session = expressSession({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: null },
    saveUninitialized: true,
    resave: true
  });

  var handlers = highway(store, {session: session});

  hooks(store);

  var expressApp = express()
    .use(compression())
    .use(serveStatic(process.cwd() + '/public'))
    .use(favicon(process.cwd() + '/public/images/favicon.ico'))
    .use(store.modelMiddleware())
    .use(cookieParser(process.env.SESSION_COOKIE))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))
    .use(session)
    .use(derbyLogin.middleware(store, require('../config/login')))
    .use(handlers.middleware)

  apps.forEach(function (app) {
    expressApp.use(app.router());
  });

  expressApp.use(require('./routes'));

  expressApp
    .all('*', function (req, res, next) {
      next('404: ' + req.url);
    })
    .use(error);

  cb(expressApp, handlers.upgrade);
}
