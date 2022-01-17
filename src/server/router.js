import * as path from 'path'
import Root from './controller/root.js'

export default class Router {


    constructor(dirname, connection) {
        this.dirname = dirname
        this.connection = connection
        this.controller = new Root(connection)
    }

    /**
     * 
     * @param {Express.core.Express} app 
     * @param {Express} express
     */
    route(app, express) {
        app.use('/static', express.static(path.resolve(this.dirname, "..", "static")))
        .use(express.urlencoded({ extended: true }))
        .use(express.json())
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
            res.redirect(301, '/user/account')
        })
        .get('/user/account', (req, res) => {
            this.controller.user.account(req, res)
        })
        .get('/user/tutorat', (req, res) => {
            res.redirect(301, '/user/tutorat/list')
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
        .post('/signin', (req, res) => {
            this.controller.signinForm(req, res)
        })
}

}