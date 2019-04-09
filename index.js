const express = require('express')
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const app = express()
const fetch = require('node-fetch')
const models = require('./models')
geocodeApi = "c8bb868a5cf89ccfca4b5a8bc25cf8ca7bb7c70"

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(bodyParser.urlencoded({extended:false}))


app.get('/state-details/', (req,res) => {
    res.render('stateDetails')
})


app.post('/state-details', (req,res) => {
    let state = req.body.state.toUpperCase();
    let city = req.body.city
    let locationType = req.body.locationType.toLowerCase();
    fetch(`https://api.geocod.io/v1.3/geocode?city=${city}&state=${state}&api_key=${geocodeApi}`)
.then(response => response.json())
.then(result => {
    let cityCoord = {lat:result.results[0].location.lat, long:result.results[0].location.lng}
        fetch(`https://developer.nps.gov/api/v1/${locationType}?api_key=YM83j0nOk32AyONYaqMkisirhWoF8XYyEEbCZ8Gk&statecode=${state}`)
        .then(response => response.json())
        .then(result => {
            let resultsDisplay = result.data.map(x => {
                let distance = 1000;
                if(x.latLong != ''){
                    let tempRow = x.latLong.split(":")
                    let latValue = parseFloat(tempRow[1].slice(0,-6))
                    let longValue = parseFloat(tempRow[2])
                    distance = Math.sqrt((Math.pow(cityCoord.lat-latValue,2) + Math.pow(cityCoord.long-longValue,2)))
                }
                let imageUrl = ''
                let parkCode = ''
                if(locationType == "places"){ //only return imageurl if you're searching up a place, not a park or campground
                    imageUrl = x.listingimage.url
                }
                if(locationType == 'parks'){//we won't display this, but it'll help the mustache determine if it's a park or not
                    parkCode = x.parkCode
                }
                return { //returning all the necessary api elements...places and parks have different keys
                    //so for now I'm just returning all the keys from both. Ex. parks has name, but not title, while 
                    //places has title but not name.
                    name:x.name,
                    description:x.description,
                    weatherInfo:x.weatherInfo,
                    distance:distance,
                    title:x.title,
                    listingdescription:x.listingdescription,
                    listingImage:imageUrl,
                    parkInfo:{
                        parkCode:parkCode,
                        parkName:x.name                        
                    } 
                    
                }
            })
            resultsDisplay.sort((a,b) => (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0));
            res.render('stateDetails', {results:resultsDisplay, state:state, message:`Here are the \
            ${locationType} ordered by distance from ${city}, ${state}. Get that travel bug! :)`})
        })  
    })
})

app.post('/campground-info', (req,res) => {
    let parkCode = req.body.parkCode
    let parkName = req.body.parkName
    fetch(`https://developer.nps.gov/api/v1/campgrounds?api_key=YM83j0nOk32AyONYaqMkisirhWoF8XYyEEbCZ8Gk&parkcode=${parkCode}`)
    .then(response => response.json())
    .then(results => {
        if(results.data.length == 0){
            res.render('campDetails', {message:`Sorry, no available campground details for ${parkName} in the database. Try again.`})
        }
        else{
        res.render('campDetails', {message: `Here are the campground details for ${parkName}`, results:results.data})
        }
    }) 
})

app.post('/add-favorite', (req,res) => {
    
    models.Parks.build({
        postid: postid,
        username: username, 
        comment: comment
    })
    .save()
    .then(x => {
        res.redirect('/index/view-all')
    })
})

app.listen(3000, () => {
    console.log('running...')
})