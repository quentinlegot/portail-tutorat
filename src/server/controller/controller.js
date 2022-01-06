

export default class Controller {

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
        res.status(200).render('signin', {})
    }

    /**
     * page d'information de compte
     * @param {*} req 
     * @param {*} res 
     */
    account(req, res) {
        res.status(200).render('account', {})
    }

    /**
     * page création tutorat
     * @param {*} req 
     * @param {*} res 
     */
    createTutorat(req, res) {
        res.status(200).render('createTutorat', {})
    }

    /**
     * page vos tutorats
     * @param {*} req 
     * @param {*} res 
     */
    yourTutorat(req, res) {
        res.status(200).render('yourTutorat', {})
    }

}