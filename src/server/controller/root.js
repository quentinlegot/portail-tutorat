import User from './user.js'
import mysql from '../model/mysql'
import bcrypt from 'bcrypt'
import logops from 'logops'

export default class Root {

    user = new User(this.connection)
    saltRounds = 10
    
    /**
     * 
     * @param {mysql} connection 
     */
    constructor(connection) {
        this.connection = connection
		this.user.connection = this.connection
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
        /* this.connection.query("SELECT tutorat.*,  CONCAT(account.prenom, \" \", account.nom) as nom, account.email, tags.content as tags " + 
        "FROM tutorat, account, tags " + 
        "WHERE customer_id IS NULL AND account.id=tutorat.proposed_by AND startdate > DATE(NOW()) AND tutorat.tags_id=tags.id " + 
        this.categorieFilter(req) + " " + this.orderFilter(req) + ";"+ 
        "SELECT * FROM tags;",
         (err, results) => {
            if(err) {
                logops.error(err)
                res.status(500).render('search', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité", session: req.session.user})
                return
            }
            res.status(200).render('search', {fatal: false, tutorats: results[0], tags: results[1], 
                selectedCategorie: req.query.categorie ? parseInt(req.query.categorie) : "", 
                selectedOrder: req.query.order ? parseInt(req.query.order) : "", session: req.session.user})
        }) */
        this.connection.searchList(req).then(() => {

        }).catch((err) => {
            
        })
    }

    /**
     * Page affichant en détail les informations d'un tutorat
     * @param {*} req 
     * @param {*} res 
     */
    showTutoraDetail(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.connection.searchList
            /* this.connection.query("SELECT tutorat.*,  CONCAT(account.prenom, \" \", account.nom) as nom, account.email, tags.content as tags FROM tutorat, account, tags "+
            "WHERE (customer_id IS NULL OR customer_id = " + mysql.escape(req.session.user.id) + " OR proposed_by = " + mysql.escape(req.session.user.id) + ") AND account.id=tutorat.proposed_by AND tutorat.tags_id=tags.id AND tutorat.id=" + mysql.escape(req.params.id) +";", 
            (err, results) => {
                if(err) {
                    logops.error(err)
                    res.status(500).render('tutorat/detail', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité", tutorat: {}})
                    return
                }
                res.status(200).render('tutorat/detail', {fatal: false, tutorats: results, session: req.session.user})
            }) */
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
        let hasGivenAllElements = true
        let elements = ["email", "confirmEmail", "firstName", "lastName", "password", "confirmPassword"]
        for(let el of elements) {
            if(req.body[el] === undefined) {
                hasGivenAllElements = false
                break
            }
        }
        if(hasGivenAllElements === true) {
            if(req.body.email === req.body.confirmEmail) {
                if(req.body.password === req.body.confirmPassword) {
                    this.connection.query("SELECT email FROM account WHERE email="+ mysql.escape(req.body.email), (err, results, fields) => {
                        if(err) {
                            req.session.error = "Une erreur interne est survenue"
                            logops.error(err)
                            res.redirect(302, "/signup")
                        } else if(Object.keys(results).length === 0) {
                            bcrypt.genSalt(this.saltRounds, (err, salt) => {
                                bcrypt.hash(req.body.password, salt, (err, hash) => {
                                    if(err) {
                                        req.session.error = "Une erreur interne est survenue"
                                        logops.error(err)
                                        res.redirect(302, "/signup")
                                    } else {
                                        this.connection.query("INSERT INTO account (email, password, prenom, nom) VALUE (?, ?, ?, ?)", [req.body.email, hash, req.body.firstName, req.body.lastName], (err, results) => {
                                            if(err) {
                                                req.session.error = "Une erreur interne est survenue"
                                                logops.error(err)
                                                res.redirect(302, "/signup")
                                            } else {
                                                this.connection.query("SELECT id, email, password, prenom, nom FROM account WHERE id= ?", [results.insertId], (err, results) => {
                                                    if(err) {
                                                        req.session.error = "Inscription réussie"
                                                        res.redirect(302, "/signin")
                                                    } else {
                                                        req.session.message = "Inscription réussie"
                                                        req.session.user = results[0]
                                                        res.redirect(302, "/")
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            })
                        } else {
                            req.session.error = "Cette adresse mail est déjà enregistrée dans notre base de données"
                            res.redirect(302, "/signup")
                        }
                    })
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
            this.connection.query("SELECT id, email, password, prenom, nom FROM account WHERE email= " + mysql.escape(req.body.email), (err, results, fields) => {
                if(err) {
                    req.session.error = "Une erreur inconnue est survenu: " + err
                    res.redirect(302, "/signin")
                } else {
                    if (Object.keys(results).length === 0) {
                        req.session.error = "Aucun compte existant avec cette adresse mail"
                        res.redirect(302, "/signin")
                    } else {
                        bcrypt.compare(req.body.password, results[0].password).then(value => {
                            if(value === true) {
                                req.session.user = results[0]
                                res.redirect(302, "/signin")
                            } else {
                                req.session.error = "Mot de passe non reconnu"
                                res.redirect(302, "/signin")
                            }
                        })
                    }
                }
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