module.exports.configuration = () => {
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
    const groups = [
        { name: "🌌 科学上网 | CLOVER", type: "select", proxies: mainGroups.concat(["DIRECT"]) },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | CLOVER"] },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /^(?!剩余|套餐)/gm },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /^(?!剩余|套餐)/gm },
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
    ]

    const customizeRules = [
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,edge,🌄 特殊控制 | Edge",
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
        "RULE-SET,proxy,🌌 科学上网 | CLOVER",
    ];
    const defaultRules = [
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
        customizeRules: customizeRules,
        customizeRulePrefix: "customize-",
        defaultRules: defaultRules,
        defaultRulePrefix: "default-",
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