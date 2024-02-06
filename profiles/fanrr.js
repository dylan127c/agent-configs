module.exports.configuration = () => {
    const mainGroups = [
        "🌃 负载均衡 | HK-NORMAL",
        "🌃 负载均衡 | HK-GAME/3X",
        "🎑 低倍節點 | Streaming",
        "🎑 高倍節點 | Native IP",
        "🌃 负载均衡 | Singapore",
        "🌃 负载均衡 | Taiwan",
        "🌃 负载均衡 | United States",
        "🌃 负载均衡 | Japan",
        "🌃 负载均衡 | United Kingdom",
        "🌅 目标節點",
    ];

    const groups = [
        { name: "🌌 科学上网 | FANRR", type: "select", proxies: mainGroups },
        { name: "🌅 目标節點", type: "select", proxies: ["REJECT", "DIRECT"], append: /^((?!traffic|update|date).)*$/gmi },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | FANRR"] },
        { name: "🌆 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | FANRR"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /^((?!traffic|update|date).)*$/gmi },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /^((?!traffic|update|date).)*$/gmi },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | FANRR", "DIRECT"] },
        { name: "🎑 低倍節點 | Streaming", type: "select", proxies: ["REJECT"], append: /📺/gm },
        { name: "🎑 高倍節點 | Native IP", type: "select", proxies: ["REJECT"], append: /[^.]\dx$/gmi },
        { name: "🌃 负载均衡 | HK-NORMAL", type: "load-balance", proxies: [], append: /^.*kong((?!game).)*$/gmi, reverse: /kong/gmi },
        { name: "🌃 负载均衡 | HK-GAME/3X", type: "load-balance", proxies: [], append: /kong.*game/gmi },
        { name: "🌃 负载均衡 | Singapore", type: "load-balance", proxies: [], append: /singapore.*[^x]$/gmi },
        { name: "🌃 负载均衡 | Taiwan", type: "load-balance", proxies: [], append: /taiwan.*[^x]$/gmi },
        { name: "🌃 负载均衡 | United States", type: "load-balance", proxies: [], append: /states.*[^x]$/gmi },
        { name: "🌃 负载均衡 | Japan", type: "load-balance", proxies: [], append: /japan.*[^x]$/gmi },
        { name: "🌃 负载均衡 | United Kingdom", type: "load-balance", proxies: [], append: /kingdom.*[^x]$/gmi },
    ]

    const additionRules = [
        "RULE-SET,idm,🌆 数据下载 | IDM",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,proxy,🌌 科学上网 | FANRR",
    ];
    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | FANRR",
        "RULE-SET,gfw,🌌 科学上网 | FANRR",
        "RULE-SET,proxy,🌌 科学上网 | FANRR",
        "RULE-SET,tld-not-cn,🌌 科学上网 | FANRR",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | FANRR,no-resolve",
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
        originalRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/commons/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "h:/onedrive/repositories/proxy rules/commons/rules/addition",
        additionNativeType: "yaml",
        additionRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/commons/rules/addition",
        additionRemoteType: "yaml",

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