module.exports.configuration = () => {
    const mainGroups = [
        "🌃 故障转移 | HK-A",
        "🌃 故障转移 | HK-B",
        "🌃 故障转移 | PROVISIONAL",
        // "🌃 故障转移 | HK-C",
        // "🌃 故障转移 | IEPL 2X",
        "🎑 负载均衡 | 狮城",
        "🎑 负载均衡 | 台湾",
        "🎑 负载均衡 | 美国",
        "🎑 负载均衡 | 日本",
        "🎑 负载均衡 | 德国",
        "🌇 專用節點 | IPv6",
        "🌅 目标节点",
    ].concat(["DIRECT"]);

    const groups = [
        { name: "🌌 科学上网 | NEBULAE", type: "select", proxies: mainGroups },
        { name: "🌅 目标节点", type: "select", proxies: ["REJECT", "DIRECT"], append: /.+/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEBULAE"] },
        { name: "🌆 数据下载 | IDM", type: "select", proxies: ["DIRECT", "🌌 科学上网 | NEBULAE"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["🌌 科学上网 | NEBULAE", "DIRECT"] },
        { name: "🌃 故障转移 | HK-A", type: "fallback", proxies: [], append: /香港\s(帕|阿|波)/gm },
        { name: "🌃 故障转移 | HK-B", type: "fallback", proxies: [], append: /香港\s(海|希|传)/gm },
        { name: "🌃 故障转移 | PROVISIONAL", type: "fallback", proxies: [], append: /优选/gm , reverse: /优选/gm},
        // { name: "🌃 故障转移 | HK-C", type: "fallback", proxies: [], append: /香港C\s/gm, reverse: /(?<=\s).+(?=C)/gm },
        // { name: "🌃 故障转移 | IEPL 2X", type: "fallback", proxies: [], append: /二倍专线\s/gm, reverse: /(?<=\s).+(?=二倍专线)/gm},
        { name: "🎑 负载均衡 | 狮城", type: "load-balance", proxies: [], append: /狮城\s/gm },
        { name: "🎑 负载均衡 | 台湾", type: "load-balance", proxies: [], append: /台湾\s/gm },
        { name: "🎑 负载均衡 | 美国", type: "load-balance", proxies: [], append: /美国\s/gm },
        { name: "🎑 负载均衡 | 日本", type: "load-balance", proxies: [], append: /日本\s/gm },
        { name: "🎑 负载均衡 | 德国", type: "load-balance", proxies: [], append: /德国\s/gm },
        { name: "🌇 專用節點 | IPv6", type: "url-test", proxies: ["REJECT"], append: /v6\s/gm },
    ]

    const additionRules = [
        "RULE-SET,idm,🌆 数据下载 | IDM",
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