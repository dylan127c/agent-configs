const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
  return FILE_NAME + "." + name + " =>";
}

function homepath() {
  return process.env.homepath.replace(/^\\/gm, "c:\\");
}

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
  OVERRIDE,
  PROFILE_PATH,
  BASIC_BUILT,
} = require("./params.js");

const profile = PROFILE_PATH === "" ?
  path.join(homepath(), ".run/profile.js") :
  PROFILE_PATH;

try {
  delete require.cache[require.resolve(profile)];
} catch (error) {
  console.log("User-defined profile.js OR %HOMEPATH%/.RUN/profile.js WAS NOT FOUND.");
}

const {
  PROXY_ABSOLUTE_PATH,
  PROXY_PROVIDER_PATH,
  PROXY_PROVIDER_TYPE,
  PROXY_PROVIDERS_MAP,
  ALL_PROFILES_OUTPUT,
  PROVIDER_GROUPS,
  GROUPS,
  RULES,
  SUB_RULES,
  FULLLIST,
} = require(profile);

function generate(log, yaml) {
  const funcName = "generate";

  params = BASIC_BUILT();
  params["proxy-providers"] = getProxyProvider();
  params["rules"] = RULES;
  params["sub-rules"] = SUB_RULES;
  params["rule-providers"] = getRuleProvider(params, RULES);
  params["rule-providers"] = getRuleProvider(params, SUB_RULES[FULLLIST]);
  params["proxy-groups"] = getProxyGroups();

  const output = yaml.stringify(params);

  fs.writeFileSync(
    PROXY_ABSOLUTE_PATH ?
      path.join(
        PROXY_PROVIDER_PATH,
        ALL_PROFILES_OUTPUT.replace(/$/gm, "." + RULE_PROVIDER_TYPE)
      ) :
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
      if (!group.hasOwnProperty("icon")) {
        for (const [search, flag] of Object.entries(FLAG)) {
          if (group.name.includes(search) || search === "UN") {
            group.name = flag + " " + provider + "-" + group.name;
            break;
          }
        }
      } else {
        group.name = provider + "-" + group.name;
      }
      providerGroupsName.push(group.name);
    });
  }

  const groupsArr = [];
  GROUPS.forEach(preset => {
    const group = {};
    group.name = preset.name;
    group.type = preset.type;

    if (preset.hasOwnProperty("proxies")) {
      group.proxies = preset.proxies;
    } else {
      group.proxies = [];
    }

    if (preset.hasOwnProperty("interval")) {
      group.interval = preset.interval;
    }
    if (preset.hasOwnProperty("lazy")) {
      group.lazy = preset.lazy;
    }
    if (preset.hasOwnProperty("icon")) {
      group.icon = preset.icon;
    }

    if (!preset.hasOwnProperty("append") || !preset.append) {
      if (isEmptyArray(group.proxies)) {
        group.proxies = [].concat(providerGroupsName);
      }
      groupsArr.push(addTypeParams(group));
      return;
    }

    if (!preset.hasOwnProperty("autofilter") && !preset.hasOwnProperty("provider")) {
      if (isEmptyArray(group.proxies)) {
        group.proxies = [].concat(providerGroupsName);
      }
      groupsArr.push(addTypeParams(group));
      return;
    }

    if (preset.hasOwnProperty("autofilter")) {
      group.proxies = group.proxies.concat(providerGroupsName.filter(name => new RegExp(preset.autofilter, "i").test(name)));
    }

    if (preset.hasOwnProperty("provider")) {
      group.use = preset.provider;
      if (preset.hasOwnProperty("filter")) {
        group.filter = preset.filter;
      }
    }
    groupsArr.push(addTypeParams(group));
  });

  for (const [provider, details] of Object.entries(PROVIDER_GROUPS)) {
    details.forEach(detail => {
      const group = {};
      group.name = detail.name;
      group.type = detail.type;
      group.proxies = ["REJECT"];
      group.filter = detail.filter
      group.use = [provider];

      if (detail.hasOwnProperty("interval")) {
        group.interval = detail.interval;
      }
      if (detail.hasOwnProperty("lazy")) {
        group.lazy = detail.lazy;
      }
      if (detail.hasOwnProperty("icon")) {
        group.icon = detail.icon;
      }
      groupsArr.push(addTypeParams(group));
    })
  }
  return groupsArr;

  function addTypeParams(group) {

    const paramsMap = {
      [LOAD_BALANCE]: LOAD_BALANCE_PARAMS,
      [URL_TEST]: URL_TEST_PARAMS,
      [FALLBACK]: FALLBACK_PARAMS
    };

    const defaultParams = paramsMap[group.type] || {};
    if (Object.keys(defaultParams).length === 0) {
      return group;
    }

    return Object.assign({}, group, defaultParams,
      group.hasOwnProperty("interval") ? { interval: group.interval } : {},
      group.hasOwnProperty("lazy") ? { lazy: group.lazy } : {},
    );
  }

  function isEmptyArray(arr) {
    return Array.isArray(arr) && arr.length === 0;
  }
}

function getRuleProvider(params, rules) {
  const provider = params["rule-providers"] || {};
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
    provider[providerName].path = (PROXY_ABSOLUTE_PATH ?
      PROXY_PROVIDER_PATH :
      path.join(homepath(), PROXY_PROVIDER_PATH))
      + fileName + "." + PROXY_PROVIDER_TYPE;
    provider[providerName] = Object.assign(provider[providerName], HEALTH_CHECK, OVERRIDE);
  }
  return provider;
}

module.exports = { generate };