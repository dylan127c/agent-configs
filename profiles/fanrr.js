module.exports.configuration = () => {
    const mainGroups = [
        "🌃 故障转移 | HK-N",
        "🌃 故障转移 | HK-G",
        "🎑 负载均衡 | 狮城",
        "🎑 负载均衡 | 台湾",
        "🎑 负载均衡 | 美国",
        "🎑 负载均衡 | 日本",
        "🎑 负载均衡 | 英国",
        "🌇 其他節點",
        "🌅 目标节点",
    ].concat(["DIRECT"]);

    const groups = [
        { name: "🌌 科学上网 | FANRR", type: "select", proxies: mainGroups },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | FANRR"] },
        { name: "🌆 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | FANRR"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | FANRR", "DIRECT"] },
        { name: "🌃 故障转移 | HK-N", type: "fallback", proxies: [], append: /Kong\s\d\d?$/gm, reverse: /Kong/gm },
        { name: "🌃 故障转移 | HK-G", type: "fallback", proxies: [], append: /Kong.+GAME/gm },
        { name: "🎑 负载均衡 | 狮城", type: "load-balance", proxies: [], append: /Singapore/gm },
        { name: "🎑 负载均衡 | 台湾", type: "load-balance", proxies: [], append: /Taiwan/gm },
        { name: "🎑 负载均衡 | 美国", type: "load-balance", proxies: [], append: /United States/gm },
        { name: "🎑 负载均衡 | 日本", type: "load-balance", proxies: [], append: /Japan/gm },
        { name: "🎑 负载均衡 | 英国", type: "load-balance", proxies: [], append: /United Kingdom/gm },
        { name: "🌇 其他節點", type: "url-test", proxies: ["REJECT"], append: /^\W{4}\s\W/gm },
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

        removal: [
            "Remaining traffic",
            "NO please update",
            "Expire date"
        ],

        replacement: {
            "Hong Kong": "香港",
            "Taiwan": "台湾",
            "Japan": "日本",
            "Singapore": "狮城",
            "United States": "美国",
            "United Kingdom": "英国",
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