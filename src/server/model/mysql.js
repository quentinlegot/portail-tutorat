import mysql from 'mysql'
import { exporDateToSQL, parseDateTimeFromHTMLInput, TimeInDuration } from './Tools.js'

export default class MySQL {
    
    order_filter = {
        0: "",
        1: "ORDER BY PRICE ASC",
        2: "ORDER BY place",
        3: "ORDER BY DURATION ASC"
    }
    saltRounds = 10

    constructor() {
        this.connection = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            database: process.env.MYSQL_DATABASE,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            charset: "utf8",
            multipleStatements: true, 
            connectionLimit: 100
        })
    }

    closeConnection() {
        this.connection.end(err => {
            if(err) {
                console.error(err)
                console.error("A fatal error occured while closing mysql connection")
            } else {
                console.log('mysql connection closed')
            }
        })
    }

    searchList(req) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT tutorat.*, DATE_FORMAT(startdate, \"%Y-%m-%dT%H:%i\") as startdateformat, CONCAT(account.prenom, \" \", account.nom) as nom, account.email, tags.content as tags " + 
            "FROM tutorat, account, tags " + 
            "WHERE customer_id IS NULL AND account.id=tutorat.proposed_by AND startdate > DATE(NOW()) AND tutorat.tags_id=tags.id " + 
            this.categorieFilter(req) + " " + this.orderFilter(req) + ";"+ 
            "SELECT * FROM tags;",
             (err, results) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(results)
             })
        })
    }

    categorieFilter(req) {
        if(req.query.categorie) {
            const id = parseInt(req.query.categorie)
            if(!Number.isNaN(id)) {
                return " AND tags_id=" + mysql.escape(id)
            }
            return ""
        }
        return ""
    }

    orderFilter(req) {
        if(req.query.order) {
            const id = parseInt(req.query.order)
            if(!Number.isNaN(id) && id in this.order_filter) {
                return this.order_filter[id]
            }
            return ""
        }
        return ""
    }

    showTutoratDetail(req) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT tutorat.*,  CONCAT(account.prenom, \" \", account.nom) as nom, account.email, tags.content as tags FROM tutorat, account, tags "+
            "WHERE (customer_id IS NULL OR customer_id = " + mysql.escape(req.session.user.id) + " OR proposed_by = " + mysql.escape(req.session.user.id) + ") AND account.id=tutorat.proposed_by AND tutorat.tags_id=tags.id AND tutorat.id=" + mysql.escape(req.params.id) +";", 
            (err, results) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(results)
            })
        })
    }

    isAccountAlreadyExist(req) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * FROM account WHERE email=?", [req.body.email], (err, results) => {
                if(err) {
                    reject(err)
                    return
                }
                if(Object.keys(results).length === 0) {
                    resolve(false)
                } else {
                    resolve(results)
                }
            })
        })
    }

    createAccount(req, hash) {
        return new Promise((resolve, reject) => {
            this.connection.query("INSERT INTO account (email, password, prenom, nom) VALUE (?, ?, ?, ?)", [req.body.email, hash, req.body.firstName, req.body.lastName], (err, results) => {
                if(err) {
                    reject(err)
                    return
                }
                this.connection.query("SELECT id, email, password, prenom, nom FROM account WHERE id= ?", [results.insertId], (err, results) => {
                    if(err) {
                        reject(err)
                        return
                    }
                    resolve(results)
                })
            })
        })
    }

    showUserTutorats(req) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT tutorat.*, CONCAT(account.prenom, \" \", account.nom) as nom, tags.content as tags FROM account, tutorat, tags WHERE proposed_by = account.id AND proposed_by = ? AND tags.id = tags_id ORDER BY tutorat.startdate DESC;", [req.session.user.id],
            (err, results) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(results)
            })
        })
        
    }

    getTags() {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * FROM tags", (err, results) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(results)
            })
        })
    }

    /**
     * 
     * @param {*} req 
     * @param {Date} date 
     * @param {Number} duration 
     * @param {string} geolocation 
     * @returns {PromiseConstructor} Promise
     */
    insertNewTutorat(req, date, duration, geolocation) {
        return new Promise((resolve, reject) => {
            this.connection.query("INSERT INTO tutorat (proposed_by, tags_id, description, customer_id, startdate, duration, price, place, geolocation) VALUE(?, ?, ?, NULL, ?,?, ?, ?, ?)", 
            [req.session.user.id, req.body["tags"], req.body["description"], exporDateToSQL(date), duration, req.body["price"], req.body["place"], geolocation], (err, results) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(results)
            })
        })
    }

    getTutoratToDelete(req) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT tutorat.*, CONCAT(account.prenom, \" \", account.nom) as nom, account.email, tags.content AS tags, TIMESTAMPDIFF(MINUTE, NOW(), startdate) AS timedifference FROM tutorat, account, tags "+
            "WHERE tutorat.proposed_by = account.id AND proposed_by = " + mysql.escape(req.session.user.id) + " AND tags.id = tags_id AND tutorat.id = " + mysql.escape(req.params.id) + " AND (TIMESTAMPDIFF(MINUTE, NOW(), startdate) > 0 AND (customer_id IS NULL OR TIMESTAMPDIFF(MINUTE, NOW(), startdate) < 60)) LIMIT 1;",
            (err, result) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(result)
            })
        })
    }

    getTutoratToModiy(req) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT tutorat.*, DATE_FORMAT(startdate, \"%Y-%m-%dT%H:%i\") as startdateformat FROM tutorat, account WHERE tutorat.proposed_by = account.id AND proposed_by = ? AND tutorat.id = ? AND TIMESTAMPDIFF(MINUTE, NOW(), startdate) > 0 LIMIT 1", 
            [req.session.user.id, req.params.id], (err, result) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(result)
            })
        })
    }

    /**
     * @todo
     * @param {*} req 
     * @returns 
     */
    modifyTutorat(req, geolocation) {
        return new Promise((resolve, reject) =>  {
            this.connection.query("UPDATE tutorat SET tags_id=?, description=?, startdate=?, duration=?, price=?, place=?, geolocation=? WHERE id=?",
            [req.body["tags"], req.body["description"], exporDateToSQL(parseDateTimeFromHTMLInput(req.body["datetime"])), TimeInDuration(req.body["duration"]), req.body["price"], req.body["place"], geolocation, req.params.id], 
            (err, results) => {
                if(err) {
                    reject(err)
                    return
                }
                resolve(results)
            })
        })
    }
}