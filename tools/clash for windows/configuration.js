const fs = require("fs");
const path = require("path");

delete require.cache[require.resolve("./settings.json")];
const settings = require("./settings.json");

/**
 * @param {string} name subscription name
 * @param {string} raw subscription content
 */
module.exports.parse = async (raw, { axios, yaml, notify, console },
    { name, url, interval, selected }) => {

    try {
        delete require.cache[require.resolve(settings.main)];
        const main = require(settings.main);
        delete require.cache[require.resolve(settings.log)];
        const log = require(settings.log)(console);

        const funcName = "parse";
        log.info(mark(funcName), "parsing start.")

        const configuration = getConfig(log, name);
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

        /* TRANSFORM SHADOWROCKET RULES */
        outputShadowrocket(log, modifiedParams);

        /* CLASH FOR WINDOWS CONFIGURATION */
        const result = outputClash(main, axios, log, mode, originalConfiguration, modifiedParams);
        /* OUTPUT FORMATTED CONFIGURATION STRING */
        return yaml.stringify(result);
    } catch (error) {
        console.log(error);
        console.warn("Error occurred. Original configuration will be returned.")
        return raw;
    }
}

/**
 * Generate the content of the previous section of the log.
 * 
 * @param {string} name function name
 * @returns The content of the previous section of the log.
 */
function mark(name) {
    return path.basename(__filename).replace(".js", "") + "." + name + " =>";
}

/**
 * Read the specified configuration file based on conditions.
 * 
 * @param {string} condition subscription name
 * @returns {Function} configuration function
 */
function getConfig(log, condition) {
    const funcName = "getConfig";

    /* THE "_" OR " " IS DEFAULT SEPARATOR. */
    const shortName = condition.includes("_") ?
        condition.split("_")[0].toLowerCase() :
        condition.split(" ")[0].toLowerCase();

    /* CONFIGURATION SOURCES */
    const position = path.resolve(__dirname, settings.profiles, shortName);
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
 * Identify the source of the rule.
 * 
 * @param {object} mode rule combination
 * @param {object} modifiedParams specific configuration
 * @returns 
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
        mode.originalStatus = false;
        log.info(mark(funcName), "originalRemote accepted.")
    }
    try {
        fs.accessSync(modifiedParams.additionNative, fs.constants.F_OK);
        mode.additionStatus = true;
        log.info(mark(funcName), "additionNative accepted.")
    } catch (error) {
        mode.additionStatus = false;
        log.info(mark(funcName), "originalRemote accepted.")
    }
    log.info(mark(funcName), "mode:", Object.values(mode));
    return mode;
}

function update(axios, log) {
    const funcName = "update";
    try {
        delete require.cache[require.resolve(settings.update)];
        const update = require(settings.update);

        /* !!! ASYNC FUNCTIOAN !!! */
        update.updateCheck(axios, log);
    } catch (error) {
        log.warn(mark(funcName), "update.js missing.")
    }
}

function outputShadowrocket(log, modifiedParams) {
    const funcName = "outputShadowrocket";
    try {
        delete require.cache[require.resolve(settings.shadowrocketConfig)];
        const shadowrocket = require(settings.shadowrocketConfig);
        log.info(mark(funcName), "script applied.");

        shadowrocket.transformRules(log, modifiedParams);
        log.info(mark(funcName), "output completed.");
    } catch (error) {
        log.error(mark(funcName), "output failed.")
        log.error(mark(funcName), error);
    }
}

function outputClash(main, axios, log, mode, originalConfiguration, modifiedParams) {
    const funcName = "outputClash"
    /* CLASH FOR WINDOWS CONFIGURATION */
    const modeActual = getStatus(axios, log, mode, modifiedParams); // GET NEW(REAL) MODE
    log.info(mark(funcName), "main parsing start.")
    const generateConfiguration = main.generate(log, modeActual, originalConfiguration, modifiedParams); // GENERATE NEW CONFIGURATION
    log.info(mark(funcName), "main parsing completed.")

    /* CHANGE PROXY NAME */
    nameChanger(generateConfiguration, modifiedParams);
    proxyAdder(generateConfiguration, modifiedParams);
    return generateConfiguration;
}

/**
 * Replace agent name.
 * 
 * @param {object} configuraion generated configuration
 * @param {object} modifiedParams specific configuration
 */
function nameChanger(configuraion, modifiedParams) {
    if (!modifiedParams.hasOwnProperty("replacement")) {
        return;
    }
    const replacementMap = modifiedParams.replacement;
    if (replacementMap) {
        configuraion.proxies.forEach(proxy => {
            proxy.name = replacement(proxy.name, replacementMap);
        });
        configuraion["proxy-groups"].forEach(group => {
            const replacedArray = group.proxies.map(name => {
                return replacement(name, replacementMap);
            })
            group.proxies = replacedArray;
        })
    }
}

function replacement(str, map) {
    for (const [search, replace] of Object.entries(map)) {
        if (search.includes("/gm")) {
            str = str.replace(eval(search), replace);
        } else {
            str = str.replace(search, replace);
        }
    }
    return str;
}

function proxyAdder(configuraion, modifiedParams) {
    if (!modifiedParams.hasOwnProperty("proxiesSpecialized")) {
        return;
    }

    const proxiesConfig = modifiedParams.proxiesSpecialized;
    const proxiesArr = proxiesConfig.proxiesAddition;
    if (proxiesArr) {
        proxiesArr.forEach(proxy => {
            configuraion.proxies.push(proxy);
        })
    }
    configuraion["proxy-groups"].forEach(group => {
        const map = proxiesConfig.proxiesMapping;
        for (const [search, add] of Object.entries(map)) {
            if (group.name.includes(search)) {
                group.proxies.unshift(add);
                break;
            }
        }
    })
}