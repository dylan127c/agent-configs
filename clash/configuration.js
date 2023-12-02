module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
  
  /* ------------------------ convert format ------------------------- */
  
  // CFW需要先根据配置文件（String）来获取对应的JavaScript对象（JSON）
  // 而CV则直接提供JSON对象，因此不需要进行格式的转换
  const params = yaml.parse(raw); /* CFW ACCEPTED */

  /* ----------------------- service provider ------------------------ */

  // CFW可以通过辨别订阅链接的方式，来确定当前使用的网络供应商是什么
  const isEasternNetwork = JSON.stringify(url).match(/touhou/gm); /* CFW ACCEPTED */
  const isColaCloud = JSON.stringify(url).match(/subsoft/gm); /* CFW ACCEPTED */

  // CV使用routing-mark字段来确定当前使用的网络供应商是什么
  // 注意，需要在CV设置中的Clash字段内，勾选routing-mark字段后，以下代码才能生效
  // let isEasternNetwork = false; /* CV ACCEPTED */
  // if (params["routing-mark"] === 6666) { /* CV ACCEPTED */
  //   isEasternNetwork = true; /* CV ACCEPTED */
  // } /* CV ACCEPTED */
  // const isColaCloud = !isEasternNetwork; /* CV ACCEPTED */

  /* ------------------------- configuration ------------------------- */

  const disableHttp = true; // 是否启用http方式获取规则列表
  
  // 是否转换并导出stash配置文件
  const disableStashOutput = false; /* CFW ACCEPTED */
  // const disableStashOutput = true; /* CV ACCEPTED */

  /* ------------------------------ dns ------------------------------ */

  /**
   * 用于新增或替换原始订阅中的DNS和TUN配置。
   * 
   * 对于CFW来说，无法确定是CFW软件本身的配置生效，还是订阅文件中的配置生效，因为两者之间互不影响。
   * 由于配置同时存在，以防万一，可以选择让CFW中的TUN配置保存与以下配置一致。
   */
  delete params["dns"];
  params["dns"] = {};
  params.dns.enable = true;
  params.dns.ipv6 = false;
  params.dns["enhanced-mode"] = "fake-ip";
  params.dns["fake-ip-range"] = "192.18.0.1/16";
  params.dns.nameserver = [
    "119.29.29.29",
    "223.5.5.5"
  ];
  params.dns.fallback = [
    "8.8.8.8",
    "1.1.1.1",
    "114.114.114.114"
  ];
  params.dns["fake-ip-filter"] = [
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

  /* ------------------------------ tun ------------------------------ */

  /**
   * 大部分浏览器默认开启“安全DNS”功能，此功能会影响TUN模式劫持DNS请求导致反推域名失败，
   * 请在浏览器设置中关闭此功能以保证TUN模式正常运行。
   */
  delete params["tun"];
  params["tun"] = {
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

  /* ---------------------------- profile ---------------------------- */

  /**
   * 遗留问题：如果使用clash-tracing项目监控CFW流量，则需要在~/.config/clash/config.yaml中配置profile信息。
   * 但目前CFW并无法正确识别该配置，即便将配置写入config.yaml中也无法生效。
   * 
   * 解决方法：可以选择直接在节点配置中添加profile信息，以启用clash-tracing项目监控CFW流量
   */
  delete params["profile"];
  params["profile"] = { "tracing": true };

  /* ---------------------- rules & proxy-groups --------------------- */

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
    "RULE-SET,Customize-Special,特殊控制", // for ChatGPT
    "RULE-SET,Customize-Proxy,科学上网"
  ];

  const remotelist = [
    "RULE-SET,Remote-Applications,DIRECT",
    "RULE-SET,Remote-Apple,DIRECT",
    "RULE-SET,Remote-iCloud,DIRECT",

    "RULE-SET,Remote-Private,DIRECT",
    "RULE-SET,Remote-Direct,DIRECT",
    "RULE-SET,Remote-Greatfire,科学上网",
    "RULE-SET,Remote-GFW,科学上网",
    "RULE-SET,Remote-Proxy,科学上网",
    "RULE-SET,Remote-Tld-not-cn,科学上网",
    "RULE-SET,Remote-Reject,REJECT",

    "RULE-SET,Remote-Telegramcidr,科学上网,no-resolve",
    "RULE-SET,Remote-Lancidr,DIRECT,no-resolve",
    "RULE-SET,Remote-Cncidr,DIRECT,no-resolve",
    "GEOIP,LAN,DIRECT,no-resolve",
    "GEOIP,CN,DIRECT,no-resolve"
  ]

  const matchlist = [
    "MATCH,规则逃逸"
  ]

  let prefix = ""; // 组别前缀
  let outputName = ""; // Stash配置的输出文件名及.stoverride文件的别名

  const proxyGroups = [];
  if (isEasternNetwork) {
    fillProxyGroupOrientalNetwork();
  } else if (isColaCloud) {
    fillProxyGroupColaCloud();
  }
  params["proxy-groups"] = proxyGroups;

  function fillProxyGroupOrientalNetwork() {
    prefix = "🛤️";
    outputName = "ORIENTAL_NETWORK";

    params["rules"] = processlist.concat(customizelist, remotelist, matchlist);

    proxyGroups[0] = getProxyGroup("科学上网", "select", ["DIRECT", "目标节点", "专线节点", "香港普通", "日本普通"]);
    proxyGroups[1] = getProxyGroup("规则逃逸", "select", ["DIRECT", "科学上网"]);
    proxyGroups[2] = getProxyGroup("特殊控制", "select", ["REJECT", "目标节点", "专线节点", "香港普通", "日本普通"]);
    proxyGroups[3] = getProxyGroup("目标节点", "select", ["REJECT"], /.+/gm);

    proxyGroups[4] = getProxyGroup("香港普通", "fallback", [], /香港\s\d\d [A-Z]((?!流媒体).)*$/gm);
    proxyGroups[5] = getProxyGroup("日本普通", "fallback", [], /日本\s\d\d [A-Z]/gm)

    proxyGroups[6] = getProxyGroup("专线节点", "select", [], /专线/gm);
    proxyGroups[6].proxies.sort((a, b) => {
      const sortRules = ["移动/深港", "电信/沪港", "电信/沪日"];
      const target = /.{2}\/.{2}/gm;
      return sortRules.indexOf(a.match(target).pop()) - sortRules.indexOf(b.match(target).pop());
    });
  }

  function fillProxyGroupColaCloud() {
    prefix = "🛣️";
    outputName = "COLA_CLOUD";

    params["rules"] = customizelist.concat(remotelist, matchlist);

    proxyGroups[0] = getProxyGroup("科学上网", "select", ["DIRECT", "目标节点", "其他节点", "香港其一", "香港其二"]);
    proxyGroups[1] = getProxyGroup("规则逃逸", "select", ["DIRECT", "科学上网"]);
    proxyGroups[2] = getProxyGroup("特殊控制", "select", ["REJECT", "目标节点", "其他节点", "香港其一", "香港其二"]);
    proxyGroups[3] = getProxyGroup("目标节点", "select", [], /^((?!套餐).)*$/gm);

    proxyGroups[7] = getProxyGroup("订阅详情", "select", [proxyGroups[3].proxies.shift()]);// 临时方案：去除剩余流量选项
    proxyGroups[3].proxies.unshift("REJECT");

    proxyGroups[4] = getProxyGroup("香港其一", "url-test", [], /香港\s\d\d$/gm);
    proxyGroups[5] = getProxyGroup("香港其二", "url-test", [], /香港\s\d\d\w/gm);

    proxyGroups[6] = getProxyGroup("其他节点", "fallback", [], /(越南|新加坡|台灣|美國|日本)\s\d\d/gm);
    proxyGroups[6].proxies.sort((a, b) => {
      const sortRules = ["[SS]台", "[SS]新", "[SS]越", "[SS]日", "[SS]美"];
      const target = /^.{5}/gm;
      return sortRules.indexOf(a.match(target).pop()) - sortRules.indexOf(b.match(target).pop());
    });
  }

  /**
   * 用于创建节点组。
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
      interval: 600,
      proxies: []
    };

    if (stableGroup.length != 0) {
      proxyGroup.proxies = stableGroup;
    }

    if (regex !== undefined) {
      const transfer = (regex + "").substring(1, (regex + "").length - 3);
      regex = new RegExp("(?:" + transfer + ")");

      params.proxies.forEach(ele => {
        var proxyName = ele.name;
        if (proxyName.match(regex)) {
          proxyGroup.proxies.push(proxyName);
        }
      });
    }
    return proxyGroup;
  }

  /* ------------------------- rule providers ------------------------ */

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
    "Customize-Special": { ...httpDomain },
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
    "Customize-Special": { ...fileDomain },
    "Customize-Direct": { ...fileDomain },
    "Customize-Reject": { ...fileDomain },
    "Customize-Proxy": { ...fileDomain }
  };

  // 远程地址采用jsDelivr转换过的地址
  const httpRemote = "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/";
  const httpCustomize = "https://cdn.jsdelivr.net/gh/dylan127c/proxy-rules@main/clash/customize%20rules/";

  for (const [key, value] of Object.entries(rpRemoteHttp)) {
    rpRemoteHttp[key]["url"] = httpRemote + getFileName(key, "txt");
  }
  for (const [key, value] of Object.entries(rpCustomizeHttp)) {
    rpCustomizeHttp[key]["url"] = httpCustomize + getFileName(key, "yaml");
  }

  const clashFilePosition = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/";
  const fileRemote = clashFilePosition + "remote rules/";
  const fileCustomize = clashFilePosition + "customize rules/";

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
    params["rule-providers"] = Object.assign( // 默认使用本地规则
      JSON.parse(rpRemoteFileRaw), JSON.parse(rpCustomizeFileRaw)
    );
  } else {
    params["rule-providers"] = Object.assign( // 仅有非自定义规则从远程订阅，自定义规则仍旧从本地订阅
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

  /* ---------------------------- prefix ---------------------------- */

  // 由于Rules规则中也存在组名，单纯为组别添加前缀不可行，需要全局替换
  // 获取当前订阅所有组别的名称，将它们存入数组对象中
  const groupNames = [];
  proxyGroups.forEach(proxyGroup => {
    groupNames.push(proxyGroup.name);
  });

  /**
   * 用于遍历当前已存在的组名名称数组，以添加前缀信息。
   * 
   * @param {string} str 订阅信息
   * @param {string} prefix 前缀信息
   * @returns 
   */
  function addPrefix(str, prefix) {
    for (var i = 0; i < groupNames.length; i++) {
      str = str.replaceAll(groupNames[i], prefix + " " + groupNames[i]);
    }
    return str;
  }

  /* ------------------- stash configuration output ------------------ */

  if (!disableStashOutput) {
    outputStashConfig(outputName, prefix);
  }

  /**
   * 用于输出Stash配置文件。
   * 
   * @param {string} outputName 输出文件名及.stoverride文件的别名
   * @param {string} prefix 为组名添加的前缀信息
   */
  function outputStashConfig(outputName, prefix) {
    // 加载Node.js内置的fs、path模块
    // 1.fs模块用于读取文件；2. path模块用于拼接路径
    const fs = require("fs");
    const path = require("path");

    const copyProxyGroups = JSON.parse(JSON.stringify(params["proxy-groups"])); // 深拷贝
    if (outputName === "COLA_CLOUD") {
      copyProxyGroups.pop(); // 临时方案：Cola Cloud 需要移除“订阅详情”分组
    }

    const output = {
      name: outputName,
      desc: "Replace original config.",
      rules: params["rules"],
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
      path.resolve(__dirname, "..", "stash", outputName + ".stoverride"),
      addPrefix(finalOutput, prefix),
      (err) => { throw err; }
    );
  }

  /* ------------------------- return result ------------------------- */

  // CFW要求返回String类型的配置文件数据，非JSON类型
  // 而CV则要求返回JSON类型的数据，使用addPrefix方法后需要转换String类型为JSON类型
  
  return addPrefix(yaml.stringify(params), prefix); /* CFW ACCEPTED */
  // return JSON.parse(addPrefix(JSON.stringify(params), prefix)); /* CV ACCEPTED */
}