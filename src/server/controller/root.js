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
        res.status(200).render('index', {})
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
        res.status(200).render('signin', {error: req.query.error})
    }

    signinForm(req, res) {
        if(req.body.email !== undefined && req.body.password !== undefined) {
            this.connection.query("SELECT password FROM account WHERE email= " + mysql.escape(req.body.email), function (err, results, fields) {
                if(err) {
                    res.redirect(302, "/signin?error=2")
                } else {
                    if (Object.keys(results).length === 0) {
                        res.redirect(302, "/signin?error=3")
                    } else {
                        bcrypt.compare(req.body.password, results[0].password).then(value => {
                            if(value === true) {
                                res.status(200).send("l'email et le mot de passe correspondent")
                            } else {
                                console.error(results[0].password)
                                res.redirect(302, "/signin?error=4")
                            }
                        })
                    }
                }
            })
        } else {
            res.redirect(302, "/signin?error=1")
        }
    }

}