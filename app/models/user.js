var db = require('../config');
var bcrypt = require('bcrypt-nodejs');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      // var password = model.attributes.password;
      // console.log(password);
      // bcrypt.hash(password, null, null, function(err, hash) {
      //   model.set('password', hash);
      // });
    });
  }

});

module.exports = User;