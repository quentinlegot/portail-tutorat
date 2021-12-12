const path = require('path')
const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.port

app.set('view engine', 'ejs')
app.set('views', path.resolve( __dirname, "views"))

app.use('/static', express.static(path.resolve(__dirname, "static")))
.get('/', (req, res) => {
    // accueil
    res.status(200).render('index', {})
})
.get('/search', (req, res) => {
    // page de recherche
    res.status(200).render('search', {})
})
.get('/signup', (req, res) => {
    // page d'inscription
    res.status(200).render('signup', {})
})
.get('/account', (req, res) => {
    // page d'information de compte
    res.status(200).render('account', {})
})
.get('/create', (req, res) => {
    // page création tutorat
    res.status(200).render('createTutorat', {})
})
.get('/yourTutorat', (req, res) => {
    // page vos tutorats
    res.status(200).render('yourTutorat', {})
})
.get('/signin', (req, res) => {
    // page de connexion
    res.status(200).render('signin', {})
})

app.listen(port, () => {
    console.log('Server listening to port ' + port + " and dir " + __dirname)
})
