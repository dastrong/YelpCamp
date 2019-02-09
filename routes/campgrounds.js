var express     = require("express"),
    router      = express.Router(),
    Campground  = require("../models/campground"),
    middleware  = require("../middleware"),
    geocoder    = require("geocoder"),
    Fuse        = require("fuse.js"),
    fetch       = require('node-fetch');
var {isLoggedIn, checkCampgroundOwnership} = middleware;

//=======INDEX========//
router.get("/", function(req, res){
  //  REMOVE ALL COMMENTS FROM CAMPGROUNDS
    // Campground.find({}, function(err, allCampgrounds) {
    //     var count = 0;
    //     allCampgrounds.forEach(function(campground){
    //         campground.ratings = [];
    //         campground.save();
    //         count++
    //         console.log(count)
    //     })
    // })
    if(req.query.search){
        var options = {
          shouldSort: true,
          threshold: 0.6,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ["name"]
        };
        var search = req.query.search;
        Campground.find({}, function(err, allCampgrounds){
            var fuse = new Fuse(allCampgrounds, options);
            var result = fuse.search(search);
            if(err) {
                console.log(err);
            } else {
                res.status(200).json(result);
            }
        });
    } else {
        (async function(){
            let baseURL = "https://webdevbootcamp-dastrong.c9users.io/campgrounds/api/";
            try {
                let data = await Promise.all([fetch(baseURL+"ratings"), fetch(baseURL+"recent")]);
                let topRated = (await data[0].json())[0];
                let mostRecent = (await data[1].json())[0];
                // eval(require('locus'))
                res.render("campground/index", {topRatedCampground:topRated, mostRecentCampground:mostRecent, page:"index"});   
            }
            catch(e) {
                console.log(e);
            }
        })();
    }
});


// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


//========CREATE=======//
router.post("/", isLoggedIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
        // IF THE LOCATION DOESN'T EXIST TRY AGAIN
        if(err || data.status === "ZERO_RESULTS"){
            req.flash("error", "Invalid Location");
            return res.redirect("back");
        }
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newCampground = {name:name, price:price, image:image, description:desc, author:author, location:location, lat:lat, lng:lng};
        Campground.create(newCampground, function(err, newlyCreated){
            if(err) {
                console.log(err);
            } else {
                req.flash("success", "Success! Check out your campground below");
                res.redirect("/campgrounds");  
            }
        }); 
    });
});


//========NEW==========//
router.get("/new", isLoggedIn, function(req, res){
    res.render("campground/new");
});


//========SHOW=========//
router.get("/:id", function(req, res){
  Campground.findById(req.params.id).populate("comments").populate("ratings").exec(function(err, foundCampground){
    if(err || !foundCampground){
      req.flash("error", "Campground not found");
      res.redirect("back");
    } else {
      if(foundCampground.ratings.length > 0){
        ratings(foundCampground, req);
      }
      res.render("campground/show", {campground: foundCampground});  
    }
  });
});

// WEATHER
async function fetchWeather(url){
  try {
    let data = await fetch(url);
    let parsedData = await data.json();
    return getWeatherInfo(parsedData);
  } catch (e) {
    console.log("Error: " + e);
  }
};

function getWeatherInfo(parsedData){
  let days = [[],[],[],[],[],[]];
  let currentDay = parsedData.list[0].dt_txt.slice(0,10);
  let y = 0;
  for(let i = 0; i < parsedData.list.length; i++){
  	let value = parsedData.list[i];
  	if(!value.dt_txt.includes(currentDay)){
  		y++;
  		currentDay = value.dt_txt.slice(0,10);
  	}
  	days[y].push(value);
  }
  let nextFourDays = days.slice(1,5);
  let nextFourDayData = [[],[],[],[]];
  for(let i = 0; i < nextFourDays.length; i++){
      let tempArr = [];
      let idArr = [];
      nextFourDays[i].forEach(function(day){
          tempArr.push(day.main.temp);
          idArr.push(day.weather[0].id);
      });
      let idObj = idArr.reduce((a,b)=>{a[b] ? a[b]++ : a[b] = 1; return a},{});
      nextFourDayData[i].maxTemp = Math.max(...tempArr);
      nextFourDayData[i].minTemp = Math.min(...tempArr);
      nextFourDayData[i].day = new Date(nextFourDays[i][0].dt_txt).toDateString().slice(0,3);
      nextFourDayData[i].id = getKeyByValue(idObj);
  }
  return nextFourDayData;
}

// GETS THE MOST FREQUENT KEY IN AN OBJECT
function getKeyByValue(obj){
	return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
}

// RATINGS SHOW PAGE LOGIC
function ratings(foundCampground, req){
    var ratingsValArr = foundCampground.ratings.map(x=> x.rating);
    var avgRating = ratingsValArr.reduce((acc, next)=>{return acc+next})/ratingsValArr.length; 
    foundCampground.rating = avgRating;
    if(req.user){
        var userHasRated = foundCampground.ratings.some(x=> x.author.id.equals(req.user._id));
        if(userHasRated){
            var currentUserRating = foundCampground.ratings.filter(x=> x.author.id.equals(req.user._id));
            foundCampground.currentUserRating = currentUserRating[0];
        }
        foundCampground.userHasRated = userHasRated;
    }
}


//========EDIT=========//
router.get("/:id/edit", checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campground/edit", {campground:foundCampground});
    });
});


//=======UPDATE========//
router.put("/:id", checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location , function(err, data){
        if(err || data.status === "ZERO_RESULTS"){
            req.flash("error", "Invalid Location");
            return res.redirect("back");
        }
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newData = {name:req.body.name, price:req.body.price, image:req.body.image, description:req.body.description, location:location, lat:lat, lng:lng};
        // UPDATE THE CAMPGROUND WITH NEW VARIABLES
        Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
          if(err){
              res.flash("error", err.message);
              res.redirect("/campgrounds");
          } else {
              req.flash("success", "Success! You've updated your campground");
              res.redirect("/campgrounds/" + campground._id);
          }
        });
    });
});

//=======DELETE========//
router.delete("/:id", checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Sorry! Something went wrong. Please try again.");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground Deleted");
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;