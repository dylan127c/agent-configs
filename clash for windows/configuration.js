const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

/**
 * 本方法用于解析 CFW 相关的订阅配置。
 * 
 * @param {string} raw 原始配置文件信息
 * @param {function} axios 网络请求框架
 * @param {object} yaml yaml 框架
 * @param {object} console 控制台调试对象
 * @param {string} url 订阅地址
 * @returns {string} 已处理完毕的配置信息
 */
module.exports.parse = async (raw, { axios, yaml, notify, console },
    { name, url, interval, selected }) => {

    const funcName = "parse";
    delete require.cache[require.resolve("./lib/log")];
    const log = require("./lib/log")(console);
    delete require.cache[require.resolve("./main")];
    const main = require("./main");
    log.info(mark(funcName), "parsing start.")

    const configuration = getConfig(name, log);
    if (configuration === undefined) {
        log.info(mark(funcName), "original configuration applied.")
        return raw;
    }

    /* MODIFIED PARAMETERS */
    const modifiedParams = configuration();
    /* ORIGINAL CONFIGURATION */
    const originalConfiguration = yaml.parse(raw);
    /* ORIGINAL MODE */
    let mode = {
        originalStatus: false,
        additionStatus: false
    }
    log.info(mark(funcName), "mode:", Object.values(mode));

    /* GENERATE CONFIGURATION */
    let generateConfiguration = main.generate(log, mode, originalConfiguration, modifiedParams, true);

    /* STASH && SHADOWROCKET CONFIGURATION */
    outputStash(yaml, log, name, generateConfiguration);
    outputShadowrocket(yaml, log, name, generateConfiguration, modifiedParams);

    log.info(mark(funcName), "main parsing start.")

    /* CLASH FOR WINDOWS CONFIGURATION */
    mode = getStatus(axios, log, mode, modifiedParams); // GET NEW(REAL) MODE
    generateConfiguration = main.generate(log, mode, originalConfiguration, modifiedParams); // GENERATE NEW CONFIGURATION
    log.info(mark(funcName), "main parsing completed.")

    /* OUTPUT FORMATTED CONFIGURATION STRING */
    return yaml.stringify(JSON.parse(generateConfiguration));
}

/**
 * 本方法用于判断当前使用的配置文件，需要根据实际的配置情况对方法进行调整。
 * 
 * @param {any} condition 判断条件
 * @param {object} console 控制台调试对象
 * @returns {function} 具体的配置文件
 */
function getConfig(condition, log) {
    const funcName = "getConfig";
    const shortName = condition.includes("_") ?
        condition.split("_")[0].toLowerCase() :
        condition.split(" ")[0].toLowerCase();
    const position = path.resolve(__dirname, "profiles", shortName);
    try {
        delete require.cache[require.resolve(position)];
        const moduleConfig = require(position);
        log.info(mark(funcName), shortName + ".js loaded.");
        return moduleConfig.configuration
    } catch (error) {
        log.warn(mark(funcName), shortName + ".js missing.");
    }
}

/**
 * 本方法用于判断规则文件来源于网络 HTTP 还是本地文件 FILE。
 * 
 * @param {number[]} mode 初始化组合
 * @param {function} axios 网络请求框架
 * @param {object} console 控制台调试对象
 * @returns {number[]} 已检查组合
 */
function getStatus(axios, log, mode, modifiedParams) {
    const funcName = "getStatus";
    try {
        fs.accessSync(modifiedParams.originalNative, fs.constants.F_OK);
        mode.originalStatus = true;
        log.info(mark(funcName), "originalNative accepted.")

        /* ORIGINAL RULES UPDATER */
        update(axios, log);
    } catch (error) {
        log.info(mark(funcName), "originalRemote accepted.")
    }
    try {
        fs.accessSync(modifiedParams.additionNative, fs.constants.F_OK);
        mode.additionStatus = true;
        log.info(mark(funcName), "additionNative accepted.")
    } catch (error) {
        log.info(mark(funcName), "originalRemote accepted.")
    }
    log.info(mark(funcName), "mode:", Object.values(mode));
    return mode;
}

function update(axios, log) {
    const funcName = "update";
    try {
        delete require.cache[require.resolve("./rules/update")];
        const update = require("./rules/update");

        /* !!! ASYNC FUNCTIOAN !!! */
        update.updateCheck(axios, log);
    } catch (error) {
        log.warn(mark(funcName), "./rules/update.js missing.")
    }
}

function outputStash(yaml, log, name, output) {
    const funcName = "outputStash";
    try {
        delete require.cache[require.resolve("../stash/configuration")];
        const stash = require("../stash/configuration");
        log.info(mark(funcName), "script applied.");

        stash.output(yaml, log, name, output);
        log.info(mark(funcName), "output completed.");
    } catch (error) {
        log.error(mark(funcName), "output failure.")
        log.error(mark(funcName), error);
    }
}

function outputShadowrocket(yaml, log, name, output, modifiedParams) {
    const funcName = "outputShadowrocket";
    try {
        delete require.cache[require.resolve("../shadowrocket/configuration")];
        const shadowrocket = require("../shadowrocket/configuration");
        log.info(mark(funcName), "script applied.");

        shadowrocket.output(yaml, log, name, output, modifiedParams);
        log.info(mark(funcName), "output completed.");
    } catch (error) {
        log.error(mark(funcName), "output failure.")
        log.error(mark(funcName), error);
    }
}