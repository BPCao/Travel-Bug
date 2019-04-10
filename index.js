const express = require('express')
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const app = express()
const fetch = require('node-fetch')
const models = require('./models')
const bcrypt= require('bcrypt')
const saltRounds = 10;
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
    if(state == '' || city == ''){
        res.render('stateDetails', {message:"Please enter both a city and a state :)"})
    }
    city = city.charAt(0).toUpperCase() + city.slice(1)
    let locationType = req.body.locationType.toLowerCase();
    fetch(`https://api.geocod.io/v1.3/geocode?city=${city}&state=${state}&api_key=${geocodeApi}`)
.then(response => response.json())
.then(result => {
    if(result.error){
        res.render('stateDetails', {message:"Hmm, your search didn\'t return any results. Try again."})
    }
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
                if(locationType == "places"){ 
                    imageUrl = x.listingimage.url
                    return { 
                        description:x.description,
                        weatherInfo:x.weatherInfo,
                        distance:distance,
                        title:x.title,
                        listingdescription:x.listingdescription,
                        listingImage:imageUrl,
                        locationType:locationType
                    }
                }
                if(locationType == 'parks'){
                    parkCode = x.parkCode
                    return { 
                        name:x.name,
                        description:x.description,
                        weatherInfo:x.weatherInfo,
                        distance:distance,
                        parkCode:parkCode,
                        listingdescription:x.listingdescription,
                        locationType:locationType,
                        parkInfo:{
                            parkCode:parkCode,
                            parkName:x.name                        
                        } 
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
    let locationType = req.body.locationType
    let parkcode 
    if(locationType == 'parks'){
        parkcode = req.body.parkcode
    }
    else if(locationType == 'places'){
        parkcode = req.body.placeTitle
    }
    let userId = req.body.userId

    models.Parks.build({
        parkid: parkcode,
        userid: userId,
        category: locationType
    })
    .save()
    .then(x => {
        res.render('stateDetails', {message: "The " + locationType.substring(0,locationType.length - 1) + " has been added to your favorites. Go back to view your search results again :)"})
    })
})

app.get('/',(req, res)=> {
    res.render('login')
})

app.get('/register', (req,res)=>{
    res.render('register')
})

app.post('/register',(req,res)=>{
  
    let username = req.body.username
    let password = req.body.password 

    

 bcrypt.hash(password, saltRounds, function(error, hash) {
    models.User.build({
        username: username,
        password: hash
    }).save()
    }).then(console.log("SUCCESS"))
     res.redirect('/')
})

// app.post('/login', (res, req)=>{

//     let memberU = req.body.memeberU
//     let memberP = req.body.memberP

//     if()

// })
app.post('/search-redirect', (req,res) => {
    res.redirect('/state-details')
})

app.get('/favorites',(req,res) =>
{
    let parkListRequests = []
    models.Parks.findAll()
    .then(parkcodeList => 
    {
        for (let park of parkcodeList)
        {   
            let rowId = park.dataValues.id
            let parkid = park.dataValues.parkid
            let category = park.dataValues.category
            let fetchURL = ''
            if(category == 'parks'){
                fetchURL = `https://developer.nps.gov/api/v1/${category}?parkcode=${parkid}&api_key=YM83j0nOk32AyONYaqMkisirhWoF8XYyEEbCZ8Gk`
            }
            else if (category == 'places'){
                fetchURL = `https://developer.nps.gov/api/v1/${category}?q=${parkid}&api_key=YM83j0nOk32AyONYaqMkisirhWoF8XYyEEbCZ8Gk`   
            }
        parkListRequests.push(fetch(fetchURL))
        }
        Promise.all(parkListRequests)
        .then((parkListResponses) => 
        {
            let parksArray = parkListResponses.map((parkListResponse) => parkListResponse.json())
            Promise.all(parksArray)
            .then((json) => 
            {   
                let nameArray = json.map((park) => 
                {   
                    let data = park.data[0]
                    return {
                        fullName: data.fullName, 
                        description: data.description, 
                        parkCode: data.parkCode,
                        title:data.title,
                        listingimage:data.listingimage
                    }
                })
                res.render('favorites', {parkList : nameArray})
            })
        })   
    })
})

app.post('/delete-favorite', (req,res) => {
    if(req.body.parkCode != ''){
        var parkId = req.body.parkCode
    }
    else if(req.body.title != ''){
        var parkId = req.body.title
    }
    models.Parks.destroy({
        where: {
            parkid: parkId
        }
    })
    res.redirect('/favorites')
})


app.listen(3000, () => {
    console.log('running...')
})

