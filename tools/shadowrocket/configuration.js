const fs = require("fs");
const path = require("path");

const CONNECTOR = "-";

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

module.exports.transformRules = (log, profile) => {
    const funcName = "transformRules";

    delete require.cache[require.resolve("./settings.json")];
    const settings = require("./settings.json");

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
            prefix.concat(CONNECTOR, fileName, ".list")
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

function removeSuffix(str) {
    return str.replace(/\.[a-zA-Z]+$/gm, "");
}

function getBehavior(profile, name) {
    for (const [behavior, arr] of Object.entries(profile.behavior)) {
        if (arr.includes(name)) {
            return behavior;
        }
    }
    return profile.defaultBehavior;
}