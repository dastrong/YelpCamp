var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        name: "Mountain View", 
        image: "https://farm3.staticflickr.com/2887/33474420866_edd950d5dd.jpg",
        description: "Bacon ipsum dolor amet shoulder ham bacon beef bresaola hamburger, ribeye brisket alcatra swine short loin kielbasa. T-bone kielbasa pig boudin prosciutto pancetta. Tail shoulder tri-tip, ham meatball bacon spare ribs. Andouille cow turkey biltong. Meatloaf tongue prosciutto andouille picanha. Salami landjaeger beef biltong andouille flank. Tail pork leberkas, beef jerky burgdoggen alcatra strip steak."
    },
    {
        name: "River View", 
        image: "https://farm5.staticflickr.com/4382/36634380815_e79c276431.jpg",
        description: "Bacon ipsum dolor amet shoulder ham bacon beef bresaola hamburger, ribeye brisket alcatra swine short loin kielbasa. T-bone kielbasa pig boudin prosciutto pancetta. Tail shoulder tri-tip, ham meatball bacon spare ribs. Andouille cow turkey biltong. Meatloaf tongue prosciutto andouille picanha. Salami landjaeger beef biltong andouille flank. Tail pork leberkas, beef jerky burgdoggen alcatra strip steak."
    },
    {
        name: "Lake View", 
        image: "https://farm3.staticflickr.com/2922/33016750230_e45807442b.jpg",
        description: "Bacon ipsum dolor amet shoulder ham bacon beef bresaola hamburger, ribeye brisket alcatra swine short loin kielbasa. T-bone kielbasa pig boudin prosciutto pancetta. Tail shoulder tri-tip, ham meatball bacon spare ribs. Andouille cow turkey biltong. Meatloaf tongue prosciutto andouille picanha. Salami landjaeger beef biltong andouille flank. Tail pork leberkas, beef jerky burgdoggen alcatra strip steak."
    }
];


function seedDB(){
    //REMOVE ALL CAMPGROUNDS
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("Removed Campgrounds!");
        Comment.remove({}, function(err){
            if(err){
                console.log(err);
            } else {
                console.log("Removed Comments!");
                // ADD A FEW CAMPGROUNDS
                data.forEach(function(seed){
                    Campground.create(seed, function(err, campground){
                        if(err){
                            console.log(err);
                        } else {
                            console.log("added a campground");
                            // CREATE A COMMENT
                            Comment.create(
                                {
                                    text: "This place is great",
                                    author: "Homer"
                                }, function(err, comment){
                                    if(err){
                                        console.log(err);
                                    } else {
                                        campground.comments.push(comment);
                                        campground.save();
                                        console.log("Create new comment");
                                    }
                                });
                        }
                    });
                });
            }
        });
    });
}

module.exports = seedDB;