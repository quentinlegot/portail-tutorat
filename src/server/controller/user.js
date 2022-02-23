import mysql from 'mysql'
import logops from 'logops'
import MySQL from '../model/mysql.js'

export default class User{
	
    /**
     * connection sql a revoir
     * @param {MySQL} connection 
     */
	constructor(connection)
	{
        this.connection = connection.connection
	}

    /**
     * page d'information de compte
     * @param {*} req 
     * @param {*} res 
     */
    account(req, res) {
        res.status(200).render('user/account', {session: req.session.user})
    }

    /**
     * page vos tutorats
     * @param {*} req 
     * @param {*} res 
     */
    tutorat(req, res) {
		if(typeof req.session.user !== 'undefined') {
            this.connection.query("SELECT tutorat.*, CONCAT(account.prenom, \" \", account.nom) as nom, tags.content as tags FROM account, tutorat, tags WHERE proposed_by = account.id AND proposed_by = " + mysql.escape(req.session.user.id) + " AND tags.id = tags_id ORDER BY tutorat.startdate DESC;",
            (err, results) => {
                if(err) {
                    logops.error(err)
                    res.status(500).render('search', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité"})
                    return
                } else {
                    let message = req.session.message
                    req.session.message = undefined
				    res.status(200).render('user/tutorat/list', {resultList: results, session: req.session.user, message})
			    }
            });
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
		
    }

    /**
     * page de création d'un tutorat
     * @param {*} req 
     * @param {*} res 
     */
    createTutorat(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.connection.query('SELECT * FROM tags', (err, result) => {
                if(err) {
                    logops(err)
                    res.status(200).render('user/tutorat/create', {session: req.session.user, fatal: "Une erreur inconnue est survenue", tags: {}})
                    return;
                }
                res.status(200).render('user/tutorat/create', {session: req.session.user, fatal: false, tags: result})


            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    confirmCreation(req, res) {
        if(typeof req.session.user !== 'undefined') {
            let hasGivenAllElements = true
            let elements = ["tags", "description", "datetime", "duration", "price", "place"]
            for(let el of elements) {
                if(req.body[el] === undefined) {
                    hasGivenAllElements = false
                    break
                }
            }
            if(hasGivenAllElements === true) {
                if(Number.isInteger(req.body["tags"])) {
                    let durationDate = new Date(req.body["duration"])
                    let duration = durationDate.getHours() * 60 + durationDate.getMinutes()
                    this.connection.query("INSERT INTO tutorat(proposed_by, tags_id, description, customer_id, startdate, duration, price, place) VALUE (?, ?, ?, NULL, ?, ?, ?, ?);", 
                    [req.session.user.id, parseInt(req.body["tags"]), req.body["description"], duration, req.body["price"], req.body["place"]], (err, result) => {
                        if(err) {
                            req.session.message = "Une erreur inconnue est survenue"
                            res.redirect(302, "/user/tutorat/create")
                            return
                        }
                        
                    })
                } else {
                    req.session.message = "Une entrée fournie est incorrecte"
                    res.redirect(302, "/uer/tutorat/create")
                }
            } else {
            req.session.message = "Veuillez remplir tout les champs de saisie"
            res.redirect(302, "/uer/tutorat/create")
            }
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    /**
     * page de modification d'un tutorat
     * @param {*} req 
     * @param {*} res 
     */
    modifyTutorat(req ,res) {
        if(typeof req.session.user !== 'undefined') {
            res.status(200).render('user/tutorat/modify', {session: req.session.user})
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    /**
     * page de suppresion d'un  tutorat
     * @param {*} req 
     * @param {*} res 
     */
    deleteTutorat(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.connection.query("SELECT tutorat.*, CONCAT(account.prenom, \" \", account.nom) as nom, account.email, tags.content AS tags, TIMESTAMPDIFF(MINUTE, NOW(), startdate) AS timedifference FROM tutorat, account, tags "+
            "WHERE tutorat.proposed_by = account.id AND proposed_by = " + mysql.escape(req.session.user.id) + " AND tags.id = tags_id AND tutorat.id = " + mysql.escape(req.params.id) + " AND (TIMESTAMPDIFF(MINUTE, NOW(), startdate) > 0 AND (customer_id IS NULL OR TIMESTAMPDIFF(MINUTE, NOW(), startdate) < 60)) LIMIT 1;",
            (err, result) => {
                if(err) {
                    res.status(200).render('user/tutorat/delete', {tutorats: {}, fatal: "Une erreur interne est survenue", session: req.session.user})
                    logops.error(err)
                    return
                }
                let message = req.session.message
                req.session.message = undefined
                res.status(200).render('user/tutorat/delete', {tutorats: result, fatal: message, session: req.session.user})
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    confirmDelete(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.connection.query("SELECT tutorat.*, CONCAT(account.prenom, \" \", account.nom) as nom, account.email, tags.content AS tags, TIMESTAMPDIFF(MINUTE, NOW(), startdate) AS timedifference FROM tutorat, account, tags "+
            "WHERE tutorat.proposed_by = account.id AND proposed_by = " + mysql.escape(req.session.user.id) + " AND tags.id = tags_id AND tutorat.id = " + mysql.escape(req.params.id) + " AND (TIMESTAMPDIFF(MINUTE, NOW(), startdate) > 0 AND (customer_id IS NULL OR TIMESTAMPDIFF(MINUTE, NOW(), startdate) < 60)) LIMIT 1;",
            (err, result) => {
                if(err) {
                    req.session.message = "Une erreur interne est survenue lors de la suppression du tutorat"
                    res.redirect(302, "/user/tutorat/delete")
                    logops.error(err)
                    return
                }
                if(result.length === 1) {
                    this.connection.query("DELETE FROM tutorat WHERE id=" + mysql.escape(req.params.id) + ";", (err, result) => {
                        if(err) {
                            req.session.message = "Une erreur interne est survenue lors de la suppression du tutorat"
                            res.redirect(302, "/user/tutorat/delete/" + req.params.id)
                            logops.error(err)
                            return
                        }
                        req.session.message = "Le tutorat a été supprimé"
                        res.redirect(302, "/user/tutorat/list")
                    })
                } else {
                    req.session.message = "Aucun tutorat n'a été trouvé"
                    res.redirect(302, "/user/tutorat/list")
                }
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }


}