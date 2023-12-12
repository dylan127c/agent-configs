const client = "CFW";
module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {

  switch (client) {
    case "CFW": {
      defaultRulesUpdateCheck();
      outputStashConfig(get(yaml.parse(raw), true));

      const configCFW = get(yaml.parse(raw));
      return yaml.stringify(JSON.parse(configCFW));
    }
    case "CV":
      const configCV = get(params);
      return JSON.parse(configCV);
    default: return "";
  }

  /**
   * 本方法用于检查是否需要更新默认规则（default rules）文件。
   * 
   * 如果时间戳文件不存在，则进行更新。否则检查该时间与当前时间的间隔是否大于一周，
   * 如果时间间隔大于一周，则进行文件更新；否则将跳过更新并输出上次文件更新的日期。
   */
  function defaultRulesUpdateCheck() {
    const fs = require("fs");
    const path = require("path");

    fs.readFile(path.resolve(__dirname, "default rules", "timestamp.txt"),
      'utf8',
      (err, data) => {
        if (err) {
          defaultRulesUpdate();
          updateTimestamp();
        } else {
          const savedTimestamp = parseInt(data);
          const currentTimestamp = Date.now();

          const intervalInHours = (currentTimestamp - savedTimestamp) / (1000 * 60 * 60);

          if (intervalInHours >= 168) {
            defaultRulesUpdate();
            updateTimestamp();
          } else {
            // 这里的对象new Date(savedTimestamp)必须以拼接字符串的方式输出，否则时区信息会出错
            console.log("No update required. Last updated: " + new Date(savedTimestamp));
          }
        }
      });
    function updateTimestamp() {
      const currentTimestamp = Date.now();
      fs.writeFile(path.resolve(__dirname, "default rules", "timestamp.txt"),
        currentTimestamp.toString(),
        (err) => {
          if (err) {
            console.error("Timestamp update failure: ", err);
          } else {
            console.log("The timestamp has been updated: " + new Date(currentTimestamp));
          }
        });
    }
  }

  /**
   * 本方法用于更新默认规则（default rules）文件。
   * 
   * 由于并不能确定是否能得到目标地址的响应，因此axios保持异步请求即可。
   * 在连接超时的情况下，仅作错误信息的记录，这样不会阻塞配置文件的更新。
   */
  function defaultRulesUpdate() {
    const fs = require("fs");
    const path = require("path");

    const fileNames = ["apple", "applications", "cncidr", "direct", "gfw", "greatfire",
      "icloud", "lancidr", "private", "proxy", "reject", "telegramcidr", "tld-not-cn"];
    const domainHttp = "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/";

    fileNames.forEach(fileName => {
      axios({
        method: "get",
        url: domainHttp + fileName + ".txt",
      }).then(res => {
        fs.writeFile(
          path.resolve(__dirname, "default rules", fileName + ".yaml"),
          res.data,
          (err) => { throw err }
        );
        console.log('The default rule is up to date: ', fileName);
      }).catch(err => {
        console.log("Update default rule file failure: ", fileName);
        console.log(err);
      });
    });
  }

  function outputStashConfig(rawAfter) {
    const configuration = yaml.parse(rawAfter);

    let symbol = "ON";

    const stashProxyGroups = Object.assign(configuration["proxy-groups"]);
    const index = stashProxyGroups.findLastIndex(ele => ele.name.includes("订阅详情"));
    if (index >= 0) {
      stashProxyGroups.splice(index, 1);
      symbol = "CC";
    }

    const outputStr = yaml.stringify({
      name: symbol,
      desc: "Replace original configuration file.",
      rules: configuration.rules,
      "proxy-groups": stashProxyGroups,
      "rule-providers": configuration["rule-providers"]
    });

    const outputFinal = outputStr
      .replace("rules:", "rules: #!replace")
      .replace("proxy-groups:", "proxy-groups: #!replace")
      .replace("rule-providers:", "rule-providers: #!replace");

    const fs = require("fs");
    const path = require("path");
    fs.writeFile(
      path.resolve(__dirname, "..", "stash", symbol + ".stoverride"),
      outputFinal,
      (err) => { throw err; }
    );
  }

}

const configurationA = () => {
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
    { name: "🌄 特殊控制 | Edge", type: "select", proxies: ["REJECT", "DIRECT", "🌌 科学上网"] },
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
    isForbidHttp: true,
    groups: groups,
    endRules: endRules,

    customizeRules: customizeRules,
    customizeRulePrefix: "customize-",
    customizeRuleHttp: {
      link: "https://cdn.jsdelivr.net/gh/dylan127c/proxy-rules@main/clash/customize%20rules",
      type: "yaml"
    },
    customizeRulePath: {
      link: "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/customize rules",
      type: "yaml"
    },

    defaultRules: defaultRules,
    defaultRulePrefix: "default-",
    defaultRuleHttp: {
      link: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release",
      type: "txt"
    },
    defaultRulePath: {
      link: "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/default rules",
      type: "yaml"
    },

    replacement: {
      "🇹🇼": "🇨🇳",
      "卢森堡": "🇺🇳 卢森堡"
    }
  }
}

const configurationB = () => {
  const mainGroups = [
    "🌅 目标节点",
    "🌉 负载均衡 | 香港 A",
    "🌉 负载均衡 | 香港 B",
    "🌁 测试延迟 | 其他节点"
  ];

  const groups = [
    { name: "🌌 科学上网", type: "select", proxies: ["DIRECT"].concat(mainGroups) },
    { name: "🌅 目标节点", type: "select", proxies: ["DIRECT", "REJECT"], append: /\[.+/gm },
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
    isForbidHttp: true,
    groups: groups,
    endRules: endRules,

    customizeRules: customizeRules,
    customizeRulePrefix: "customize-",
    customizeRuleHttp: {
      link: "https://cdn.jsdelivr.net/gh/dylan127c/proxy-rules@main/clash/customize%20rules",
      type: "yaml"
    },
    customizeRulePath: {
      link: "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/customize rules",
      type: "yaml"
    },

    defaultRules: defaultRules,
    defaultRulePrefix: "default-",
    defaultRuleHttp: {
      link: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release",
      type: "txt"
    },
    defaultRulePath: {
      link: "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/default rules",
      type: "yaml"
    },

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

const profileSelector = {
  11: configurationA(),
  15: configurationB()
}

function get(originalConfiguration, forceHttpRuleProviders = false) {

  // !.service provider && configuration

  const profile = profileSelector[originalConfiguration["proxy-groups"].length];


  // ! 初始化配置文件

  let newConfiguration = init(originalConfiguration);
  function init(configuration) {

    // ! 改用自行编写配置文件的方式，只从原始配置中读取相关的proxy信息，其余信息均手动编写。
    // ! 这样可以提高配置文件在不同软件中的容错率，同时减少配置文件的冗余信息。

    let initConfiguration = {};

    initConfiguration["mixed-port"] = 7890;
    initConfiguration["allow-lan"] = false;
    initConfiguration["bind-address"] = "*";
    initConfiguration.mode = "rule";
    initConfiguration["log-level"] = "info";
    initConfiguration.ipv6 = false;
    initConfiguration["external-controller"] = "127.0.0.1:9090";
    initConfiguration.secret = "";

    // !.dns

    /**
     * 用于新增或替换原始订阅中的DNS和TUN配置。
     * 
     * 当dns.enable启用时，所有经过CFW或CV的流量都会使用DNS配置。
     * 
     * 对于CFW来说，TUN模式自带了DNS配置，同时该配置默认处于启用状态，且无法更改。
     * 这意味着使用CFW开启TUN模式后，默认生效的DNS配置永远是TUN模式自带的DNS配置。
     * 
     * 位于此订阅文件内的DNS配置可以选择性开启或关闭。如果启用DNS配置，则所有经过CFW或CV的请求
     * 都会用nameserver、fallback中的所有DNS服务器进行同时解析。
     * 如不启用此配置（dns.enable = false），则意味着使用系统默认的DNS配置。
     * 
     * 对于CV来说，必须开启DNS、TUN字段，同时启用订阅文件的DNS配置才能使用TUN模式。
     */
    initConfiguration["dns"] = {};
    initConfiguration.dns.enable = true; // 不启用则默认使用系统的DNS配置
    initConfiguration.dns.ipv6 = false;
    initConfiguration.dns["enhanced-mode"] = "fake-ip";
    initConfiguration.dns["fake-ip-range"] = "192.18.0.1/16";

    initConfiguration.dns.nameserver = [
      "119.29.29.29", // DNSPod Public
      "119.28.28.28",
      "223.5.5.5", // Ali
      "223.6.6.6"
    ];
    initConfiguration.dns.fallback = [
      "114.114.114.114", // 114
      "114.114.115.115",
      "101.226.4.6", // 360
      "218.30.118.6",
      "8.8.8.8", // Google
      "94.140.14.15", // AdGuard Family
      "94.140.15.16",
      "1.1.1.1" // Cloudflare
    ];
    initConfiguration.dns["fake-ip-filter"] = [
      "+.stun.*.*",
      "+.stun.*.*.*",
      "+.stun.*.*.*.*",
      "+.stun.*.*.*.*.*",
      "*.n.n.srv.nintendo.net",
      "+.stun.playstation.net",
      "xbox.*.*.microsoft.com",
      "*.*.xboxlive.com",
      "*.msftncsi.com",
      "*.msftconnecttest.com",
      "WORKGROUP"
    ];

    // !.tun

    /**
     * !大部分浏览器默认开启“安全DNS”功能，此功能会影响TUN模式劫持DNS请求导致反推域名失败，
     * !请在浏览器设置中关闭此功能以保证TUN模式正常运行。
     */
    initConfiguration["tun"] = {
      // 注意，如果enable的值为true，那么CFW会在更新配置的时候同步启用TUN模式
      // 但对于CV来说，无论值为什么，TUN模式都不会根据配置自动打开TUN模式
      // 建议保持该项的值为false，需要使用TUN模式再手动启用
      enable: false,
      // stack默认为gvisor模式，但兼容性欠佳，建议使用system模式
      // 启用system模式，需要添加防火墙规则（Add firewall rules），同时安装并启用服务模式（Service Mode）
      stack: "system",
      "auto-route": true,
      "auto-detect-interface": true,
      "dns-hijack": ["any:53"]
    };

    // !.profile

    /**
     * 遗留问题：如果使用clash-tracing项目监控CFW流量，则需要在~/.config/clash/config.yaml中配置profile信息。
     * 但目前CFW并无法正确识别该配置，即便将配置写入config.yaml中也无法生效。
     * 
     * 解决方法：可以选择直接在节点配置中添加profile信息，以启用clash-tracing项目监控CFW流量
     */
    initConfiguration["profile"] = { "tracing": true };

    // !.proxies

    initConfiguration.proxies = configuration.proxies;
    return initConfiguration;
  }

  // !.rules & proxy-groups

  newConfiguration["rules"] = addRulePrefix(profile.customizeRulePrefix, profile.customizeRules).concat(
    addRulePrefix(profile.defaultRulePrefix, profile.defaultRules),
    profile.endRules
  );
  function addRulePrefix(rulePrefix, ...ruleArrays) {
    let arr = [];
    ruleArrays.forEach(ruleArray => {
      const provisionalArr = ruleArray.map(ele => ele.replace(",", "," + rulePrefix));
      arr = arr.concat(provisionalArr);
    })
    return arr;
  }

  newConfiguration["proxy-groups"] = getGroups(profile.groups)
  function getGroups(details) {
    const arr = [];
    details.forEach(ele => {
      arr.push(getProxyGroup(ele));
    })
    return arr;

    function getProxyGroup(details) {
      const proxyGroup = {
        name: details.name,
        type: details.type,
        proxies: details.proxies
      };

      if (details.type !== "select") {
        proxyGroup.url = "http://www.gstatic.com/generate_204";
        proxyGroup.interval = 72;
        proxyGroup.lazy = true;
      }

      if (details.proxies.length) {
        proxyGroup.proxies = details.proxies;
      }

      if (details.append) {
        originalConfiguration.proxies.forEach(ele => {
          var proxyName = ele.name;
          if (proxyName.match(details.append)) {
            proxyGroup.proxies.push(proxyName);
          }
        });
      }
      return proxyGroup;
    }
  }

  // !.rule providers
  if (!forceHttpRuleProviders) {
    if (profile.isForbidHttp) {
      newConfiguration["rule-providers"] = Object.assign(
        getRuleProviders(profile.defaultRules, profile.defaultRulePath, profile.defaultRulePrefix),
        getRuleProviders(profile.customizeRules, profile.customizeRulePath, profile.customizeRulePrefix)
      );
    } else {
      newConfiguration["rule-providers"] = Object.assign(
        getRuleProviders(profile.defaultRules, profile.defaultRuleHttp, profile.defaultRulePrefix),
        getRuleProviders(profile.customizeRules, profile.customizeRulePath, profile.customizeRulePrefix)
      );
    }
  } else {
    newConfiguration["rule-providers"] = Object.assign(
      getRuleProviders(profile.defaultRules, profile.defaultRuleHttp, profile.defaultRulePrefix),
      getRuleProviders(profile.customizeRules, profile.customizeRuleHttp, profile.customizeRulePrefix)
    );
  }
  function getRuleProviders(rules, ruleSource, rulePrefix) {

    const ruleNames = getRuleNames(rules);
    function getRuleNames(...ruleArrays) {
      let arr = [];
      ruleArrays.forEach(ruleArray => {
        const provisionalArr = ruleArray.map(ele => ele.replace(/^.+?,/gm, "").replace(/,.+$/gm, ""));
        arr = arr.concat(provisionalArr);
      })
      return arr;
    }

    let ruleProviders = {};

    const getType = (ruleSource) => {
      return ruleSource.link.includes("https") ? "http" : "file";
    }
    const getBehavior = (ruleName) => {
      if (ruleName === "applications") {
        return "classical";
      }
      if (ruleName.includes("cidr")) {
        return "ipcidr";
      }
      return "domain";
    }

    if (getType(ruleSource) === "http") {
      ruleNames.forEach(name => {
        ruleProviders[rulePrefix + name] = {
          type: "http",
          behavior: getBehavior(name),
          url: ruleSource.link + "/" + name + "." + ruleSource.type,
          interval: 86400
        }
      })
    }

    if (getType(ruleSource) === "file") {
      ruleNames.forEach(name => {
        ruleProviders[rulePrefix + name] = {
          type: "file",
          behavior: getBehavior(name),
          path: ruleSource.link + "/" + name + "." + ruleSource.type
        }
      })
    }

    return ruleProviders;
  }

  // !.return result

  return forceHttpRuleProviders ?
    JSON.stringify(newConfiguration) :
    outputClashConfig(newConfiguration, profile.replacement);
  function outputClashConfig(configuration, replacement) {

    // *.CV则要求返回JSON类型的数据，使用addPrefix方法后需要转换String类型为JSON类型
    // *.CFW要求返回String类型的配置文件数据，非JSON类型
    return fixSomeFlag(JSON.stringify(configuration), replacement);
    /**
     * 补充节点的旗帜信息。
     * 
     * @param {string} str 
     * @param {Map} map
     * @returns 
     */
    function fixSomeFlag(str, map) {
      let result = str;
      for (const [search, replace] of Object.entries(map)) {
        result = result.replaceAll(search, replace);
      }
      return result;
    }
  }
}