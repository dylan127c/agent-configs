module.exports.configuration = () => {
    const mainGroups = [
        "🌃 负载均衡 | SZ/HK-IEPL",
        "🌃 负载均衡 | SH/HK-IEPL",
        "🌃 负载均衡 | SH/JP-IEPL",
        "🌃 负载均衡 | Hong Kong",
        "🌃 负载均衡 | Japan",
        "🌅 目标节点",
    ];

    const specificRegex = /韩国|德国|土耳其|巴西|新加坡\s01|日本|阿根廷|澳大利亚|英国/gm;
    const groups = [
        { name: "🌌 科学上网 | ORIENT", type: "select", proxies: mainGroups },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENT"] },
        { name: "🌆 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | ORIENT"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: specificRegex },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | ORIENT", "DIRECT"] },
        { name: "🌃 负载均衡 | SZ/HK-IEPL", type: "load-balance", append: /香港 \d\d 移动.+/gm },
        { name: "🌃 负载均衡 | SH/HK-IEPL", type: "load-balance", append: /香港 \d\d 电信.+/gm },
        { name: "🌃 负载均衡 | SH/JP-IEPL", type: "load-balance", append: /日本 \d\d [^A-Z].+/gm },
        { name: "🌃 负载均衡 | Hong Kong", type: "load-balance", append: /香港\s\d\d [A-Z].+$/gm },
        { name: "🌃 负载均衡 | Japan", type: "load-balance", append: /日本\s\d\d [A-Z]/gm },
    ];

    const additionRules = [
        "RULE-SET,idm,🌆 数据下载 | IDM",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
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
            "🇹🇼": "🇨🇳",
            "卢森堡": "🇺🇳 卢森堡",
            "（流媒体）": "",
            "/(?<=\\s\\d\\d)\\s.+(?=（)/gm": "",
            "/(?<=\\s\\d\\d)\\s.+$/gm": "",
            "/无版权": "",
        },

        interval: 72,

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