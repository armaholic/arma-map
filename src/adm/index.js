var derby = require('derby');
var path = require('path');

var adminApp = module.exports = derby.createApp('adminApp', __filename);

if (!derby.util.isProduction) global.adminApp = adminApp;

adminApp.serverUse(module, 'derby-stylus');
adminApp.loadViews(path.join(__dirname, '/../../views/adm'));
adminApp.loadStyles(path.join(__dirname, '/../../styles/adm'));
adminApp.use(require('derby-login/components'));
adminApp.component(require('./../../components/login-dropdown'));

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


adminApp.proto.delUser = function(userId){
  this.model.del('users.' + userId);
};

adminApp.proto.editTodo = function(user){

  this.model.set('_page.edit', {
    id: user.id,
    text: user.text
  });

  window.getSelection().removeAllRanges();
  document.getElementById(user.id).focus()
}

adminApp.proto.doneEditing = function(user){
  this.model.set('users.'+user.id+'.text', user.text);
  this.model.set('_page.edit', {
    id: undefined,
    text: ''
  });
}

adminApp.proto.cancelEditing = function(e){
  if (e.keyCode == 27) {
    this.model.set('_page.edit.id', undefined);
  }
}


adminApp.get('/adm', function getPage(page, model) {
  page.render('dashboard');
});

adminApp.get('/adm/users', function getPage(page, model) {
  model.subscribe('users', function () {
    model.filter('users', {}).ref('_page.users');
    page.render('users');
  });
});
adminApp.get('/adm/maps', function getPage(page, model) {
  model.subscribe('maps', function () {
    model.filter('maps', {}).ref('_page.maps');
    page.render('maps');
  });
});

