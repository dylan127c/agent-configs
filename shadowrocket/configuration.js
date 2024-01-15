const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

delete require.cache[require.resolve("./settings.json")];
const settings = require("./settings.json");

const RULES_FOLDER = path.resolve(__dirname, settings.rules);

/**
 * 本方法用于输出 Shadowrocket 配置文件。
 * 
 * @param {*} yaml yaml 框架
 * @param {*} configurationRaw 已处理完毕的配置信息
 * @param {object} console 控制台调试对象
 */
module.exports.output = (yaml, log, name, configurationRaw, profile) => {
    const funcName = "output";
    const symbol = name.split("_")[0].toLowerCase();

    const configuration = yaml.parse(configurationRaw);

    const initProxyGroups = Object.assign(configuration["proxy-groups"]);
    const index = initProxyGroups.findLastIndex(ele => ele.name.includes("订阅详情"));
    if (index >= 0) {
        initProxyGroups.splice(index, 1);
    }

    /* RULE */
    let shadowrocketRule = "[Rule]\n";
    configuration.rules.forEach(ele => {
        if (ele.includes("RULE-SET")) {
            const remote = settings.remote.endsWith("/") ?
                settings.remote :
                settings.remote + "/";
            shadowrocketRule += ele.replace(/RULE-SET,/gm, "RULE-SET," + remote)
                .replace(/(?<!T),(?!n)/gm, ".list,") + "\n";
        } else {
            shadowrocketRule += ele + "\n"
        }
    });

    /* PROXY GROUP */
    let shadowrocketProxyGroup = "[Proxy Group]\n";
    initProxyGroups.forEach(ele => {
        shadowrocketProxyGroup += ele.name + " = " + ele.type + ",";
        ele.proxies.forEach(proxy => {
            if (symbol === "orient" && proxy.match(/\d\d/gm)) {
                /* Shadowrocket 中非 SS 节点的组名不支持 Emoji 表情。
                 * 注意：由于某些节点名称不包含 Emoji，不推荐使用 /^\W{4}/gm 替换，这样会导致中文字符被替换。*/
                shadowrocketProxyGroup += proxy.replace(/^\W+?\s(?!\d)/gm, "") + ","
            } else {
                shadowrocketProxyGroup += proxy + ","
            }
        });

        /* Shadowrocket 配置文件的分组无论属于什么 Type 类型，都可以添加以下条目。
         * 当类型本身不需要这些选项时，Shadowrocket 会自动忽略条目中已给出的某些键值。*/
        shadowrocketProxyGroup += "interval=600,timeout=5,select=0,url=http://www.gstatic.com/generate_204\n";
    });

    /*
     * Shadowrocket 的规则集已经和规则融合在一起了，只要规则和分组详情获取完毕，就可以输出到文件。
     * 
     * 目录下存在一个初始的配置文件：init.conf。
     * 通过覆盖初始配置文件的 Rule 和 Proxy Group 内容，即可得到最终的 Shadowrocket 配置文件。
     */
    const inputFileName = settings.init;
    const inputFilePath = path.resolve(__dirname, settings.configs, inputFileName);

    const outputFileName = settings.prefix + symbol + settings.suffix;
    const outputFilePath = path.resolve(__dirname, settings.outputs, outputFileName);

    try {
        const inputContent = fs.readFileSync(inputFilePath, 'utf-8');
        log.info(mark(funcName), inputFileName, "imported.");
        const outputContent = inputContent
            .replace(/\[Rule\]/g, shadowrocketRule)
            .replace(/\[Proxy Group\]/g, shadowrocketProxyGroup);
        fs.writeFileSync(outputFilePath, outputContent, "utf-8");
        log.info(mark(funcName), outputFileName, "exported.");
    } catch (error) {
        log.error(mark(funcName), error);
    }
    transformRules(log, profile);
}

/**
 * 本方法用于转换 Clash 规则文件为 Shadowrocket 规则文件。
 * 
 * 所有 Clash 规则会通过本地获取，不需要请求网络。但前提是，本地需要存在 Clash 规则文件。
 * 
 * @param {object} console 
 */
function transformRules(log, profile) {
    const funcName = "transformRules";
    if (!fs.existsSync(RULES_FOLDER)) {
        fs.mkdirSync(RULES_FOLDER);
    }

    transform(log, profile, profile.originalNative, profile.originalPrefix, profile.prefixConnector);
    transform(log, profile, profile.additionNative, profile.additionPrefix, profile.prefixConnector);

    log.info(mark(funcName), "transform completed.")
}

function transform(log, profile, native, prefix, connector) {
    const funcName = "transform";
    if (!fs.existsSync(native)) {
        log.error(mark(funcName), "native rules folder missing.");
        return;
    }

    const sourceFiles = fs.readdirSync(native);
    sourceFiles.forEach(sourceFile => {
        const inputPath = path.join(native, sourceFile);
        const outputPath = path.join(RULES_FOLDER, prefix + connector + sourceFile.replace(/\..+$/gm, "") + ".list");
        try {
            let fileContent = fs.readFileSync(inputPath, "utf-8");
            /* 这里主要是为了去掉文件名的后缀信息。
             * 不推荐使用/\..+$/gm匹配，以避免文件名中存在多个“.”符号。*/
            const fileName = sourceFile.replace(/\.[a-zA-Z]+$/gm, "");
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

function getBehavior(profile, name) {
    for (const [behavior, arr] of Object.entries(profile.behavior)) {
        if (arr.includes(name)) {
            return behavior;
        }
    }
    return profile.defaultBehavior;
}