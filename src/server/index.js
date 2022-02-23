import * as path from 'path'
import { fileURLToPath } from 'url';
import e from 'express'
import dotenv from 'dotenv'
import Router from './router.js'
import mysql from 'mysql'
import logops from 'logops';

logops.setLevel('INFO')
dotenv.config()
const port = process.env.PORT
const dirname = path.dirname(fileURLToPath(import.meta.url))

let connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    charset: "utf8",
    multipleStatements: true, 
    connectionLimit: 100
})

const router = new Router(dirname, connection)
const app = e()

app.set('view engine', 'ejs')
app.set('views', path.resolve(dirname, "views"))

router.route(app, e, process.env.SESSION_SECRET)

const server = app.listen(port, () => {
    console.log('Server listening to port ' + port)
    console.log("Press Ctrl-C to close the server")
})


function close() {
    console.log('Closing server...')
    server.close((error) => {
        if(error) {
            console.error(error)
            console.error('Failed to close server correctly')
        } else {
            console.log('Server closed')
        }
        console.log('Closing mysql connection...')
        connection.end(err => {
            if(err) {
                console.error(err)
                console.error("A fatal error occured while closing mysql connection")
            } else {
                console.log('mysql connection closed')
            }
        })
    })
}

process.on('SIGTERM', close)
process.on('SIGINT', close)