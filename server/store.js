var liveDbMongo = require('livedb-mongo');
var coffeeify = require('coffeeify');

module.exports = store;

function store(derby) {

  derby.use(require('racer-bundle'));
  //derby.use(require('racer-schema'), require('./schema'));

  var opts = {db: liveDbMongo(process.env.MONGO_URL + '?auto_reconnect', {safe: true})};

  var store = derby.createStore(opts);

  store.on('bundle', function(browserify) {

    browserify.transform({global: true}, coffeeify);

    var pack = browserify.pack;
    browserify.pack = function(opts) {
      var detectTransform = opts.globalTransform.shift();
      opts.globalTransform.push(detectTransform);
      return pack.apply(this, arguments);
    };
  });

  store.shareClient.backend.addProjection('sg', 'briefings', 'json0', {id: true, mapId: true, userId: true, markers: true, timestamps: true});

  return store;
}