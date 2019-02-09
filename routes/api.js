var express     = require("express"),
    router      = express.Router(),
    Campground  = require("../models/campground"),
    middleware  = require("../middleware"),
    Fuse        = require("fuse.js");
var {isLoggedIn, checkCampgroundOwnership} = middleware;


// SEARCH FEATURE
router.get("/search", function(req, res){
    
});


// HIGHEST RATED CAMPGROUNDS
router.get("/ratings", function(req, res){
    Campground.find().populate("ratings")
    .then(function(allCampgrounds){
        for(let i = 0; i < allCampgrounds.length; i++){
            let count = 0;
            for(let j = 0; j < allCampgrounds[i].ratings.length; j++){
                count += allCampgrounds[i].ratings[j].rating;
            }
            let totalRating = count/allCampgrounds[i].ratings.length;
            allCampgrounds[i].rating = totalRating;
        }
        allCampgrounds.sort(function(a,b){
            return b.rating-a.rating;
        });
        res.status(200).json(allCampgrounds);
    })
    .catch(function(err){
        console.log(err);
    });
});


// MOST RECENT CAMPGROUNDS
router.get("/recent", function(req, res){
    Campground.find()
    .then(function(allCampgrounds){
        var sorted = allCampgrounds.map(function(campground){
            return campground;
        }).sort(function(a,b){
            return b.createdAt-a.createdAt;
        });
        res.status(200).json(sorted);
    })
    .catch(function(err){
        console.log(err);
    });
});


module.exports = router;