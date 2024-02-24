const GROUPS = [
  { name: "🎇 Comprehensive", type: "select", proxies: ["REJECT", "🌅 SPECIFIC-LINE"], use: false },
  { name: "🌠 Escape", type: "select", proxies: ["DIRECT"], use: false },
  { name: "🎆 PikPak", type: "select", proxies: ["REJECT"], use: false },
  { name: "🎆 OpenAI", type: "select", proxies: ["REJECT"], use: false },
  { name: "🎆 Gemini", type: "select", proxies: ["REJECT"], use: false },
  { name: "🎆 GitHub", type: "select", proxies: ["REJECT"], use: false },
  { name: "🎆 YouTube", type: "select", proxies: ["REJECT"], use: false },
  { name: "🎆 Copilot", type: "select", proxies: ["REJECT"], use: false },
  { name: "🎆 Steam", type: "select", proxies: ["REJECT"], use: false },
  { name: "🌅 SPECIFIC-LINE", type: "select", proxies: ["REJECT"], use: true, filter: "^[^(📮|⏰|💥|🎮|剩|套|地|续)]" },
];

const PROVIDER_GROUPS = {
  "CL": [
    { name: "HK-IEPL", type: "load-balance", filter: "(?<=IEPL).*(?:香港)" },
    { name: "SG-IEPL", type: "load-balance", filter: "(?<=IEPL).*(?:新加坡)" },
    { name: "TW-IEPL", type: "load-balance", filter: "(?<=IEPL).*(?:台湾)" },
    { name: "KR-IEPL", type: "load-balance", filter: "(?<=IEPL).*(?:韩国)" },
    { name: "JP-IEPL", type: "load-balance", filter: "(?<=IEPL).*(?:日本)" },
    { name: "HK-TRANS", type: "load-balance", filter: "^(?!.*(?:IEPL)).*香港" },
    { name: "SG-TRANS", type: "load-balance", filter: "^(?!.*(?:IEPL)).*新加坡" },
    { name: "TW-TRANS", type: "load-balance", filter: "^(?!.*(?:IEPL)).*台湾" },
    { name: "KR-TRANS", type: "load-balance", filter: "^(?!.*(?:IEPL)).*韩国" },
    { name: "JP-TRANS", type: "load-balance", filter: "^(?!.*(?:IEPL)).*日本" },
  ],
  "SW": [
    { name: "HK", type: "load-balance", filter: "🇭🇰" },
    { name: "SG", type: "load-balance", filter: "🇸🇬" },
    { name: "TW", type: "load-balance", filter: "🇹🇼" },
    { name: "US", type: "load-balance", filter: "🇺🇸" },
    { name: "JP", type: "load-balance", filter: "🇯🇵" },
  ],
  "FR": [
    { name: "HK", type: "load-balance", filter: "(?i)^.*kong((?!premium).)*$" },
    { name: "SG", type: "load-balance", filter: "(?i)^.*singapore((?!premium).)*[^x]$" },
    { name: "TW", type: "load-balance", filter: "(?i)^.*taiwan((?!premium).)*[^x]$" },
    { name: "US", type: "load-balance", filter: "(?i)^.*states((?!premium).)*[^x]$" },
    { name: "JP", type: "load-balance", filter: "(?i)^.*japan((?!premium).)*[^x]$" },
    { name: "UK", type: "load-balance", filter: "(?i)^.*kingdom((?!premium).)*[^x]$" },
    { name: "PREMIUM-HK", type: "load-balance", filter: "(?i)hong.*premium" },
    { name: "PREMIUM-SG", type: "load-balance", filter: "(?i)singapore.*premium" },
    { name: "PREMIUM-TW", type: "load-balance", filter: "(?i)taiwan.*premium" },
    { name: "PREMIUM-JP", type: "load-balance", filter: "(?i)japan.*premium" },
    { name: "Streaming", type: "load-balance", filter: "📺" },
    { name: "Native/IP", type: "load-balance", filter: "(?i)[^.][0-9]x$" },
  ],
  "XY": [
    { name: "HK", type: "load-balance", filter: "香港.*" },
    { name: "SG", type: "load-balance", filter: "(?:狮城|新加坡).*" },
    { name: "JP", type: "load-balance", filter: "日本.*" },
    { name: "US", type: "load-balance", filter: "美国.*" },
    { name: "TW", type: "load-balance", filter: "台湾.*" },
    { name: "UK", type: "load-balance", filter: "英国.*" },
  ],
  "KL": [
    { name: "HK", type: "load-balance", filter: "香港.*" },
  ]
};

const RULE_PROVIDER_PATH = "h:/onedrive/repositories/proxy rules/commons/rules/";
const RULE_PROVIDER_TYPE = "yaml";
const RULES = [
  "RULE-SET,addition-reject,REJECT",
  "RULE-SET,addition-direct,DIRECT",
  "RULE-SET,addition-pikpak,🎆 PikPak",
  "RULE-SET,addition-copilot,🎆 Copilot",
  "RULE-SET,addition-openai,🎆 OpenAI",
  "RULE-SET,addition-gemini,🎆 Gemini",
  "RULE-SET,special-github,🎆 GitHub",
  "RULE-SET,special-youtube,🎆 YouTube",
  "RULE-SET,special-steam,🎆 Steam",
  "RULE-SET,addition-proxy,🎇 Comprehensive",
  "RULE-SET,original-applications,DIRECT",
  "RULE-SET,original-apple,DIRECT",
  "RULE-SET,original-icloud,DIRECT",
  "RULE-SET,original-private,DIRECT",
  "RULE-SET,original-direct,DIRECT",
  "RULE-SET,original-greatfire,🎇 Comprehensive",
  "RULE-SET,original-gfw,🎇 Comprehensive",
  "RULE-SET,original-proxy,🎇 Comprehensive",
  "RULE-SET,original-tld-not-cn,🎇 Comprehensive",
  "RULE-SET,original-reject,REJECT",
  "RULE-SET,original-telegramcidr,🎇 Comprehensive,no-resolve",
  "RULE-SET,original-lancidr,DIRECT,no-resolve",
  "RULE-SET,original-cncidr,DIRECT,no-resolve",
  "GEOIP,LAN,DIRECT,no-resolve",
  "GEOIP,CN,DIRECT,no-resolve",
  "MATCH,🌠 Escape"
];

const PROXY_PROVIDER_PATH = "c:/users/dylan/.config/clash-verge/profiles/";
const PROXY_PROVIDER_TYPE = "yaml";
const PROXY_PROVIDERS_MAP = {
  "CL": "rVHWildVA4kE",
  "XY": "rrs4tf1oAqZD",
  "SW": "rgdpxDKzALxP",
  "FR": "rTvDYQBQb8EX",
  "KL": "rKHPVl529aYE"
};

const FLAG = { HK: "🇭🇰", SG: "🇸🇬", TW: "🇹🇼", US: "🇺🇸", JP: "🇯🇵", UK: "🇬🇧", KR: "🇰🇷", UN: "🇺🇳" };
const LOAD_BALANCE = {
  url: "https://www.gstatic.com/generate_204",
  lazy: true,
  strategy: "consistent-hashing",
  interval: 300
};
const HEALTH_CHECK = {
  "health-check": {
    enable: true,
    url: "https://www.gstatic.com/generate_204",
    interval: 300
  }
};

const fs = require("fs");
const yaml = require('yaml');
const axios = require("axios");
const settings = require("./settings.json");

function main() {
  try {
    delete require.cache[require.resolve(settings.log)];
    const log = require(settings.log)(console);

    delete require.cache[require.resolve(settings.update)];
    const update = require(settings.update);

    params = build();
    params["proxy-providers"] = getProxyProvider();
    params["rules"] = RULES;
    params["rule-providers"] = getRuleProvider(RULES);
    params["proxy-groups"] = getProxyGroups();

    const detail = "# upload=0; download=2330019758080; total=10995116277760; expire=4102329600;";
    const output = detail + "\n" + yaml.stringify(params);
    fs.writeFileSync(settings.cv, output, "utf-8");

    /* !!! ASYNC FUNCTIOAN !!! */
    update.updateCheck(axios, log);
  } catch (error) {
    console.log(error);
  }
}

function getProxyGroups() {
  const providerGroupsName = [];
  for (const provider in PROVIDER_GROUPS) {
    PROVIDER_GROUPS[provider].forEach(group => {
      for (const [search, flag] of Object.entries(FLAG)) {
        if (group.name.includes(search) || search === "UN") {
          group.name = flag + " " + provider + "-" + group.name;
          break;
        }
      }
      providerGroupsName.push(group.name);
    });
  }

  const groupsArr = [];
  GROUPS.forEach(ele => {
    const group = {};
    group.name = ele.name;
    group.type = ele.type;
    if (!ele.use) {
      ele.proxies = ele.proxies.concat(providerGroupsName);
    } else {
      group.use = Object.keys(PROXY_PROVIDERS_MAP);
      group.filter = ele.filter;
    }
    group.proxies = ele.proxies;
    groupsArr.push(group);
  });

  for (const [provider, details] of Object.entries(PROVIDER_GROUPS)) {
    details.forEach(detail => {
      const group = {};
      group.name = detail.name;
      group.type = detail.type;
      group.filter = detail.filter
      group.use = [provider];
      groupsArr.push(Object.assign(group, LOAD_BALANCE));
    })
  }
  return groupsArr;
}

function getRuleProvider(rules) {
  const provider = {};
  rules.forEach(ele => {
    const arr = ele.match(/(?<=RULE-SET,)[a-z-]*(?=,)/gm);
    if (arr && arr.length) {
      const providerName = arr[0];
      provider[providerName] = {};
      provider[providerName].type = "file";
      provider[providerName].behavior = getBehavior(providerName);
      provider[providerName].path = RULE_PROVIDER_PATH + providerName.replace("-", "/").replace(/$/gm, "." + RULE_PROVIDER_TYPE);
      provider[providerName].interval = 86400;
    }
  });
  return provider;

  function getBehavior(name) {
    if (name.includes("cidr")) {
      return "ipcidr";
    }
    if (name.includes("special") || name.includes("applications") || name.includes("pikpak")) {
      return "classical";
    }
    return "domain"
  }
}

function getProxyProvider() {
  const provider = {};
  for (const [providerName, fileName] of Object.entries(PROXY_PROVIDERS_MAP)) {
    provider[providerName] = {};
    provider[providerName].type = "file";
    provider[providerName].path = PROXY_PROVIDER_PATH + fileName + "." + PROXY_PROVIDER_TYPE;
    provider[providerName] = Object.assign(provider[providerName], HEALTH_CHECK);
  }
  return provider;
}

function build() {

  /* INITIALIZE */
  let initConfiguration = {};

  /* BASIC CONFIGURATION */
  initConfiguration["mixed-port"] = 7890;
  initConfiguration["allow-lan"] = false;
  initConfiguration["bind-address"] = "*";
  initConfiguration.mode = "rule";
  initConfiguration["log-level"] = "info";
  initConfiguration.ipv6 = false;
  initConfiguration["external-controller"] = "127.0.0.1:9090";
  initConfiguration.secret = "";

  /*
   * DNS
   *
   * TUN 模式下，所有使用 DIRECT 或遇到未添加 no-resolve 的 IP 规则的域名，
   * 都需要使用到 DNS 规则。
   * 
   * CLASH 将同时使用 nameserver 和 fallback 中的所有 DNS 服务器，来查询
   * 域名的真实 IP 地址，其中 fallback 中的 DNS 解析结果的优先级较高。
   * 
   * 通常的配置策略是 nameserver 中提供国内的 DNS 服务器，而在 fallback 中
   * 提供国外的 DNS 服务器。 当需要解析国内域名时，基本能够保证结果的可靠性；
   * 如果需要解析国外域名，即便 nameserver 返回被污染的 IP 地址，也还可以
   * 依靠 fallback 中国外的 DNS 服务器所解析出来的 IP 地址。
   * 
   * 对于 CFW 来说，TUN 模式自带了 DNS 配置，且该配置默认处于启用状态，并无法更改。
   * 这意味着使用 CFW 开启 TUN 模式后，默认生效的 DNS 配置永远是 TUN 模式自带的 DNS 配置。
   * 
   * 配置文件内的 DNS 配置可以选择性开启或关闭。如果开启 DNS 配置，则所有经过 CFW/CV 的请求
   * 都会用 nameserver、fallback 中的 DNS 服务器进行解析（同时解析）。
   * 如果关闭 DNS 配置（dns.enable = false），则意味 CFW/CV 会使用系统默认的 DNS 解析服务。
   * 
   * 建议日常将 dns.enable 设置 false，以免未启用 TUN 时使用了 DNS 配置中的服务器。
   * 
   * 无论是 CFW 还是 CV，都需要启用服务模式后，才能正常使用 TUN 模式。
   */
  initConfiguration["dns"] = {};
  initConfiguration.dns.enable = false;
  initConfiguration.dns.ipv6 = false;
  initConfiguration.dns.listen = "0.0.0.0:53";
  initConfiguration.dns["use-hosts"] = true;
  initConfiguration.dns["enhanced-mode"] = "fake-ip";
  initConfiguration.dns["fake-ip-range"] = "192.18.0.1/16";
  initConfiguration.dns["fake-ip-filter"] = [
    "*.lan",
    "localhost.ptlogin2.qq.com",
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
    "*.logon.battlenet.com.cn",
    "*.logon.battle.net",
    "WORKGROUP"
  ];
  initConfiguration.dns["default-nameserver"] = [
    "119.29.29.29",
    "119.28.28.28",
    "223.5.5.5",
    "223.6.6.6",
  ];
  initConfiguration.dns.nameserver = [
    "https://doh.pub/dns-query",
    "https://1.12.12.12/dns-query",
    "https://120.53.53.53/dns-query",
    "https://dns.alidns.com/dns-query",
    "https://223.5.5.5/dns-query",
    "https://223.6.6.6/dns-query",
  ];

  /*
   * TUN
   *
   * 大部分浏览器默认开启 “安全 DNS” 功能，此功能会影响 TUN 模式劫持 DNS 请求导致反推域名失败，
   * 请在浏览器设置中关闭此功能以保证 TUN 模式正常运行。
   * 
   * 注意，在 tun.enable = true 时，CFW 会在完成配置更新时自动打开 TUN 模式，这显然不合理。
   * 而对于 CV 来说，无论 tun.enable 的值是什么，TUN 模式都不会被自动打开。
   * 
   * 因此，建议 tun.enable 保持 false 状态，在需要使用到 TUN 模式时，再手动代开。
   * 
   * 另外，tun.stack 默认为 gvisor 模式，但该模式兼容性欠佳，因此建议改为 system 模式。
   * 
   * 但需要注意，使用 system 模式需要先添加防火墙规则 Add firewall rules，
   * 同时还要安装、启用服务模式 Service Mode。
   */
  initConfiguration["tun"] = {
    enable: false,
    stack: "system",
    "auto-route": true,
    "auto-detect-interface": true,
    "dns-hijack": ["any:53"]
  };

  /*
   * PROFILE
   *
   * 遗留问题：使用 clash-tracing 项目监控 CFW 流量时，则需要在 ~/.config/clash/config.yaml 中添加 profile 配置。
   * 但目前 CFW 并无法正确识别该配置，即便将配置写入 config.yaml 中也不会生效。
   * 
   * 解决方法：直接在配置中添加 profile 信息，这样就可以使用 clash-tracing 项目来监控 CFW 流量了。
   */
  initConfiguration["profile"] = { "tracing": true };

  return initConfiguration;
}

module.exports = { main };