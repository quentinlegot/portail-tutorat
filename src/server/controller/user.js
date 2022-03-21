import mysql from 'mysql'
import logops from 'logops'
import MySQL from '../model/mysql.js'
import { getGeolocalisation, isAllElementInBody, parseDateTimeFromHTMLInput, TimeInDuration, TwoDigitDate } from '../model/Tools.js'

export default class User{
	
    /**
     * connection sql a revoir
     * @param {MySQL} connection 
     */
	constructor(connection)
	{
        this.mysql = connection
        this.connection = connection.connection // deprecated
	}

    /**
     * page d'information de compte
     * @param {*} req 
     * @param {*} res 
     */
    account(req, res) {
        if(typeof req.session.user !== 'undefined') {
            res.status(200).render('user/account', {session: req.session.user})
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
        
    }
    /**
     * page de modification de compte
     * @param {*} req 
     * @param {*} res 
     */
     account_edit(req, res) {
        if(typeof req.session.user !== 'undefined') {
            res.status(200).render('user/account_edit', {session: req.session.user})
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
        
    }
    account_editConfirm(req, res) {
        if(typeof req.session.user !== 'undefined') {
            res.status(200).render('user/account', {session: req.session.user})
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
        
    }
    /**
     * page vos tutorats
     * @param {*} req 
     * @param {*} res 
     */
    tutorat(req, res) {
		if(typeof req.session.user !== 'undefined') {
            this.mysql.showUserTutorats(req).then(results => {
                let message = req.session.message
                req.session.message = undefined
                res.status(200).render('user/tutorat/list', {resultList: results, session: req.session.user, message})
            }).catch(err => {
                logops.error(err)
                res.status(500).render('search', {fatal: "Une erreur critique est survenue, impossible d'afficher le contenu souhaité"})
            })
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
            this.mysql.getTags().then(results => {
                const today = new Date()
                const startdateMin = `${today.getFullYear()}-${TwoDigitDate(today.getMonth() + 1)}-${TwoDigitDate(today.getDay())}T${TwoDigitDate(today.getHours())}:${TwoDigitDate(today.getMinutes())}`
                res.status(200).render('user/tutorat/create', {session: req.session.user, fatal: req.session.message, tags: results, previous: (typeof req.session.create_previous !== 'undefined') ? req.session.create_previous : null, startdateMin: startdateMin})
            }).catch(err => {
                logops(err)
                res.status(200).render('user/tutorat/create', {session: req.session.user, fatal: "Une erreur inconnue est survenue", tags: {}})
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    confirmCreation(req, res) {
        if(typeof req.session.user !== 'undefined') {
            if(isAllElementInBody(req, ["tags", "description", "datetime", "duration", "price", "place"]) === true) {
                let startdate = parseDateTimeFromHTMLInput(req.body["datetime"])
                let duration = TimeInDuration(req.body["duration"])
                if(duration === 0) {
                    req.session.create_previous = req.body
                    req.session.message = "La durée du tutorat donnée n'est pas correcte"
                    res.redirect(302, "/user/tutorat/create")
                    return
                }
                let geolocation = null
                const place = req.body["place"]
                getGeolocalisation(place).then(geolocalisation => {
                    geolocation = `${geolocalisation.lat},${geolocalisation.lon}`
                    this.mysql.insertNewTutorat(req, startdate, duration, geolocation).then(results => {
                        res.redirect(302, `/tutorat/${results.insertId}`)
                    }).catch(err => {
                        logops.error(err)
                        req.session.create_previous = req.body
                        req.session.message = "Une erreur inconnue est survenue"
                        res.redirect(302, "/user/tutorat/create")
                    })
                }).catch(() => {
                    req.session.create_previous = req.body
                    req.session.message = "La localisation donnée n'est pas correcte"
                    res.redirect(302, "/user/tutorat/create")
                })
            } else {
                req.session.message = "Certains champs n'ont pas été renseignés"
                req.session.create_previous = req.body
                res.redirect(302, "/")
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
            Promise.all([this.mysql.getTags(), this.mysql.getTutoratToModiy(req)]).then((results) => {
                const today = new Date()
                const startdateMin = `${today.getFullYear()}-${TwoDigitDate(today.getMonth() + 1)}-${TwoDigitDate(today.getDay())}T${TwoDigitDate(today.getHours())}:${TwoDigitDate(today.getMinutes())}`
                let tutorat = results[1].length === 0 ? null : results[1][0]
                let hoursDuration = "00"
                let minuteDuration = "00"
                if(tutorat !== null) {
                    hoursDuration = TwoDigitDate(Math.floor(tutorat.duration / 60))
                    minuteDuration = TwoDigitDate(tutorat.duration - hoursDuration * 60)
                }
                res.status(200).render('user/tutorat/modify', {session: req.session.user, fatal: null, tags: results[0], tutorat: tutorat, startdateMin: startdateMin, hoursDuration: hoursDuration, minuteDuration: minuteDuration})
            }).catch(err => {
                res.status(200).render('user/tutorat/modify', {session: req.session.user, fatal: "Une erreur inconnue est suvenue", tags: [], tutorat: []})
                logops.error(err)
                return
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    confirmModification(req, res) {
        if(typeof req.session.user !== 'undefined') {
            if(isAllElementInBody(req, ["tags", "description", "datetime", "duration", "price", "place"]) === true) {
                this.mysql.getTutoratToModiy(req).then(result => {
                    if(result.length === 1) {
                        getGeolocalisation(req.body["place"]).then(geolocalisation => {
                            const geolocation = `${geolocalisation.lat},${geolocalisation.lon}`
                            this.mysql.modifyTutorat(req, geolocation).then(() => {
                                res.redirect(302, `/tutorat/${req.params.id}`)
                            }).catch(err => {
                                res.status(200).render('user/tutorat/modify', {tutorats: {}, fatal: "Une erreur interne est survenue", session: req.session.user})
                                logops.error(err)
                            })
                        }).catch((err) => {
                            let message = err === "" ? "Le lieu du tutorat ne correspond à aucun lieu existant" : "Une erreur inconnue est survenue"
                            res.status(200).render('user/tutorat/modify', {tutorats: {}, fatal: message, session: req.session.user})
                            if(err !== "") {
                                logops.error(err)
                            }
                        })
                    } else {
                        req.session.message = "Aucun tutorat n'a été trouvé"
                        res.redirect(302, "/user/tutorat/list")
                    }
                }).catch(err => {
                    req.session.message = "Une erreur interne est survenue lors de la modification du tutorat"
                    res.redirect(302, "/user/tutorat/modify/" + req.params.id)
                    logops.error(err)
                })
            } else {
                req.session.message = "Certains champs n'ont pas été renseignés"
                res.redirect(400, "/user/tutorat/modify/" + req.params.id)
            }
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
            this.mysql.getTutoratToDelete(req).then(result => {
                let message = req.session.message
                req.session.message = undefined
                res.status(200).render('user/tutorat/delete', {tutorats: result, fatal: message, session: req.session.user})
            }).catch(err => {
                res.status(200).render('user/tutorat/delete', {tutorats: {}, fatal: "Une erreur interne est survenue", session: req.session.user})
                logops.error(err)
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    confirmDelete(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.mysql.getTutoratToDelete(req).then(result => {
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
            }).catch(err => {
                req.session.message = "Une erreur interne est survenue lors de la suppression du tutorat"
                res.redirect(302, "/user/tutorat/delete/" + req.params.id)
                logops.error(err)
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    reservation(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.mysql.getUserReservation(req).then(results => {
                let message = req.session.message
                req.session.message = undefined
                if(results.length === 0) {
                    res.status(200).render("user/reservations", {reservations: [], session: req.session.user, fatal: false, message: "Aucune réservation n'a été trouvé", message})
                } else {
                    res.status(200).render("user/reservations", {reservations: results, session: req.session.user, fatal: false, message})
                }
            }).catch((err) => {
                logops.error(err)
                res.status(200).render("user/reservations", {reservations: [], session: req.session.user, fatal: "Une erreur interne est survenue"})
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }

    deleteReservation(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.mysql.getReservationById(req).then(result => {
                let message = req.session.message
                req.session.message = undefined
                let reservation = null
                if(result.length !== 0) {
                    reservation = result[0]
                }
                res.status(200).render('user/reservations/delete', {fatal: false, reservation: reservation, session: req.session.user, message})
            }).catch(err => {
                res.status(200).render('user/reservations/delete', {fatal: false, reservation: [], session: req.session.user, message})
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }

    }

    confirmDeleteReservation(req, res) {
        if(typeof req.session.user !== 'undefined') {
            this.mysql.getReservationById(req).then(result => {
                if(result.length !== 0) {
                    this.mysql.deleteReservationById(req).then(() => {
                        req.session.message = "Suppression réussi avec succès"
                        res.redirect(302, '/user/reservations')
                    }).catch(err => {
                        req.session.message = "Une erreur interne est survenue"
                        res.redirect(302, '/user/reservations/delete')
                    })
                } else {
                    req.session.message = "Tutorat introuvable"
                    res.redirect(302, '/user/reservations')
                }
            })
        } else {
            req.session.message = "Vous devez être connecté pour accéder à cette section du site"
            res.redirect(302, "/")
        }
    }


}