import * as path from 'path'
import { fileURLToPath } from 'url';
import e from 'express'
import dotenv from 'dotenv'
import Router from './router.js'
import logops from 'logops';
import mysql from  './model/mysql.js'

logops.setLevel('INFO')
dotenv.config()
const port = process.env.PORT
const dirname = path.dirname(fileURLToPath(import.meta.url))

const connection = new mysql()

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
        connection.closeConnection()
    })
}

process.on('SIGTERM', close)
process.on('SIGINT', close)