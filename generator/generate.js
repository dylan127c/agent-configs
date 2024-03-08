const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
  return FILE_NAME + "." + name + " =>";
}

function homepath() {
  return process.env.homepath.replace(/^\\/gm, "c:\\");
}

const providers = path.join(homepath(), ".run/providers.js");
try {
  delete require.cache[require.resolve(providers)];
} catch (error) {
  console.log("%HOMEPATH%/.RUN/PROVIDERS.JS WAS NOT FOUND.");
}

const {
  PROXY_PROVIDER_PATH,
  PROXY_PROVIDER_TYPE,
  PROXY_PROVIDERS_MAP,
  ALL_PROFILES_OUTPUT
} = require(providers);

delete require.cache[require.resolve("./profile.js")];
const {
  GROUPS,
  PROVIDER_GROUPS,
  IPCIDR,
  CLASSICAL,
  DOMAIN,
  TYPE_MAP,
  RULE_PROVIDER_PATH,
  RULE_PROVIDER_TYPE,
  RULES,
  FLAG,
  LOAD_BALANCE,
  LOAD_BALANCE_PARAMS,
  URL_TEST,
  URL_TEST_PARAMS,
  FALLBACK,
  FALLBACK_PARAMS,
  HEALTH_CHECK
} = require("./profile.js");

function generate(log, yaml) {
  const funcName = "generate";

  params = build();
  params["proxy-providers"] = getProxyProvider();
  params["rules"] = RULES;
  params["rule-providers"] = getRuleProvider(RULES);
  params["proxy-groups"] = getProxyGroups();

  const output = yaml.stringify(params);

  fs.writeFileSync(
    path.join(
      homepath(),
      PROXY_PROVIDER_PATH,
      ALL_PROFILES_OUTPUT.replace(/$/gm, "." + RULE_PROVIDER_TYPE)
    ),
    output, "utf-8");
  log.info(mark(funcName), "done.");
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
  GROUPS.forEach(preset => {
    const group = {};
    group.name = preset.name;
    group.type = preset.type;
    if (preset.hasOwnProperty("use") && !preset.use) {
      preset.proxies = preset.proxies.concat(providerGroupsName);
    } else {
      if (preset.hasOwnProperty("all") && preset.all) {
        group.use = Object.keys(PROXY_PROVIDERS_MAP);
      } else {
        group.use = preset.provider;
      }
      if (preset.hasOwnProperty("filter")) {
        group.filter = preset.filter;
      }
    }
    group.proxies = preset.proxies;
    groupsArr.push(group);
  });

  for (const [provider, details] of Object.entries(PROVIDER_GROUPS)) {
    details.forEach(detail => {
      const group = {};
      group.name = detail.name;
      group.type = detail.type;
      group.filter = detail.filter
      group.use = [provider];

      if (detail.type === LOAD_BALANCE) {
        groupsArr.push(Object.assign(group, LOAD_BALANCE_PARAMS));
      } else if (detail.type === URL_TEST) {
        groupsArr.push(Object.assign(group, URL_TEST_PARAMS));
      }
    })
  }
  return groupsArr;
}

function getRuleProvider(rules) {
  const provider = {};
  rules.forEach(rule => {
    const arr = rule.match(/(?<=RULE-SET,)[a-z-]*(?=,)/gm);
    if (arr && arr.length) {
      const providerName = arr[0];
      provider[providerName] = {};
      provider[providerName].type = "file";
      provider[providerName].behavior = getBehavior(providerName);
      provider[providerName].path = path.resolve(__dirname, RULE_PROVIDER_PATH, providerName.replace("-", "/").replace(/$/gm, "." + RULE_PROVIDER_TYPE));
      provider[providerName].interval = 86400;
    }
  });
  return provider;

  function getBehavior(name) {
    if (TYPE_MAP.IPCIDR.some(keyword => name.includes(keyword))) {
      return IPCIDR;
    }
    if (TYPE_MAP.CLASSICAL.some(keyword => name.includes(keyword))) {
      return CLASSICAL;
    }
    return DOMAIN;
  }
}

function getProxyProvider() {
  const provider = {};
  for (const [providerName, fileName] of Object.entries(PROXY_PROVIDERS_MAP)) {
    provider[providerName] = {};
    provider[providerName].type = "file";
    provider[providerName].path = path.join(homepath(), PROXY_PROVIDER_PATH) + fileName + "." + PROXY_PROVIDER_TYPE;
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

module.exports = { generate };