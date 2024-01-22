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
        initScript: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/configs/initialization",

        defaultBehavior: "domain",
        behavior: {
            "classical": ["idm"],
            "ipcidr": ["telegramcidr", "lancidr", "cncidr"]
        },

        originalRules: originalRules,
        originalPrefix: "original",
        originalNative: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/rules/original",
        originalNativeType: "yaml",
        originalRemote: "https://raw.gitmirror.com/dylan127c/proxy-rules/main/clash%20for%20windows/rules/original",
        originalRemoteType: "yaml",

        additionRules: additionRules,
        additionPrefix: "addition",
        additionNative: "H:/OneDrive/Repositories/Proxy Rules/clash for windows/rules/addition",
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