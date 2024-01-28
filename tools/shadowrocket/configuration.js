const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

module.exports.output = (log, name, configuration, profile) => {
    const funcName = "output";

    delete require.cache[require.resolve("./settings.json")];
    const settings = require("./settings.json");

    /* THE "_" OR " " IS DEFAULT SEPARATOR. */
    const symbol = name.includes("_") ?
        name.split("_")[0].toLowerCase() :
        name.split(" ")[0].toLowerCase();

    /* REMOVE UNNECESSARY GROUP IF EXIST. */
    const initProxyGroups = Object.assign(configuration["proxy-groups"]);
    const index = initProxyGroups.findLastIndex(ele => ele.name.includes("订阅详情"));
    if (index >= 0) {
        initProxyGroups.splice(index, 1);
    }

    /* RULE */
    let rules = "[Rule]\n";
    const remote = ensureTrailingSlash(settings.remote);
    configuration.rules.forEach(rule => {
        if (rule.includes("RULE-SET")) {
            rules += rule
                .replace(/RULE-SET,/gm, "RULE-SET," + remote)
                .replace(/(?<!T),(?!n)/gm, ".list,") + "\n";
        } else {
            rules += rule + "\n"
        }
    });

    /* PROXY GROUP */
    let groups = "[Proxy Group]\n";
    initProxyGroups.forEach(group => {
        groups += group.name + " = " + group.type + ",";
        group.proxies.forEach(name => {
            if (symbol === "orient" && name.match(/\d\d/gm)) {
                groups += removeEmoji(name) + ","
            } else {
                groups += name + ","
            }
        });
        groups += "interval=600,timeout=5,select=0,url=http://www.gstatic.com/generate_204\n";
    });

    /*
     * Shadowrocket 的规则集已经和规则融合在一起了，只要规则和分组详情获取完毕，就可以输出到文件。
     * 
     * 目录下存在一个初始的配置文件：init.conf。
     * 通过覆盖初始配置文件的 Rule 和 Proxy Group 内容，即可得到最终的 Shadowrocket 配置文件。
     */
    const inputFileName = settings.init;
    const outputFileName = settings.prefix + symbol + settings.suffix;

    const inputFilePath = path.resolve(__dirname, settings.configs, inputFileName);
    const outputFilePath = path.resolve(__dirname, settings.outputs, outputFileName);
    try {
        const inputContent = fs.readFileSync(inputFilePath, 'utf-8');
        log.info(mark(funcName), inputFileName, "imported.");
        const outputContent = inputContent
            .replace(/\[Rule\]/g, rules)
            .replace(/\[Proxy Group\]/g, groups);
        fs.writeFileSync(outputFilePath, outputContent, "utf-8");
        log.info(mark(funcName), outputFileName, "exported.");
    } catch (error) {
        log.error(mark(funcName), error);
    }
    transformRules(log, profile, settings);
}

function transformRules(log, profile, settings) {
    const funcName = "transformRules";

    const shadowrocketRules = path.resolve(__dirname, settings.rules);
    if (!fs.existsSync(shadowrocketRules)) {
        fs.mkdirSync(shadowrocketRules);
    }
    ["original", "addition"].forEach(identifier => {
        transform(log, profile, settings, identifier);
    })
    log.info(mark(funcName), "transform completed.")
}

function transform(log, profile, settings, identifier) {
    const funcName = "transform";

    const native = profile[identifier + "Native"];
    const prefix = profile[identifier + "Prefix"];

    if (!fs.existsSync(native)) {
        log.error(mark(funcName), "native rules folder missing.");
        return;
    }

    const sourceFiles = fs.readdirSync(native);
    sourceFiles.forEach(sourceFile => {
        const fileName = removeSuffix(sourceFile);
        const inputPath = path.join(native, sourceFile);
        const outputPath = path.join(
            path.resolve(__dirname, settings.rules),
            prefix.concat(profile.connector, fileName, ".list")
        );
        try {
            let fileContent = fs.readFileSync(inputPath, "utf-8");
            const behavior = getBehavior(profile, fileName);

            for (const [search, replace] of Object.entries(settings.replacement[settings[behavior]])) {
                fileContent = fileContent.replace(new RegExp(search, "gm"), replace);
            }
            fs.writeFileSync(outputPath, fileContent, "utf-8");
        } catch (error) {
            log.error(mark(funcName), error);
        }
    });
}

function ensureTrailingSlash(str) {
    if (!str.endsWith('/')) {
        return str + '/';
    }
    return str;
}

function removeSuffix(str) {
    return str.replace(/\.[a-zA-Z]+$/gm, "");
}

/**
 * Group names of non-SS nodes in Shadowrocket do not support Emoji.
 */
function removeEmoji(str) {
    return str.replace(/^\W+?\s(?!\d)/gm, "");
}

function getBehavior(profile, name) {
    for (const [behavior, arr] of Object.entries(profile.behavior)) {
        if (arr.includes(name)) {
            return behavior;
        }
    }
    return profile.defaultBehavior;
}