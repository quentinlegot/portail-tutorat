import User from './user.js'
import mysql from 'mysql'
import bcrypt from 'bcrypt'

export default class Root {

    user = new User()
    saltRounds = 10
    
    constructor(connection) {
        this.connection = connection
    }

    /**
     * Accueil
     * @param {*} req 
     * @param {*} res 
     */
    index(req, res) {
        let message = req.session.message
        req.session.message = undefined
        res.status(200).render('index', {message})
    }

    /**
     * page de recherche
     * @param {*} req 
     * @param {*} res 
     */
    search(req, res) {
        res.status(200).render('search', {})
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
                            console.error(err)
                            res.redirect(302, "/signup")
                        } else if(Object.keys(results).length === 0) {
                            bcrypt.genSalt(this.saltRounds, (err, salt) => {
                                bcrypt.hash(req.body.password, salt, (err, hash) => {
                                    if(err) {
                                        req.session.error = "Une erreur interne est survenue"
                                        console.error(err)
                                        res.redirect(302, "/signup")
                                    } else {
                                        this.connection.query("INSERT INTO account (nickname, email, password, prenom, nom) VALUE (?, ?, ?, ?, ?)", [req.body.nickname, req.body.email, hash, req.body.firstName, req.body.lastName], (err, results) => {
                                            if(err) {
                                                req.session.error = "Une erreur interne est survenue"
                                                console.error(err)
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
                                res.redirect(302, "/")
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