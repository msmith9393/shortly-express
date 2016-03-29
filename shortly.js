var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('client-sessions');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  cookieName: 'session',
  secret: 'anlensoibnanfoiergbkrjdnsdrgar',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

app.get('/', util.isAuthenticated,
function(req, res) {
  res.render('index');
});

app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: 'http://127.0.0.1:4568/links'
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/signup', function(req, res) {
  res.render('signup');
});


app.post('/signup', function(req, res) {
  var username = req.body.username;
  new User({username: username})
  .fetch().then(function(found) {
    // if user in database
    if (found) {
      console.log('found was found', found);
    // you already have an accout, please log in (Maybe redirect to login page)
      res.redirect('/login');
    // otherwise
    } else {
    // add new user to the database, hash/salt password, make sure to set session that keeps user logged in
    // log them in send to '/'
      Users.create({
        username: req.body.username,
        password: req.body.password
      }).then(function(newUser) {
        res.render('login');
      });
    }
  })
  .catch(function(err) {
    console.error('error is = ', err);
  });
});

app.get('/login', function(req, res) {
  res.render('login');
});


// util.isAuthorized check if user password is the one in the database
app.post('/login', function(req, res) {
  // create a session to keep them logged in
  // redirect them to index page
  new User({username: req.body.username})
    .fetch().then(function(user) {
      console.log('USER', user)
      if (user) {
        console.log('USER WAS FOUND!', user);
        console.log('USER PASSWORD', user.attributes.password);
        if (req.body.password === user.attributes.password) {
          req.session.user = user;
          console.log('SESSION USER!', req.session.user);
          res.redirect('/');
        } else {
          console.log('RENDERING');
          res.render('login', {error: 'Invalid email or password'});
        }
      }
    }).catch(function(err) {
      console.error('Invalid username or password', err);
    });

});


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
