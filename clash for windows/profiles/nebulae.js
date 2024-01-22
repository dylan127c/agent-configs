module.exports.configuration = () => {
    const mainGroups = [
        "🌃 故障恢复 | IEPL",
        "🌉 负载均衡 | 香港",
        "🌉 负载均衡 | 新加坡",
        "🌉 负载均衡 | 台湾",
        "🌉 负载均衡 | 美国",
        "🌉 负载均衡 | 日本",
        "🌉 负载均衡 | 德国",
        "🏙️ 延迟测试 | IPv6",
        "🌅 目标节点",
    ].concat(["DIRECT"]);

    const groups = [
        { name: "🌌 科学上网 | NEBULAE", type: "select", proxies: mainGroups },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEBULAE"] },
        { name: "🌁 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEBULAE"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | NEBULAE", "DIRECT"] },
        { name: "🌃 故障恢复 | IEPL", type: "fallback", proxies: [], append: /IEPL\s/gm },
        { name: "🌉 负载均衡 | 香港", type: "load-balance", proxies: [], append: /香港\w\s/gm },
        { name: "🌉 负载均衡 | 台湾", type: "load-balance", proxies: [], append: /台湾\w\s/gm },
        { name: "🌉 负载均衡 | 美国", type: "load-balance", proxies: [], append: /美国\w\s/gm },
        { name: "🌉 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本\w\s/gm },
        { name: "🌉 负载均衡 | 德国", type: "load-balance", proxies: [], append: /德国\w\s/gm },
        { name: "🌉 负载均衡 | 新加坡", type: "load-balance", proxies: [], append: /狮城\w\s/gm },
        { name: "🏙️ 延迟测试 | IPv6", type: "url-test", proxies: ["REJECT"], append: /v6\s/gm },
    ]

    const additionRules = [
        "RULE-SET,idm,🌁 数据下载 | IDM",
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,openai,🌄 特殊控制 | OpenAI",
        "RULE-SET,brad,🌄 特殊控制 | Brad",
        "RULE-SET,copilot,🌄 特殊控制 | Copilot",
        "RULE-SET,proxy,🌌 科学上网 | NEBULAE",
    ];
    const originalRules = [
        "RULE-SET,applications,DIRECT",
        "RULE-SET,apple,DIRECT",
        "RULE-SET,icloud,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,greatfire,🌌 科学上网 | NEBULAE",
        "RULE-SET,gfw,🌌 科学上网 | NEBULAE",
        "RULE-SET,proxy,🌌 科学上网 | NEBULAE",
        "RULE-SET,tld-not-cn,🌌 科学上网 | NEBULAE",
        "RULE-SET,reject,REJECT",
        "RULE-SET,telegramcidr,🌌 科学上网 | NEBULAE,no-resolve",
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
    }
}