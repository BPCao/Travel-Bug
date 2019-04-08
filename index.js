const express = require('express')
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const app = express()
const fetch = require('node-fetch')

geocodeApi = "c8bb868a5cf89ccfca4b5a8bc25cf8ca7bb7c70"

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(bodyParser.urlencoded({extended:false}))


app.get('/state-details/:state', (req,res) => {
    let state = req.params.state;
    res.render('stateDetails', {state:state})
})


app.post('/state-details', (req,res) => {
    let state = req.body.state
    let city = req.body.city
    let locationType = req.body.locationType
    fetch(`https://api.geocod.io/v1.3/geocode?city=${city}&state=${state}&api_key=${geocodeApi}`)
.then(response => response.json())
.then(result => {
    let cityCoord = {lat:result.results[0].location.lat, long:result.results[0].location.lng}
    if(locationType == "Parks"){
        fetch(`https://developer.nps.gov/api/v1/parks?api_key=YM83j0nOk32AyONYaqMkisirhWoF8XYyEEbCZ8Gk&statecode=${state}`)
        .then(response => response.json())
        .then(result => {
            console.log(cityCoord)
            let resultsDisplay = result.data.map(x => {
                let distance = 1000;
                if(x.latLong != ''){
                    let tempRow = x.latLong.split(":")
                    let latValue = parseFloat(tempRow[1].slice(0,-6))
                    let longValue = parseFloat(tempRow[2])
                    distance = Math.sqrt((Math.pow(cityCoord.lat-latValue,2) + Math.pow(cityCoord.long-longValue,2)))
                    console.log(distance,x.name)
                    
                }
                else{
                }
                return {
                    name:x.name,
                    description:x.description,
                    weatherInfo:x.weatherInfo,
                    distance:distance
                }
            })
            resultsDisplay.sort((a,b) => (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0));
            res.render('stateDetails', {results:resultsDisplay, state:state})
        })  
    }
    })
})


app.listen(3000, () => {
    console.log('running...')
})