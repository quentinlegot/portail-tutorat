import * as path from 'path'
import { fileURLToPath } from 'url';
import e from 'express'
import dotenv from 'dotenv'
import { Router } from './router.js'

dotenv.config()
const port = process.env.port
const dirname = path.dirname(fileURLToPath(import.meta.url))

const router = new Router(dirname)
const app = e()

app.set('view engine', 'ejs')
app.set('views', path.resolve(dirname, "views"))

router.route(app, e)

app.listen(port, () => {
    console.log('Server listening to port ' + port + " and dir " + dirname)
})