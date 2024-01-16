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

function generate(log, mode, originalConfiguration, modifiedParams, isConfigRemote) {
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

function build() {

    /* INITIALIZE */
    let initConfiguration = {};

    /* BASIC CONFIGURATION */
    initConfiguration["mixed-port"] = 7890;
    initConfiguration["allow-lan"] = false;
    initConfiguration["bind-address"] = "*";
    initConfiguration.mode = "rule";
    initConfiguration["log-level"] = "info";
    initConfiguration.ipv6 = false;
    initConfiguration["external-controller"] = "127.0.0.1:9090";
    initConfiguration.secret = "";

    /*
     * DNS
     * 
     * 当 dns.enable 启用时，所有经过 CFW 或 CV 的流量都会使用 DNS 配置。
     * 
     * 对于 CFW 来说，TUN 模式自带了 DNS 配置，且该配置默认处于启用状态，并无法更改。
     * 这意味着使用 CFW 开启 TUN 模式后，默认生效的 DNS 配置永远是 TUN 模式自带的 DNS 配置。
     * 
     * 配置文件内的 DNS 配置可以选择性开启或关闭。如果开启 DNS 配置，则所有经过 CFW/CV 的请求
     * 都会用 nameserver、fallback 中的 DNS 服务器进行解析（同时解析）。
     * 如果关闭 DNS 配置（dns.enable = false），则意味 CFW/CV 会使用系统默认的 DNS 解析服务。
     * 
     * 对于 CV 来说，需在设置中勾选 DNS/TUN 字段同时启用 DNS 配置后，才能正常使用 TUN 模式。
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
        "223.6.6.6",
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
     * TUN
     *
     * 大部分浏览器默认开启 “安全 DNS” 功能，此功能会影响 TUN 模式劫持 DNS 请求导致反推域名失败，
     * 请在浏览器设置中关闭此功能以保证 TUN 模式正常运行。
     * 
     * 注意，在 tun.enable = true 时，CFW 会在完成配置更新时自动打开 TUN 模式，这显然不合理。
     * 而对于 CV 来说，无论 tun.enable 的值是什么，TUN 模式都不会被自动打开。
     * 
     * 因此，建议 tun.enable 保持 false 状态，在需要使用到 TUN 模式时，再手动代开。
     * 
     * 另外，tun.stack 默认为 gvisor 模式，但该模式兼容性欠佳，因此建议改为 system 模式。
     * 
     * 但需要注意，使用 system 模式需要先添加防火墙规则 Add firewall rules，
     * 同时还要安装、启用服务模式 Service Mode。
     */
    initConfiguration["tun"] = {
        enable: false,
        stack: "system",
        "auto-route": true,
        "auto-detect-interface": true,
        "dns-hijack": ["any:53"]
    };

    /*
     * PROFILE
     *
     * 遗留问题：使用 clash-tracing 项目监控 CFW 流量时，则需要在 ~/.config/clash/config.yaml 中添加 profile 配置。
     * 但目前 CFW 并无法正确识别该配置，即便将配置写入 config.yaml 中也不会生效。
     * 
     * 解决方法：直接在配置中添加 profile 信息，这样就可以使用 clash-tracing 项目来监控 CFW 流量了。
     */
    initConfiguration["profile"] = { "tracing": true };

    return initConfiguration;
}

const clover = () => {
    const mainGroups = [
        "🌉 负载均衡 | 香港",
        "🌉 负载均衡 | 新加坡",
        "🌉 负载均衡 | 台湾",
        "🌉 负载均衡 | 印度",
        "🌉 负载均衡 | 日本",
        "🌉 负载均衡 | 美国",
        "🌉 负载均衡 | 韩国",
        "🌅 目标节点",
    ];

    const regChatGPT = /香港\s02|菲律宾|马来西亚|加拿大|德国|土耳其|爱尔兰|澳大利亚|瑞典/gm;    
    const groups = [
        { name: "🌌 科学上网 | CLOVER", type: "select", proxies: mainGroups.concat(["DIRECT"]) },
        { name: "🌁 数据下载", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: regChatGPT },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /^(?!剩余|套餐)/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["DIRECT", "REJECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌄 特殊控制 | Node.js", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", proxies: [], append: /香港/gm },
        { name: "🌉 负载均衡 | 新加坡", type: "load-balance", proxies: [], append: /新加坡/gm },
        { name: "🌉 负载均衡 | 台湾", type: "load-balance", proxies: [], append: /台湾/gm },
        { name: "🌉 负载均衡 | 印度", type: "load-balance", proxies: [], append: /印度/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本/gm },
        { name: "🌉 负载均衡 | 美国", type: "load-balance", proxies: [], append: /美国/gm },
        { name: "🌉 负载均衡 | 韩国", type: "load-balance", proxies: [], append: /韩国/gm },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT"], append: /^(?!剩余|套餐)/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
    ]

    const additionRules = [
        "RULE-SET,download,🌁 数据下载",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,edge,🌄 特殊控制 | Edge",
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
        "RULE-SET,proxy,🌌 科学上网 | CLOVER",
    ];
    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | CLOVER",
        "RULE-SET,gfw,🌌 科学上网 | CLOVER",
        "RULE-SET,proxy,🌌 科学上网 | CLOVER",
        "RULE-SET,tld-not-cn,🌌 科学上网 | CLOVER",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | CLOVER,no-resolve",
        "RULE-SET,lancidr,DIRECT,no-resolve",
        "RULE-SET,cncidr,DIRECT,no-resolve"
    ];
    const endRules = [
        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",
        "MATCH,🌠 规则逃逸"
    ];

    return {
        groups: groups,
        endRules: endRules,
        connector: "-",
        initScript: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/configs/initialization",

        defaultBehavior: "domain",
        behavior: {
            "classical": ["applications", "download", "nodejs"],
            "ipcidr": ["telegramcidr", "lancidr", "cncidr"]
        },

        originalRules: originalRules,
        originalPrefix: "original",
        originalNative: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/rules/original",
        originalNativeType: "yaml",
        originalRemote: "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/addition",
        additionRemoteType: "yaml",

        replacement: {
            "🇹🇼": "🇨🇳 ",
            "香港01": "香港 01",
            "🇭🇰香港": "🇭🇰 香港",
            "🇸🇬新加坡": "🇸🇬 新加坡",
            "🇯🇵日本": "🇯🇵 日本",
            "🇺🇸美国": "🇺🇸 美国",
            "🇰🇷韩国": "🇰🇷 韩国",
            "🇮🇳印度": "🇮🇳 印度",
            "🇨🇳台湾": "🇨🇳 台湾",
            "🇲🇾马来西亚": "🇲🇾 马来西亚",
            "🇫🇷法国": "🇫🇷 法国",
            "🇦🇺澳大利亚": "🇦🇺 澳大利亚",
            "🇷🇺俄罗斯": "🇷🇺 俄罗斯",
            "🇨🇦加拿大": "🇨🇦 加拿大",
            "🇹🇷土耳其": "🇹🇷 土耳其",
            "🇧🇷巴西": "🇧🇷 巴西",
            "🇩🇪德国": "🇩🇪 德国",
            "🇮🇹意大利": "🇮🇹 意大利",
            "🇹🇭泰国": "🇹🇭 泰国",
            "🇮🇪爱尔兰": "🇮🇪 爱尔兰",
            "🇸🇪瑞典": "🇸🇪 瑞典",
            "🇬🇧英国": "🇬🇧 英国",
            "🇵🇭菲律宾": "🇵🇭 菲律宾",
            "🇦🇪迪拜": "🇦🇪 迪拜",
            "🇦🇷阿根廷": "🇦🇷 阿根廷",
        }
    }
}

const kele = () => {
    const mainGroups = [
        "🌉 负载均衡 | 香港 A",
        "🌉 负载均衡 | 香港 B",
        "🌉 负载均衡 | 美国",
        "🌉 负载均衡 | 日本",
        "🌅 目标节点",
    ];
    const groups = [
        { name: "🌌 科学上网 | KELECLOUD", type: "select", proxies: mainGroups.concat(["DIRECT"]) },
        { name: "🌁 数据下载", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["DIRECT", "REJECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🌄 特殊控制 | Node.js", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🌉 负载均衡 | 香港 A", type: "load-balance", proxies: [], append: /香港\s\d\d\w/gm },
        { name: "🌉 负载均衡 | 香港 B", type: "load-balance", proxies: [], append: /香港\s\d\d$/gm },
        { name: "🌉 负载均衡 | 美国", type: "load-balance", proxies: [], append: /美國\s\d\d$/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本\s\d\d$/gm },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /\[.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🏞️ 订阅详情", type: "select", proxies: [], append: /剩余流量/gm },
    ]

    const additionRules = [
        "RULE-SET,download,🌁 数据下载",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,edge,🌄 特殊控制 | Edge",
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
        "RULE-SET,proxy,🌌 科学上网 | KELECLOUD",
    ];
    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | KELECLOUD",
        "RULE-SET,gfw,🌌 科学上网 | KELECLOUD",
        "RULE-SET,proxy,🌌 科学上网 | KELECLOUD",
        "RULE-SET,tld-not-cn,🌌 科学上网 | KELECLOUD",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | KELECLOUD,no-resolve",
        "RULE-SET,lancidr,DIRECT,no-resolve",
        "RULE-SET,cncidr,DIRECT,no-resolve"
    ];
    const endRules = [
        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",
        "MATCH,🌠 规则逃逸"
    ];

    return {
        groups: groups,
        endRules: endRules,
        connector: "-",
        initScript: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/configs/initialization",

        defaultBehavior: "domain",
        behavior: {
            "classical": ["applications", "download", "nodejs"],
            "ipcidr": ["telegramcidr", "lancidr", "cncidr"]
        },

        originalRules: originalRules,
        originalPrefix: "original",
        originalNative: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/rules/original",
        originalNativeType: "yaml",
        originalRemote: "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/addition",
        additionRemoteType: "yaml",

        replacement: {
            "[SS]香港": "🇭🇰 香港",
            "[SS]越南": "🇻🇳 越南",
            "[SS]美國": "🇺🇸 美國",
            "[SS]日本": "🇯🇵 日本",
            "[SS]台灣": "🇨🇳 台灣",
            "[SS]新加坡": "🇸🇬 新加坡"
        }
    }
}

const orient = () => {
    const mainGroups = [
        "🌃 故障切换 | 深港移动",
        "🌃 故障切换 | 沪港电信",
        "🌃 故障切换 | 沪日电信",
        "🌉 负载均衡 | 香港",
        "🌉 负载均衡 | 日本",
        "🌅 目标节点",
    ].concat(["DIRECT"]);

    const regChatGPT = /韩国|德国|土耳其|巴西|新加坡\s01|日本|阿根廷|澳大利亚|英国/gm;
    const groups = [
        { name: "🌌 科学上网 | ORIENTAL", type: "select", proxies: mainGroups },
        { name: "🌁 数据下载", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENTAL"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: regChatGPT },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENTAL"] },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["DIRECT", "REJECT", "🌌 科学上网 | ORIENTAL"] },
        { name: "🌄 特殊控制 | Node.js", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENTAL"] },
        { name: "🌃 故障切换 | 深港移动", type: "fallback", append: /香港 \d\d 移动.+/gm },
        { name: "🌃 故障切换 | 沪港电信", type: "fallback", append: /香港 \d\d 电信.+/gm },
        { name: "🌃 故障切换 | 沪日电信", type: "fallback", append: /日本 \d\d [^A-Z].+/gm },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", append: /香港\s\d\d [A-Z].+$/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", append: /日本\s\d\d [A-Z]/gm },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENTAL"] },
    ];

    const additionRules = [
        "RULE-SET,download,🌁 数据下载",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,edge,🌄 特殊控制 | Edge",
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
        "RULE-SET,proxy,🌌 科学上网 | ORIENTAL",
    ];

    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | ORIENTAL",
        "RULE-SET,gfw,🌌 科学上网 | ORIENTAL",
        "RULE-SET,proxy,🌌 科学上网 | ORIENTAL",
        "RULE-SET,tld-not-cn,🌌 科学上网 | ORIENTAL",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | ORIENTAL,no-resolve",
        "RULE-SET,lancidr,DIRECT,no-resolve",
        "RULE-SET,cncidr,DIRECT,no-resolve"
    ];
    
    const endRules = [
        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",
        "MATCH,🌠 规则逃逸"
    ];

    return {
        groups: groups,
        endRules: endRules,
        connector: "-",
        initScript: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/configs/initialization",

        defaultBehavior: "domain",
        behavior: {
            "classical": ["applications", "download", "nodejs"],
            "ipcidr": ["telegramcidr", "lancidr", "cncidr"]
        },

        originalRules: originalRules,
        originalPrefix: "original",
        originalNative: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/rules/original",
        originalNativeType: "yaml",
        originalRemote: "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/addition",
        additionRemoteType: "yaml",

        replacement: {
            "🇹🇼": "🇨🇳",
            "卢森堡": "🇺🇳 卢森堡",
            "/（.+?）/gm": ""
        }
    }
}



function main(params) {
    let configuration;
    const count = params["proxy-groups"].length
    if (count === 11) {
        configuration = orient;
    } else if (count === 15) {
        configuration = kele;
    } else if (count === 3) {
        configuration = clover;
    }
    let mode = {
        originalStatus: true,
        additionStatus: true
    }
    return JSON.parse(generate(
        console,
        mode,
        params,
        configuration()));
}

