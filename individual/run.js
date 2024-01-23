const axios = require("axios");
const yaml = require('yaml');
const fs = require("fs");
const path = require("path");

delete require.cache[require.resolve("./settings.json")];
const settings = require("./settings.json");

const logFilePath = path.join(__dirname, settings.log);
const logStream = fs.createWriteStream(logFilePath);
console.log = (...messages) => {
    const logMessage = messages.join(" ");
    logStream.write(`${logMessage}\n`);
}

delete require.cache[require.resolve(settings.source)];
const preset = require(settings.source);
const subs = preset.subscriptions;

const promises = Object.keys(subs).map(name => {
    const link = subs[name];
    return new Promise((resolve, reject) => {
        axios.get(link)
            .then(function (response) {
                const configuration = tryParse(response.data);
                const configurationRaw = yaml.stringify(configuration);

                parse(configurationRaw, axios, yaml, name);
                resolve();
            })
            .catch(function (error) {
                console.log(error);
                reject();
            });
    });
});

/* ONLY UPDATE ONCE */
Promise.all(promises)
    .then(() => {
        delete require.cache[require.resolve("../commons/lib/log")];
        const log = require("../commons/lib/log")(console);

        /* ORIGINAL RULES UPDATER */
        update(axios, log);
    })
    .catch(err => {
        console.log(err);
    });

function tryParse(encryptedRaw) {
    /* PLAIN TEXT SUBSCRIPTION CONTENT */
    const configuraion = yaml.parse(encryptedRaw);
    if (configuraion.hasOwnProperty("proxies")) {
        return {
            proxies: configuraion.proxies
        };
    }

    /* ENCRYPTED SUBSCRIPTION CONTENT */
    const afterBase64 = atob(encryptedRaw);
    const afterURI = decodeURI(afterBase64);
    const nodes = afterURI.split("\r\n");

    const arr = [];
    nodes.forEach(node => {
        if (node !== "") {
            const name = node.match(/(?<=#).+$/gm)[0].toString();
            const type = node.match(/^.+?:/gm)[0].toString();

            const serverAndPort = node.match(/(?<=@).+(?=#)/gm)[0].toString();
            const server = serverAndPort.match(/^.+(?=:)/gm)[0].toString();
            const port = serverAndPort.match(/(?<=:).+$/gm)[0].toString();

            const cipherAndPassword = atob(node.match(/(?<=\/\/).+(?=@)/gm)[0].toString());
            const cipher = cipherAndPassword.match(/^.+(?=:)/gm)[0].toString();
            const password = cipherAndPassword.match(/(?<=:).+$/gm)[0].toString();

            const newNode = {
                name: name,
                type: type,
                server: server,
                port: port,
                cipher: cipher,
                password: password,
                udp: true
            }
            arr.push(newNode);
        }
    });

    return {
        proxies: arr
    }
}

/**
 * @param {string} name subscription name
 * @param {string} raw subscription content
 */
function parse(raw, axios, yaml, name) {

    try {
        delete require.cache[require.resolve("../commons/main")];
        const main = require("../commons/main");
        delete require.cache[require.resolve("../commons/lib/log")];
        const log = require("../commons/lib/log")(console);

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

        /* GENERATE CONFIGURATION */
        let generateConfiguration = main.generate(log, mode, originalConfiguration, modifiedParams);

        /* STASH && SHADOWROCKET CONFIGURATION */
        outputStash(yaml, log, name, generateConfiguration);
        outputShadowrocket(log, name, generateConfiguration, modifiedParams);

        return;

        /* CLASH FOR WINDOWS CONFIGURATION */
        mode = getStatus(axios, log, mode, modifiedParams); // GET NEW(REAL) MODE
        log.info(mark(funcName), "main parsing start.")
        generateConfiguration = main.generate(log, mode, originalConfiguration, modifiedParams); // GENERATE NEW CONFIGURATION
        log.info(mark(funcName), "main parsing completed.")

        /* CHANGE PROXY NAME */
        nameChanger(generateConfiguration, modifiedParams);

        /* OUTPUT FORMATTED CONFIGURATION STRING */
        return yaml.stringify(generateConfiguration);
    } catch (error) {
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
    const position = path.resolve(__dirname, "..", "profiles", shortName);
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
        delete require.cache[require.resolve("../commons/rules/update")];
        const update = require("../commons/rules/update");

        /* !!! ASYNC FUNCTIOAN !!! */
        update.updateCheck(axios, log);
    } catch (error) {
        log.warn(mark(funcName), "update.js missing.")
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
        log.error(mark(funcName), "output failed.")
        log.error(mark(funcName), error);
    }
}

function outputShadowrocket(log, name, output, modifiedParams) {
    const funcName = "outputShadowrocket";
    try {
        delete require.cache[require.resolve("../shadowrocket/configuration")];
        const shadowrocket = require("../shadowrocket/configuration");
        log.info(mark(funcName), "script applied.");

        shadowrocket.output(log, name, output, modifiedParams);
        log.info(mark(funcName), "output completed.");
    } catch (error) {
        log.error(mark(funcName), "output failed.")
        log.error(mark(funcName), error);
    }
}

function outputClashVerge(log) {
    const funcName = "outputClashVerge";
    try {
        delete require.cache[require.resolve("../clash verge/transform")];
        const cv = require("../clash verge/transform");
        log.info(mark(funcName), "script applied.");

        cv.output();
        log.info(mark(funcName), "output completed.");
    } catch (error) {
        log.error(mark(funcName), "output failed.")
        log.error(mark(funcName), error);
    }
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
    if (!str.match(/\d\d/gm)) {
        return str;
    }
    for (const [search, replace] of Object.entries(map)) {
        if (search.includes("/gm")) {
            str = str.replace(eval(search), replace);
        } else {
            str = str.replace(search, replace);
        }
    }
    return str;
}