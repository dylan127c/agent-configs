const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}
const OUTPUT_FOLDER = path.resolve(__dirname, "./outputs");
const SEARCHES = [];
const EMOJI_REMOVAL = ["🌌", "🌅", "🌠", "🌆", "🌄", "🌃", "🎑", "🌇"];

module.exports.output = (yaml, log, name, configuration) => {
    const funcName = "output";
    const symbol = name.split("_")[0].toLowerCase();

    const constructContent = yaml.stringify({
        name: symbol,
        desc: "Replace original configuration file.",
        dns: configuration.dns,
        rules: configuration.rules,
        "proxy-groups": removeSpecificGroupReverse(configuration, SEARCHES),
        "rule-providers": configuration["rule-providers"]
    });

    const outputFilePath = path.join(OUTPUT_FOLDER, symbol + ".stoverride");
    const outputContent = removeEmoji(constructContent, EMOJI_REMOVAL)
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

function removeSpecificGroupReverse(configuration, searches) {
    const groups = Object.assign(configuration["proxy-groups"]);
    if (!searches.length) {
        return groups;
    }
    searches.forEach(search => {
        const index = groups.findLastIndex(ele => ele.name.includes(search));
        if (index >= 0) {
            groups.splice(index, 1);
        }
    })
    return groups;
}

function removeEmoji(str, removale) {
    if (!removale.length) {
        return str;
    }
    removale.forEach(emoji => {
        str = str.replaceAll(new RegExp(emoji + "\\s*", "g"), "");
    });
    return str;
}