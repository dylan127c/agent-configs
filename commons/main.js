const IDENTIFIERS = ["addition", "original"];

/** @method {@link mark} */
const FILENAME = "main";

/** @method {@link getProxyGroups} */
const SELECT = "select";
const LOAD_BALANCE = "load-balance";
const URL_TEST = "url-test";
const HEALTH_CHECK_URL = "https://www.gstatic.com/generate_204";
const TEST_INTERVAL = 300;
const LAZY_TESTING = true;
const STRATEGY = "consistent-hashing";
const TOLERANCE = 50;
const MAIN_NETWORK_INDEX = 0;
const REJECT = "REJECT";
const DIRECT = "DIRECT";
const CONNECTOR = "-";
const DEFAULT_PROXY = "REJECT";

/** @method {@link getRuleProviders} */
const FILE = "file";
const HTTP = "http";

/**
 * Generate configuration.
 */
module.exports.generate = (log, mode, originalConfiguration, modifiedParams) => {
    const funcName = "generate";

    /* INITIALIZE */
    const newConfiguration = init(log, originalConfiguration, modifiedParams);

    /* RULES */
    newConfiguration["rules"] = getRules(modifiedParams, IDENTIFIERS);
    /* PROXY GROUPS */
    newConfiguration["proxy-groups"] = getProxyGroups(modifiedParams, newConfiguration);
    /* RULE PROVIDERS */
    newConfiguration["rule-providers"] = getRuleProviders(mode, modifiedParams);

    /* FINAL CONFIGURATION */
    log.info(mark(funcName), "parsing done.");
    return newConfiguration;
}

function mark(name) {
    return FILENAME + "." + name + " =>";
}

function init(log, configuration, modifiedParams) {
    const funcName = "init";

    /* INITIALIZE */
    let initConfiguration;
    try {
        delete require.cache[require.resolve(modifiedParams.initScript)];
        const build = require(modifiedParams.initScript).build;
        initConfiguration = build();
    } catch (error) {
        log.error(mark(funcName), "initScript missing.");
        log.error(mark(funcName), error);
    }

    /* PROXIES */
    initConfiguration.proxies = Array.from(configuration.proxies);
    /* RETURN NEW CONFIGURATION */
    return initConfiguration;
}

function getRules(modifiedParams, identifiers) {
    let arr = [];
    identifiers.forEach(identifier => {
        const rules = modifiedParams[identifier + "Rules"];
        const prefix = modifiedParams[identifier + "Prefix"];

        if (!rules || !rules.length) {
            return arr;
        }
        const provisional = rules.map(ele => {
            return ele.replace(",", ",".concat(prefix, CONNECTOR));
        });
        arr = arr.concat(provisional);
    });
    return arr.concat(modifiedParams.endRules);
}

function getProxyGroups(modifiedParams, configuraion) {
    if (modifiedParams.hasOwnProperty("removal")) {
        modifiedParams.removal.forEach(condition => {
            const index = configuraion.proxies
                .findIndex(proxy => proxy.name.includes(condition));
            configuraion.proxies.splice(index, 1);
        })
    }

    const groupsAll = modifiedParams.hasOwnProperty("mainRequiredGroups") ?
        [modifiedParams.mainGroup, modifiedParams.ruleRequiredGroups, modifiedParams.mainRequiredGroups] :
        [modifiedParams.mainGroup, modifiedParams.ruleRequiredGroups]

    const arr = [];
    for (let i = 0; i < groupsAll.length; i++) {
        for (let j = 0; j < groupsAll[i].length; j++) {
            const group = groupsAll[i][j];
            const groupConstruct = {
                name: group.name,
                type: group.type,
                proxies: group.hasOwnProperty("proxies") ? Array.from(group.proxies) : [],
            };

            if (group.type !== SELECT) {
                groupConstruct.url = HEALTH_CHECK_URL;
                groupConstruct.lazy = LAZY_TESTING;

                /* CONSISTENT-HASHING IS DEFAULT STRATEGY */
                if (group.type === LOAD_BALANCE) {
                    groupConstruct.strategy = STRATEGY;
                }
                if (group.type === URL_TEST) {
                    groupConstruct.tolerance = TOLERANCE;
                }
                /* ALLOW CUSTOMIZE HEALTH CHECK INTERVAL */
                if (modifiedParams.hasOwnProperty("interval")) {
                    groupConstruct.interval = modifiedParams.interval;
                } else {
                    groupConstruct.interval = TEST_INTERVAL;
                }
            }

            if (i === 0) {
                if (groupsAll.length === 2) {
                    /* DEFAULT PROXIES ADDING TO AVOID EMPTY GROUP PROXIES */
                    groupConstruct.proxies.push(DEFAULT_PROXY);
                    configuraion.proxies.forEach(proxy => {
                        groupConstruct.proxies.push(proxy.name);
                    });
                }
                arr.push(groupConstruct);
                break;
            }

            const conditions = [];
            if (group.hasOwnProperty("append")) {
                configuraion.proxies.forEach(proxy => {
                    /* GET THE CONDITIONS FOR RESERSING SORTING */
                    if (group.hasOwnProperty("reverse")) {
                        const condition = proxy.name.match(group.reverse);
                        if (condition && condition.length) {
                            conditions.push(condition[0]);
                        }
                    }
                    if (proxy.name.match(group.append)) {
                        groupConstruct.proxies.push(proxy.name);
                    }
                });
            }

            /* REVERSE SORTING BASED ON CONDITIONS */
            if (conditions.length) {
                const ordered = [];
                [...new Set(conditions)].forEach(condition => {
                    const saver = [];
                    groupConstruct.proxies.forEach(name => {
                        if (name.match(condition)) {
                            saver.unshift(name);
                        }
                    });
                    saver.forEach(name => {
                        ordered.push(name);
                    });
                });
                groupConstruct.proxies = Array.from(ordered);
            }

            /* DEFAULT PROXIES BEHAVIOR TO REMOVE UNQUALIFIED GROUP'S PROXIES */
            if (i === 2) {
                if (groupConstruct.proxies.length === 0) {
                    continue;
                } else if (groupConstruct.proxies.length === 1 &&
                    (groupConstruct.proxies[0] === REJECT || groupConstruct.proxies[0] === DIRECT)) {
                    continue;
                } else {
                    arr[0].proxies.push(groupConstruct.name);
                }
            }
            arr.push(groupConstruct);
        }
    }
    return arr;
}

function getRuleProviders(mode, modifiedParams) {
    let ruleProviders = {};
    if (modifiedParams.additionRules) {
        const link = mode.additionStatus ? "path" : "url";
        const ruleNames = modifiedParams.additionRules.map(ele => {
            return ele.replace(",no-resolve", "").match(/(?<=,).+(?=,)/gm).toString();
        });
        ruleNames.forEach(name => {
            ruleProviders[modifiedParams.additionPrefix.concat(CONNECTOR + name)] = {
                type: mode.additionStatus ? FILE : HTTP,
                behavior: getBehavior(modifiedParams, name),
                [link]: mode.additionStatus ?
                    modifiedParams.additionNative.concat("/", name, ".", modifiedParams.additionNativeType) :
                    modifiedParams.additionRemote.concat("/", name, ".", modifiedParams.additionRemoteType),
                interval: 86400
            }
        })
    }
    if (modifiedParams.originalRules) {
        const link = mode.additionStatus ? "path" : "url";
        const ruleNames = modifiedParams.originalRules.map(ele => {
            return ele.replace(/^.+?,/gm, "").replace(/,.+$/gm, "");
        });
        ruleNames.forEach(name => {
            ruleProviders[modifiedParams.originalPrefix.concat(CONNECTOR + name)] = {
                type: mode.originalStatus ? FILE : HTTP,
                behavior: getBehavior(modifiedParams, name),
                [link]: mode.originalStatus ?
                    modifiedParams.originalNative.concat("/", name, ".", modifiedParams.originalNativeType) :
                    modifiedParams.originalRemote.concat("/", name, ".", modifiedParams.originalRemoteType),
                interval: 86400
            }
        })
    }
    return ruleProviders;
}

function getBehavior(modifiedParams, name) {
    for (const [behavior, arr] of Object.entries(modifiedParams.behavior)) {
        if (arr.includes(name)) {
            return behavior;
        }
    }
    return modifiedParams.defaultBehavior;
}