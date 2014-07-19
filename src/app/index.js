var derby = require('derby');
var path = require('path');

var app = module.exports = derby.createApp('app', __filename);

if (!derby.util.isProduction) global.app = app;

app.serverUse(module, 'derby-stylus');
app.loadViews(path.join(__dirname, '/../../views/app'));
app.loadStyles(path.join(__dirname, '/../../styles/app'));
app.use(require('derby-login/components'));
app.component(require('./../../components/login-dropdown'));
app.component(require('./../../components/maps'));

app.proto.create = function (model) {
  // require('jquery');
  require('mapbox.js');
  require('./../../public/js/leaflet.draw.js');
}

app.component('home', Home);
function Home() {
};

app.component('camp', Campaign);
function Campaign() {
};

app.component('sg', SG);
function SG() {
};

Campaign.prototype.create = function (model, dom) {
}

SG.prototype.create = function (model, dom) {
}

app.get('*', function (page, model, params, next) {
  if (model.get('_session.loggedIn')) {
    var userId = model.get('_session.userId');
    $user = model.at('users.' + userId);
    model.subscribe($user, function () {
      model.ref('_session.user', $user);
      next();
    });
  } else {
    next();
  }
});

app.get('/', function getPage(page, model) {
  page.render('home');
});

app.get('/camp', function getPage(page, model) {
  page.render('camp');
});

app.get('/sg', function getPage(page, model) {
  page.render('sg');
});

