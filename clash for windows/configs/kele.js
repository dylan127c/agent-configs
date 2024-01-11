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
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["DIRECT", "REJECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🌄 特殊控制 | Node.js", type: "select", proxies: ["DIRECT", "🌌 科学上网 | KELECLOUD"] },
        { name: "🌉 负载均衡 | 香港 A", type: "load-balance", proxies: [], append: /香港\s\d\d\w/gm },
        { name: "🌉 负载均衡 | 香港 B", type: "load-balance", proxies: [], append: /香港\s\d\d$/gm },
        { name: "🌉 负载均衡 | 美国", type: "load-balance", proxies: [], append: /美國\s\d\d$/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本\s\d\d$/gm },
        { name: "🏞️ 订阅详情", type: "select", proxies: [], append: /剩余流量/gm },
    ]

    const customizeRules = [
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,edge,🌄 特殊控制 | Edge",
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
        "RULE-SET,proxy,🌌 科学上网 | KELECLOUD",
    ];
    const defaultRules = [
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
        customizeRules: customizeRules,
        customizeRulePrefix: "customize-",
        defaultRules: defaultRules,
        defaultRulePrefix: "default-",
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