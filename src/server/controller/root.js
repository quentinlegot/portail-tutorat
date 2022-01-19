import User from './user.js'
import mysql from 'mysql'
import bcrypt from 'bcrypt'

export default class Root {

    user = new User()

    
    constructor(connection) {
        this.connection = connection
    }

    /**
     * Accueil
     * @param {*} req 
     * @param {*} res 
     */
    index(req, res) {
        let disconnect = req.session.disconnect
        req.session.disconnect = false
        res.status(200).render('index', { disconnect })
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
        res.status(200).render('signup', {})
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
            this.connection.query("SELECT id, nickname, email, password, prenom, nom FROM account WHERE email= " + mysql.escape(req.body.email), function (err, results, fields) {
                if(err) {
                    req.session.error = "Uneerreur inconnue est survenu: " + err
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
        req.session.disconnect = true
        res.redirect(302, '/')
    }

}