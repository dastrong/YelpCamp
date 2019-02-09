# YelpCamp

### What is it?
My *first* big project is a site to hold user-created campground sites. 

### Why did I make this?
This was the main project created in Colt Steele's Web Developer Bootcamp course. 

### What sets my project apart from others?
After completing the base project, I made some custom add-ons which included:
- creating dynamic page redirects 
- adding current and future weather forecasts using the OpenWeatherAPI for the
    - locations for forecasts were obtained through the Google Maps API
- changing the main page layout into two sections:
    - Most Recent Campgrounds
    - Top Rated Campgrounds
        - created a stars-based rating system for this
- creating pagination from the ground up
- adding a fuzzy search option using Fuse.js 
- implementing social login capability (Facebook & Google)

### Want to try locally?
- `git clone` the project
- `cd` into project folder
- `npm i` dependencies
- apply the following environment variables through your CLI:
```
DATABASEURL=mongoUrlHere
MAPS_KEY=googleMapsKeyHere
WEATHER_KEY=openWeatherKeyHere
```
- `nodemon` or `npm start` to start server
- Open your browser

**Note:** No live version of this site currently 
