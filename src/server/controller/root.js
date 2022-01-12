import User from'./user.js'

export default class Root {

    user = new User()

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

}