var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tablename: 'users',
  hasTimestamps: true,

  initialize: function() {
    console.log('ANYTHING');
    this.on('creating', function(model, attrs, options) {
      console.log('ATTRS', attrs);


    });
  }
  
});

module.exports = User;