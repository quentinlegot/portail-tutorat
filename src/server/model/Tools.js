/**
* time given by html time input, converted to duration in minutes
* return 0 if cannot parse
* @param {string} time 
*/
export function TimeInDuration(time) { 
    let strs = time.split(":")
    if(strs.length === 2 && !Number.isNaN(strs[0]) && !Number.isNaN(strs[1])) {
        return parseInt(strs[0]) * 60 + parseInt(strs[1])
    } else {
        return 0
    }
}

/**
 * return a string representation of this element of the date in 2 digits
 * @param {*} str 
 */
export function TwoDigitDate(date) {
    if(date < 10) {
        return "0" + date
    } 
    return date
}

/**
 * 
 * @param {string} datetime 
 * @returns Date
 */
export function parseDateTimeFromHTMLInput(datetime) {
    const strs = datetime.split("T")
    if(strs.length === 2) {
        const date = strs[0].split("-")
        const time = strs[1].split(":")
        if(date.length === 3 && time.length === 2) {
            let value = new Date()
            value.setFullYear(date[0])
            value.setMonth(date[1] - 1)
            value.setDate(date[2])
            value.setHours(time[0])
            value.setMinutes(time[1])
            return value
        }
        return null
    }
    return null

}

/**
 * 
 * @param {Date} datetime 
 */
export function exporDateToSQL(datetime) {
    return datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + datetime.getDate() + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":00"
}