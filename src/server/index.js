import * as path from 'path'
import { fileURLToPath } from 'url';
import e from 'express'
import dotenv from 'dotenv'
import Router from './router.js'
import mysql from 'mysql'
import { exit } from 'process'
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

/* let handleDisconnect = () => {
    connection.on('error', (err) => {
        if (!err.fatal) {
            return
        }

        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err
        }

        logops.info('Re-connecting lost connection: ' + err.stack)

        connection = mysql.createConnection(connection.config)
        handleDisconnect(connection)
        connection.connect()
    })
} */

/* connection.connect(err => {
    if(err) {
        console.error('Cannot connect to database')
        console.error(err)
        exit(1)
    }
}) */



const router = new Router(dirname, connection)
const app = e()

app.set('view engine', 'ejs')
app.set('views', path.resolve(dirname, "views"))

router.route(app, e)

const server = app.listen(port, () => {
    console.log('Server listening to port ' + port + " and dir " + dirname)
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