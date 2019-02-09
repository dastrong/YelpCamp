var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Campground  = require("../models/campground"),
    Rating      = require("../models/rating"),
    middleware  = require("../middleware"),
    {isLoggedIn, checkRatingOwnership} = middleware;

// PASSWORD RESET
// LOAD THE TOP CAMPGROUNDS ON THE FRONT END
  // THIS WILL KEEP THE LOADING OF THE INDEX PAGE NICER
// ADD THE CURRENT RATING STARS ON THE INDEX CAMPGROUNDS THUMBNAIL
// MOVE SCRIPTS TO SCRIPT FILE

// ADD SEARCH LOGIC TO API ROUTES
// ON MOBILE WHEN A USER CLICKS MOST RECENT THEY HAVE TO SCROLL PAST THE TOP RATED CAMPGROUND TOO
    // CSS GRID CAN FIX THIS, I THINK

// ======== NEXT MEETUP ======== //
// MAKE THE COMMENTS SECTION NICER


router.post("/", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("back");
        // CHECKS IF THE RATING IS EMPTY
        } else if (req.body.rating.rating) {
            Rating.create(req.body.rating, function(err, rating){
                if(err){
                    req.flash("error", "Something went wrong");
                    res.redirect("back");
                }
                rating.author.id = req.user._id;
                rating.author.username = req.user.username;
                rating.save();
                campground.ratings.push(rating);
                campground.save();
                req.flash("success", `Successfully rated ${campground.name}`);
                res.redirect('/campgrounds/' + campground._id);
            });
        // RATING WAS EMPTY
        } else {
            req.flash("info", "Please select a rating");
            res.redirect('/campgrounds/' + campground._id);
        }
    });
});


router.put("/:rating_id", checkRatingOwnership, function(req, res){
    if(req.body.rating.rating){
        Rating.findByIdAndUpdate(req.params.rating_id, req.body.rating, function(err, updatedRating){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else if(req.body.rating.rating == updatedRating.rating){
                req.flash("info", "That's the same rating that you left before");
                res.redirect("back");
            } else {
                req.flash("success", "We've updated your rating");
                res.redirect("back");
            }
        });
    } else {
        req.flash("info", "Please select a rating");
        res.redirect('/campgrounds/' + req.params.id);
    }
});
    
module.exports = router;