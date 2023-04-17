module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
  const obj = yaml.parse(raw);

  const fs = require("fs");
  const path = require("path");

  // 读取当前目录下的settings.yaml配置文件
  const rawSettings = fs.readFileSync(path.resolve(__dirname, "settings.yaml"), "utf8");
  const objSettings = yaml.parse(rawSettings);

  const disableHttp = objSettings["disableHttp"]; // 是否启用http方式获取规则列表
  const disableStashOutput = objSettings["disableStashOutput"]; // 是否转换并导出stash配置文件

  // 替换订阅中的DNS配置，但无法确定是订阅中的DNS生效，还是Clash默认TUN Mode内的DNS生效
  // 以防万一，可以将TUN Mode中的DNS配置修改为与自定义DNS配置一致，但不改也能用
  // 使用TUN模式请关闭浏览器中的安全DNS功能，以防止DNS劫持失败
  obj["dns"] = objSettings["dns"];

  /* ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 允许修改或添加配置 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ */

  // Determine the current subscription link.
  const isEasternNetwork = JSON.stringify(url).match(/touhou/gm);
  const isColaCloud = JSON.stringify(url).match(/dingyuedizhi/gm);
  
  let suffix = ""; // 组别后缀
  let outputName = ";" // Stash配置的输出文件名及.stoverride文件的别名

  const proxyGroups = [];
  if (isEasternNetwork) {
    suffix = "A";
    outputName = "ORIENTAL_NETWORK";
    
    proxyGroups[0] = getProxyGroup("🛣️ 科学上网", "select", ["DIRECT", "🌟 目标节点", "🌠 故障切换", "🇭🇰 香港节点", "🇯🇵 日本节点"]);
    proxyGroups[1] = getProxyGroup("🌊 规则逃逸", "select", ["DIRECT", "🛣️ 科学上网"]);
    proxyGroups[2] = getProxyGroup("🌤️ 特殊控制", "select", ["REJECT", "🌟 目标节点", "🌠 故障切换", "🇭🇰 香港节点", "🇯🇵 日本节点"]);
    proxyGroups[3] = getProxyGroup("🌟 目标节点", "select", ["REJECT"], /.+/gm);

    proxyGroups[4] = getProxyGroup("🇭🇰 香港节点", "url-test", [], /香港\s\d\d ((?!流媒体).)*$/gm);
    proxyGroups[5] = getProxyGroup("🇯🇵 日本节点", "url-test", [], /日本\s\d\d/gm)

    proxyGroups[6] = getProxyGroup("🌠 故障切换", "fallback", [], /专线/gm);
    proxyGroups[6].proxies.sort((a, b) => {
      const sortRules = ["移动/深港", "电信/深港", "电信/沪日"];
      const target = /.{2}\/.{2}/gm;
      return sortRules.indexOf(a.match(target).pop()) - sortRules.indexOf(b.match(target).pop());
    });
  } else if (isColaCloud) {
    suffix = "B";
    outputName = "COLA_CLOUD";

    proxyGroups[0] = getProxyGroup("🛣️ 科学上网", "select", ["DIRECT", "🌟 目标节点", "🌠 故障切换", "🇭🇰 香港节点", "🇭🇰 香港海外"]);
    proxyGroups[1] = getProxyGroup("🌊 规则逃逸", "select", ["DIRECT", "🛣️ 科学上网"]);
    proxyGroups[2] = getProxyGroup("🌤️ 特殊控制", "select", ["REJECT", "🌟 目标节点", "🌠 故障切换", "🇭🇰 香港节点", "🇭🇰 香港海外"]);
    proxyGroups[3] = getProxyGroup("🌟 目标节点", "select", ["REJECT"], /^((?!套餐).)*$/gm);

    proxyGroups[4] = getProxyGroup("🇭🇰 香港节点", "url-test", [], /香港\s\d\d/gm);
    proxyGroups[5] = getProxyGroup("🇭🇰 香港海外", "url-test", [], /香港\d\d\s海外用節點/gm);

    proxyGroups[6] = getProxyGroup("🌠 故障切换", "fallback", [], /(越南|獅城|台灣)\s\d\d/gm);
    proxyGroups[6].proxies.sort((a, b) => {
      const sortRules = ["台灣", "獅城", "越南"];
      const target = /^.{2}/gm;
      return sortRules.indexOf(a.match(target).pop()) - sortRules.indexOf(b.match(target).pop());
    });
  }
  obj["proxy-groups"] = proxyGroups;

  // User-defined rules will replace original rules.
  obj["rules"] = [
    "PROCESS-NAME,BitComet.exe,DIRECT",
    "PROCESS-NAME,aria2c.exe,DIRECT",
    "PROCESS-NAME,Motrix.exe,DIRECT",
    "RULE-SET,Customize-Reject,REJECT", // personal rules
    "RULE-SET,Customize-Special,🌤️ 特殊控制", // personal rules (Special for ChatGPT)
    "RULE-SET,Customize-Direct,DIRECT", // personal rules
    "RULE-SET,Customize-Proxy,🛣️ 科学上网", // personal rules
    "RULE-SET,Remote-Applications,DIRECT",
    "RULE-SET,Remote-Apple,DIRECT",
    "RULE-SET,Remote-iCloud,DIRECT",
    "RULE-SET,Remote-Reject,REJECT", // ad filter
    "RULE-SET,Remote-Proxy,🛣️ 科学上网",
    "RULE-SET,Remote-GFW,🛣️ 科学上网",
    "RULE-SET,Remote-Direct,DIRECT",
    "RULE-SET,Remote-Private,DIRECT",
    "RULE-SET,Remote-Greatfire,🛣️ 科学上网",
    "RULE-SET,Remote-Tld-not-cn,🛣️ 科学上网",

    // If DOMAIN not match and meet IP RULES, no-resolve option will protect DNS from leakage.
    // But no-resolve mean IP RULES will not apply to DOMAIN, it means only IP access use IP RULES.
    "RULE-SET,Remote-Telegramcidr,🛣️ 科学上网,no-resolve",
    "RULE-SET,Remote-Cncidr,DIRECT,no-resolve",
    "RULE-SET,Remote-Lancidr,DIRECT,no-resolve",

    // GEOIP RULES.
    "GEOIP,LAN,DIRECT,no-resolve",
    "GEOIP,CN,DIRECT,no-resolve",

    // By default blacklist mode is used. So at last, no matching DOMAIN will match the MATCH RULES.
    // If DOMAIN was not inculded in DOMAIN RULES, please check log and add relevant domain into customize file.
    // Customize rules are saved in (/customize rules) directory.
    "MATCH,🌊 规则逃逸"
  ];

  /* ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ 允许修改或添加配置 ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ */
  
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

      obj.proxies.forEach(ele => {
        var proxyName = ele.name;
        if (proxyName.match(regex)) {
          proxyGroup.proxies.push(proxyName);
        }
      });
    }
    return proxyGroup;
  }

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

  // 远程自定义的规则文件 => https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash/customize%20rules/
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

  // Setup url or path for rule providers.
  const httpRemote = "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/";
  const httpCustomize = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/clash/customize%20rules/";
  const fileRemote = path.resolve(__dirname, "remote rules");
  const fileCustomize = path.resolve(__dirname, "customize rules");

  for (const [key, value] of Object.entries(rpRemoteHttp)) {
    rpRemoteHttp[key]["url"] = httpRemote + getFileName(key, "txt");
  }
  for (const [key, value] of Object.entries(rpCustomizeHttp)) {
    rpCustomizeHttp[key]["url"] = httpCustomize + getFileName(key, "yaml");
  }
  for (const [key, value] of Object.entries(rpRemoteFile)) {
    rpRemoteFile[key]["path"] = path.resolve(fileRemote, getFileName(key, "yaml"));
  }
  for (const [key, value] of Object.entries(rpCustomizeFile)) {
    rpCustomizeFile[key]["path"] = path.resolve(fileCustomize, getFileName(key, "yaml"));
  }

  // 深拷贝要使用JSON.stringify()和JSON.parse()方法
  const rpRemoteHttpRaw = JSON.stringify(rpRemoteHttp);
  const rpRemoteFileRaw = JSON.stringify(rpRemoteFile);
  const rpCustomizeHttpRaw = JSON.stringify(rpCustomizeHttp);
  const rpCustomizeFileRaw = JSON.stringify(rpCustomizeFile);

  // 根据配置文件选择使用远程的Rule Providers，还是本地的Rule Providers
  // 但该配置仅针对非自定义的规则，自定义规则只推荐使用本地的Rule Providers
  if (disableHttp) {
    obj["rule-providers"] = Object.assign(
      JSON.parse(rpRemoteFileRaw), JSON.parse(rpCustomizeFileRaw)
    );
  } else {
    obj["rule-providers"] = Object.assign(
      JSON.parse(rpRemoteHttpRaw), JSON.parse(rpCustomizeFileRaw)
    );
  }

  // 由于Rules规则中也存在组名，单纯为组别添加后缀不可行，需要全局替换
  const groupNames = [];
  proxyGroups.forEach(proxyGroup => {
    groupNames.push(proxyGroup.name);
  })
  /**
   * 用于遍历当前已存在的所有组名数组，以添加组别的后缀信息
   * 
   * @param {string} str 订阅配置的string类型原文
   * @param {string} suffix 后缀信息
   * @returns 
   */
  function addSuffix(str, suffix) {
    for (var i = 0; i < groupNames.length; i++) {
      str = str.replaceAll(groupNames[i], groupNames[i] + " " + suffix);
    }
    return str;
  }

  /**
   * 用于输出Stash配置文件。
   * 
   * @param {string} outputName 输出文件名及.stoverride文件的别名
   * @param {string} suffix 为组名添加的后缀信息
   */
  function outputStashConfig(outputName, suffix) {
    const output = {
      name: outputName,
      desc: "Replace original config.",
      "proxy-groups": obj["proxy-groups"],
      rules: obj.rules,
      "rule-providers": Object.assign(
        JSON.parse(rpRemoteHttpRaw), JSON.parse(rpCustomizeHttpRaw)
      )
    };
    const str = yaml.stringify(output);
    let finalOutput = str.replace("rules:", "rules: #!replace")
      .replace("proxy-groups:", "proxy-groups: #!replace")
      .replace("rule-providers:", "rule-providers: #!replace");

    fs.writeFile(
      path.resolve(__dirname, "..", "stash", outputName + ".stoverride"),
      addSuffix(finalOutput, suffix),
      (err) => { throw err; }
    );
  }

  if (!disableStashOutput) {
      outputStashConfig(outputName, suffix);
  }
  return addSuffix(yaml.stringify(obj), suffix);
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