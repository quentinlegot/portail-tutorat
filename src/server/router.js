import * as path from 'path'
import Root from './controller/root.js'
import session from 'express-session'
import logging from 'express-logging'
import logops from 'logops'

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
        app.use(logging(logops))
        .use('/static', express.static(path.resolve(this.dirname, "..", "static")))
        .use(express.urlencoded({ extended: true }))
        .use(express.json())
        .use(session({ secret: "a secret key", resave: false, saveUninitialized: true }))
        .get('/', (req, res) => {
            this.controller.index(req, res)
        })
        .get('/search', (req, res) => {
            this.controller.search(req, res)
        })
        .get('/tutorat/:id', (req, res) => {
            this.controller.showTutoraDetail(req, res)
        })
        .get('/tutorat/:id/book', (req, res) => {
            this.controller.bookTutorat(req, res)
        })
        .post('/tutorat/:id/book', (req, res) => {
            this.controller.confirmBookTutorat(req, res)
        })
		.get('/tutorat/:id/review', (req, res) => {
            this.controller.leaveReview(req, res)
        })
		.get('/tutorat/:id/review/pos', (req, res) => {
            this.controller.addPositiveReview(req, res)
        })
		.get('/tutorat/:id/review/neg', (req, res) => {
            this.controller.addNegativeReview(req, res)
        })
        .get('/user', (req, res) => {
            res.redirect(301, '/user/account')
        })
        .get('/user/account', (req, res) => {
            this.controller.user.account(req, res)
        })
        .get('/user/reservations', (req, res) => {
            this.controller.user.reservation(req, res)
        })
        .get('/user/reservations/accept/:id', (req, res) => {
            this.controller.user.acceptReservation(req, res)
        })
        .get('/user/reservations/confirm/accept/:id', (req, res) => {
            this.controller.user.confirmAcceptReservation(req, res)
        })
        .get('/user/reservations/delete/:id', (req, res) => {
            this.controller.user.deleteReservation(req, res)
        })
        .get('/user/reservations/confirm/delete/:id', (req, res) => {
            this.controller.user.confirmDeleteReservation(req, res)
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
        .post('/user/tutorat/create', (req, res) => {
            this.controller.user.confirmCreation(req, res)
        })
        .get('/user/tutorat/modify/:id', (req, res) => {
            this.controller.user.modifyTutorat(req, res)
        })

        .post('/user/tutorat/modify/:id', (req, res) => {
            this.controller.user.confirmModification(req, res)
        })
        .get('/user/tutorat/delete/:id', (req, res) => {
            this.controller.user.deleteTutorat(req, res)
        })
        .post('/user/tutorat/confirm/delete/:id', (req, res) => {
            this.controller.user.confirmDelete(req, res)
        })
        .get('/signin', (req, res) => {
            this.controller.signin(req, res)
        })
        .post('/signin', (req, res) => {
            this.controller.signinForm(req, res)
        })
        .get('/disconnect', (req, res) => {
            this.controller.disconnect(req, res)
        })
        .get('/signup', (req, res) => {
            this.controller.signup(req, res)
        })
        .post('/signup', (req, res) => {
            this.controller.signupForm(req, res)
        })
}

}