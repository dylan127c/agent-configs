const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
  return FILE_NAME + "." + name + " =>";
}

function homepath() {
  return process.env.homepath.replace(/^\\/gm, "c:\\");
}

const providers = path.join(homepath(), ".run/profile.js");
try {
  delete require.cache[require.resolve(providers)];
} catch (error) {
  console.log("%HOMEPATH%/.RUN/profile.js WAS NOT FOUND.");
}

const {
  PROXY_PROVIDER_PATH,
  PROXY_PROVIDER_TYPE,
  PROXY_PROVIDERS_MAP,
  ALL_PROFILES_OUTPUT,
  PROVIDER_GROUPS,
  GROUPS,
  RULES,
} = require(providers);

delete require.cache[require.resolve("./params.js")];
const {
  IPCIDR,
  CLASSICAL,
  DOMAIN,
  TYPE_MAP,
  RULE_PROVIDER_PATH,
  RULE_PROVIDER_TYPE,
  FLAG,
  LOAD_BALANCE,
  LOAD_BALANCE_PARAMS,
  URL_TEST,
  URL_TEST_PARAMS,
  FALLBACK,
  FALLBACK_PARAMS,
  HEALTH_CHECK,
  BASIC_BUILT,
} = require("./params.js");

function generate(log, yaml) {
  const funcName = "generate";

  params = BASIC_BUILT();
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

module.exports = { generate };