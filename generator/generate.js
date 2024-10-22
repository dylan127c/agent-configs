const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

// function homepath() {
//     return process.env.homepath.replace(/^\\/gm, "c:\\");
// }

delete require.cache[require.resolve("./params.js")];
const {
    IPCIDR,
    CLASSICAL,
    DOMAIN,
    TYPE_MAP,
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
    COLLECT_APPEND,
    COLLECT_SYMBOL,
    COLLECT_TYPE,
    COLLECT_PROXIES,
    COLLECT_ICON,
    COLLECT_FILTER,
    PROXY_PROVIDER_REG,
    SUBS_COLLECT_REGEX,
    PROXY_GROUPS_REGEX,
    BASIC_BUILT,
} = require("./params.js");

delete require.cache[require.resolve(PROFILE_PATH)];
const {
    OVERRIDE_MAPPING,
    RULES_PROVIDER_TYPE,
    GROUPS,
    RULES,
    SUB_RULES,
    READ_PROVIDER,
} = require(PROFILE_PATH);

function generate(log, yaml) {
    const funcName = "generate";

    const {
        COMPREHENSIVE_CONFIG_PATH,
        COMPREHENSIVE_CONFIG_NAME,
        COMPREHENSIVE_CONFIG_TYPE,
        PROXY_PROVIDERS_MAP
    } = READ_PROVIDER(fs, yaml);

    params = BASIC_BUILT();
    params["proxy-providers"] = getProxyProvider(PROXY_PROVIDERS_MAP);
    params["rules"] = RULES;
    params["sub-rules"] = SUB_RULES;
    params["rule-providers"] = getRuleProvider(params, yaml, OVERRIDE_MAPPING); // *.带 params 参数允许反复调用 getRuleProvider 函数
    params["proxy-groups"] = getProxyGroups(PROXY_PROVIDERS_MAP);

    const output = yaml.stringify(params);
    fs.writeFileSync(
        path.join(
            COMPREHENSIVE_CONFIG_PATH,
            COMPREHENSIVE_CONFIG_NAME.replace(/$/gm, "." + COMPREHENSIVE_CONFIG_TYPE)
        ),
        output, "utf-8");
    log.info(mark(funcName), "done.");
}

function getProxyGroups(map) {
    const providerCollection = []; // *.如果 COLLECT_APPEND 为 false 则此数组为空
    const providerGroupsName = [];
    const providerGroups = [];

    for (const [key, value] of Object.entries(map)) {
        if (value.hasOwnProperty("override")) { // *.以防万一可以检查一下是否存在 override 字段
            const script = value.override;
            delete require.cache[require.resolve(script)];
            const { GROUP } = require(script);

            if (GROUP) { // *.如果存在 GROUP 则进行下一步，它可能为 undefined 值
                if (COLLECT_APPEND) {
                    const collect = {};

                    const collectName = formatName(SUBS_COLLECT_REGEX, key);
                    if (collectName === key) {
                        collect.name = collectName + COLLECT_SYMBOL;
                    } else {
                        collect.name = collectName;
                    }

                    collect.type = COLLECT_TYPE;
                    collect.proxies = COLLECT_PROXIES;
                    collect.use = [formatName(PROXY_PROVIDER_REG, key)];
                    collect.icon = COLLECT_ICON;
                    collect.filter = COLLECT_FILTER;
                    providerCollection.push(collect);
                }

                let groupName = formatName(PROXY_GROUPS_REGEX, key);
                if (groupName !== key) {
                    groupName = groupName.replace("|", "[").replace(/$/gm, "]");
                }
                GROUP.forEach(group => {
                    if (!group.hasOwnProperty("icon")) {
                        for (const [search, flag] of Object.entries(FLAG)) {
                            if (group.name.includes(search) || search === "UN") {
                                group.name = flag + " " + groupName + " => " + group.name;
                                break;
                            }
                        }
                    } else {
                        group.name = groupName + " => " + group.name;
                    }
                    providerGroupsName.push(group.name); // *.将自动生成的分组名称先存储起来，以便后续使用

                    const construct = {}; // *.根据配置的分组规则自动构建这些分组
                    construct.name = group.name;
                    construct.type = group.type;
                    construct.proxies = ["REJECT"];
                    construct.filter = group.filter
                    construct.use = [formatName(PROXY_PROVIDER_REG, key)];

                    if (group.hasOwnProperty("interval")) {
                        construct.interval = group.interval;
                    }
                    if (group.hasOwnProperty("lazy")) {
                        construct.lazy = group.lazy;
                    }
                    if (group.hasOwnProperty("icon")) {
                        construct.icon = group.icon;
                    }
                    providerGroups.push(addTypeParams(construct)); // *.将构建好的分组存储起来
                });
            }
        }
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
                group.proxies.push(...providerGroupsName);
            }
            groupsArr.push(addTypeParams(group));
            return; // *.进行下一次迭代
        }

        if (!preset.hasOwnProperty("autofilter")) {
            if (isEmptyArray(group.proxies)) {
                group.proxies.push(...providerGroupsName);
            }
            groupsArr.push(addTypeParams(group));
            return; // *.进行下一次迭代
        }

        const filtered = providerGroupsName.filter(name => new RegExp(preset.autofilter, "i").test(name));
        group.proxies.push(...filtered);

        groupsArr.push(addTypeParams(group));
    });

    groupsArr.push(...providerCollection);
    groupsArr.push(...providerGroups);
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

function getRuleProvider(params, yaml, override) {

    const file = fs.readFileSync(override, "utf8");
    const result = yaml.parse(file);

    const provider = params["rule-providers"] || {};
    result.items.forEach(item => {
        if (item.ext === RULES_PROVIDER_TYPE) { // *.只添加类型为 YAML 的文件为规则提供者
            const providerName = item.name;
            provider[providerName] = {};
            provider[providerName].type = "file";
            provider[providerName].behavior = getBehavior(providerName);
            provider[providerName].path = override.replace(/\./gm, "/" + item.id + ".");
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

function getProxyProvider(map) {
    const provider = {};
    for (const [key, value] of Object.entries(map)) {
        const providerName = formatName(PROXY_PROVIDER_REG, key);

        provider[providerName] = {};
        provider[providerName].type = "file";
        provider[providerName].path = value.id;
        provider[providerName] = Object.assign(provider[providerName], HEALTH_CHECK, OVERRIDE);
    }
    return provider;
}

function formatName(reg, str) {
    // *.提取名称，不符合正则时使用原名称
    const result = reg.exec(str);
    if (result) {
        return result[0];
    }
    return str;
}

module.exports = { generate };