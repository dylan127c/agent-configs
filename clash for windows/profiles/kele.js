module.exports.configuration = () => {
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