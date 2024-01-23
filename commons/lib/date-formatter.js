/**
 * Output a formatted date.
 * 
 * => yyyy/MM/dd HH:mm:ss
 * 
 * @param {Date} date
 */
module.exports.getFormatDate = (date) => {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Shanghai'
    }).format(date);
}