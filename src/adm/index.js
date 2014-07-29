var derby = require('derby');
var path = require('path');

var adminApp = module.exports = derby.createApp('adminApp', __filename);

if (!derby.util.isProduction) global.adminApp = adminApp;

adminApp.serverUse(module, 'derby-stylus');
adminApp.loadViews(path.join(__dirname, '/../../views/adm'));
adminApp.loadStyles(path.join(__dirname, '/../../styles/adm'));
adminApp.use(require('derby-login/components'));
adminApp.component(require('./../../components/login-dropdown'));
adminApp.use(require('./../../components/d-bootstrap'));

adminApp.proto.create = function (model, dom) {
  //require('./../../public/js/routie.min.js');
}


adminApp.proto.sendModal = function(action, cancel) {
  if (!this.model.get('_page.mapName') || !this.model.get('_page.mapTiles') || !this.model.get('_page.mapCRC')) cancel();
};
adminApp.proto.hideModal = function(action, cancel) {};

adminApp.proto.addMap = function(){
  var mapName = this.model.get('_page.mapName');
  var mapTiles = this.model.get('_page.mapTiles');
  var mapCRC = this.model.get('_page.mapCRC');

  if (!mapName || !mapTiles) return;

  this.model.add('maps', {
    mapName: mapName,
    mapTiles: mapTiles,
    mapCRC: mapCRC
  });

  this.model.set('_page.mapName', '');
  this.model.set('_page.mapTiles', '');
  this.model.set('_page.mapCRC', '');
};

adminApp.proto.delMap = function(mapId){
  this.model.del('maps.' + mapId);
};

/*adminApp.proto.editMap = function(){
  var mapName = this.model.get('_page.mapName');
  var mapTiles = this.model.get('_page.mapTiles');
  var mapCRC = this.model.get('_page.mapCRC');

  if (!mapName || !mapTiles) return;

  this.model.set('maps', {
    mapName: mapName,
    mapTiles: mapTiles,
    mapCRC: mapCRC
  });

  this.model.set('_page.mapName', '');
  this.model.set('_page.mapTiles', '');
  this.model.set('_page.mapCRC', '');
}*/


adminApp.get('*', function (page, model, params, next) {
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

adminApp.get('/adm', function(page, model, params, next) {
  page.render('dashboard');
});

adminApp.get('/adm/users', function(page, model, params, next) {
  model.subscribe('users', function () {
    model.filter('users', {}).ref('_page.users');
    page.render('users');
  });
});
adminApp.get('/adm/maps', function(page, model, params, next) {
  model.subscribe('maps', function () {
    model.filter('maps', {}).ref('_page.maps');
    page.render('maps');
  });
});
/*adminApp.get('/adm/map/:id', function(page, model, params, next) {
  model.subscribe('maps', function () {
    model.filter('maps', {}).ref('_page.maps');
    page.render('maps');
  });
});*/
adminApp.get('/adm/camp', function(page, model, params, next) {
  model.subscribe('camp', function () {
    model.filter('camp', {}).ref('_page.camp');
    page.render('camp');
  });
});

