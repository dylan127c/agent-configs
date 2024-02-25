const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

delete require.cache[require.resolve("./settings.json")];
const settings = require("./settings.json");

delete require.cache[require.resolve("../lib/date-formatter")];
const formatter = require("../lib/date-formatter")

/**
 * 本方法用于检查是否需要更新默认规则目录 original 下的文件。
 * 
 * - 如果时间戳文件不存在，则进行更新；否则检查该时间与当前时间的间隔是否大于一周。
 * - 如果时间间隔大于一周，则进行文件更新；否则将跳过更新并输出上次文件更新的日期。
 * 
 * @async
 * @param {function} axios 网络请求框架
 * @param {object} log 控制台调试对象
 */
module.exports.updateCheck = (log, axios) => {
    const funcName = "updateCheck";
    fs.readFile(path.resolve(__dirname, settings.timestamp),
        "utf-8",
        (err, data) => {
            if (err) {
                log.info(mark(funcName), "initiate rules.");
                update(log, axios);
            } else {
                const savedTimestamp = parseInt(data);
                const currentTimestamp = Date.now();

                const intervalInHours = (currentTimestamp - savedTimestamp) / (1000 * 60 * 60);

                if (intervalInHours >= settings.interval) {
                    log.info(mark(funcName), "update rules.");
                    update(log, axios);
                } else {
                    log.info(mark(funcName), "update suspended.");
                    log.info(mark(funcName), "last updated:", formatter.getFormatDate(new Date(savedTimestamp)));
                }
            }
        });
}

/**
 * 本方法用于更新默认规则目录 default rules 下的文件。
 * 
 * - 由于目标地址不一定响应，因此 axios 可以保持异步请求，超时仅需要输出错误信息；
 * - 关于固定的文件名称，除非维护规则文件更新的作者修改了文件名称，否则不需要修改它们。
 * 
 * @async
 * @param {function} axios 网络请求框架
 * @param {object} log 控制台调试对象
 */
function update(log, axios) {
    const funcName = "update";
    const promises = settings.list.map(detail => {
        return axios({
            method: "get",
            url: detail.updateUrl,
        }).then(res => {
            return new Promise((resolve, reject) => {
                fs.writeFile(
                    path.resolve(
                        path.resolve(__dirname, detail.savePath),
                        detail.saveName + "." + detail.saveType
                    ),
                    res.data, 'utf8',
                    (err) => {
                        if (err) {
                            log.info(mark(funcName), "update failure:", detail.saveName + ".yaml");
                            log.info(mark(funcName), err);
                            reject(err);
                        } else {
                            log.info(mark(funcName), "up-to-date:", detail.saveName + ".yaml");
                            resolve();
                        }
                    }
                );
            });
        }).catch(err => {
            log.info(mark(funcName), "axios errors occurred:", detail.saveName + ".yaml");
            log.info(mark(funcName), err);
            return Promise.reject();
        });
    });
    Promise.all(promises)
        .then(() => {
            log.info(mark(funcName), "done.");
            updateTimestamp(log);
        })
        .catch(err => {
            log.info(mark(funcName), "some updates failed, timestamp won't update this time.");
            log.info(mark(funcName), err);
        });
}

/**
 * 本方法用于更新时间戳 timestamp.txt 文件。
 * 
 * 当 Date 对象调用 toString 方法时，JS 会根据实际运行环境来转换时间戳，得到符合当前时区的日期字符串。
 * 
 * @async
 * @param {object} log 控制台调试对象
 */
function updateTimestamp(log) {
    const funcName = "updateTimestamp";
    const currentTimestamp = Date.now();
    fs.writeFile(path.resolve(__dirname, settings.timestamp),
        currentTimestamp.toString(),
        (err) => {
            if (err) {
                log.info(mark(funcName), err);
            } else {
                log.info(mark(funcName), "timestamp file updated:",
                    formatter.getFormatDate(new Date(currentTimestamp)));
            }
        });
}