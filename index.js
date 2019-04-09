const express = require('express')
const bodyParser = require('body-parser')
const models = require('./models')
const mustacheExpress = require('mustache-express')
const bcrypt= require('bcrypt')
const fetch = require('node-fetch')
const saltRounds = 10;
const app = express()
let codeList = []
let parkListRequests = []

app.engine('mustache', mustacheExpress())

app.set('views', './views')
app.set('view engine', 'mustache')

app.use(bodyParser.urlencoded({ extended: false }))

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





app.get('/favorites',(req,res) =>
{
    models.Park.findAll({attributes : ['parkid']})
    .then(parkcodeList => 
    {
        for (let park of parkcodeList)
        {
            let fetchURL = "https://developer.nps.gov/api/v1/parks?parkcode=" + park.dataValues.parkid + 
            "&api_key=YM83j0nOk32AyONYaqMkisirhWoF8XYyEEbCZ8Gk"
            parkListRequests.push(fetch(fetchURL))
        }
        Promise.all(parkListRequests)
        .then((parkListResponses) => 
        {
            let parksArray = parkListResponses.map((parkListResponse) => parkListResponse.json())
            Promise.all(parksArray)
            .then((json) => 
            {   
                console.log(json)
                let nameArray = json.map((park) => 
                {   
                    let data = park.data[0]
                    return {fullName: data.fullName, description: data.description, id: data.id, parkcode: data.parkCode}
                })
                res.render('favorites', {parkList : nameArray})
            })
        })   
    })
})

app.listen(3000,function(){
    console.log("Server is running...")
  })