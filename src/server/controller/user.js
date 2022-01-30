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
		console.log("Viewing tutorat list.");
		console.log(req.session.user.id);
		//console.log(this.connection);
		
		
		this.connection.query(("SELECT * FROM account,tutorat,tags WHERE proposed_by = account.id AND proposed_by = " + req.session.user.id + " AND tags.id = tags_id;"),
		(err, results) => {
            if(err) {
                logops.error(err)
                res.status(500).render('search', {fatal: "Erreur lors d'execution SQL"})
                return
            }
			else
			{
				console.log(results)
				res.status(200).render('user/tutorat/list', {resultList: results})
			}
		}
		
		);
    }

    /**
     * page création tutorat
     * @param {*} req 
     * @param {*} res 
     */
     createTutorat(req, res) {
        res.status(200).render('user/tutorat/create', {})
    }
	
	 /**
     * page voir tutorat
     * @param {*} req 
     * @param {*} res 
     */
     viewTutorat(req, res) {

	 }
		
        //res.status(200).render('user/tutorat/view', {})


}