import mysql from 'mysql'

export default class MySQL {
    
    order_filter = { 
        0: "", 
        1: "ORDER BY PRICE ASC",
        2: "ORDER BY place",
        3: "ORDER BY DURATION ASC"
    }

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

    searchList(req) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT tutorat.*,  CONCAT(account.prenom, \" \", account.nom) as nom, account.email, tags.content as tags " + 
            "FROM tutorat, account, tags " + 
            "WHERE customer_id IS NULL AND account.id=tutorat.proposed_by AND startdate > DATE(NOW()) AND tutorat.tags_id=tags.id " + 
            this.categorieFilter(req) + " " + this.orderFilter(req) + ";"+ 
            "SELECT * FROM tags;",
             (err, results) => {
                if(err) {
                    logops.error(err)
                    throw(err)
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



}