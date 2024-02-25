const fs = require("fs");
const path = require("path");

const CONNECTOR = "-";

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

module.exports.transform = (log) => {
    const funcName = "transform";

    delete require.cache[require.resolve("./settings.json")];
    const settings = require("./settings.json");

    const destination = path.resolve(__dirname, settings.rules);
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
    } else {
        clearDirectorySync(destination);
    }
    ["original", "addition"].forEach(identifier => {
        transform(log, settings, identifier);
    })
    log.info(mark(funcName), "done.")
}

function transform(log, settings, identifier) {
    const funcName = "transform";

    const native = settings[identifier + "Native"];
    const prefix = settings[identifier + "Prefix"];

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
            const behavior = getBehavior(settings, fileName);

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

function getBehavior(settings, name) {
    for (const [behavior, arr] of Object.entries(settings.behavior)) {
        if (arr.includes(name)) {
            return behavior;
        }
    }
    return settings.defaultBehavior;
}

function clearDirectorySync(directory) {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const filePath = path.join(directory, file);
        fs.unlinkSync(filePath);
    });
}
