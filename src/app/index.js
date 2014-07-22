var derby = require('derby');
var path = require('path');
var mapTiles = require('./../../config/map.json');

var app = module.exports = derby.createApp('app', __filename);

if (!derby.util.isProduction) global.app = app;

app.serverUse(module, 'derby-stylus');
app.loadViews(path.join(__dirname, '/../../views/app'));
app.loadStyles(path.join(__dirname, '/../../styles/app'));
app.use(require('derby-login/components'));
app.component(require('./../../components/login-dropdown'));

var options = {
  mapTiles: mapTiles,
  attribution: '',
  maxZoom: 6,
  minZoom: 1,
  continuousWorld: false,
  noWrap: true
};
/*  var b = 0.5859375 / 15.36, c = L.latLng([0, 0]);
 var crcOptions = {
 crs: L.CRS.Chernarus = L.Util.extend({}, L.CRS, {
 latLngToPoint: function (e, d) {
 var a = L.latLng([e.lat - c.lat, e.lng - c.lng]),
 a = this.projection.project(a),
 b = this.scale(d);
 return a = this.transformation._transform(a, b)
 },
 pointToLatLng: function (b, d) {
 var a = this.scale(d),
 a = this.transformation.untransform(b, a),
 a = this.projection.unproject(a);
 a.lat += c.lat;
 a.lng += c.lng;
 return a
 },
 projection: L.Projection.LonLat,
 transformation: new L.Transformation(b, 0, b, 0)
 })
 };*/

app.use(require('d-mapbox'), options);

app.proto.create = function (model) {
  // require('jquery');
  //require('./../../public/js/leaflet.draw.js');
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

