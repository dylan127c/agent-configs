const IDENTIFIERS = ["addition", "original"];

/** @method {@link mark} */
const FILENAME = "main";

/** @method {@link getProxyGroups} */
const SELECT = "select";
const LOAD_BALANCE = "load-balance";
const HEALTH_CHECK_URL = "https://www.gstatic.com/generate_204";
const TEST_INTERVAL = 300;
const LAZY_TESTING = true;
const STRATEGY = "consistent-hashing";
const DEFAULT_PROXY = "DIRECT";

/** @method {@link getRuleProviders} */
const FILE = "file";
const HTTP = "http";

/**
 * Generate configuration.
 */
function generate(log, mode, originalConfiguration, modifiedParams) {
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
            groupConstruct.url = HEALTH_CHECK_URL;
            groupConstruct.lazy = LAZY_TESTING;

            /* CONSISTENT-HASHING IS DEFAULT STRATEGY */
            if (group.type === LOAD_BALANCE) {
                groupConstruct.strategy = STRATEGY;
            }
            /* ALLOW CUSTOMIZE HEALTH CHECK INTERVAL */
            if (modifiedParams.hasOwnProperty("interval")) {
                groupConstruct.interval = modifiedParams.interval;
            } else {
                groupConstruct.interval = TEST_INTERVAL;
            }
        }

        if (group.append) {
            configuraion.proxies.forEach(proxy => {
                if (proxy.name.match(group.append)) {
                    groupConstruct.proxies.push(proxy.name);
                }
            });
        }

        /* DEFAULT PROXIES ADDING TO AVOID EMPTY GROUP PROXIES */
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

function getRuleProviders(mode, modifiedParams) {
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
    initConfiguration.dns.listen = "0.0.0.0:53";
    initConfiguration.dns["use-hosts"] = true;
    initConfiguration.dns["default-nameserver"] = [
        "119.29.29.29",
        "119.28.28.28",
        "223.5.5.5",
        "223.6.6.6",
        "114.114.114.114",
        "114.114.115.115",
        "101.226.4.6",
    ];
    initConfiguration.dns.nameserver = [
        "https://doh.pub/dns-query",
        "https://dns.alidns.com/dns-query",
        "https://1.12.12.12/dns-query",
        "https://120.53.53.53/dns-query",
    ];
    initConfiguration.dns.fallback = [
        "94.140.14.15",
        "94.140.15.16",
        "8.8.8.8",
        "1.1.1.1",
    ];
    initConfiguration.dns["fallback-filter"] = {
        geoip: true,
        "geoip-code": "CN",
        ipcidr: [
            "240.0.0.0/4",
            "0.0.0.0/32",
        ]
    }
    initConfiguration.dns["fake-ip-filter"] = [
        "*.lan",
        "localhost.ptlogin2.qq.com",
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
        "*.logon.battlenet.com.cn",
        "*.logon.battle.net",
        "WORKGROUP"
    ];

    /*
     * TUN
     *
     * 大部分浏览器默认开启 “安全 DNS” 功能，此功能会影响 TUN 模式劫持 DNS 请求导致反推域名失败，
     * 请在浏览器设置中关闭此功能以保证 TUN 模式正常运行。
     * 
     * 注意，在 tun.enable = true 时，CFW 会在完成配置更新时自动打开 TUN 模式，这显然不合理。
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

    const specificRegex = /香港\s02|菲律宾|马来西亚|加拿大|德国|土耳其|爱尔兰|澳大利亚|瑞典/gm;
    const groups = [
        { name: "🌌 科学上网 | CLOVER", type: "select", proxies: mainGroups.concat(["DIRECT"]) },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT"], append: /^(?!剩余|套餐)/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌁 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: specificRegex },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /^(?!剩余|套餐)/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | CLOVER", "DIRECT"] },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", proxies: [], append: /香港/gm },
        { name: "🌉 负载均衡 | 台湾", type: "load-balance", proxies: [], append: /台湾/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本/gm },
        { name: "🌉 负载均衡 | 印度", type: "load-balance", proxies: [], append: /印度/gm },
        { name: "🌉 负载均衡 | 韩国", type: "load-balance", proxies: [], append: /韩国/gm },
        { name: "🌉 负载均衡 | 美国", type: "load-balance", proxies: [], append: /美国/gm },
        { name: "🌉 负载均衡 | 新加坡", type: "load-balance", proxies: [], append: /新加坡/gm },
    ]

    const additionRules = [
        "RULE-SET,idm,🌁 数据下载 | IDM",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
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
        initScript: "h:/onedrive/repositories/proxy rules/commons/configs/basis",

        defaultBehavior: "domain",
        behavior: {
            "classical": ["idm"],
            "ipcidr": ["telegramcidr", "lancidr", "cncidr"]
        },

        originalRules: originalRules,
        originalPrefix: "original",
        originalNative: "h:/onedrive/repositories/proxy rules/commons/rules/original",
        originalNativeType: "yaml",
        originalRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "h:/onedrive/repositories/proxy rules/commons/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/addition",
        additionRemoteType: "yaml",

        replacement: {
            "🇹🇼": "🇨🇳",
            "香港01": "香港 01",
            "/(?<=^\\W{4})/gm": " "
        }
    }
}

const kele = () => {
    const mainGroups = [
        "🌉 负载均衡 | 香港推荐",
        "🌉 负载均衡 | 香港备选",
        "🌉 负载均衡 | 美国",
        "🌉 负载均衡 | 日本",
        "🏙️ 延迟测试 | 其他",
        "🌅 目标节点",
    ];
    const groups = [
        { name: "🌌 科学上网 | KELE", type: "select", proxies: mainGroups.concat(["DIRECT"]) },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /\[.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELE"] },
        { name: "🌁 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELE"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | KELE", "DIRECT"] },
        { name: "🌉 负载均衡 | 香港推荐", type: "load-balance", proxies: [], append: /香港\s\d\d\w/gm },
        { name: "🌉 负载均衡 | 香港备选", type: "load-balance", proxies: [], append: /香港\s\d\d$/gm },
        { name: "🌉 负载均衡 | 美国", type: "load-balance", proxies: [], append: /美國\s\d\d$/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本\s\d\d$/gm },
        { name: "🏙️ 延迟测试 | 其他", type: "url-test", proxies: ["REJECT"], append: /[^香港|美國|日本]\s\d\d$/gm },
        { name: "🏞️ 订阅详情", type: "select", proxies: [], append: /剩余流量/gm },
    ]

    const additionRules = [
        "RULE-SET,idm,🌁 数据下载 | IDM",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,proxy,🌌 科学上网 | KELE",
    ];
    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | KELE",
        "RULE-SET,gfw,🌌 科学上网 | KELE",
        "RULE-SET,proxy,🌌 科学上网 | KELE",
        "RULE-SET,tld-not-cn,🌌 科学上网 | KELE",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | KELE,no-resolve",
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
        initScript: "h:/onedrive/repositories/proxy rules/commons/configs/basis",

        defaultBehavior: "domain",
        behavior: {
            "classical": ["idm"],
            "ipcidr": ["telegramcidr", "lancidr", "cncidr"]
        },

        originalRules: originalRules,
        originalPrefix: "original",
        originalNative: "h:/onedrive/repositories/proxy rules/commons/rules/original",
        originalNativeType: "yaml",
        originalRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "h:/onedrive/repositories/proxy rules/commons/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/addition",
        additionRemoteType: "yaml",

        replacement: {
            "[SS]香港": "🇭🇰 香港",
            "[SS]越南": "🇻🇳 越南",
            "[SS]美國": "🇺🇸 美國",
            "[SS]日本": "🇯🇵 日本",
            "[SS]台灣": "🇨🇳 台灣",
            "[SS]新加坡": "🇸🇬 新加坡"
        },

        interval: 72,

        proxiesClashVerge: {
            proxiesAddition: [{
                name: "🏳️‍⚧️ 本地订阅 | PORT => 13766",
                type: "http",
                server: "127.0.0.1",
                port: 13766
            }],
            proxiesMapping: {
                "🌄 特殊控制 | OpenAI": "🏳️‍⚧️ 本地订阅 | PORT => 13766",
                "🌄 特殊控制 | Brad": "🏳️‍⚧️ 本地订阅 | PORT => 13766",
            },
        }
    }
}

const nebulae = () => {
    const mainGroups = [
        "🌃 故障恢复 | IEPL",
        "🌉 负载均衡 | 香港",
        "🌉 负载均衡 | 新加坡",
        "🌉 负载均衡 | 台湾",
        "🌉 负载均衡 | 美国",
        "🌉 负载均衡 | 日本",
        "🌉 负载均衡 | 德国",
        "🏙️ 延迟测试 | IPv6",
        "🌅 目标节点",
    ].concat(["DIRECT"]);

    const groups = [
        { name: "🌌 科学上网 | NEBULAE", type: "select", proxies: mainGroups },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEBULAE"] },
        { name: "🌁 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEBULAE"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | NEBULAE", "DIRECT"] },
        { name: "🌃 故障恢复 | IEPL", type: "fallback", proxies: [], append: /IEPL\s/gm },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", proxies: [], append: /香港\w\s/gm },
        { name: "🌉 负载均衡 | 台湾", type: "load-balance", proxies: [], append: /台湾\w\s/gm },
        { name: "🌉 负载均衡 | 美国", type: "load-balance", proxies: [], append: /美国\w\s/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本\w\s/gm },
        { name: "🌉 负载均衡 | 德国", type: "load-balance", proxies: [], append: /德国\w\s/gm },
        { name: "🌉 负载均衡 | 新加坡", type: "load-balance", proxies: [], append: /狮城\w\s/gm },
        { name: "🏙️ 延迟测试 | IPv6", type: "url-test", proxies: ["REJECT"], append: /v6\s/gm },
    ]

    const additionRules = [
        "RULE-SET,idm,🌁 数据下载 | IDM",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,proxy,🌌 科学上网 | NEBULAE",
    ];
    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | NEBULAE",
        "RULE-SET,gfw,🌌 科学上网 | NEBULAE",
        "RULE-SET,proxy,🌌 科学上网 | NEBULAE",
        "RULE-SET,tld-not-cn,🌌 科学上网 | NEBULAE",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | NEBULAE,no-resolve",
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
        initScript: "h:/onedrive/repositories/proxy rules/commons/configs/basis",

        defaultBehavior: "domain",
        behavior: {
            "classical": ["idm"],
            "ipcidr": ["telegramcidr", "lancidr", "cncidr"]
        },

        originalRules: originalRules,
        originalPrefix: "original",
        originalNative: "h:/onedrive/repositories/proxy rules/commons/rules/original",
        originalNativeType: "yaml",
        originalRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "h:/onedrive/repositories/proxy rules/commons/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/addition",
        additionRemoteType: "yaml",
    }
}

const orient = () => {
    const mainGroups = [
        "🌃 故障恢复 | 深港移动",
        "🌃 故障恢复 | 沪港电信",
        "🌃 故障恢复 | 沪日电信",
        "🌉 负载均衡 | 香港",
        "🌉 负载均衡 | 日本",
        "🌅 目标节点",
    ].concat(["DIRECT"]);

    const specificRegex = /韩国|德国|土耳其|巴西|新加坡\s01|日本|阿根廷|澳大利亚|英国/gm;
    const groups = [
        { name: "🌌 科学上网 | ORIENT", type: "select", proxies: mainGroups },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENT"] },
        { name: "🌁 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENT"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: specificRegex },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | ORIENT", "DIRECT"] },
        { name: "🌃 故障恢复 | 深港移动", type: "fallback", append: /香港 \d\d 移动.+/gm },
        { name: "🌃 故障恢复 | 沪港电信", type: "fallback", append: /香港 \d\d 电信.+/gm },
        { name: "🌃 故障恢复 | 沪日电信", type: "fallback", append: /日本 \d\d [^A-Z].+/gm },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", append: /香港\s\d\d [A-Z].+$/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", append: /日本\s\d\d [A-Z]/gm },
    ];

    const additionRules = [
        "RULE-SET,idm,🌁 数据下载 | IDM",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,proxy,🌌 科学上网 | ORIENT",
    ];

    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | ORIENT",
        "RULE-SET,gfw,🌌 科学上网 | ORIENT",
        "RULE-SET,proxy,🌌 科学上网 | ORIENT",
        "RULE-SET,tld-not-cn,🌌 科学上网 | ORIENT",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | ORIENT,no-resolve",
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
        initScript: "h:/onedrive/repositories/proxy rules/commons/configs/basis",

        defaultBehavior: "domain",
        behavior: {
            "classical": ["idm"],
            "ipcidr": ["telegramcidr", "lancidr", "cncidr"]
        },

        originalRules: originalRules,
        originalPrefix: "original",
        originalNative: "h:/onedrive/repositories/proxy rules/commons/rules/original",
        originalNativeType: "yaml",
        originalRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "h:/onedrive/repositories/proxy rules/commons/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/addition",
        additionRemoteType: "yaml",

        replacement: {
            "🇹🇼": "🇨🇳",
            "卢森堡": "🇺🇳 卢森堡",
            "（流媒体）": "",
            "/(?<=\\s\\d\\d)\\s.+(?=（)/gm": "",
            "/(?<=\\s\\d\\d)\\s.+$/gm": "",
            "/无版权": "",
        },

        interval: 72,
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
    } else if (count === 18) {
        configuration = nebulae;
    }
    let mode = {
        originalStatus: true,
        additionStatus: true
    }

    /* WHITELIST MODE REVERSE DEFAULT GROUP FOR MATCH RULES */
    const provisional = configuration();
    provisional.groups.forEach(element => {
        if (element.name.match("规则逃逸")) {
            const reversed = element.proxies.reverse();
            element.proxies = reversed;
        }
    });

    const generateConfiguration = generate(console, mode, params, provisional);
    nameReplacer(generateConfiguration, provisional);
    proxyAdder(generateConfiguration, provisional);
    return generateConfiguration;
}

function nameReplacer(configuraion, modifiedParams) {
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

function proxyAdder(configuraion, modifiedParams) {
    if (!modifiedParams.hasOwnProperty("proxiesClashVerge")) {
        return;
    }

    const proxiesConfig = modifiedParams.proxiesClashVerge;
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