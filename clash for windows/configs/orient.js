module.exports.configuration = () => {
    const mainGroups = [
        "🌃 故障切换 | 深港移动",
        "🌃 故障切换 | 沪港电信",
        "🌃 故障切换 | 沪日电信",
        "🌉 负载均衡 | 香港",
        "🌉 负载均衡 | 日本",
        "🌅 目标节点",
    ];
    const groups = [
        { name: "🌌 科学上网 | ORIENTAL", type: "select", proxies: mainGroups.concat(["DIRECT"]) },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENTAL"] },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENTAL"] },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["DIRECT", "REJECT", "🌌 科学上网 | ORIENTAL"] },
        { name: "🌄 特殊控制 | Node.js", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENTAL"] },
        { name: "🌃 故障切换 | 深港移动", type: "fallback", proxies: [], append: /香港 \d\d 移动.+/gm },
        { name: "🌃 故障切换 | 沪港电信", type: "fallback", proxies: [], append: /香港 \d\d 电信.+/gm },
        { name: "🌃 故障切换 | 沪日电信", type: "fallback", proxies: [], append: /日本 \d\d [^A-Z].+/gm },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", proxies: [], append: /香港\s\d\d [A-Z].+$/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本\s\d\d [A-Z]/gm },
    ];

    const customizeRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,edge,🌄 特殊控制 | Edge",
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
        "RULE-SET,proxy,🌌 科学上网 | ORIENTAL",
    ];
    const defaultRules = [
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