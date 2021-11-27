const path = require('path')
const express = require('express')
const app = express()
const port = 8080

app.set('view engine', 'ejs')
app.set('views', path.resolve( __dirname, "views"))

app.use('/static', express.static(path.resolve(__dirname, "static")))
.get('/', (req, res) => {
    res.status(200).render('index', {})
})

app.listen(port, () => {
    console.log('Server listening to port ' + port + " and dir " + __dirname)
})
