// ! 请使用VSCode，并安装Better Comments插件以阅读高亮注释。

module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {

  const currentClient = "CFW";

  // !.convert format
  // !.service provider && configuration

  // 是否启用http方式获取规则列表
  const disableHttp = true;

  let obj;
  let isEasternNetwork;
  let isColaCloud;
  let disableStashOutput;

  // ?.CFW ACCEPTED
  if (currentClient === "CFW") {

    // !CFW需要先根据配置文件（String）来获取对应的JavaScript对象（JSON）
    obj = yaml.parse(raw);

    // CFW可以通过辨别订阅链接的方式，来确定当前使用的网络供应商是什么
    isEasternNetwork = JSON.stringify(url).match(/touhou/gm);
    isColaCloud = JSON.stringify(url).match(/sub/gm);

    // 是否转换并导出stash配置文件
    disableStashOutput = false;
  }

  // ?.CV ACCEPTED
  if (currentClient === "CV") {

    // !CV直接提供JSON对象params，虽然不需要转换，但为了可用性可以作一层变量转换
    obj = JSON.parse(JSON.stringify(params));

    /**
     * !CV使用routing-mark字段来确定当前使用的网络供应商是什么。
     * !注意，需要在CV设置中的Clash字段内，勾选routing-mark字段后，以下代码才能生效。
     */
    if (obj["routing-mark"] === 6666) {
      isEasternNetwork = true;
    }
    isColaCloud = !isEasternNetwork;

    disableStashOutput = true;
  }

  // !.dns

  /**
   * 用于新增或替换原始订阅中的DNS和TUN配置。
   * 
   * 对于CFW来说，无法确定是CFW软件本身的配置生效，还是订阅文件中的配置生效，因为两者之间互不影响。
   * 由于配置同时存在，以防万一，可以选择让CFW中的TUN配置保存与以下配置一致。
   */
  delete obj["dns"];
  obj["dns"] = {};
  obj.dns.enable = true;
  obj.dns.ipv6 = false;
  obj.dns["enhanced-mode"] = "fake-ip";
  obj.dns["fake-ip-range"] = "192.18.0.1/16";

  obj.dns.nameserver = [
    "119.29.29.29", // DNSPod Public
    "119.28.28.28",
    "223.5.5.5", // Ali
    "223.6.6.6"
  ];
  obj.dns.fallback = [
    "114.114.114.114", // 114
    "8.8.8.8", // Google
    "94.140.14.15", // AdGuard
    "94.140.15.16"
  ];
  obj.dns["fake-ip-filter"] = [
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
  delete obj["tun"];
  obj["tun"] = {
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
  delete obj["profile"];
  obj["profile"] = { "tracing": true };

  // !.rules & proxy-groups

  /**
   * 规则可以让指定的程序或规则列表（Rule Providers）使用特定的模式，
   * 这里的模式一般只包含三种：PROXY、DIRECT、REJECT。
   */
  const processlist = [
    "PROCESS-NAME,aria2c.exe,DIRECT",
    "PROCESS-NAME,IDMan.exe,DIRECT"
  ];

  const customizelist = [
    "RULE-SET,Customize-Reject,REJECT",
    "RULE-SET,Customize-Direct,DIRECT",
    "RULE-SET,Customize-Edge,🌄 特殊控制 | Edge", // for ChatGPT
    "RULE-SET,Customize-OpenAI,🌄 特殊控制 | OpenAI", // for ChatGPT
    "RULE-SET,Customize-Brad,🌄 特殊控制 | Brad", // for Google Brad
    "RULE-SET,Customize-Copilot,🌄 特殊控制 | Copilot", // for New Bing
    "RULE-SET,Customize-Proxy,🌌 科学上网"
  ];

  const remotelist = [
    "RULE-SET,Remote-Applications,DIRECT",
    "RULE-SET,Remote-Apple,DIRECT",
    "RULE-SET,Remote-iCloud,DIRECT",

    "RULE-SET,Remote-Private,DIRECT",
    "RULE-SET,Remote-Direct,DIRECT",
    "RULE-SET,Remote-Greatfire,🌌 科学上网",
    "RULE-SET,Remote-GFW,🌌 科学上网",
    "RULE-SET,Remote-Proxy,🌌 科学上网",
    "RULE-SET,Remote-Tld-not-cn,🌌 科学上网",
    "RULE-SET,Remote-Reject,REJECT",

    /**
     * ! 以下为IP规则，添加no-resolve可以避免使用本地DNS解析未匹配域名，
     * ! 从而避免DNS泄露。但相应的未解析域名，将跳过IP规则直接匹配MATCH。
     * 
     * * DNS_LEAKING_TEST：https://ipleak.net
     * 
     * * 测试需要保证以上网址的网络连通性，并同时仅使用同一个网络。
     * * 如若测试中出现了你所在国家的IP地址，则表示发生了DNS泄露。
     * 
     * ? 选择使用类似于AdGuard Windows中的DNS Protection功能，
     * ? 同时使用AdGuard DNS并启用DoQ协议，能有效地避免DNS泄露。
     * ? 那么此时，对于IP规则来说，则无需额外添加no-resolve选项。
     * 
     * ! 需要注意，是否选择使用AdGuard DNS取决于该DNS
     * ! 与你所在网络之间的网络连通性。
     * ! 如果延迟过高，则不建议使用，保持本地解析建议添加no-resolve选项。
     */
    "RULE-SET,Remote-Telegramcidr,🌌 科学上网,no-resolve",
    "RULE-SET,Remote-Lancidr,DIRECT,no-resolve",
    "RULE-SET,Remote-Cncidr,DIRECT,no-resolve",
    "GEOIP,LAN,DIRECT,no-resolve",
    "GEOIP,CN,DIRECT,no-resolve"
  ];

  const matchlist = [
    "MATCH,🌠 规则逃逸"
  ];

  let serviceProvider = ""; // Stash配置的输出文件名及.stoverride文件的别名

  const proxyGroups = [];
  if (isEasternNetwork) {
    fillProxyGroupOrientalNetwork();
  } else if (isColaCloud) {
    fillProxyGroupColaCloud();
  }
  obj["proxy-groups"] = proxyGroups;

  function fillProxyGroupOrientalNetwork() {
    serviceProvider = "ORIENTAL_NETWORK";
    obj["rules"] = processlist.concat(customizelist, remotelist, matchlist);

    const proxyGroupsName = [
      "🌅 目标节点",
      "🌃 故障切换 | 深港移动",
      "🌃 故障切换 | 沪港电信",
      "🌃 故障切换 | 沪日电信",
      "🌉 负载均衡 | 香港",
      "🌉 负载均衡 | 日本"
    ];
    proxyGroups[0] = getProxyGroup("🌌 科学上网", "select", ["DIRECT"].concat(proxyGroupsName));
    proxyGroups[1] = getProxyGroup("🌅 目标节点", "select", ["DIRECT", "REJECT"], /.+/gm);

    proxyGroups[2] = getProxyGroup("🌄 特殊控制 | Edge", "select", ["REJECT", "DIRECT", "🌌 科学上网"]);
    proxyGroups[3] = getProxyGroup("🌄 特殊控制 | OpenAI", "select", ["REJECT"], /.+/gm);
    proxyGroups[4] = getProxyGroup("🌄 特殊控制 | Brad", "select", ["REJECT"], /.+/gm);
    proxyGroups[5] = getProxyGroup("🌄 特殊控制 | Copilot", "select", ["DIRECT", "🌌 科学上网"]);

    proxyGroups[6] = getProxyGroup("🌃 故障切换 | 深港移动", "fallback", [], /香港 \d\d 移动.+/gm);
    proxyGroups[7] = getProxyGroup("🌃 故障切换 | 沪港电信", "fallback", [], /香港 \d\d 电信.+/gm);
    proxyGroups[8] = getProxyGroup("🌃 故障切换 | 沪日电信", "fallback", [], /日本 \d\d [^A-Z].+/gm);

    proxyGroups[9] = getProxyGroup("🌉 负载均衡 | 香港", "load-balance", [], /香港\s\d\d [A-Z].+$/gm);
    proxyGroups[10] = getProxyGroup("🌉 负载均衡 | 日本", "load-balance", [], /日本\s\d\d [A-Z]/gm)

    proxyGroups[11] = getProxyGroup("🌠 规则逃逸", "select", ["DIRECT", "🌌 科学上网"]);
  }

  function fillProxyGroupColaCloud() {
    serviceProvider = "COLA_CLOUD";
    obj["rules"] = customizelist.concat(remotelist, matchlist);

    const proxyGroupsName = [
      "🌅 目标节点",
      "🌉 负载均衡 | 香港 A",
      "🌉 负载均衡 | 香港 B",
      "🌁 测试延迟 | 其他节点"
    ];
    proxyGroups[0] = getProxyGroup("🌌 科学上网", "select", ["DIRECT"].concat(proxyGroupsName));
    proxyGroups[1] = getProxyGroup("🌅 目标节点", "select", ["DIRECT", "REJECT"], /\[.+/gm);

    proxyGroups[2] = getProxyGroup("🌄 特殊控制 | Edge", "select", ["REJECT", "DIRECT", "🌌 科学上网"]);
    proxyGroups[3] = getProxyGroup("🌄 特殊控制 | OpenAI", "select", ["REJECT"], /.+/gm);
    proxyGroups[4] = getProxyGroup("🌄 特殊控制 | Brad", "select", ["REJECT"], /.+/gm);
    proxyGroups[5] = getProxyGroup("🌄 特殊控制 | Copilot", "select", ["DIRECT", "🌌 科学上网"]);

    proxyGroups[6] = getProxyGroup("🌉 负载均衡 | 香港 A", "load-balance", [], /香港\s\d\d$/gm);
    proxyGroups[7] = getProxyGroup("🌉 负载均衡 | 香港 B", "load-balance", [], /香港\s\d\d\w/gm);

    proxyGroups[8] = getProxyGroup("🌁 测试延迟 | 其他节点", "fallback", [], /(越南|新加坡|台灣|美國|日本)\s\d\d/gm);
    proxyGroups[8].proxies.sort((a, b) => {
      // ! 按照高可用性排序 !
      const sortRules = ["[SS]台", "[SS]新", "[SS]越", "[SS]日", "[SS]美"];
      const target = /^.{5}/gm;
      return sortRules.indexOf(a.match(target).pop()) - sortRules.indexOf(b.match(target).pop());
    });

    proxyGroups[9] = getProxyGroup("🌠 规则逃逸", "select", ["DIRECT", "🌌 科学上网"]);
    proxyGroups[10] = getProxyGroup("🏞️ 订阅详情", "select", [obj.proxies.find(ele => ele.name.match(/剩余流量/gm)).name]);
  }

  /**
   * 使用正则表达式筛选节点列表，并构建代理分组。
   * 
   * @param {string} groupName 组名
   * @param {string} groupType 类型
   * @param {Array} stableGroup 属于该分组的节点或组别 
   * @param {RegExp} regex 正则表达式，用于筛选节点
   * @returns 
   */
  function getProxyGroup(groupName, groupType, stableGroup, regex) {
    const proxyGroup = {
      name: groupName,
      type: groupType,
      url: "http://www.gstatic.com/generate_204",
      interval: 72,
      proxies: []
    };

    if (stableGroup.length) {
      proxyGroup.proxies = stableGroup;
    }

    if (regex) {
      obj.proxies.forEach(ele => {
        var proxyName = ele.name;
        if (proxyName.match(regex)) {
          proxyGroup.proxies.push(proxyName);
        }
      });
    }
    return proxyGroup;
  }

  // !.rule providers

  // 构建Rule providers对象
  const httpClassical = { type: "http", behavior: "classical", interval: 86400 };
  const httpDomain = { type: "http", behavior: "domain", interval: 86400 };
  const httpIpcidr = { type: "http", behavior: "ipcidr", interval: 86400 };

  const fileClassical = { type: "file", behavior: "classical", };
  const fileDomain = { type: "file", behavior: "domain", };
  const fileIpcidr = { type: "file", behavior: "ipcidr", };

  // 远程非自定义的规则文件 => https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/
  // 另一个获取规则文件地址 => https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/
  const rpRemoteHttp = {
    "Remote-Reject": { ...httpDomain }, // 针对不可变对象，使用shallow copy即可
    "Remote-Proxy": { ...httpDomain },
    "Remote-Direct": { ...httpDomain },
    "Remote-Private": { ...httpDomain },
    "Remote-GFW": { ...httpDomain },
    "Remote-Greatfire": { ...httpDomain },
    "Remote-Tld-not-cn": { ...httpDomain },
    "Remote-Telegramcidr": { ...httpIpcidr },
    "Remote-Cncidr": { ...httpIpcidr },
    "Remote-Lancidr": { ...httpIpcidr },
    "Remote-Applications": { ...httpClassical },
    "Remote-iCloud": { ...httpDomain },
    "Remote-Apple": { ...httpDomain },
  };

  // 远程自定义的规则文件 => https://cdn.jsdelivr.net/gh/dylan127c/proxy-rules@main/clash/customize%20rules/
  // 另一个获取规则的地址 => https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash/customize%20rules/
  const rpCustomizeHttp = {
    "Customize-Edge": { ...httpDomain },
    "Customize-OpenAI": { ...httpDomain },
    "Customize-Brad": { ...httpDomain },
    "Customize-Copilot": { ...httpDomain },
    "Customize-Direct": { ...httpDomain },
    "Customize-Reject": { ...httpDomain },
    "Customize-Proxy": { ...httpDomain }
  };

  // 本地非自定义的规则文件 => path.resolve(__dirname, "remote rules")
  const rpRemoteFile = {
    "Remote-Reject": { ...fileDomain },
    "Remote-Proxy": { ...fileDomain },
    "Remote-Direct": { ...fileDomain },
    "Remote-Private": { ...fileDomain },
    "Remote-GFW": { ...fileDomain },
    "Remote-Greatfire": { ...fileDomain },
    "Remote-Tld-not-cn": { ...fileDomain },
    "Remote-Telegramcidr": { ...fileIpcidr },
    "Remote-Cncidr": { ...fileIpcidr },
    "Remote-Lancidr": { ...fileIpcidr },
    "Remote-Applications": { ...fileClassical },
    "Remote-iCloud": { ...fileDomain },
    "Remote-Apple": { ...fileDomain },
  };

  // 本地自定义的规则文件 => path.resolve(__dirname, "customize rules")
  const rpCustomizeFile = {
    "Customize-Edge": { ...fileDomain },
    "Customize-OpenAI": { ...fileDomain },
    "Customize-Brad": { ...fileDomain },
    "Customize-Copilot": { ...fileDomain },
    "Customize-Direct": { ...fileDomain },
    "Customize-Reject": { ...fileDomain },
    "Customize-Proxy": { ...fileDomain }
  };

  // 远程地址采用jsDelivr转换过的地址
  const httpRemote = "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/";
  const httpCustomize = "https://cdn.jsdelivr.net/gh/dylan127c/proxy-rules@main/clash/customize%20rules/";

  // 构建远程规则的获取地址
  for (const [key, value] of Object.entries(rpRemoteHttp)) {
    rpRemoteHttp[key]["url"] = httpRemote + getFileName(key, "txt");
  }
  for (const [key, value] of Object.entries(rpCustomizeHttp)) {
    rpCustomizeHttp[key]["url"] = httpCustomize + getFileName(key, "yaml");
  }

  // 本地地址直接使用字符串类型
  const clashFilePosition = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/";
  const fileRemote = clashFilePosition + "remote rules/";
  const fileCustomize = clashFilePosition + "customize rules/";

  // 构建本地规则的获取地址
  for (const [key, value] of Object.entries(rpRemoteFile)) {
    rpRemoteFile[key]["path"] = fileRemote + getFileName(key, "yaml");
  }
  for (const [key, value] of Object.entries(rpCustomizeFile)) {
    rpCustomizeFile[key]["path"] = fileCustomize + getFileName(key, "yaml");
  }

  // 深拷贝要使用JSON.stringify()和JSON.parse()方法
  const rpRemoteHttpRaw = JSON.stringify(rpRemoteHttp); // 远程的非自定义规则
  const rpRemoteFileRaw = JSON.stringify(rpRemoteFile); // 本地的非自定义规则（预下载）
  const rpCustomizeHttpRaw = JSON.stringify(rpCustomizeHttp); // 远程的自定义规则（预上传）
  const rpCustomizeFileRaw = JSON.stringify(rpCustomizeFile); // 本地的自定义规则

  /**
   * 远程规则可以选择从远程下载至本地，让CFW直接从本地获取到这些规则，以免CFW出现所谓的网络故障，以至无法更新。
   * 
   * 归根结底的原因，是CFW无法通过代理的方式去更新这些远程的规则集。
   * 但是用户可以选择使用代理，预先将远程规则下载至本地以供CFW使用。
   */
  if (disableHttp) {
    obj["rule-providers"] = Object.assign( // 默认使用本地规则
      JSON.parse(rpRemoteFileRaw), JSON.parse(rpCustomizeFileRaw)
    );
  } else {
    obj["rule-providers"] = Object.assign( // 仅有非自定义规则从远程订阅，自定义规则仍旧从本地订阅
      JSON.parse(rpRemoteHttpRaw), JSON.parse(rpCustomizeFileRaw)
    );
  }

  /**
   * 用于提取并拼接目标规则文件的名称。
   * 
   * @param {string} key 
   * @param {string} type 
   * @returns 
   */
  function getFileName(key, type) {
    return key.match(/-[-\w]+/gm).pop().replace(/^-/gm, "").toLowerCase() + "." + type;
  }

  /**
   * 补充节点的旗帜信息。
   * 
   * @param {string} str 
   * @param {string} serviceProvider
   * @returns 
   */
  function fixSomeFlag(str, serviceProvider) {
    if (serviceProvider === "ORIENTAL_NETWORK") {
      return str
        .replaceAll("🇹🇼", "🇨🇳")
        .replaceAll("卢森堡", "🇺🇳 卢森堡");
    } else if (serviceProvider === "COLA_CLOUD") {
      return str
        .replaceAll("[SS]香港", "🇭🇰 香港")
        .replaceAll("[SS]越南", "🇻🇳 越南")
        .replaceAll("[SS]美國", "🇺🇸 美國")
        .replaceAll("[SS]日本", "🇯🇵 日本")
        .replaceAll("[SS]台灣", "🇨🇳 台灣")
        .replaceAll("[SS]新加坡", "🇸🇬 新加坡");
    }
    return str;
  }

  // !.stash configuration output

  if (!disableStashOutput) {
    outputStashConfig(serviceProvider);
  }

  /**
   * 用于输出Stash配置文件，当前版本Stash不支持使用JS来修改订阅内容。
   * 折中可选择使用stoverride配置，以覆盖rules、proxy-groups及rule-providers等字段。
   * 
   * !注意，方法需要使用fs、path等模块，而CV不支持引用模块，即本方法不能在CV更新订阅时启用。
   * 
   * @param {string} serviceProvider 输出文件名及.stoverride文件的别名
   * @param {string} prefix 为组名添加的前缀信息
   */
  function outputStashConfig(serviceProvider) {
    // 加载Node.js内置的fs、path模块
    // 1.fs模块用于读取文件；2. path模块用于拼接路径
    const fs = require("fs");
    const path = require("path");

    /** 
     * 以下用于移除Cola Cloud中的“订阅详情”分组，该分组依赖于实时更新。
     * 
     * Stash内的stoverride文件仅用于覆盖订阅内容中的rules、proxy-groups及rule-providers，
     * 这些配置已写死在stoverride文件内，它不会因为Stash的实时订阅内容而改变。
     */
    const copyProxyGroups = JSON.parse(JSON.stringify(obj["proxy-groups"])); // 深拷贝
    if (serviceProvider === "COLA_CLOUD") {
      copyProxyGroups.pop();
    }

    const output = {
      name: serviceProvider,
      desc: "Replace original config.",
      rules: obj["rules"],
      "proxy-groups": copyProxyGroups,
      "rule-providers": Object.assign( // 输出到Stach的配置无法从本地订阅规则，因此所有规则都需要从远程获取
        JSON.parse(rpRemoteHttpRaw), JSON.parse(rpCustomizeHttpRaw)
      )
    };

    const outputStr = yaml.stringify(output);
    let finalOutput = outputStr.replace("rules:", "rules: #!replace")
      .replace("proxy-groups:", "proxy-groups: #!replace")
      .replace("rule-providers:", "rule-providers: #!replace");

    fs.writeFile(
      path.resolve(__dirname, "..", "stash", serviceProvider + ".stoverride"),
      fixSomeFlag(finalOutput, serviceProvider),
      (err) => { throw err; }
    );
  }

  // !.return result

  // ?.CFW ACCEPTED
  if (currentClient === "CFW") {
    // *.CFW要求返回String类型的配置文件数据，非JSON类型
    return fixSomeFlag(JSON.stringify(obj), serviceProvider);
  }

  // ?.CV ACCEPTED
  if (currentClient === "CV") {
    // *.CV则要求返回JSON类型的数据，使用addPrefix方法后需要转换String类型为JSON类型
    return JSON.parse(fixSomeFlag(JSON.stringify(obj), serviceProvider));
  }
}