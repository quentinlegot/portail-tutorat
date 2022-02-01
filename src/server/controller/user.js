import Root from './root.js'
import mysql from 'mysql'
import bcrypt from 'bcrypt'
import logops from 'logops'

export default class User{
	
	constructor(connection)
	{
        this.connection = connection
	}

    /**
     * page d'information de compte
     * @param {*} req 
     * @param {*} res 
     */
    account(req, res) {
        res.status(200).render('user/account', {})
    }

    /**
     * page vos tutorats
     * @param {*} req 
     * @param {*} res 
     */
    tutorat(req, res) {
		if(typeof req.session.user !== 'undefined') {
            this.connection.query("SELECT tutorat.*, account.nickname, tags.content as tags FROM account, tutorat, tags WHERE proposed_by = account.id AND proposed_by = " + mysql.escape(req.session.user.id) + " AND tags.id = tags_id ORDER BY tutorat.startdate DESC;",
            (err, results) => {
                if(err) {
                    logops.error(err)
                    res.status(500).render('search', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité"})
                    return
                } else {
				    res.status(200).render('user/tutorat/list', {resultList: results})
			    }
            });
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
		
    }

    /**
     * page création tutorat
     * @param {*} req 
     * @param {*} res 
     */
    createTutorat(req, res) {
        res.status(200).render('user/tutorat/create', {})
    }


}