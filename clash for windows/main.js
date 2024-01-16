const FILENAME = "main";

const ADDITION = "addition";
const ORIGINAL = "original";

/**
 * @method {@link getProxyGroups}
 */
const SELECT = "select";
const TEST_URL = "http://www.gstatic.com/generate_204";
const TEST_INTERVAL = 72;
const TEST_LAZY = true;
const DEFAULT_PROXY = "DIRECT";

/**
 * @method {@link getRuleProviders}
 */
const FILE = "file";
const HTTP = "http";

module.exports.generate = (log, mode, originalConfiguration, modifiedParams, isConfigRemote) => {
    const funcName = "generate";

    /* INITIALIZE */
    const newConfiguration = init(log, originalConfiguration, modifiedParams);

    /* RULES */
    const identifiers = [ADDITION, ORIGINAL];
    newConfiguration["rules"] = getRules(modifiedParams, identifiers);

    /* PROXY GROUPS */
    newConfiguration["proxy-groups"] = getProxyGroups(modifiedParams, originalConfiguration);
    /* RULE PROVIDERS */
    newConfiguration["rule-providers"] = getRuleProviders(modifiedParams, mode);

    /* FINAL CONFIGURATION */
    log.info(mark(funcName), "parsing done.");
    const rawConfiguration = JSON.stringify(newConfiguration);
    return isConfigRemote ?
        rawConfiguration :
        replaceAndReturn(rawConfiguration, modifiedParams.replacement);
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
    initConfiguration.proxies = configuration.proxies;
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
            return ele.replace(",", ",".concat(prefix, modifiedParams.connector));
        });
        arr = arr.concat(provisional);
    });
    return arr.concat(modifiedParams.endRules);
}

function getProxyGroups(modifiedParams, configuraion) {
    const arr = [];
    modifiedParams.groups.forEach(group => {
        const groupConstruct = {
            name: group.name,
            type: group.type,
            proxies: group.proxies ? Array.from(group.proxies) : []
        };

        if (group.type !== SELECT) {
            groupConstruct.url = TEST_URL;
            groupConstruct.interval = TEST_INTERVAL;
            groupConstruct.lazy = TEST_LAZY;
        }

        if (group.append) {
            configuraion.proxies.forEach(proxy => {
                if (proxy.name.match(group.append)) {
                    groupConstruct.proxies.push(proxy.name);
                }
            });
        }

        if (!groupConstruct.proxies.length) {
            groupConstruct.proxies.push(DEFAULT_PROXY);
            configuraion.proxies.forEach(proxy => {
                groupConstruct.proxies.push(proxy.name);
            });
        }
        arr.push(groupConstruct);
    })
    return arr;
}

function getRuleProviders(modifiedParams, mode) {
    let ruleProviders = {};
    if (modifiedParams.additionRules) {
        const link = mode.additionStatus ? "path" : "url";
        const ruleNames = modifiedParams.additionRules.map(ele => {
            return ele.replace(",no-resolve", "").match(/(?<=,).+(?=,)/gm).toString();
        });
        ruleNames.forEach(name => {
            ruleProviders[modifiedParams.additionPrefix.concat(modifiedParams.connector + name)] = {
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
            ruleProviders[modifiedParams.originalPrefix.concat(modifiedParams.connector + name)] = {
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

/**
 * 获取 ./profiles 中的替换信息，以替换输出配置中的某些文本信息。
 * 
 * @param {string} str 已解析并重构的配置信息
 * @param {Map<string, string>} map 记录替换信息的映射表
 * @returns {string} 已处理完毕的配置信息
 */
function replaceAndReturn(str, map) {
    for (const [search, replace] of Object.entries(map)) {
        if (search.includes("/")) {
            str = str.replaceAll(eval(search), replace);
        } else {
            str = str.replaceAll(search, replace);
        }
    }
    return str;
}