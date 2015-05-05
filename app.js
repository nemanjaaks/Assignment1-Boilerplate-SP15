//dependencies for each module used
var express = require('express');
var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var dotenv = require('dotenv');
var Instagram = require('instagram-node-lib');
var mongoose = require('mongoose');
var graph = require('fbgraph');
var app = express();


var sess;
//local dependencies
var models = require('./models');

//client id and client secret here, taken from .env
dotenv.load();
var INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
var INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
var INSTAGRAM_CALLBACK_URL = process.env.INSTAGRAM_CALLBACK_URL;
var INSTAGRAM_ACCESS_TOKEN = "";
/*var INSTAGRAM_CLIENT_ID = "e6d663c0c7a049d3ae401efcda46778c";
var INSTAGRAM_CLIENT_SECRET = "e897dde9c56d4b6ca733da27935d8ff6";
var INSTAGRAM_CALLBACK_URL = "http://cogsassignment1.herokuapp.com";
var INSTAGRAM_ACCESS_TOKEN = "";*/
Instagram.set('client_id', INSTAGRAM_CLIENT_ID);
Instagram.set('client_secret', INSTAGRAM_CLIENT_SECRET);


//facebook client and secrets
var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
var FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL;



//connect to database
mongoose.connect(process.env.MONGODB_CONNECTION_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Database connected succesfully.");
});

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Instagram profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.
passport.use(new InstagramStrategy({
        clientID: INSTAGRAM_CLIENT_ID,
        clientSecret: INSTAGRAM_CLIENT_SECRET,
        callbackURL: INSTAGRAM_CALLBACK_URL,
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
           if(true){
               console.log("InstaSignIn with profile" + profile);
               models.User.findOne({'ig_id':profile.id}, function(err,user){
                  if(err){
                      return done(err);
                  }
                  if(user){
                      //User entry exists
                      console.log('User entry exits' );
                      sess.ig_id = profile.id;
                      user.ig_id =profile.id;
                      user.name = profile.username;
                      user.full_name = profile._json.data.full_name;
                      user.access_token = accessToken;
                      user.bio = profile._json.data.bio;
                      user.photo = profile._json.data.profile_picture;
                      user.follows_count = profile._json.data.counts.follows;
                      user.follower_count = profile._json.data.counts.followed_by;
                      user.media_count = profile._json.data.counts.media;
                      user.save(function(err){
                          if(err){
                              return done(err);
                          }
                          else{
                              return done(null,user);
                          }
                      });
                  }

                  else{
                      //create user
                      var usr = new models.User();
                      sess.ig_id = profile.id;
                      usr.ig_id =profile.id;
                      usr.name = profile.username;
                      usr.full_name = profile._json.data.full_name;
                      usr.access_token = accessToken;
                      usr.bio = profile._json.data.bio;
                      usr.photo = profile._json.data.profile_picture;
                      usr.follows_count = profile._json.data.counts.follows;
                      usr.follower_count = profile._json.data.counts.followed_by;
                      usr.media_count = profile._json.data.counts.media;
                      usr.save(function(err){
                          if(err){
                              return done(err);
                          }
                          else{
                              return done(null,usr);
                          }
                      });
                  }
               });
           }
           /*else{
               models.User.findOne({'_id':req.user._id}, function(err, user){
                   if(err){
                       return done(err);
                   }
                   else{
                       user.ig_id=profile.id;
                       user.name = profile.username;
                       user.full_name = profile._json.data.full_name;
                       user.access_token = accessToken;
                       user.bio = profile._json.data.bio;
                       user.photo = profile._json.data.profile_picture;
                       user.follows_count = profile._json.data.counts.follows;
                       user.follower_count = profile._json.data.counts.followed_by;
                       user.media_count = profile._json.data.counts.media;
                       user.save(function(err){
                           if(err){
                               return done(err);
                           }
                           else{
                               return done(null,user);
                           }
                       });
                   }
               });
           }*/
        });
    }
));









/*











passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_CLIENT_ID,
    clientSecret: INSTAGRAM_CLIENT_SECRET,
    callbackURL: INSTAGRAM_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    console.log(JSON.stringify(profile));
    models.User.findOrCreate({
      "name": profile.username,
      "ig_id": profile.id,
      "photo": profile.profile_picture,
      "access_token": accessToken 
    }, function(err, user, created) {
      // created will be true here
       if(created){

           console.log('ITS TRUE');
           console.log(user);
           user.access_token = accessToken;
           user.save();
           return done(null,user);

       }
       else{
           console.log('ITS FALSE');
           models.User.findOrCreate({}, function(err, user, created) {
               user.ig_id = profile.id;
               user.access_token = accessToken;
               user.save();

               console.log(user.ig_id);
               // created will be false here
               process.nextTick(function () {
                   // To keep the example simple, the user's Instagram profile is returned to
                   // represent the logged-in user.  In a typical application, you would want
                   // to associate the Instagram account with a user record in your database,
                   // and return that user instead.

                   return done(null, user);
               });
           });
       }
    });
  }
));
*/
//Use a facebook strateg
/*
passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: FACEBOOK_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile.profileUrl);
        models.fbUser.findOrCreate({
            "first_name" : profile.name.givenName,
            "last_name" : profile.name.familyName,
            "fb_id" : profile.id,
            "access_token" : accessToken,
            "link" : profile.profileUrl
        }, function(err, user, created) {
            //Created will be true here
            if(!user){
                console.log('User does not exist, aka it has not been created');
                user.access_token = accessToken;
                user.save();
            }

            if (err) { return done(err); }

            return done(null, user);
        });
    }
));



*/
passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: FACEBOOK_CALLBACK_URL,
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            if(true){
                models.fbUser.findOne({'fb_id':profile.id}, function(err,user){
                    sess = req.session;
                    if(err){
                        return done(err);
                    }
                    if(user){
                        //User entry exists
                        console.log('User entry exits' );

                        sess.fb_id = profile.id;
                        user.fb_id =profile.id;
                        user.last_name = profile.name.familyName;
                        user.first_name= profile.name.givenName;
                        user.access_token = accessToken;
                        user.bio = profile._json.bio;
                        user.hometown = profile._json.hometown.name;
                        user.location = profile._json.location.name;
                        user.link = profile.profileUrl;
                        user.save(function(err){
                            if(err){
                                return done(err);
                            }
                            else{
                                return done(null,user);
                            }
                        });
                    }

                    else{
                        //create user
                        var usr = new models.fbUser();
                        sess.fb_id = profile.id;
                        usr.fb_id =profile.id;
                        usr.last_name = profile.name.familyName;
                        usr.first_name= profile.name.givenName;
                        usr.access_token = accessToken;
                        usr.bio = profile._json.bio;
                        usr.hometown = profile._json.hometown.name;
                        usr.location = profile._json.location.name;
                        usr.link = profile.profileUrl;
                        usr.save(function(err){
                            if(err){
                                return done(err);
                            }
                            else{
                                return done(null,usr);
                            }
                        });
                    }
                });
            }
            /*else{
                models.fbUser.findOne({'_id':req.user._id}, function(err, user){
                    if(err){
                        return done(err);
                    }
                    else{
                        user.fb_id =profile.id;
                        user.last_name = profile.name.familyName;
                        user.first_name= profile.name.givenName;
                        user.access_token = accessToken;
                        user.bio = profile._json.bio;
                        user.hometown = profile._json.hometown.name;
                        user.location = profile._json.location.name;
                        user.link = profile.profileUrl;
                        user.save(function(err){
                            if(err){
                                return done(err);
                            }
                            else{
                                return done(null,user);
                            }
                        });
                    }
                });
            }*/
        });
    }
));

//Configures the Template engine
app.engine('handlebars', handlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true}));
app.use(passport.initialize());
app.use(passport.session());


//set environment ports and start application
app.set('port', process.env.PORT || 3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); 
  }
  res.redirect('/login');
}


function ensureAuthenticatedFacebook(req, res, next) {
    console.log('FBauth is called auth');
    console.log('1AuthFB'+JSON.stringify(req.user));
    if (req.isAuthenticated() && !!sess.fb_id) {
        return next();
    }
    res.redirect('/login');
}

function ensureAuthenticatedInstagram(req, res, next) {
    if (req.isAuthenticated() && !!req.user.ig_id) {
        console.log('AuthINSTA'+req.user.ig_id);
        return next();
    }
    res.redirect('/login');
}

//routes
app.get('/', function(req, res){
  sess = req.session;
  res.render('login');
  sess.fb_id;
  sess.ig_id;
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
    sess = req.session;
    sess.fb_id;
    sess.ig_id;
});

app.get('/account', ensureAuthenticatedInstagram, function(req, res){
  console.log('req contains'+JSON.stringify(req.user));
    sess = req.session;
    sess.ig_id=req.user.ig_id;
  res.render('account', {user:req.user});
});

app.get('/photos', ensureAuthenticatedInstagram, function(req, res){
    console.log('PHOTOS for '+ req.user.ig_id);
  var query  = models.User.where({ ig_id: req.user.ig_id });
  query.findOne(function (err, user) {
    if (err) return handleError(err);
    if (user) {
      // doc may be null if no document matched
        console.log('PHOTOS for '+ user);
      Instagram.users.self({

        access_token: user.access_token,
        complete: function(data) {
          //Map will iterate through the returned data obj
          var imageArr = data.map(function(item) {
            //create temporary json object
            tempJSON = {};
            tempJSON.user = req.user.username;
            tempJSON.photo_id = item.id;
            tempJSON.poster = item.user;
            tempJSON.caption = item.caption;
            tempJSON.url = item.images.low_resolution.url;
            //insert json object into image array
            return tempJSON;
          });
          res.render('photos', {photos: imageArr});
        }
      });
    }
  });
});


// GET /auth/instagram
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Instagram authentication will involve
//   redirecting the user to instagram.com.  After authorization, Instagram
//   will redirect the user back to this application at /auth/instagram/callback
app.get('/auth/instagram',
  passport.authenticate('instagram', {scope:'likes'}),
  function(req, res){
    // The request will be redirected to Instagram for authentication, so this
    // function will not be called.
  });

// GET /auth/instagram/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login'}),
  function(req, res) {
    res.redirect('/account');
  });

app.post('/like',ensureAuthenticated, function(req,res){
    console.log('---'+req.body.user);
    var query  = models.User.where({ name: req.body.user});
    query.findOne(function (err, user) {
        if (err) return handleError(err);
        if (user) {
            /*
             ---- LIKE method that would work if the API allowed-----

            Instagram.media.like({
                access_token: user.access_token,
                media_id: req.body.photo_id,
                complete: function (data) {
                    res.redirect('/account');
                }
            });
            */
            res.redirect('/photos');
        }
    });
});


// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook', {scope : ['user_photos', 'user_friends','user_posts', 'read_stream', 'user_about_me', 'user_hometown', 'user_location']}));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {successRedirect: '/facebook-account', failureRedirect: 'back' }));


app.get('/facebook-account',ensureAuthenticatedFacebook, function(req, res){
    sess = req.session;
    if(sess.fb_id != null){
        sess.fb_id = req.user.fb_id;
    }
    console.log('INSIDE FB ACC'+req.user);
    var query = models.fbUser.where({fb_id: req.user.fb_id});
    query.findOne(function(err,user){
        if(err) return handleError(err);
        if(user){
            graph.setAccessToken(req.user.access_token);

            /*
            graph.get('me/home?filter=app_2392950137',  function(err, response){
                console.log(response);
                res.render('facebook-account', {user: req.user, url:response});
            });

            */
            graph.get('me', function(error, response){
                console.log(response);
                graph.get('me/picture?width=150&height=150', function(errr, inner_res){
                    res.render('facebook-account', {user: req.user, me: response , picture: inner_res.location});
                });


            });

        }
    });

});


app.get('/facebook-videos', ensureAuthenticatedFacebook,function(req,res){
    console.log('INSIDE FB ACC'+req.user);
    var query = models.fbUser.where({fb_id: sess.fb_id});
    query.findOne(function(err,user){
        if(err) return handleError(err);
        if(user){
            graph.setAccessToken(user.access_token);

            graph.get('me/home?filter=app_2392950137',  function(err, response){
                console.log(response);
                res.render('facebook-videos', {user: user, url:response});
            });

        }
    });




});

app.get('/logout', function(req, res){
  req.logout();
  req.session.destroy(function(err){
      if(err){
          console.log(err);
      }
      else
      {
          res.redirect('/');
      }
  });
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
