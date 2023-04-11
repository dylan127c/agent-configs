/*
  配置文件不是什么需要经常改动的文件，所有必要的配置信息推荐尽量置于代码之中。

  将不常改动的配置，提取到单独的配置文件中，实际上是得不偿失的；
  仅推荐将需要经常改动的配置提取到文件中，如：本地的域名访问权限等配置。
*/

module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
  const obj = yaml.parse(raw);

  // Construct rule provider's format.
  const httpClassical = { type: "http", behavior: "classical", url: "", path: "", interval: 86400 };
  const httpDomain = { type: "http", behavior: "domain", url: "", path: "", interval: 86400 };
  const httpIpcidr = { type: "http", behavior: "ipcidr", url: "", path: "", interval: 86400 };
  const fileDomain = { type: "file", behavior: "domain", path: "" };

  // Remote rule provider. => https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/
  const ruleProviders = {
    "Remote-Reject": { ...httpDomain }, // shallow copy, those object are only including String and Number
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
  }
  // Personal rule provider will separate into remote access and local access.
  // Remote access. => https://raw.githubusercontent.com/dylan127c/proxy-rules/main/customize%20rules/
  const ruleProvidersWithPersonalHttp = {
    "Customize-Special": { ...httpDomain },
    "Customize-Direct": { ...httpDomain },
    "Customize-Reject": { ...httpDomain },
    "Customize-Proxy": { ...httpDomain }
  };
  // Local access. => path.resolve(__dirname, "..\\) + "\\customize rules\\"
  const ruleProvidersWithPersonalFile = {
    "Customize-Special": { ...fileDomain },
    "Customize-Direct": { ...fileDomain },
    "Customize-Reject": { ...fileDomain },
    "Customize-Proxy": { ...fileDomain }
  };

  const path = require("path");

  // Setup url or path for rule providers.
  const remote = "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/";
  const remotePersonal = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/customize%20rules/";
  const localPersonal = path.resolve(__dirname, "..\\") + "\\customize rules\\";

  for (const [key, value] of Object.entries(ruleProviders)) {
    ruleProviders[key]["url"] = remote + this.get(key, "txt");
    ruleProviders[key]["path"] = path.resolve(__dirname) + "\\rules\\" + this.get(key, "yaml"); // ! confuse, why first time setup require this prop?
  }
  for (const [key, value] of Object.entries(ruleProvidersWithPersonalHttp)) {
    ruleProvidersWithPersonalHttp[key]["url"] = remotePersonal + this.get(key, "yaml");
    ruleProvidersWithPersonalHttp[key]["path"] = localPersonal + this.get(key, "yaml");
  }
  for (const [key, value] of Object.entries(ruleProvidersWithPersonalFile)) {
    ruleProvidersWithPersonalFile[key]["path"] = localPersonal + this.get(key, "yaml");
  }

  // Create rule providers' deep copy by useing JSON.stringify() and JSON.parse().
  const rawRuleProviders = JSON.stringify(ruleProviders);
  const rawRuleProvidersWithPersonalHttp = JSON.stringify(ruleProvidersWithPersonalHttp);
  const rawRuleProvidersWithPersonalFile = JSON.stringify(ruleProvidersWithPersonalFile);

  // User-defined rule providers will replace the original rule providers.
  obj["rule-providers"] = Object.assign(
    // By default, remote rule providers and personal local access rule providers will be chosen.
    // DEEP COPY!!!
    JSON.parse(rawRuleProviders), JSON.parse(rawRuleProvidersWithPersonalFile)
  );

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
  const proxyGroupMainUse = { name: "🛣️ 科学上网", type: "select", proxies: ["DIRECT", "🌟 目标节点", "🌠 故障切换", "🇭🇰 香港节点"] };
  const proxyGroupAISpecial = { name: "🌤️ 特殊控制", type: "select", proxies: ["REJECT", "🌟 目标节点", "🌠 故障切换", "🇭🇰 香港节点"] };
  const proxyGroupAllNodes = { name: "🌟 目标节点", type: "select", proxies: ["REJECT"] };
  const proxyGroupElesRequest = { name: "🌊 规则逃逸", type: "select", proxies: ["DIRECT", "🛣️ 科学上网"] };
  const proxyGroupHongKong = {
    name: "🇭🇰 香港节点",
    type: "url-test",
    url: "http://www.gstatic.com/generate_204",
    interval: 600,
    lazy: true,
    proxies: []
  };
  const proxyGroupOrderSwitching = {
    name: "🌠 故障切换",
    type: "fallback",
    url: "http://www.gstatic.com/generate_204",
    interval: 600,
    lazy: true,
    proxies: []
  };

  // Determine the current subscription link.
  const isEasternNetwork = JSON.stringify(url).match(/touhou/gm);
  const isColaCloud = JSON.stringify(url).match(/dingyuedizhi/gm);

  // Setup for special subscription.
  let proxyGroupJapan;
  if (isEasternNetwork) {

    proxyGroupJapan = {
      name: "🇯🇵 日本节点",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 600,
      lazy: true,
      proxies: []
    };
    proxyGroupMainUse.proxies.push("🇯🇵 日本节点");
    proxyGroupAISpecial.proxies.push("🇯🇵 日本节点");
  }

  // Special group for Cola Cloud.
  let proxyGroupHongKongOverseas;
  let proxyGroupLoadBalance;
  if (isColaCloud) {
    proxyGroupHongKongOverseas = {
      name: "🇭🇰 海外节点",
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 600,
      lazy: true,
      proxies: []
    }
    proxyGroupMainUse.proxies.push("🇭🇰 海外节点");
    proxyGroupAISpecial.proxies.push("🇭🇰 海外节点");

    obj["rules"].shift();
    obj["rules"].unshift("PROCESS-NAME,BitComet.exe,🛣️ 科学上网");
  }

  // For sorting proxy, it will be used by proxyGroupOrderSwitching group.
  const HKChinaTelecom = [];
  const HKChinaMobile = [];
  const JapanChinaTelecom = [];

  // Add proxy to proxy groups.
  obj.proxies.forEach(ele => {
    let proxyName = ele.name;

    // Filter out Cola Cloud's useless node.
    if (proxyName.match(/^((?!套餐).)*$/gm)) {
      proxyGroupAllNodes.proxies.push(proxyName);
    }

    if (proxyName.match(/香港\s\d\d/gm) && proxyName.match(/^((?!流媒体).)*$/gm)) {
      proxyGroupHongKong.proxies.push(proxyName);

      // Special group for Cola Cloud.
      if (isColaCloud) {
        proxyGroupOrderSwitching.proxies.push(proxyName);
      }
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

  // For eastern network, should sequentially add proxy into proxyGroupOrderSwitching group.
  if (isEasternNetwork) {
    proxyGroupOrderSwitching.proxies = HKChinaMobile.concat(HKChinaTelecom, JapanChinaTelecom);
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
    obj["proxy-groups"].push(proxyGroupHongKongOverseas);
  }
  obj["proxy-groups"].push(proxyGroupOrderSwitching);

  // Output file for Stash App.
  const fs = require("fs");
  let fileName = "Undefined";
  const output = {
    name: "",
    desc: "Replace original config.",
    "proxy-groups": obj["proxy-groups"],
    rules: obj.rules,
    "rule-providers": Object.assign(
      JSON.parse(rawRuleProviders), JSON.parse(rawRuleProvidersWithPersonalHttp)
    )
  };

  // Setup output["name"] and fileName.
  if (isEasternNetwork) {
    output["name"] = "Eastern Network";
    fileName = "eastern";
  } else if (isColaCloud) {
    output["name"] = "Cola Cloud";
    fileName = "cola";
  }

  // Convert to raw and replace some case in necessarily.
  const str = yaml.stringify(output);
  var finalOutput = str.replace("rules:", "rules: #!replace")
    .replace("proxy-groups:", "proxy-groups: #!replace")
    .replace("rule-providers:", "rule-providers: #!replace");

  // Final return config.
  var finalReturn = yaml.stringify(obj);

  // Specialized groups.
  if (isEasternNetwork) {
    finalOutput = specializedEastern(finalOutput);
    finalReturn = specializedEastern(finalReturn);
  } else if (isColaCloud) {
    finalOutput = specializedCola(finalOutput);
    finalReturn = specializedCola(finalReturn);
  }

  // Output file.
  fs.writeFile(path.resolve(__dirname, "..\\") + "\\stash\\" + fileName + ".stoverride", removePath(finalOutput), (err) => { });

  // Output configuration.
  return finalReturn;
}

module.exports.get = function getFileName(key, type) {
  // Notice that obj.match() will return type Array, and array.pop() will return type String.
  return key.match(/(-\w+)+/gm).pop().replace(/^-/gm, "").toLowerCase() + "." + type;
}

// Groups with same group name may cause problem when switch proxy node.
// Below two methods are using for specializing proxy node's group.
function specializedEastern(str) {
  const groupNames = ["科学上网", "规则逃逸", "特殊控制", "目标节点", "香港节点", "日本节点", "故障切换"];
  for (var i = 0; i < groupNames.length; i++) {
    str = str.replaceAll(groupNames[i], groupNames[i] + " A");
  }
  return str;
}

function specializedCola(str) {
  const groupNames = ["科学上网", "规则逃逸", "特殊控制", "目标节点", "香港节点", "海外节点", "故障切换"];
  for (var i = 0; i < groupNames.length; i++) {
    str = str.replaceAll(groupNames[i], groupNames[i] + " B");
  }
  return str;
}

function removePath(str) {
  return str.replaceAll(/\s{4}path:\s*.+\.yaml\n/gm,"");
}