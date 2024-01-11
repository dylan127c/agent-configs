const CFW_FOLDER = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash for windows/";
const REMOTE_URL = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/";
const SOURCES = {
  defaultFile: CFW_FOLDER + "default rules",
  customizeFile: CFW_FOLDER + "customize rules",
  defaultHttp: REMOTE_URL + "default%20rules",
  customizeHttp: REMOTE_URL + "customize%20rules"
};

function get(console, originalConfiguration, mode, configuration, isConfigRemote) {
  const newConfiguration = init(originalConfiguration);
  const profile = configuration();
  const defaultRulesSaver = addRulePrefix(profile.defaultRulePrefix, profile.defaultRules);
  const customizeRulesSaver = addRulePrefix(profile.customizeRulePrefix, profile.customizeRules);
  newConfiguration["rules"] = customizeRulesSaver.concat(defaultRulesSaver, profile.endRules);
  newConfiguration["proxy-groups"] = getProxyGroups(profile.groups, originalConfiguration.proxies);
  let defaultSaver;
  let customizeSaver;
  if (mode[0]) {
    defaultSaver = getRuleProviders(profile.defaultRules, profile.defaultRulePrefix, SOURCES.defaultFile);
  } else {
    defaultSaver = getRuleProviders(profile.defaultRules, profile.defaultRulePrefix, SOURCES.defaultHttp);
  }
  if (mode[1]) {
    customizeSaver = getRuleProviders(profile.customizeRules, profile.customizeRulePrefix, SOURCES.customizeFile);
  } else {
    customizeSaver = getRuleProviders(profile.customizeRules, profile.customizeRulePrefix, SOURCES.customizeHttp);
  }
  newConfiguration["rule-providers"] = Object.assign(defaultSaver, customizeSaver);
    return isConfigRemote ? JSON.stringify(newConfiguration) : outputClashConfig(newConfiguration, profile.replacement);
}

function init(configuration) {
  let initConfiguration = {};
  initConfiguration["mixed-port"] = 7890;
  initConfiguration["allow-lan"] = false;
  initConfiguration["bind-address"] = "*";
  initConfiguration.mode = "rule";
  initConfiguration["log-level"] = "info";
  initConfiguration.ipv6 = false;
  initConfiguration["external-controller"] = "127.0.0.1:9090";
  initConfiguration.secret = "";
  initConfiguration["dns"] = {};
  initConfiguration.dns.enable = true;
  initConfiguration.dns.ipv6 = false;
  initConfiguration.dns["enhanced-mode"] = "fake-ip";
  initConfiguration.dns["fake-ip-range"] = "192.18.0.1/16";
  initConfiguration.dns.nameserver = ["119.29.29.29", "119.28.28.28", "223.5.5.5", "223.6.6.6"];
  initConfiguration.dns.fallback = ["114.114.114.114", "114.114.115.115", "101.226.4.6", "218.30.118.6", "8.8.8.8", "94.140.14.15", "94.140.15.16", "1.1.1.1"];
  initConfiguration.dns["fake-ip-filter"] = ["+.stun.*.*", "+.stun.*.*.*", "+.stun.*.*.*.*", "+.stun.*.*.*.*.*", "*.n.n.srv.nintendo.net", "+.stun.playstation.net", "xbox.*.*.microsoft.com", "*.*.xboxlive.com", "*.msftncsi.com", "*.msftconnecttest.com", "WORKGROUP"];
  initConfiguration["tun"] = {
    enable: false,
    stack: "system",
    "auto-route": true,
    "auto-detect-interface": true,
    "dns-hijack": ["any:53"]
  };
  initConfiguration["profile"] = {
    "tracing": true
  };
  initConfiguration.proxies = configuration.proxies;
  return initConfiguration;
}

function addRulePrefix(rulePrefix, ...ruleArrays) {
  let arr = [];
  if (!ruleArrays || ruleArrays.toString() === "") {
    return arr;
  }
  ruleArrays.forEach(ruleArray => {
    const provisionalArr = ruleArray.map(ele => ele.replace(",", "," + rulePrefix));
    arr = arr.concat(provisionalArr);
  });
  return arr;
}

function getProxyGroups(details, proxies) {
  const arr = [];
  details.forEach(detail => {
    const proxyGroup = {
      name: detail.name,
      type: detail.type,
      proxies: detail.proxies
    };
    if (detail.type !== "select") {
      proxyGroup.url = "http://www.gstatic.com/generate_204";
      proxyGroup.interval = 72;
      proxyGroup.lazy = true;
    }
    if (detail.proxies.length) {
      proxyGroup.proxies = detail.proxies;
    }
    if (detail.append) {
      proxies.forEach(proxy => {
        if (proxy.name.match(detail.append)) {
          proxyGroup.proxies.push(proxy.name);
        }
      });
    }
    arr.push(proxyGroup);
  });
  return arr;
}

function getRuleProviders(rules, rulePrefix, ruleSource) {
  let ruleProviders = {};
  if (!ruleSource || ruleSource === "") {
    return {};
  }
  const ruleNames = rules.map(ele => ele.replace(/^.+?,/gm, "").replace(/,.+$/gm, ""));
  ;
  const getType = ruleSource => {
    return ruleSource.includes("http") ? "http" : "file";
  };
  const getBehavior = ruleName => {
    if (ruleName === "applications") {
      return "classical";
    }
    if (ruleName.includes("cidr")) {
      return "ipcidr";
    }
    return "domain";
  };
  if (getType(ruleSource) === "http") {
    ruleNames.forEach(name => {
      ruleProviders[rulePrefix + name] = {
        type: "http",
        behavior: getBehavior(name),
        url: ruleSource + "/" + name + ".yaml",
        interval: 86400
      };
    });
  }
  if (getType(ruleSource) === "file") {
    ruleNames.forEach(name => {
      ruleProviders[rulePrefix + name] = {
        type: "file",
        behavior: getBehavior(name),
        path: ruleSource + "/" + name + ".yaml"
      };
    });
  }
  return ruleProviders;
}

function outputClashConfig(configuration, replacement) {
  return fixSomeFlag(JSON.stringify(configuration), replacement);
}

function fixSomeFlag(str, map) {
  for (const [search, replace] of Object.entries(map)) {
    str = str.replaceAll(search, replace);
  }
  return str;
}

const clover = () => {
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

const kele = () => {
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

const orient = () => {
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

function main(params) {
    let configuration;
    const count = params["proxy-groups"].length
    if (count === 11) {
        configuration = orient;
    } else if (count === 15) {
        configuration = kele;
    } else if (count === 3) {
        configuration = clover;
    }
    const mode = [1, 1];
    return JSON.parse(get(
        console,
        params,
        mode,
        configuration));
}

