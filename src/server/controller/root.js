import User from './user.js'
import mysql from 'mysql'
import bcrypt from 'bcrypt'
import logops from 'logops'

export default class Root {

    user = new User(this.connection)
    saltRounds = 10
    order_filter = { 
        0: "", 
        1: "ORDER BY PRICE ASC",
        2: "ORDER BY place",
        3: "ORDER BY DURATION ASC"
    }
    
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
        this.connection.query("SELECT tutorat.*, account.nickname, account.email, tags.content as tags " + 
        "FROM tutorat, account, tags "+ 
        "WHERE customer_id IS NULL AND account.id=tutorat.proposed_by AND startdate > DATE(NOW()) AND tutorat.tags_id=tags.id " + 
        this.categorieFilter(req) + " " + this.orderFilter(req) + ";"+ 
        "SELECT * FROM tags;",
         (err, results) => {
            if(err) {
                logops.error(err)
                res.status(500).render('search', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité"})
                return
            }
            res.status(200).render('search', {fatal: false, tutorats: results[0], tags: results[1], 
                selectedCategorie: req.query.categorie ? parseInt(req.query.categorie) : "", 
                selectedOrder: req.query.order ? parseInt(req.query.order) : ""})
        })
    }

    categorieFilter(req) {
        if(req.query.categorie) {
            const id = parseInt(req.query.categorie)
            if(!Number.isNaN(id)) {
                return " AND tags_id=" + mysql.escape(id)
            }
            return ""
        }
        return ""
    }

    orderFilter(req) {
        if(req.query.order) {
            const id = parseInt(req.query.order)
            if(!Number.isNaN(id) && id in this.order_filter) {
                return this.order_filter[id]
            }
            return ""
        }
        return ""
    }

    /**
     * Page affichant en détail les informations d'un tutorat
     * @param {*} req 
     * @param {*} res 
     */
    showTutoraDetail(req, res) {
        this.connection.query("SELECT tutorat.*, account.nickname, account.email, tags.content as tags FROM tutorat, account, tags WHERE customer_id IS NULL AND account.id=tutorat.proposed_by AND tutorat.tags_id=tags.id AND tutorat.id=" + mysql.escape(req.params.id) +";", (err, results) => {
            if(err) {
                logops.error(err)
                res.status(500).render('tutorat/detail', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité", tutorat: {}})
                return
            }
            res.status(200).render('tutorat/detail', {fatal: false, tutorats: results, session: req.session.user})
        })
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
        let elements = [ "email", "confirmEmail", "firstName", "lastName", "nickname", "password", "confirmPassword"]
        for(let el of elements) {
            if(req.body[el] === undefined) {
                hasGivenAllElements = false
                break
            }
        }
        if(hasGivenAllElements === true) {
            if(req.body.email === req.body.confirmEmail) {
                if(req.body.password === req.body.confirmPassword) {
                    this.connection.query("SELECT nickname, email FROM account WHERE nickname="+ mysql.escape(req.body.nickname) + " OR email="+ mysql.escape(req.body.email), (err, results, fields) => {
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
                                        this.connection.query("INSERT INTO account (nickname, email, password, prenom, nom) VALUE (?, ?, ?, ?, ?)", [req.body.nickname, req.body.email, hash, req.body.firstName, req.body.lastName], (err, results) => {
                                            if(err) {
                                                req.session.error = "Une erreur interne est survenue"
                                                logops.error(err)
                                                res.redirect(302, "/signup")
                                            } else {
                                                this.connection.query("SELECT id, nickname, email, password, prenom, nom FROM account WHERE id= ?", [results.insertId], (err, results) => {
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
                            for(el of results) {
                                if(el.email === req.body.email) {
                                    req.session.error = "Cette adresse mail est déjà enregistrée dans notre base de données"
                                    res.redirect(302, "/signup")
                                    break
                                } else if (el.password === req.body.password) {
                                    req.session.error = "Ce pseudonyme n'est pas disponibles"
                                    res.redirect(302, "/signup")
                                    break
                                }
                            }
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
            this.connection.query("SELECT id, nickname, email, password, prenom, nom FROM account WHERE email= " + mysql.escape(req.body.email), (err, results, fields) => {
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