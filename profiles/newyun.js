module.exports.configuration = () => {

    const mainGroup = [{ name: "🌌 科学上网 | NEWYUN", type: "select" },];
    const ruleRequiredGroups = [
        { name: "🌠 规则逃逸", type: "select", proxies: ["🌌 科学上网 | NEWYUN", "DIRECT",] },
        { name: "🌆 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEWYUN"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Gemini", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | NEWYUN", "DIRECT"] },
    ];
    const mainRequiredGroups = [
        { name: "🌃 负载均衡 | Hong Kong", type: "load-balance", proxies: [], append: /^.*香港.*$/gmi },
        { name: "🌃 负载均衡 | Singapore", type: "load-balance", proxies: [], append: /^.*新加坡.*$/gmi },
        { name: "🌃 负载均衡 | Taiwan", type: "load-balance", proxies: [], append: /^.*台湾.*$/gmi },
        { name: "🌃 负载均衡 | United States", type: "load-balance", proxies: [], append: /^.*美国.*$/gmi },
        { name: "🌃 负载均衡 | Japan", type: "load-balance", proxies: [], append: /^.*日本.*$/gmi },
        { name: "🌃 负载均衡 | United Kingdom", type: "load-balance", proxies: [], append: /^.*英国.*$/gmi },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT"], append: /.+/gm },
    ];

    const additionRules = [
        "RULE-SET,idm,🌆 数据下载 | IDM",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Gemini",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,proxy,🌌 科学上网 | NEWYUN",
    ];
    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | NEWYUN",
        "RULE-SET,gfw,🌌 科学上网 | NEWYUN",
        "RULE-SET,proxy,🌌 科学上网 | NEWYUN",
        "RULE-SET,tld-not-cn,🌌 科学上网 | NEWYUN",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | NEWYUN,no-resolve",
        "RULE-SET,lancidr,DIRECT,no-resolve",
        "RULE-SET,cncidr,DIRECT,no-resolve"
    ];
    const endRules = [
        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",
        "MATCH,🌠 规则逃逸"
    ];

    return {
        mainGroup: mainGroup,
        ruleRequiredGroups: ruleRequiredGroups,
        mainRequiredGroups: mainRequiredGroups,

        endRules: endRules,
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
            "二倍专线": "",
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