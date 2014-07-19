module.exports = Maps;
function Maps() {}
Maps.prototype.name = 'Maps';
Maps.prototype.view = __dirname;

Maps.prototype.create = function (model, dom) {

  var b = 0.5859375 / 15.36, c = L.latLng([0, 0]);
  var mapTiles = '/tiles/chernarus_new/{z}/{x}_{y}.jpg';
  var mapOptions = {
    attribution: '',
    maxZoom: 6,
    minZoom: 1,
    continuousWorld: false,
    noWrap: true,
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

  var map = L.mapbox.map('map-app')
    .addLayer(L.tileLayer(mapTiles, mapOptions))
    .setView([7.5, 7], 3);

  var canvasTiles = L.tileLayer.canvas();

  canvasTiles.drawTile = function(canvas, tilePoint, zoom) {
    var ctx = canvas.getContext('2d');
  };

  canvasTiles.addTo(map);
  map.zoomControl.setPosition('bottomright');


/*  var coordinates = document.getElementById('coordinates'),
    markerCoordinates = document.getElementById('markerCoordinates'),
    gpsCoordinates = document.getElementById('gpsCoordinates'),
    editorCoordinates = document.getElementById('editorCoordinates');

  var b = 0.5859375 / 15.36, c = L.latLng([0, 0]);
  var mapTiles = '/tiles/chernarus_new/{z}/{x}_{y}.jpg';

  var mapboxTiles = L.tileLayer(mapTiles, {
      attribution: null,
      attributionControl: false,
      maxZoom: 6,
      minZoom: 1,
      continuousWorld: false,
      noWrap: true,
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
    }
  );

  var map = L.mapbox.map('map-app')
    .addLayer(mapboxTiles)
    .setView([7.5, 7], 3);

  var canvasTiles = L.tileLayer.canvas();

  canvasTiles.drawTile = function (canvas, tilePoint, zoom) {
    var ctx = canvas.getContext('2d');
  };
  canvasTiles.addTo(map);

  map.zoomControl.setPosition('bottomright');

  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  var drawControl = new L.Control.Draw({
    draw: {
      marker: {
        icon: L.mapbox.marker.icon({
          'marker-color': 'ff8888'
        })
      }
    },
    edit: {
      featureGroup: drawnItems
    },
    position: 'bottomright'
  });
  map.addControl(drawControl);

  map.on('draw:created', function(e) {
    drawnItems.addLayer(e.layer);
  });

  map.on("mousemove", function (e) {
    coordinates.innerHTML = 'Latitude: ' + e.latlng.lat + '<br />Longitude: ' + e.latlng.lng;
    gpsCoordinates.innerHTML = fromLatLngToGps(e.latlng);

    var Xin = e.latlng.lng * 100;
    var Yin = 15360 - e.latlng.lat * 100;
    var heading = 0;
    editorCoordinates.innerHTML = '[' + heading + ',[' + Xin + ',' + Yin + ',0]]';
  });*/

}


function calculateCoords(m) {
  var Xin = m.lng * 100;
  var Yin = 15360 - m.lat * 100;
  var heading = 0;

  editorCoordinates.innerHTML = '[' + heading + ',[' + Xin + ',' + Yin + ',0]]';
}

var mapUpdateHash = function () {
  var a = Map.getCenter(),
    a = "#" + Map.getZoom() + "." + fromCoordToGps(a.lng) + "." + fromCoordToGps(a.lat);
};

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