module.exports = {
  // db collection
  collection: 'auths',
  // projection of db collection
  publicCollection: 'users',
  // passportjs options
  passport: {
    successRedirect: '/',
    failureRedirect: '/',
    registerCallback: function (req, res, user, done) {
      var model = req.getModel();
      var $user = model.at('auths.' + user.id);
      model.fetch($user, function () {
        $user.set('displayName', $user.get('google.displayName'));
        $user.set('username', $user.get('google.name.givenName') + ' ' + $user.get('google.name.familyName'));
        $user.set('profileUrl', $user.get('google._json.link'));
        $user.set('email', $user.get('google._json.email'));
        $user.set('avatar', $user.get('google._json.picture'));
        done();
      })
    }
  },
  strategies: {
    google: {
      strategy: require('passport-google-oauth').OAuth2Strategy,
      conf: {
        clientID: '853927240280-hsc6maml117dau8cegd5907gnccqps4f.apps.googleusercontent.com',
        clientSecret: 'YkkDSi5s0IZ25WFACG0Uepe3',
        callbackURL: 'http://localhost:8080/auth/google/callback',
        scope: 'https://www.googleapis.com/auth/plus.login  https://www.googleapis.com/auth/userinfo.email',
        realm: 'http://localhost:8080',
        tokenURL: 'https://accounts.google.com/o/oauth2/token'
      }
    },
  },
  // projection
  user: {
    id: true,
    displayName: true,
    username: true,
    profileUrl: true,
    email: true,
    avatar: true,
    online: true,
    group: true
   }
}