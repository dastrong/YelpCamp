var express  = require("express"),
    router   = express.Router(),
    User     = require("../models/user"),
    passport = require("passport");

// ROOT ROUTE
router.get("/", function(req, res){
   res.render("landing");
});

// REGISTER FORM
router.get("/register", function(req, res){
   res.render("register", {page:"register"});
});

// REGISTER LOGIC
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username, email: req.body.email});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// LOGIN FORM
router.get("/login", function(req, res) {
  req.session.returnTo2 = req.headers.referer;
  res.render("login", {page:"login"});
});


// LOCAL LOGIN
router.post("/login", function(req, res, next) {
  passportAuth('local', req, res, next);
});

// FACEBOOK LOGIN
router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] }));
 
router.get("/auth/facebook/callback", function(req, res, next) {
  passportAuth('facebook', req, res, next);
});
  
//GOOGLE LOGIN
router.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));

router.get("/auth/google/callback", function(req, res, next) {
  passportAuth('google', req, res, next);
});

//logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.session.destroy();
  // req.flash("success", "You've been logged out. See you next time!");
  res.redirect("/campgrounds");
});

// AUTHENTICATE A USER WITH PASSPORT
function passportAuth(type, req, res, next) {
  passport.authenticate(type, function(err, user, info) {
    if(err){
      req.flash("error", err.message);
      return res.redirect("/login");
    }
    if(!user){
      if(type === 'facebook'){
        req.flash("error", "Your Facebook email does not match a user's email. Please register an account first, then you can sign in through Facebook");
      } else if(type === 'google') {
        req.flash("error", "Your Google+ email does not match a user's email. Please register an account first, then you can sign in through Google+");
      } else {
        req.flash("error", "Username or Password are incorrect. Please, try again.");
      }
      return res.redirect('/login');
    } 
    req.logIn(user, function(err) {
      if(err) return next(err);
      req.flash("success", `Welcome Back, ${req.user.username}`);
      return res.redirect(req.session.returnTo || req.session.returnTo2 || req.headers.referer);
    });
  })(req, res, next);
}

module.exports = router;