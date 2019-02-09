var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware");
var {isLoggedIn, checkCommentOwnership} = middleware;

// COMMENTS NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campgrounds by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            res.render("comments/new", {campground:campground});
        }
    });
});

// COMMENTS CREATE
router.post("/", isLoggedIn, function(req, res){
     // look up campground using id
     Campground.findById(req.params.id, function(err, campground){
         if(err){
             req.flash("error", "Campground not found");
             res.redirect("back");
         } else {
             Comment.create(req.body.comment, function(err, comment){
                 if(err){
                     req.flash("error", "Something went wrong");
                     res.redirect("back");
                 } else {
                     // add username and id to comment
                     comment.author.id = req.user._id;
                     comment.author.username = req.user.username;
                     // save comment
                     comment.save();
                     campground.comments.push(comment);
                     campground.save();
                     req.flash("success", "Successfully added a comment");
                     res.redirect("/campgrounds/" + campground._id);
                 }
             });
         }
     });
});


// COMMENTS EDIT FORM
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
           req.flash("error", "Campground not found");
           return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "Comment not found");
                res.redirect("back");   
            } else {
                res.render("comments/edit", {campground_id:req.params.id, comment: foundComment});
            }
        });
    });
});


// COMMENTS UPDATE
router.put("/:comment_id", checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.flash("error", "Comment not found");
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


// COMMENTS DELETE
router.delete("/:comment_id", checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.flash("error", "Comment not found");
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});


module.exports = router;