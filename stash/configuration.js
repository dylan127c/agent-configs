const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

const OUTPUT_FOLDER = path.resolve(__dirname, "./outputs");

/**
 * 本方法用于输出 Stash 配置文件。
 * 
 * @async
 * @param {object} yaml yaml 框架
 * @param {string} configurationRaw 已处理完毕的配置信息
 * @param {object} console 控制台调试对象
 */
module.exports.output = (yaml, log, name, configurationRaw) => {
    const funcName = "output";
    const symbol = name.split("_")[0].toLowerCase();
    const configuration = yaml.parse(configurationRaw);

    const constructContent = yaml.stringify({
        name: symbol,
        desc: "Replace original configuration file.",
        dns: configuration.dns,
        rules: configuration.rules,
        "proxy-groups": removeSpecificGroupReverse(configuration, "订阅详情"),
        "rule-providers": configuration["rule-providers"]
    });

    const outputFilePath = path.join(OUTPUT_FOLDER, symbol + ".stoverride");
    const outputContent = constructContent
        .replace("dns:", "dns: #!replace")
        .replace("rules:", "rules: #!replace")
        .replace("proxy-groups:", "proxy-groups: #!replace")
        .replace("rule-providers:", "rule-providers: #!replace");

    try {
        fs.writeFileSync(outputFilePath, outputContent, "utf-8")
    } catch (error) {
        log.error(mark(funcName), error);
    }
}

function removeSpecificGroupReverse(configuration, search) {
    const groups = Object.assign(configuration["proxy-groups"]);
    const index = groups.findLastIndex(ele => ele.name.includes(search));
    if (index >= 0) {
        groups.splice(index, 1);
    }
    return groups;
}