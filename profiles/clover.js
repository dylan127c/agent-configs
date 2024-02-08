module.exports.configuration = () => {

    const mainGroup = [{ name: "🌌 科学上网 | CLOVER", type: "select" }];
    const ruleRequiredGroups = [
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌆 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /^((?!流量|到期).)*$/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /^((?!流量|到期).)*$/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | CLOVER", "DIRECT"] },
    ];
    const mainRequiredGroups = [
        { name: "🌃 负载均衡 | HK-IEPL", type: "load-balance", proxies: [], append: /(?<=IEPL)香港/gm },
        { name: "🌃 负载均衡 | SG-IEPL", type: "load-balance", proxies: [], append: /(?<=IEPL)新加坡/gm },
        { name: "🌃 负载均衡 | TW-IEPL", type: "load-balance", proxies: [], append: /(?<=IEPL)台湾/gm },
        { name: "🌃 负载均衡 | KR-IEPL", type: "load-balance", proxies: [], append: /(?<=IEPL)韩国/gm },
        { name: "🌃 负载均衡 | JP-IEPL", type: "load-balance", proxies: [], append: /(?<=IEPL)日本/gm },
        { name: "🌃 负载均衡 | HK-TRANS", type: "load-balance", proxies: [], append: /(?<!IEPL)香港/gm },
        { name: "🌃 负载均衡 | SG-TRANS", type: "load-balance", proxies: [], append: /(?<!IEPL)新加坡/gm },
        { name: "🌃 负载均衡 | TW-TRANS", type: "load-balance", proxies: [], append: /(?<!IEPL)台湾/gm },
        { name: "🌃 负载均衡 | KR-TRANS", type: "load-balance", proxies: [], append: /(?<!IEPL)韩国/gm },
        { name: "🌃 负载均衡 | JP-TRANS", type: "load-balance", proxies: [], append: /(?<!IEPL)日本/gm },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT"], append: /^((?!流量|到期).)*$/gm },
    ];

    const additionRules = [
        "RULE-SET,idm,🌆 数据下载 | IDM",
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
        mainGroup: mainGroup,
        ruleRequiredGroups: ruleRequiredGroups,
        mainRequiredGroups: mainRequiredGroups,

        endRules: endRules,
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
        originalRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/commons/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "h:/onedrive/repositories/proxy rules/commons/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/commons/rules/addition",
        additionRemoteType: "yaml",

        replacement: {
            "🇹🇼": "🇨🇳",
            "/(?<!\\s)(?=\\d\\d)/gm": " ",
            "/(?<=^\\W{4})(?=.+\\d)/gm": " "
        },

        proxiesSpecialized: {
            proxiesAddition: [{
                name: "🔄️ v2rayN | Global",
                type: "socks5",
                server: "127.0.0.1",
                port: 10808
            }],
            proxiesMapping: {
                "🌄 特殊控制 | OpenAI": "🔄️ v2rayN | Global",
            },
        }
    }
}