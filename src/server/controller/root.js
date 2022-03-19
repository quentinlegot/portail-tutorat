import User from './user.js'
import mysql from '../model/mysql.js'
import bcrypt from 'bcrypt'
import logops from 'logops'
import { isAllElementInBody, parseDateTimeFromHTMLInput } from '../model/Tools.js'

export default class Root {
    
    /**
     * @param {mysql} connection 
     */
    constructor(connection) {
        this.connection = connection
		this.user = new User(this.connection)
    }

    /**
     * Accueil
     * @param {*} req 
     * @param {*} res 
     */
    index(req, res) {
        let message = req.session.message
        req.session.message = undefined
        res.status(200).render('index', {message, session: req.session.user})
    }

    /**
     * page de recherche
     * @param {*} req 
     * @param {*} res 
     */
    search(req, res) {
        this.connection.searchList(req).then((results) => {
            res.status(200).render('search', {fatal: false, parseDateTimeFromHTMLInput: parseDateTimeFromHTMLInput, tutorats: results[0], tags: results[1], 
                selectedCategorie: req.query.categorie ? parseInt(req.query.categorie) : "", 
                selectedOrder: req.query.order ? parseInt(req.query.order) : "", session: req.session.user})
                return
        }).catch((err) => {
            logops.error(err)
            res.status(500).render('search', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité", session: req.session.user})
            return
        })
    }

    /**
     * Page affichant en détail les informations d'un tutorat
     * @param {*} req 
     * @param {*} res 
     */
    showTutoraDetail(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.connection.showTutoratDetail(req).then((results) => {
                this.connection.getReservationByTutoratId(req).then(v => {
                    res.status(200).render('tutorat/detail', {fatal: false, tutorats: results, session: req.session.user, reservations: v})
                }).catch(err => {
                    logops.error(err)
                    res.status(500).render('tutorat/detail', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité", tutorats: []})
                })
            }).catch((err) => {
                logops.error(err)
                res.status(500).render('tutorat/detail', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité", tutorats: []})
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
        
    }

    bookTutorat(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.connection.showTutoratDetail(req).then(result => {
                let tutorat
                if(result.length === 0) {
                    tutorat = null
                } else {
                    tutorat = result[0]
                }
                let message = req.session.message
                req.session.message = undefined
                res.status(200).render('tutorat/book', {fatal: false, tutorat: tutorat, session: req.session.user, message: message})
            }).catch(err => {
                res.status(200).render('tutorat/book', {fatal: "Une erreur inconnue est survenue", tutorat: null, session: req.session.user})
                logops.error(err)
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    confirmBookTutorat(req, res) {
        if(typeof req.session.user !== 'undefined') {
            if(isAllElementInBody(req, ["description"])) {
                this.connection.getUserReservationByTutoratId(req).then(result => {
                    if(result.length === 0) {
                        this.connection.insertNewReservation(req).then(() => {
                            res.redirect(302, '/user/reservations')
                        }).catch(err => {
                            logops.error(err)
                            req.session.message = "Une erreur interne est survenue"
                            res.redirect(302, '/tutorat/' + req.params['id'] + '/book')
                        })
                    } else {
                        req.session.message = "Vous avez déjà réserver ce tutorat"
                        res.redirect(302, '/tutorat/' + req.params['id'] + '/book')
                    }
                }).catch(err => {
                    logops.error(err)
                    req.session.message = "Une erreur interne est survenue"
                    res.redirect(302, '/tutorat/' + req.params['id'] + '/book')
                })
            } else {
                req .session.message = "Vous n'avez pas saisis tout les champs requis"
                res.redirect(302, '/tutorat/' + req.params['id'] + '/book')
            }
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    /**
     * page d'inscription
     * @param {*} req 
     * @param {*} res 
     */
    signup(req, res) {
        let error = req.session.error
        req.session.error = undefined
        res.status(200).render('signup', {error})
    }

    signupForm(req, res) {
        if(isAllElementInBody(req, ["email", "confirmEmail", "firstName", "lastName", "password", "confirmPassword"]) === true) {
            if(req.body.email === req.body.confirmEmail) {
                if(req.body.password === req.body.confirmPassword) {
                    if(req.body.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
                        if(req.body.password.length >= 5) {
                            this.connection.isAccountAlreadyExist(req).then((v) => {
                                if(v === false) {
                                    bcrypt.genSalt(this.saltRounds, (_err, salt) => {
                                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                                            if(err) {
                                                req.session.error = "Une erreur interne est survenue"
                                                logops.error(err)
                                                res.redirect(302, "/signup")
                                            } else {
                                                this.connection.createAccount(req, hash).then((results) => {
                                                    req.session.message = "Inscription réussie"
                                                    req.session.user = results[0]
                                                    res.redirect(302, "/")
                                                }).catch(err => {
                                                    req.session.error = "Une erreur interne est survenue"
                                                    logops.error(err)
                                                    res.redirect(302, "/signup")
                                                })
                                            }
                                        })
                                    })
                                } else {
                                    req.session.error = "Cette adresse mail est déjà enregistrée dans notre base de données"
                                    res.redirect(302, "/signup")
                                } 
                            }).catch((err) => {
                                req.session.error = "Une erreur interne est survenue"
                                logops.error(err)
                                res.redirect(302, "/signup")
                            })
                        } else {
                            req.session.error = "Votre mot de passe n'est pas assez long"
                            res.redirect(302, "/signup")
                        } 
                    } else {
                        req.session.error = "Votre adresse mail est dans un format incorrect"
                        res.redirect(302, "/signup")
                    }
                } else {
                    req.session.error = "Votre mot depasse n'est pas identique"
                    res.redirect(302, "/signup")
                }
                
            } else {
                req.session.error = "Votre adresse mail n'est pas identique"
                res.redirect(302, "/signup")
            }
            
        } else {
            req.session.error = "Veuillez remplir tout les champs de saisie"
            res.redirect(302, "/signup")
        }
    }

    /**
     * page de connexion
     * @param {*} req 
     * @param {*} res 
     */
    signin(req, res) {
        let error = req.session.error
        req.session.error = ""
        res.status(200).render('signin', {session: req.session.user, error})
       
    }

    signinForm(req, res) {
        if(req.body.email !== undefined && req.body.password !== undefined) {
            this.connection.isAccountAlreadyExist(req).then((results) => {
                if(results !== false) {
                    bcrypt.compare(req.body.password, results[0].password).then(value => {
                        if(value === true) {
                            req.session.user = results[0]
                            res.redirect(302, "/signin")
                        } else {
                            req.session.error = "Mot de passe non reconnu"
                            res.redirect(302, "/signin")
                        }
                    })
                } else {
                    req.session.error = "Aucun compte existant avec cette adresse mail"
                    res.redirect(302, "/signin")
                }
            }).catch(err => {
                logops.error(err)
                req.session.error = "Une erreur inconnue est survenue"
                res.redirect(302, "/signin")
            })
        } else {
            req.session.error = "Veuillez insérer un email et un mot de passe"
            res.redirect(302, "/signin")
        }
    }

    disconnect(req, res) {
        req.session.user = undefined
        req.session.message = "Vous avez été déconnecté"
        res.redirect(302, '/')
    }

}