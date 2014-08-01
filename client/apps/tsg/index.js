var derby = require('derby');
var path = require('path');

var app = module.exports = derby.createApp('app', __filename);

if (!derby.util.isProduction) global.app = app;

app.serverUse(module, 'derby-stylus');
app.loadViews(path.join(__dirname, '/views'));
app.loadStyles(path.join(__dirname, '/styles'));
app.use(require('derby-login/components'));
app.component(require('./../../components/login-dropdown'));

app.proto.create = function (model) {
  require('mapbox.js');
  require('leaflet-draw');
  require('leaflet-hash');
  require('./libs/Leaflet.StyleEditor.min.js');
  //require('./../../public/js/routie.min.js');
}

app.component('home', Home);
function Home() {};

Home.prototype.newBriefing = function (model, dom) {
  var model = this.model;
  var mapId = model.root.get('_session.mapId');
  var userId = model.root.get('_session.userId');
  if (!mapId || !userId) return;

  var briefingId = model.root.add('sg', {
    mapId: mapId,
    userId: userId,
    markers: {}
  });

  app.history.push('/sg/' + briefingId);
}

Home.prototype.delSg = function(sgId){
  if (sgId) this.model.root.del('sg.' + sgId);
};


app.component('camp', Campaign);
function Campaign() {};

app.component('sg', SG);
function SG() {};

Campaign.prototype.create = function (model, dom) {

  var b = 0.5859375 / 15.36, c = L.latLng([0, 0]);
  var mapOptions = {
    center: [5, 7],
    zoom: 3,
    minZoom: 1,
    maxZoom: 6,
    attributionControl: false,
    layers: [L.tileLayer('/tiles/chernarus_new/{z}/{x}_{y}.jpg', {
      continuousWorld: false,
      noWrap: true
    })],
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
  };

  var map = L.map('mapbox-container', mapOptions);
  map.zoomControl.setPosition('bottomright');

  var hash = new L.Hash(map);

  var canvasTiles = L.tileLayer.canvas();
  canvasTiles.drawTile = function (canvas, tilePoint, zoom) {
    var ctx = canvas.getContext('2d');
  };
  canvasTiles.addTo(canvasTiles);

  var coordinates = document.getElementById('mapbox-coordinates');

  map.on("mousemove", function (e) {
    coordinates.innerHTML = 'Lat: ' + e.latlng.lat + ' Lon: ' + e.latlng.lng + ' <br/> GPS: ' + fromLatLngToGps(e.latlng);
    /*gpsCoordinates.innerHTML = fromLatLngToGps(e.latlng);

     var Xin = e.latlng.lng * 100;
     var Yin = 15360 - e.latlng.lat * 100;
     var heading = 0;
     editorCoordinates.innerHTML = '[' + heading + ',[' + Xin + ',' + Yin + ',0]]';*/
  });


  function calculateCoords(m) {
    var Xin = m.lng * 100;
    var Yin = 15360 - m.lat * 100;
    var heading = 0;

    editorCoordinates.innerHTML = '[' + heading + ',[' + Xin + ',' + Yin + ',0]]';
  }

  function fromCoordToGps(a) {
    a = Math.abs(a);
    var b = (1E3 * a).toString();
    return b = 0.1 > a ? "000" : 1 > a ? "00" + b.substr(0, 1) : 10 > a ? "0" + b.substr(0, 2) : 100 > a ? b.substr(0, 3) : "999"
  }

  function fromGpsToCoord(a) {
    return 0.1 * parseInt(a, 10)
  }

  function fromLatLngToGps(a) {
    var b = fromCoordToGps(a.lat);
    return fromCoordToGps(a.lng) + " " + b
  }
}

SG.prototype.create = function (model, dom) {

  var model = this.model;
  var sgId = model.root.get('_session.sgId');
  var mapId = model.root.get('sg.' + sgId + '.mapId');
  var mapCRC = model.root.get('maps.' + mapId + '.mapCRC');
  var mapName = model.root.get('maps.' + mapId + '.mapName');
  var mapTiles = model.root.get('maps.' + mapId + '.mapTiles');

  var b = mapCRC, c = L.latLng([0, 0]), map;
  var mapOptions = {
    center: [5, 7],
    zoom: 3,
    minZoom: 1,
    maxZoom: 6,
    attributionControl: false,
    layers: [L.tileLayer(mapTiles, {
      continuousWorld: false,
      noWrap: true
    })],
    crs: L.CRS.CustomCRC = L.Util.extend({}, L.CRS, {
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
  };

  var map = L.map('mapbox-container', mapOptions);
  map.zoomControl.setPosition('bottomright');

  var hash = new L.Hash(map);

  var canvasTiles = L.tileLayer.canvas();
  canvasTiles.drawTile = function (canvas, tilePoint, zoom) {
    var ctx = canvas.getContext('2d');
  };
  canvasTiles.addTo(map);


  var styleEditor = L.control.styleEditor({
    position: "bottomright"
  });
  map.addControl(styleEditor);

  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  var drawControl = new L.Control.Draw({
/*    draw: {
      marker: {
        icon: L.mapbox.marker.icon({
          'marker-color': 'ff8888'
        })
      }
    },*/
    edit: {
      featureGroup: drawnItems
    },
    position: 'bottomright'
  });
  map.addControl(drawControl);

  map.on('draw:created', function(e) {
    drawnItems.addLayer(e.layer);
  });

}


app.get('*', function (page, model, params, next) {
  if (model.get('_session.loggedIn')) {
    var userId = model.get('_session.userId');
    var sgs = model.query('sg', {userId: userId});
    $user = model.at('users.' + userId);
    model.subscribe($user, 'maps', sgs, function () {
      model.ref('_session.user', $user);
      model.filter('sg', {}).ref('_session.sgs');
      model.filter('maps', {}).ref('_session.maps');
      next();
    });
  } else {
    next();
  }
});

app.get('/', function (page, model) {
  page.render('home');
});

app.get('/camp', function (page, model) {
  page.render('camp');
});

app.get('/sg/:id', function(page, model, params, next){
  var sgData = model.query('sg', {_id: params.id});
  model.set('_session.sgId', params.id);
  model.subscribe(sgData, function(){
      page.render('sg');
  });
});

app.on('model', function(model){
  model.fn('getMapIds', function (map) {
    var ids = {};
    for (var key in map) ids[map[key].mapId] = true;
    var tmp = Object.keys(ids);
    return Object.keys(ids);
  });
});