// all the middle ware goes here
var Campground      = require("../models/campground"),
    Comment         = require("../models/comment"),
    Rating          = require("../models/rating"),
    middlewareObj   = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground) {
           if(err || !foundCampground){
               req.flash("error", "Campground not found");
               res.redirect("back");
           } else {
               if(foundCampground.author.id.equals(req.user._id)){
                    next();
               } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
               }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
           if(err || !foundComment){
               req.flash("error", "Comment not found");
               res.redirect("back");
           } else {
               // does user own the comment?
               if(foundComment.author.id.equals(req.user._id)){
                    next();
               } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
               }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    // PASSING THE URL OF THE PAGE THEY COULDN'T ACCESS BECAUSE THEY WEREN'T LOGGED IN
    req.session.returnTo = req.headers.referer; 
    // IF THEY ARE TRYING TO CREATE A NEW CAMPGROUND THIS WILL REDIRECT THEM TO THE NEW FORM ONCE LOGGED IN
    if(req.originalUrl === '/campgrounds/new'){
        req.session.returnTo = req.originalUrl; 
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect('/login');
};

middlewareObj.checkRatingOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Rating.findById(req.params.rating_id, function(err, foundRating){
            if(err || !foundRating){
                req.flash("error", "Rating not found");
                return res.redirect("back");
            }
            if(foundRating.author.id.equals(req.user._id)) return next();    
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    }
};

module.exports = middlewareObj;