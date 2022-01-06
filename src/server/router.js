import * as path from 'path'
import './controller/controller.js'
import Controller from './controller/controller.js'

export class Router {

    controller = new Controller()

    constructor(dirname) {
        this.dirname = dirname
    }

    /**
     * 
     * @param {Express.core.Express} app 
     * @param {Express} express
     */
    route(app, express) {
        app.use('/static', express.static(path.resolve(this.dirname, "static")))
        .get('/', (req, res) => {
            this.controller.index(req, res)
        })
        .get('/search', (req, res) => {
            this.controller.search(req, res)
        })
        .get('/signup', (req, res) => {
            this.controller.signup(req, res)
        })
        .get('/account', (req, res) => {
            this.controller.account(req, res)
        })
        .get('/create', (req, res) => {
            this.controller.createTutorat(req, res)
        })
        .get('/yourTutorat', (req, res) => {
            this.controller.yourTutorat(req, res)
        })
        .get('/signin', (req, res) => {
            this.controller.signin(req, res)
        })
}

}