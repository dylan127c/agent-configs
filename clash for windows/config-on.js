module.exports.configurationOn = () => {
    const mainGroups = [
        "🌅 目标节点",
        "🌃 故障切换 | 深港移动",
        "🌃 故障切换 | 沪港电信",
        "🌃 故障切换 | 沪日电信",
        "🌉 负载均衡 | 香港",
        "🌉 负载均衡 | 日本"
    ];
    const groups = [
        { name: "🌌 科学上网", type: "select", proxies: ["DIRECT"].concat(mainGroups) },
        { name: "🌅 目标节点", type: "select", proxies: ["DIRECT", "REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["REJECT", "DIRECT", "🌌 科学上网"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["DIRECT", "🌌 科学上网"] },
        { name: "🌃 故障切换 | 深港移动", type: "fallback", proxies: [], append: /香港 \d\d 移动.+/gm },
        { name: "🌃 故障切换 | 沪港电信", type: "fallback", proxies: [], append: /香港 \d\d 电信.+/gm },
        { name: "🌃 故障切换 | 沪日电信", type: "fallback", proxies: [], append: /日本 \d\d [^A-Z].+/gm },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", proxies: [], append: /香港\s\d\d [A-Z].+$/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本\s\d\d [A-Z]/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网"] }
    ];

    const customizeRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,edge,🌄 特殊控制 | Edge",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,proxy,🌌 科学上网"
    ];
    const defaultRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网",
        "RULE-SET,gfw,🌌 科学上网",
        "RULE-SET,proxy,🌌 科学上网",
        "RULE-SET,tld-not-cn,🌌 科学上网",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网,no-resolve",
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
            "🇹🇼": "🇨🇳",
            "卢森堡": "🇺🇳 卢森堡"
        }
    }
}