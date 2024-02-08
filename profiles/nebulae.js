module.exports.configuration = () => {
    
    const mainGroup = [{ name: "🌌 科学上网 | NEBULAE", type: "select" },];
    const ruleRequiredGroups = [
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEBULAE"] },
        { name: "🌆 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEBULAE"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | NEBULAE", "DIRECT"] },
    ];
    const mainRequiredGroups = [
        { name: "🌃 负载均衡 | HK-PRIORITY", type: "load-balance", proxies: [], append: /香港.*(?:波粒|传导).*/gm },
        { name: "🌃 负载均衡 | HK-ALL", type: "load-balance", proxies: [], append: /^.*香港((?!波粒|传导|专线|v6).)*$/gmi },
        { name: "🌃 负载均衡 | HK-IEPL/2X", type: "load-balance", proxies: [], append: /香港.*专线/gm, reverse: /香港/gm },
        { name: "🌃 负载均衡 | Singapore", type: "load-balance", proxies: [], append: /^.*狮城((?!专线|v6).)*$/gmi },
        { name: "🌃 负载均衡 | Taiwan", type: "load-balance", proxies: [], append: /^.*台湾((?!专线|v6).)*$/gmi },
        { name: "🌃 负载均衡 | United States", type: "load-balance", proxies: [], append: /^.*美国((?!专线|v6).)*$/gmi },
        { name: "🌃 负载均衡 | Japan", type: "load-balance", proxies: [], append: /^.*日本((?!专线|v6).)*$/gmi },
        { name: "🌃 负载均衡 | Germany", type: "load-balance", proxies: [], append: /^.*德国((?!专线|v6).)*$/gmi },
        { name: "🎑 其他專線 | REST-IEPL/2X", type: "select", proxies: ["REJECT"], append: /^((?!香港).)*专线/gm },
        { name: "🎑 專用節點 | IPv6", type: "select", proxies: ["REJECT"], append: /v6/gmi },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT"], append: /.+/gm },
    ];

    const additionRules = [
        "RULE-SET,idm,🌆 数据下载 | IDM",
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
            "二倍专线": "",
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