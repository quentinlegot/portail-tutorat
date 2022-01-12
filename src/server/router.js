import * as path from 'path'
import Root from './controller/root.js'

export class Router {

    controller = new Root()

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
        .get('/user', (req, res) => {
            res.redirect('/user/account')
        })
        .get('/user/account', (req, res) => {
            this.controller.user.account(req, res)
        })
        .get('/user/tutorat', (req, res) => {
            res.redirect('/user/tutorat/list')
        })
        .get('/user/tutorat/list', (req, res) => {
            this.controller.user.tutorat(req, res)
        })
        .get('/user/tutorat/create', (req, res) => {
            this.controller.user.createTutorat(req, res)
        })
        .get('/signin', (req, res) => {
            this.controller.signin(req, res)
        })
}

}