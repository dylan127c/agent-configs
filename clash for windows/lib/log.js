// module.exports = {
//     info,
//     error,
//     getTime,
//     getFormatDate
// }

module.exports = (console) => {
    const INFO = "INFO";
    const ERROR = "ERROR";
    const WARN = "WARN";

    function info(...message) {
        log(INFO, ...message);
    }

    function error(...message) {
        log(ERROR, ...message);
    }

    function warn(...message) {
        log(WARN, ...message);
    }

    function log(type, ...message) {
        console.log(getTime(), `[${type.toUpperCase().padStart(5)}]`, ...message);
    }

    function getTime() {
        const currentDate = new Date();

        const month = currentDate.toLocaleString('en-US', { month: 'short' });
        const day = currentDate.getDate();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const seconds = currentDate.getSeconds();

        return `[${month},${day < 10 ? '0' : ''}${day}]` +
            `[${hours < 10 ? '0' : ''}${hours}:` +
            `${minutes < 10 ? '0' : ''}${minutes}:` +
            `${seconds < 10 ? '0' : ''}${seconds}]`;
    }

    /**
     * 格式化输出日期。
     * 
     * => yyyy/MM/dd HH:mm:ss
     * 
     * @param {Date} date 日期对象
     * @returns {string} 格式化的日期字符串
     */
    function getFormatDate(date) {
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

    return {
        log: log,
        info: info,
        error: error,
        warn: warn,
        getTime: getTime,
        getFormatDate: getFormatDate
    }
}

