const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

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

/**
 * 本方法用于解析并重构配置文件。
 * 
 * @param {object} console 控制台调试对象
 * @param {object} originalConfiguration 原始的配置文件对象
 * @param {number[]} mode 存储规则组合的数组
 * @param {function} configuration 存储配置信息的函数
 * @param {boolean} isConfigRemote 指示当前是否为输出 Stash 配置模式
 * @returns {string} 已解析并重构的配置文件信息
 */
module.exports.generate = (log, mode, originalConfiguration, modifiedParams, isConfigRemote) => {
    const funcName = "generate";

    /* INITIALIZE */
    const newConfiguration = init(log, originalConfiguration, modifiedParams);

    /* RULES */
    const originalRulesSaver = addRulePrefix(
        modifiedParams.prefixConnector,
        modifiedParams.originalPrefix,
        modifiedParams.originalRules
    );
    const additionRulesSaver = addRulePrefix(
        modifiedParams.prefixConnector,
        modifiedParams.additionPrefix,
        modifiedParams.additionRules
    );
    newConfiguration["rules"] = additionRulesSaver.concat(originalRulesSaver, modifiedParams.endRules);

    /* PROXY GROUPS */
    newConfiguration["proxy-groups"] = getProxyGroups(modifiedParams, originalConfiguration);

    /* RULE PROVIDERS */
    newConfiguration["rule-providers"] = getRuleProviders(modifiedParams, mode);

    /* FINAL CONFIGURATION */
    log.info(mark(funcName), "parsing done.");
    return isConfigRemote ?
        JSON.stringify(newConfiguration) :
        outputClashConfig(newConfiguration, modifiedParams.replacement);
}

/**
 * 
 * 
 * 本方法用于初始化新的配置文件。
 * 
 * @param {object} configuration 原始的配置文件对象
 * @returns {object} 初始化的新的配置文件对象
 */
function init(log, configuration, modifiedParams) {
    const funcName = "init";
    /* INITIALIZE */
    let initConfiguration;
    try {
        delete require.cache[require.resolve(modifiedParams.initScript)];
        const initScript = require(modifiedParams.initScript);
        initConfiguration = initScript.build();
    } catch (error) {
        log.error(mark(funcName), "initScript missing.");
        log.error(mark(funcName), error);
    }

    /* PROXIES */
    initConfiguration.proxies = configuration.proxies;

    /* RETURN NEW CONFIGURATION */
    return initConfiguration;
}

/**
 * 本方法用于为规则数组中的文件名称添加前缀信息。
 * 
 * @param {string} rulePrefix 需要添加的前缀信息
 * @param  {string | string[]} ruleArrays 存储规则字符串的数组
 * @returns {string[]} 已添加前缀信息规则数组
 */
function addRulePrefix(connector, prefix, ...rules) {
    let arr = [];
    if (!rules || rules.toString() === "") {
        return arr;
    }

    rules.forEach(rule => {
        const provisional = rule.map(ele => ele.replace(",", ",".concat(prefix, connector)));
        arr = arr.concat(provisional);
    })
    return arr;
}

/**
 * 本方法用于构建具体的分组信息。
 * 
 * @param {object[]} details 存储分组信息的对象数组
 * @param {object[]} proxies 存储所有节点信息的对象数组
 * @returns {object[]} 已完成分组的对象数组 
 */
function getProxyGroups(modifiedParams, configuraion) {

    /* 从 profile 中读取所有的分组信息，遍历以构造可用于配置的分组格式。*/
    const arr = [];
    modifiedParams.groups.forEach(group => {
        const groupConstruct = {
            name: group.name,
            type: group.type,
            proxies: group.proxies ? group.proxies : []
        };

        /* 如果类型不为 select 则为该分组添加测试参数。*/
        if (group.type !== SELECT) {
            groupConstruct.url = TEST_URL;
            groupConstruct.interval = TEST_INTERVAL;
            groupConstruct.lazy = TEST_LAZY;
        }

        /* 在默认 proxies 的基础上，添加额外的节点信息。*/
        if (group.append) {
            configuraion.proxies.forEach(proxy => {
                if (proxy.name.match(group.append)) {
                    groupConstruct.proxies.push(proxy.name);
                }
            });
        }

        /* 如果 proxies 中没有任何节点信息，则默认将 DEFAULT_PROXY 及所有的节点添加至 proxies 中。*/
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

/**
 * 本方法用于构建规则集的具体获取方式。
 * 
 * @param {string[]} rules 存储规则信息的数组
 * @param {string} rulePrefix 规则文件的前缀信息
 * @param {object} ruleSource 存储规则集的来源信息
 * @returns {object} 具体的规则集对象
 */
function getRuleProviders(modifiedParams, mode) {
    let ruleProviders = {};
    if (modifiedParams.additionRules) {
        const ruleNames = modifiedParams.additionRules.map(ele => {
            return ele.replace(",no-resolve", "").match(/(?<=,).+(?=,)/gm).toString();
        });
        ruleNames.forEach(name => {
            ruleProviders[modifiedParams.additionPrefix.concat(modifiedParams.prefixConnector + name)] = {
                type: mode.additionStatus ? FILE : HTTP,
                behavior: getBehavior(modifiedParams, name),
                path: mode.additionStatus ?
                    modifiedParams.additionNative.concat("/", name, ".", modifiedParams.additionNativeType) :
                    modifiedParams.additionRemote.concat("/", name, ".", modifiedParams.additionRemoteType),
                interval: 86400
            }
        })
    }
    if (modifiedParams.originalRules) {
        const ruleNames = modifiedParams.originalRules.map(ele => {
            return ele.replace(/^.+?,/gm, "").replace(/,.+$/gm, "");
        });
        ruleNames.forEach(name => {
            ruleProviders[modifiedParams.originalPrefix.concat(modifiedParams.prefixConnector + name)] = {
                type: mode.originalStatus ? FILE : HTTP,
                behavior: getBehavior(modifiedParams, name),
                path: mode.originalStatus ?
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
 * 本方法用于获取解析完毕的配置信息。
 * 
 * @param {object} configuration 已解析并重构的配置文件对象
 * @param {object} replacement 需替换的配置信息对象
 * @returns {string} 已替换信息的配置文件信息
 */
function outputClashConfig(configuration, replacement) {
    return fixSomeFlag(JSON.stringify(configuration), replacement);
}

/**
 * 本方法用于替换配置中的某些文本信息。
 * 
 * @param {string} str 已解析并重构的配置信息
 * @param {Map<string, string>} map 记录替换信息的映射表
 * @returns {string} 已处理完毕的配置信息
 */
function fixSomeFlag(str, map) {
    for (const [search, replace] of Object.entries(map)) {
        str = str.replaceAll(search, replace);
    }
    return str;
}