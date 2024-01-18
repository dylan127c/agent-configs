module.exports.configuration = () => {
    const mainGroups = [
        "🌃 故障恢复 | 深港移动",
        "🌃 故障恢复 | 沪港电信",
        "🌃 故障恢复 | 沪日电信",
        "🌉 负载均衡 | 香港",
        "🌉 负载均衡 | 日本",
        "🌅 目标节点",
    ].concat(["DIRECT"]);

    const specificRegex = /韩国|德国|土耳其|巴西|新加坡\s01|日本|阿根廷|澳大利亚|英国/gm;
    const groups = [
        { name: "🌌 科学上网 | ORIENT", type: "select", proxies: mainGroups },
        { name: "🌁 数据下载", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENT"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: specificRegex },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | ORIENT", "DIRECT"] },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["DIRECT", "REJECT", "🌌 科学上网 | ORIENT"] },
        { name: "🌄 特殊控制 | Node.js", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENT"] },
        { name: "🌃 故障恢复 | 深港移动", type: "fallback", append: /香港 \d\d 移动.+/gm },
        { name: "🌃 故障恢复 | 沪港电信", type: "fallback", append: /香港 \d\d 电信.+/gm },
        { name: "🌃 故障恢复 | 沪日电信", type: "fallback", append: /日本 \d\d [^A-Z].+/gm },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", append: /香港\s\d\d [A-Z].+$/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", append: /日本\s\d\d [A-Z]/gm },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENT"] },
    ];

    const additionRules = [
        "RULE-SET,download,🌁 数据下载",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,edge,🌄 特殊控制 | Edge",
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
        "RULE-SET,proxy,🌌 科学上网 | ORIENT",
    ];

    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | ORIENT",
        "RULE-SET,gfw,🌌 科学上网 | ORIENT",
        "RULE-SET,proxy,🌌 科学上网 | ORIENT",
        "RULE-SET,tld-not-cn,🌌 科学上网 | ORIENT",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | ORIENT,no-resolve",
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
            "🇹🇼": "🇨🇳",
            "卢森堡": "🇺🇳 卢森堡",
            "/(?<=\\s\\d\\d)\\s.+$/gm": "",
        }
    }
}