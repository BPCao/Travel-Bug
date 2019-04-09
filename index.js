const express = require('express')
const bodyParser = require('body-parser')
const models = require('./models')
const mustacheExpress = require('mustache-express')
const bcrypt= require('bcrypt')
const saltRounds = 10;
const app = express()


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

app.post('/login', (res, req)=>{

    let memberU = req.body.memeberU
    let memberP = req.body.memberP

    if()

})

app.listen(3000,function(){
    console.log("Server is running...")
  })