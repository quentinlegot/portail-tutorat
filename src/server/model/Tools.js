

    /**
     * time given by html time input, converted to duration in minutes
     * return 0 if cannot parse
     * @param {string} time 
     */
export function TimeInDuration(time) { 
    let strs = time.split(":")
    if(strs.length === 2) {
        return strs[0] * 60 + strs[1]
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