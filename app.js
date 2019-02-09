var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local").Strategy,
    FacebookStrategy = require("passport-facebook").Strategy,
    GoogleStrategy  = require("passport-google-oauth").OAuth2Strategy,
    methodOverride  = require("method-override"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    // seedDB          = require("./seeds"),
    User            = require("./models/user");

// REQUIRING ROUTES
var commentRoutes       = require("./routes/comments"),    
    campgroundRoutes    = require("./routes/campgrounds"), 
    ratingRoutes        = require("./routes/rating"),
    indexRoutes         = require("./routes/index"),
    apiRoutes           = require("./routes/api");

//=============================================================//

mongoose.Promise = global.Promise;
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(url, {useMongoClient: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// APP.locals persist for the life of the application
app.locals.moment = require("moment");
// seedDB(); //seed the database

//=================PASSPORT CONFIGURATION======================//

app.use(require("express-session")({
    secret: "Once again Mika wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

//=============================================================//

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.use(new FacebookStrategy({
  clientID: 907965069370166,
  clientSecret: "dad6936f50b8dd3e817f0595ec292933",
  callbackURL: "https://webdevbootcamp-dastrong.c9users.io/auth/facebook/callback",
  profileFields: ['id', 'name', 'email']
  },
  function(accessToken, refreshToken, profile, done){
    authCB(...arguments);
  }
));
passport.use(new GoogleStrategy({
    clientID: '359583165231-toucml7cjd1oj9s3rumgi0d0qop6adpu.apps.googleusercontent.com',
    clientSecret: 'gcItBZOq9BxW_E0L_i9ldfSP',
    callbackURL: "https://webdevbootcamp-dastrong.c9users.io/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done){
    authCB(...arguments);
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

//=============================================================//

app.use(function(req, res, next){
    // RES.locals -- only value for the lifetime of the request
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    next();
});

//=============================================================//

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/rating", ratingRoutes);
app.use("/campgrounds/api", apiRoutes);

//=============================================================//
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Yelp is Open for Business"); 
});


function authCB(accessToken, refreshToken, profile, done){
  User.findOne({'email': profile.emails[0].value}, function(err, user){
    if(err){  return done(err);}
    if(user){ return done(null, user); } 
    else {    return done(null); }
  });
}