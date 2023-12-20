const PATH = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash for windows/";
const URL = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash%20for%20windows/";
const SOURCES = {
  defaultFile: PATH + "default rules",
  customizeFile: PATH + "customize rules",
  defaultHttp: URL + "default%20rules",
  customizeHttp: URL + "customize%20rules"
};
const STASH_FOLDER = "H:/OneDrive/Documents/Repositories/Proxy Rules/stash";
const SHADOWROCKET_FOLDER = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket";
const RULE_UPDATE_HTTP = "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release";
const RULE_UPDATE_NAMES = ["apple", "applications", "cncidr", "direct", "gfw", "greatfire", "icloud", "lancidr", "private", "proxy", "reject", "telegramcidr", "tld-not-cn"];
const RULE_UPDATE_TYPE = "txt";

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
  console.log("[ INFO] configuration.get =>", "Parsing successful.");
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

const configurationOn = () => {
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
        { name: "🌄 特殊控制 | Node.js", type: "select", proxies: ["DIRECT", "🌌 科学上网"] },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["DIRECT", "REJECT", "🌌 科学上网"] },
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
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
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

const configurationCc = () => {
    const mainGroups = [
        "🌅 目标节点",
        "🌉 负载均衡 | 香港 A",
        "🌉 负载均衡 | 香港 B",
        "🌁 测试延迟 | 其他节点"
    ];
    const groups = [
        { name: "🌌 科学上网", type: "select", proxies: ["DIRECT"].concat(mainGroups) },
        { name: "🌅 目标节点", type: "select", proxies: ["DIRECT", "REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Node.js", type: "select", proxies: ["DIRECT", "🌌 科学上网"] },
        { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["REJECT", "DIRECT", "🌌 科学上网"] },
        { name: "🌄 特殊控制 | OpenAI", type: "select", proxies: ["REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Brad", type: "select", proxies: ["REJECT"], append: /\[.+/gm },
        { name: "🌄 特殊控制 | Copilot", type: "select", proxies: ["DIRECT", "🌌 科学上网"] },
        { name: "🌉 负载均衡 | 香港 A", type: "load-balance", proxies: [], append: /香港\s\d\d$/gm },
        { name: "🌉 负载均衡 | 香港 B", type: "load-balance", proxies: [], append: /香港\s\d\d\w/gm },
        { name: "🌁 测试延迟 | 其他节点", type: "fallback", proxies: [], append: /(越南|新加坡|台灣|美國|日本)\s\d\d/gm },
        { name: "🌠 规则逃逸", type: "select", proxies: ["DIRECT", "🌌 科学上网"] },
        { name: "🏞️ 订阅详情", type: "select", proxies: [], append: /剩余流量/gm }
    ]

    const customizeRules = [
        "RULE-SET,reject,REJECT",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,nodejs,🌄 特殊控制 | Node.js",
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
            "[SS]香港": "🇭🇰 香港",
            "[SS]越南": "🇻🇳 越南",
            "[SS]美國": "🇺🇸 美國",
            "[SS]日本": "🇯🇵 日本",
            "[SS]台灣": "🇨🇳 台灣",
            "[SS]新加坡": "🇸🇬 新加坡"
        }
    }
}

function main(params) {

    let configuration;
    const count = params["proxy-groups"].length
    if (count === 11) {
        configuration = configurationOn;
    } else if (count === 15) {
        configuration = configurationCc;
    }
    const mode = [1, 2];
    return JSON.parse(get(
        console,
        params,
        mode,
        configuration));
}

