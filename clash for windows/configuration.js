const PATH = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash for windows/";
const URL = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/";

const SOURCES = {
    defaultFile: PATH + "default rules",
    customizeFile: PATH + "customize rules",
    defaultHttp: URL + "default%20rules",
    customizeHttp: URL + "customize%20rules"
};
const STASH_FOLDER = "H:/OneDrive/Documents/Repositories/Proxy Rules/stash";
const SHADOWROCKET_FOLDER = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket";

const RULE_UPDATE_HTTP = "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release";
const RULE_UPDATE_NAMES = ["apple", "applications", "cncidr", "direct", "gfw", "greatfire",
    "icloud", "lancidr", "private", "proxy", "reject", "telegramcidr", "tld-not-cn"];
const RULE_UPDATE_TYPE = "txt";

/**
 * 本方法用于解析CFW相关的订阅配置。
 * 
 * - CFW使用此脚本不需要移除或注释main方法。
 * 
 * @param {string} raw 原始配置文件信息
 * @param {object} axios 网络请求框架
 * @param {object} yaml yaml框架
 * @param {object} console 控制台调试对象
 * @param {string} url 订阅地址
 * @returns {string} 已处理完毕的配置信息
 */
module.exports.parse = async (raw, { axios, yaml, notify, console },
    { name, url, interval, selected }) => {

    console.log("[ INFO] configuration.parse =>", "Get config.");
    const configuration = getConfig(url, console);
    if (configuration === undefined) {
        console.log("[ INFO] configuration.parse =>",
            "The default configuration will be returned")
        return raw;
    }
    const mode = [0, 0];
    console.log("[ INFO] configuration.parse =>", "Current combination mode:", mode, "\n");

    console.log("[ INFO] configuration.parse =>", "Export Stash config.");
    outputStash(mode, raw, yaml, console, configuration);

    console.log("[ INFO] configuration.parse =>", "Export Shadowrocket config.");
    outputShadowrocket(mode, raw, yaml, console, configuration);

    console.log("[ INFO] configuration.parse =>", "Main parse start.");
    const result = yaml.stringify(JSON.parse(get(
        console,
        yaml.parse(raw),
        getMode(mode, axios, console),
        configuration
    )));
    console.log("[ INFO] configuration.parse =>", "Parsing main configuration successful.\n");
    return result;
}

/**
 * 本方法用于判断当前使用的配置文件。
 * 
 * 注：可根据实际情况调整此方法的内容。
 * 
 * @param {any} condition 判断条件
 * @returns {Function} 具体的配置文件
 */
function getConfig(condition, console) {
    if (condition.match(/touhou/gm)) {
        try {
            delete require.cache[require.resolve("./config-on")];
            const moduleConfig = require("./config-on");
            console.log("[ INFO] configuration.getConfig =>",
                "Configuration file config-on.js has been loaded.\n");
            return moduleConfig.configurationOn;
        } catch (error) {
            console.log("[ INFO] configuration.getConfig =>",
                "Configuration file config-on.js doesn't exist.\n");
            return;
        }
    } else if (condition.match(/sub/gm)) {
        try {
            delete require.cache[require.resolve("./config-cc")];
            const moduleConfig = require("./config-cc");
            console.log("[ INFO] configuration.getConfig =>",
                "Configuration file config-cc.js has been loaded.\n");
            return moduleConfig.configurationCc;
        } catch (error) {
            console.log("[ INFO] configuration.getConfig =>",
                "Configuration file config-cc.js doesn't exist.\n");
            return;
        }
    }
    console.log("[ INFO] configuration.getConfig =>", "No configuration files have been found.");
}

/**
 * 本方法用于判断是否需要输出相关的Stash配置文件。
 * 
 * - 如果Stash输出目录不存在，即表示不需要输出Stash配置文件；
 * - 如果输出目录存在，但不存在output.js文件，这也表明不需要输出Stash配置文件。
 * 
 * @param {string} raw 原始配置文件
 * @param {object} yaml yaml框架
 * @param {object} console 控制台调试
 * @param {string} url 订阅地址
 */
function outputStash(mode, raw, yaml, console, configuration) {
    const fs = require("fs");
    try {
        fs.accessSync(STASH_FOLDER, fs.constants.F_OK);
        delete require.cache[require.resolve("./output-stash")];
        const output = require("./output-stash");
        console.log("[ INFO] configuration.outputStash =>", "Parsing start.");
        output.runStash(yaml, get(console, yaml.parse(raw), mode, configuration, true), console);
        console.log("[ INFO] configuration.outputStash =>",
            "Stash configuration exported.\n");
    } catch (error) {
        console.log("[ INFO] configuration.outputStash =>",
            "Stash folder or configuration file doesn't exist.\n");
    }
}

/**
 * 本方法用于判断是否需要输出相关的Shadowrocket配置文件。
 * 
 * - 如果Shadowrocket输出目录不存在，即表示不需要输出Shadowrocket配置文件；
 * - 如果输出目录存在，但不存在output.js文件，这也表明不需要输出Shadowrocket配置文件。
 * 
 * @param {string} raw 原始配置文件
 * @param {object} yaml yaml框架
 * @param {object} console 控制台调试
 * @param {string} url 订阅地址
 */
function outputShadowrocket(mode, raw, yaml, console, configuration) {
    const fs = require("fs");
    try {
        fs.accessSync(SHADOWROCKET_FOLDER, fs.constants.F_OK);
        delete require.cache[require.resolve("./output-shadowrocket")];
        const output = require("./output-shadowrocket");
        console.log("[ INFO] configuration.outputShadowrocket =>", "Parsing start.");
        output.runShadowrocket(yaml, get(console, yaml.parse(raw), mode, configuration, true), console);
        console.log("[ INFO] configuration.outputShadowrocket =>",
            "Shadowrocket configuration exported.\n");
    } catch (error) {
        console.log("[ INFO] configuration.outputShadowrocket =>",
            "Shadowrocket folder or configuration file doesn't exist.\n");
    }
}

/**
 * 本方法用于判断default rules/customize rules来源于网络还是本地文件。
 * 
 * 如果本地存在default rules/customize rules目录，则表明规则来源于本地，其中：
 * 
 * - default rules：如果存在，则mode[0]计数为1；否则mode[0]计数为0；
 * - customize rules：如果存在，则mode[1]计数为2；否则mode[1]计数为0.
 * 
 * 那么，数组mode中的元素即存在四种不同的状态：
 * 
 * - [0, 0]：网络（default rules）| 网络（customize rules）
 * - [1, 0]：本地（default rules）| 网络（customize rules）
 * - [0, 2]：网络（default rules）| 本地（customize rules）
 * - [1, 2]：本地（default rules）| 本地（customize rules）
 * 
 * @param {Array<number>} mode 初始化组合
 * @param {object} console 控制台调试对象
 * @returns {Array<number>} 已检查组合
 */
function getMode(mode, axios, console) {
    const fs = require("fs");
    console.log("[ INFO] configuration.getMode =>", "Start to get the combination mode.");
    try {
        fs.accessSync(SOURCES.defaultFile, fs.constants.F_OK);
        updateCheck(axios, console);
        mode[0] = 1;
    } catch (error) {
        mode[0] = 0;
    }
    try {
        fs.accessSync(SOURCES.customizeFile, fs.constants.F_OK);
        mode[1] = 1;
    } catch (error) {
        mode[1] = 0;
    }
    console.log("[ INFO] configuration.getMode =>", "Current combination mode:", mode);
    return mode;
}

/**
 * 本方法用于检查是否需要更新默认规则目录（default rules）下的文件。
 * 
 * - 如果时间戳文件不存在，则进行更新；否则检查该时间与当前时间的间隔是否大于一周。
 * - 如果时间间隔大于一周，则进行文件更新；否则将跳过更新并输出上次文件更新的日期。
 * 
 * @param {object} console 控制台调试对象
 */
function updateCheck(axios, console) {
    const fs = require("fs");
    const path = require("path");

    fs.readFile(path.resolve(SOURCES.defaultFile, "..", "default-rule-timestamp.log"),
        "utf-8",
        (err, data) => {
            if (err) {
                console.log("[ INFO] configuration.updateCheck =>",
                    "Init default rules.");
                updateRules(axios, console);
            } else {
                const savedTimestamp = parseInt(data);
                const currentTimestamp = Date.now();

                const intervalInHours = (currentTimestamp - savedTimestamp) / (1000 * 60 * 60);

                if (intervalInHours >= 168) {
                    console.log("[ INFO] configuration.updateCheck =>",
                        "Start update default rules.");
                    updateRules(axios, console);
                } else {
                    console.log("[ INFO] configuration.updateCheck =>",
                        "Update time has not arrived yet.",
                        "Last updated:", getFormatDate(new Date(savedTimestamp)));
                }
            }
        });
}

/**
 * 本方法用于更新默认规则目录（default rules）下的文件。
 * 
 * - 由于目标地址不一定响应，因此axios可以保持异步请求，超时仅需要输出错误信息；
 * - 关于固定的文件名称，除非维护规则文件更新的作者修改了文件名称，否则不需要修改它们。
 * 
 * @param {object} console 控制台调试对象
 */
function updateRules(axios, console) {
    const fs = require("fs");
    const path = require("path");

    const promises = RULE_UPDATE_NAMES.map(fileName => {
        return axios({
            method: "get",
            url: RULE_UPDATE_HTTP + "/" + fileName + "." + RULE_UPDATE_TYPE,
        }).then(res => {
            return new Promise((resolve, reject) => {
                fs.writeFile(
                    path.resolve(SOURCES.defaultFile, fileName + ".yaml"),
                    res.data, 'utf8',
                    (err) => {
                        if (err) {
                            console.log("[ERROR] configuration.updateRules =>",
                                "Update rule file failure:", fileName + ".yaml");
                            console.log("[ERROR] configuration.updateRules =>", err);
                            reject(err);
                        } else {
                            console.log("[ INFO] configuration.updateRules =>",
                                "Rule file is up to date:", fileName + ".yaml");
                            resolve();
                        }
                    }
                );
            });
        }).catch(err => {
            console.log("[ERROR] configuration.updateRules =>",
                "File writing failed, or some exceptions occurred:", fileName + ".yaml");
            console.log("[ERROR] configuration.updateRules =>", err);
            return Promise.resolve();
        });
    });

    Promise.all(promises)
        .then(() => {
            console.log("[ INFO] configuration.updateRules =>", "Start update timestamp file.");
            updateTimestamp(console);
        })
        .catch(err => {
            console.log("[ERROR] configuration.updateRules =>", err);
        });
}

/**
 * 本方法用于更新时间戳（timestamp.txt）文件。
 * 
 * 当Date对象调用toString方法时，JS会根据实际运行环境来转换时间戳，得到符合当前时区的日期字符串。
 * 
 * @param {object} console 控制台调试对象
 */
function updateTimestamp(console) {
    const fs = require("fs");
    const path = require("path");

    const currentTimestamp = Date.now();
    fs.writeFile(path.resolve(SOURCES.defaultFile, "..", "default-rule-timestamp.log"),
        currentTimestamp.toString(),
        (err) => {
            if (err) {
                console.log("[ERROR] configuration.updateTimestamp =>",
                    "Timestamp file update failure:", err, "\n");
            } else {
                console.log(
                    "[ INFO] configuration.updateTimestamp =>",
                    "The timestamp file has been updated:", getFormatDate(new Date(currentTimestamp)), "\n");
            }
        });
}

/**
 * 格式化输出日期。
 * 
 * => yyyy/MM/dd HH:mm:ss
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

/**
 * 本方法用于解析并重构配置文件。
 * 
 * @param {object} originalConfiguration 原始的配置文件对象
 * @param {Array<number>} mode 存储规则组合的数组
 * @param {Function} configuration 存储配置信息的函数
 * @param {boolean} isConfigRemote 指示当前是否为输出Stash配置模式
 * @returns {string} 已解析并重构的配置文件信息
 */
function get(console, originalConfiguration, mode, configuration, isConfigRemote) {

    const newConfiguration = init(originalConfiguration);
    const profile = configuration();

    /* rules */
    const defaultRulesSaver = addRulePrefix(profile.defaultRulePrefix, profile.defaultRules);
    const customizeRulesSaver = addRulePrefix(profile.customizeRulePrefix, profile.customizeRules);
    newConfiguration["rules"] = customizeRulesSaver.concat(defaultRulesSaver, profile.endRules);

    /* proxy-groups */
    newConfiguration["proxy-groups"] = getProxyGroups(profile.groups, originalConfiguration.proxies);

    /* rule providers */
    let defaultSaver;
    let customizeSaver;

    if (mode[0]) {
        defaultSaver = getRuleProviders(
            profile.defaultRules,
            profile.defaultRulePrefix,
            SOURCES.defaultFile
        );
    } else {
        defaultSaver = getRuleProviders(
            profile.defaultRules,
            profile.defaultRulePrefix,
            SOURCES.defaultHttp
        );
    }
    if (mode[1]) {
        customizeSaver = getRuleProviders(
            profile.customizeRules,
            profile.customizeRulePrefix,
            SOURCES.customizeFile
        );
    } else {
        customizeSaver = getRuleProviders(
            profile.customizeRules,
            profile.customizeRulePrefix,
            SOURCES.customizeHttp
        );
    }
    newConfiguration["rule-providers"] = Object.assign(defaultSaver, customizeSaver);

    console.log("[ INFO] configuration.get =>", "Parsing successful.");
    /* final configuration */
    return isConfigRemote ?
        JSON.stringify(newConfiguration) :
        outputClashConfig(newConfiguration, profile.replacement);
}

/**
 * 本方法用于初始化新的配置文件。
 * 
 * @param {object} configuration 原始的配置文件对象
 * @returns {object} 初始化的新的配置文件对象
 */
function init(configuration) {

    /* initialize */
    let initConfiguration = {};

    /* basic configuration */
    initConfiguration["mixed-port"] = 7890;
    initConfiguration["allow-lan"] = false;
    initConfiguration["bind-address"] = "*";
    initConfiguration.mode = "rule";
    initConfiguration["log-level"] = "info";
    initConfiguration.ipv6 = false;
    initConfiguration["external-controller"] = "127.0.0.1:9090";
    initConfiguration.secret = "";

    /*
     * dns
     * 
     * 当dns.enable启用时，所有经过CFW或CV的流量都会使用DNS配置。
     * 
     * 对于CFW来说，TUN模式自带了DNS配置，且该配置默认处于启用状态，并无法更改。
     * 这意味着使用CFW开启TUN模式后，默认生效的DNS配置永远是TUN模式自带的DNS配置。
     * 
     * 配置文件内的DNS配置可以选择性开启或关闭。如果开启DNS配置，则所有经过CFW/CV的请求
     * 都会用nameserver、fallback中的DNS服务器进行解析（同时解析）。
     * 如果关闭DNS配置（dns.enable = false），则意味CFW/CV会使用系统默认的DNS解析服务。
     * 
     * 对于CV来说，需在设置中勾选DNS/TUN字段同时启用DNS配置后，才能正常使用TUN模式。
     */
    initConfiguration["dns"] = {};
    initConfiguration.dns.enable = true;
    initConfiguration.dns.ipv6 = false;
    initConfiguration.dns["enhanced-mode"] = "fake-ip";
    initConfiguration.dns["fake-ip-range"] = "192.18.0.1/16";
    initConfiguration.dns.nameserver = [
        "119.29.29.29",
        "119.28.28.28",
        "223.5.5.5",
        "223.6.6.6"
    ];
    initConfiguration.dns.fallback = [
        "114.114.114.114",
        "114.114.115.115",
        "101.226.4.6",
        "218.30.118.6",
        "8.8.8.8",
        "94.140.14.15",
        "94.140.15.16",
        "1.1.1.1"
    ];
    initConfiguration.dns["fake-ip-filter"] = [
        "+.stun.*.*",
        "+.stun.*.*.*",
        "+.stun.*.*.*.*",
        "+.stun.*.*.*.*.*",
        "*.n.n.srv.nintendo.net",
        "+.stun.playstation.net",
        "xbox.*.*.microsoft.com",
        "*.*.xboxlive.com",
        "*.msftncsi.com",
        "*.msftconnecttest.com",
        "WORKGROUP"
    ];

    /*
     * tun
     *
     * 大部分浏览器默认开启“安全DNS”功能，此功能会影响TUN模式劫持DNS请求导致反推域名失败，
     * 请在浏览器设置中关闭此功能以保证TUN模式正常运行。
     * 
     * 注意，在tun.enable=true时，CFW会在完成配置更新时自动打开TUN模式，这显然不合理。
     * 而对于CV来说，无论tun.enable的值是什么，TUN模式都不会被自动打开。
     * 
     * 因此，建议tun.enable保持false状态，在需要使用到TUN模式时，再手动代开。
     * 
     * 另外，tun.stack默认为gvisor模式，但该模式兼容性欠佳，因此建议改为system模式。
     * 
     * 但需要注意，使用system模式需要先添加防火墙规则（Add firewall rules），
     * 同时还要安装、启用服务模式（Service Mode）。
     */
    initConfiguration["tun"] = {
        enable: false,
        stack: "system",
        "auto-route": true,
        "auto-detect-interface": true,
        "dns-hijack": ["any:53"]
    };

    /*
     * profile
     *
     * 遗留问题：使用clash-tracing项目监控CFW流量时，则需要在~/.config/clash/config.yaml中添加profile配置。
     * 但目前CFW并无法正确识别该配置，即便将配置写入config.yaml中也不会生效。
     * 
     * 解决方法：直接在配置中添加profile信息，这样就可以使用clash-tracing项目来监控CFW流量了。
     */
    initConfiguration["profile"] = { "tracing": true };

    /* proxies */
    initConfiguration.proxies = configuration.proxies;
    return initConfiguration;
}

/**
 * 本方法用于为规则数组中的文件名称添加前缀信息。
 * 
 * @param {string} rulePrefix 需要添加的前缀信息
 * @param  {Array<string> | Array<string>[]} ruleArrays 存储规则字符串的数组
 * @returns {Array<string>} 已添加前缀信息规则数组
 */
function addRulePrefix(rulePrefix, ...ruleArrays) {
    let arr = [];
    if (!ruleArrays || ruleArrays.toString() === "") {
        return arr;
    }

    ruleArrays.forEach(ruleArray => {
        const provisionalArr = ruleArray.map(ele => ele.replace(",", "," + rulePrefix));
        arr = arr.concat(provisionalArr);
    })
    return arr;
}

/**
 * 本方法用于构建具体的分组信息。
 * 
 * @param {Array<object>} details 存储分组信息的对象数组
 * @param {Array<object>} proxies 存储所有节点信息的对象数组
 * @returns {Array<object>} 已完成分组的对象数组 
 */
function getProxyGroups(details, proxies) {
    const arr = [];
    details.forEach(detail => {
        const proxyGroup = {
            name: detail.name,
            type: detail.type,
            proxies: detail.proxies
        };

        if (detail.type !== "select") {
            proxyGroup.url = "http://www.gstatic.com/generate_204";
            proxyGroup.interval = 72;
            proxyGroup.lazy = true;
        }

        if (detail.proxies.length) {
            proxyGroup.proxies = detail.proxies;
        }

        if (detail.append) {
            proxies.forEach(proxy => {
                if (proxy.name.match(detail.append)) {
                    proxyGroup.proxies.push(proxy.name);
                }
            });
        }
        arr.push(proxyGroup);
    })
    return arr;
}

/**
 * 本方法用于构建规则集的具体获取方式。
 * 
 * @param {Array<string>} rules 存储规则信息的数组
 * @param {string} rulePrefix 规则文件的前缀信息
 * @param {object} ruleSource 存储规则集的来源信息
 * @returns {object} 具体的规则集对象
 */
function getRuleProviders(rules, rulePrefix, ruleSource) {
    let ruleProviders = {};
    if (!ruleSource || ruleSource === "") {
        return {};
    }
    const ruleNames = rules.map(ele => ele.replace(/^.+?,/gm, "").replace(/,.+$/gm, ""));;

    const getType = (ruleSource) => {
        return ruleSource.includes("http") ? "http" : "file";
    }
    const getBehavior = (ruleName) => {
        if (ruleName === "applications") {
            return "classical";
        }
        if (ruleName.includes("cidr")) {
            return "ipcidr";
        }
        return "domain";
    }

    if (getType(ruleSource) === "http") {
        ruleNames.forEach(name => {
            ruleProviders[rulePrefix + name] = {
                type: "http",
                behavior: getBehavior(name),
                url: ruleSource + "/" + name + ".yaml",
                interval: 86400
            }
        })
    }
    if (getType(ruleSource) === "file") {
        ruleNames.forEach(name => {
            ruleProviders[rulePrefix + name] = {
                type: "file",
                behavior: getBehavior(name),
                path: ruleSource + "/" + name + ".yaml"
            }
        })
    }
    return ruleProviders;
}

/**
 * 本方法用于获取解析完毕的配置信息。其中，函数返回的配置信息为String类型：
 * 
 * - 对于CFW来说，建议使用yaml.parse将其格式化为标准的JSON格式；
 * - 对于CV来说，需要使用JSON.parse将其转换为JSON对象。
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