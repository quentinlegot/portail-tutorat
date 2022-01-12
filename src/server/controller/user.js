

export default class User {

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
        res.status(200).render('user/tutorat/list', {})
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