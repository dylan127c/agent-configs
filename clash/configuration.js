module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
  const obj = yaml.parse(raw);

  // 引入必要模块
  const fs = require("fs");
  const path = require("path");

  // 读取当前目录下的settings.yaml配置文件
  const settingsFile = fs.readFileSync(path.resolve(__dirname, "settings.yaml"), "utf8");
  const disableHttp = yaml.parse(settingsFile)["disableHttp"]; // 是否启用http方式获取规则列表
  const disableStashOutput = yaml.parse(settingsFile)["disableStashOutput"]; // 是否转换并导出stash配置文件
  const dnsSettings = yaml.parse(settingsFile)["dns"]; // 获取自定义的DNS配置

  // 替换订阅中的DNS配置，但无法确定是订阅中的DNS生效，还是Clash默认TUN Mode内的DNS生效
  // 以防万一，可以将TUN Mode中的DNS配置修改为与自定义DNS配置一致，但不改也能用
  // 使用TUN模式请关闭浏览器中的安全DNS功能，以防止DNS劫持失败
  obj["dns"] = dnsSettings;

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
    rpRemoteHttp[key]["url"] = httpRemote + this.get(key, "txt");
  }
  for (const [key, value] of Object.entries(rpCustomizeHttp)) {
    rpCustomizeHttp[key]["url"] = httpCustomize + this.get(key, "yaml");
  }
  for (const [key, value] of Object.entries(rpRemoteFile)) {
    rpRemoteFile[key]["path"] = path.resolve(fileRemote, this.get(key, "yaml"));
  }
  for (const [key, value] of Object.entries(rpCustomizeFile)) {
    rpCustomizeFile[key]["path"] = path.resolve(fileCustomize, this.get(key, "yaml"));
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

  // Create proxy groups.
  const proxyGroupMainUse = { name: "🛣️ 科学上网", type: "select", proxies: ["DIRECT", "🌟 目标节点", "🌠 稳定节点", "🇭🇰 香港节点"] };
  const proxyGroupAISpecial = { name: "🌤️ 特殊控制", type: "select", proxies: ["REJECT", "🌟 目标节点", "🌠 稳定节点", "🇭🇰 香港节点"] };
  const proxyGroupAllNodes = { name: "🌟 目标节点", type: "select", proxies: ["REJECT"] };
  const proxyGroupElesRequest = { name: "🌊 规则逃逸", type: "select", proxies: ["DIRECT", "🛣️ 科学上网"] };
  const proxyGroupHongKong = {
    name: "🇭🇰 香港节点",
    type: "url-test",
    url: "http://www.gstatic.com/generate_204",
    interval: 600,
    proxies: []
  };
  const proxyGroupStable = {
    name: "🌠 稳定节点",
    type: "select",
    // type: "fallback",
    // url: "http://www.gstatic.com/generate_204",
    // interval: 600,
    proxies: []
  };

  // Determine the current subscription link.
  const isEasternNetwork = JSON.stringify(url).match(/touhou/gm);
  const isColaCloud = JSON.stringify(url).match(/dingyuedizhi/gm);

  // Special group for Eastern Network.
  let proxyGroupJapan;
  if (isEasternNetwork) {

    proxyGroupJapan = {
      name: "🇯🇵 日本节点",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 600,
      proxies: []
    };
    proxyGroupMainUse.proxies.push("🇯🇵 日本节点");
    proxyGroupAISpecial.proxies.push("🇯🇵 日本节点");
  }

  // Special group for Cola Cloud.
  let proxyGroupHongKongOverseas;
  let proxyGroupExceptHK;
  if (isColaCloud) {
    proxyGroupExceptHK = {
      name: "🇺🇳 其他节点",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 600,
      proxies: []
    }
    proxyGroupMainUse.proxies.push("🇺🇳 其他节点");
    proxyGroupAISpecial.proxies.push("🇺🇳 其他节点");

    proxyGroupHongKongOverseas = {
      name: "🇭🇰 香港海外",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 600,
      proxies: []
    }
    proxyGroupMainUse.proxies.push("🇭🇰 香港海外");
    proxyGroupAISpecial.proxies.push("🇭🇰 香港海外");

    // 本节点允许BT下载
    obj["rules"].shift();
    obj["rules"].unshift("PROCESS-NAME,BitComet.exe,🛣️ 科学上网");
  }

  // For sorting proxy, it will be used by proxyGroupStable group.
  const HKChinaTelecom = [];
  const HKChinaMobile = [];
  const JapanChinaTelecom = [];

  const Singapore = [];
  const Taiwan = [];
  const Vietnam = [];

  // Add proxy to proxy groups.
  obj.proxies.forEach(ele => {
    let proxyName = ele.name;
    // 本条正则用于过滤没用的节点，根据节点特性来选择是否需要判断
    if (proxyName.match(/^((?!套餐).)*$/gm)) {
      proxyGroupAllNodes.proxies.push(proxyName);
    }

    if (isColaCloud) {
      if (proxyName.match(/^越南\s\d\d/gm)) {
        Vietnam.push(proxyName);
      } else if (proxyName.match(/^台灣\s\d\d/gm)) {
        Taiwan.push(proxyName);
      } else if (proxyName.match(/^獅城\s\d\d/gm)) {
        Singapore.push(proxyName);
      }
    }

    if (proxyName.match(/香港\s\d\d/gm) && proxyName.match(/^((?!流媒体).)*$/gm)) {
      proxyGroupHongKong.proxies.push(proxyName);

      // Special group for Cola Cloud.
      // if (isColaCloud) {
      //   proxyGroupStable.proxies.push(proxyName);
      // }
    } else if (isColaCloud && proxyName.match(/^((?!(海外用節點|套餐)).)*$/gm)) {
      proxyGroupExceptHK.proxies.push(proxyName);
    }

    // Special group for Eastern Network.
    if (proxyName.match(/香港\d\d\s海外用節點/gm)) {
      proxyGroupHongKongOverseas.proxies.push(proxyName);
    }

    // Special sort for Eastern Network.
    if (isEasternNetwork) {
      if (proxyName.match(/日本\s\d\d/gm)) {
        proxyGroupJapan.proxies.push(proxyName)

        if (proxyName.match(/电信\/沪日专线/gm)) {
          JapanChinaTelecom.push(proxyName);
        }
      }
      if (proxyName.match(/电信\/深港专线/gm)) {
        HKChinaTelecom.push(proxyName);
      } else if (proxyName.match(/移动\/深港专线/gm)) {
        HKChinaMobile.push(proxyName);
      }
    }
  });

  // For eastern network, should sequentially add proxy into proxyGroupStable group.
  if (isEasternNetwork) {
    proxyGroupStable.proxies = HKChinaMobile.concat(HKChinaTelecom, JapanChinaTelecom);
  }

  if (isColaCloud) {
    proxyGroupStable.proxies = Taiwan.concat(Singapore, Vietnam);
  }

  // Add proxy group into obj.
  obj["proxy-groups"] = []; // This will help erase original proxy groups.
  obj["proxy-groups"].push(proxyGroupMainUse);
  obj["proxy-groups"].push(proxyGroupElesRequest);
  obj["proxy-groups"].push(proxyGroupAISpecial);
  obj["proxy-groups"].push(proxyGroupAllNodes);
  obj["proxy-groups"].push(proxyGroupHongKong);
  if (isEasternNetwork) {
    obj["proxy-groups"].push(proxyGroupJapan);
  } else if (isColaCloud) {
    obj["proxy-groups"].push(proxyGroupExceptHK);
    obj["proxy-groups"].push(proxyGroupHongKongOverseas);
  }
  obj["proxy-groups"].push(proxyGroupStable);

  // Final return config.
  let finalReturn = yaml.stringify(obj);

  // 选择是否将当前Clash的配置转换为Stash的配置
  // 通过settings.yaml中的disableStashOutput参数控制
  if (!disableStashOutput) {
    let fileName = "Undefined";
    const output = {
      name: "",
      desc: "Replace original config.",
      "proxy-groups": obj["proxy-groups"],
      rules: obj.rules,
      "rule-providers": Object.assign(
        JSON.parse(rpRemoteHttpRaw), JSON.parse(rpCustomizeHttpRaw)
      )
    };

    if (isEasternNetwork) {
      output["name"] = "Eastern Network";
      fileName = "eastern";
    } else if (isColaCloud) {
      output["name"] = "Cola Cloud";
      fileName = "cola";
    }

    const str = yaml.stringify(output);
    let finalOutput = str.replace("rules:", "rules: #!replace")
      .replace("proxy-groups:", "proxy-groups: #!replace")
      .replace("rule-providers:", "rule-providers: #!replace");

    // 为组别添加symbol以避免不同订阅下的组别重名
    if (isEasternNetwork) {
      finalOutput = specialized(finalOutput, "A");
    } else if (isColaCloud) {
      finalOutput = specialized(finalOutput, "B");
    }

    fs.writeFile(
      path.resolve(__dirname, "..", "stash", fileName + ".stoverride"),
      finalOutput,
      (err) => { throw err; }
    );
  }

  // 为组别添加symbol以避免不同订阅下的组别重名
  if (isEasternNetwork) {
    finalReturn = specialized(finalReturn, "A");
  } else if (isColaCloud) {
    finalReturn = specialized(finalReturn, "B");
  }
  return finalReturn;
}

// 本方法中的match()返回仅包含一个字符串的数组对象
// 用pop()是为了将字符串提取出来以使用replace()方法
module.exports.get = function getFileName(key, type) {
  return key.match(/-[-\w]+/gm).pop().replace(/^-/gm, "").toLowerCase() + "." + type;
}

// 不同订阅的分组建议不要同名，本方法用于为分组添加不同的symbol以避免重名
function specialized(str, symbol) {
  const groupNames = ["科学上网", "规则逃逸", "特殊控制", "目标节点", "香港节点", "日本节点", "稳定节点", "香港海外", "其他节点"];
  for (var i = 0; i < groupNames.length; i++) {
    str = str.replaceAll(groupNames[i], groupNames[i] + " " + symbol);
  }
  return str;
}