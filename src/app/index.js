var derby = require('derby');
var path = require('path');

var app = module.exports = derby.createApp('app', __filename);

if (!derby.util.isProduction) global.app = app;

app.serverUse(module, 'derby-stylus');
app.loadViews(path.join(__dirname, '/../../views/app'));
app.loadStyles(path.join(__dirname, '/../../styles/app'));
app.use(require('derby-login/components'));
app.component(require('./../../components/login-dropdown'));

app.proto.create = function (model) {
  require('mapbox.js');
  require('leaflet-draw');
  //require('./../../public/js/routie.min.js');
}

app.component('home', Home);
function Home() {};

Home.prototype.newBriefing = function (model, dom) {
  var model = this.model;
  var mapId = model.root.get('_page.mapId');
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

  var canvasTiles = L.tileLayer.canvas();
  canvasTiles.drawTile = function (canvas, tilePoint, zoom) {
    var ctx = canvas.getContext('2d');
  };
  canvasTiles.addTo(map);


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
  var mapId = model.root.get('_page.mapId');
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

  var canvasTiles = L.tileLayer.canvas();
  canvasTiles.drawTile = function (canvas, tilePoint, zoom) {
    var ctx = canvas.getContext('2d');
  };
  canvasTiles.addTo(map);

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
    $user = model.at('users.' + userId);
    model.subscribe($user, function () {
      model.ref('_session.user', $user);
      next();
    });
  } else {
    next();
  }
});

app.get('/', function (page, model) {
  var userId = model.root.get('_session.userId');
  var sgData = model.query('sg', {userId: userId});
  model.subscribe('maps', sgData, function () {
    model.filter('maps', {}).ref('_page.maps');
    model.filter('sg', {}).ref('_page.sgs');
    page.render('home');
  });
});

app.get('/camp', function (page, model) {
  page.render('camp');
});

app.get('/sg/:id', function(page, model, params, next){
  var sgId = params.id;
  var sgData = model.query('sg', {_id: sgId});
  model.subscribe(sgData, function(){
    model.start('_page.mapId', 'sg', 'getMapIds');
    var map = model.query('maps', '_page.mapId');
    model.subscribe(map, function(){
      page.render('sg');
    });
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