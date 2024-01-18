const INFO = "INFO";
const WARN = "WARN";
const ERROR = "ERROR";

module.exports = (console) => {
    function log(type, ...message) {
        console.log(getTime(), `[${type.toUpperCase().padStart(5)}]`, ...message);
    }

    function info(...message) {
        log(INFO, ...message);
    }
    function warn(...message) {
        log(WARN, ...message);
    }
    function error(...message) {
        log(ERROR, ...message);
    }

    return {
        log: log,
        info: info,
        warn: warn,
        error: error,
    }
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