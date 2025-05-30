const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const axios = require("axios");

delete require.cache[require.resolve("./settings.json")];
const settings = require("./settings.json");

/* 将 console.log 的输出重定向至日志文件中 */
const logFilePath = path.join(__dirname, settings.logPath);
const logStream = fs.createWriteStream(logFilePath);
console.log = (...messages) => {
    const logMessage = messages.join(" ");
    logStream.write(`${logMessage}\n`);
}

delete require.cache[require.resolve(settings.log)];
const log = require(settings.log)(console);

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

function run() {
    const funcName = "run";
    try {
        // *.创建 CLASH 配置文件
        delete require.cache[require.resolve(settings.generator)];
        const generator = require(settings.generator);
        generator.generate(log, yaml);

        // *.从网络上更新位于 COMMONS RULES FOLDER 的那些 ORIGINAL/SPECIAL 字段规则
        delete require.cache[require.resolve(settings.update)];
        const update = require(settings.update);
        update.updateCheck(log, axios);

        // !.MIHOMO PATRY 中覆写所对应的真实规则文件的命名，与软件中的覆写命名不一致
        // !.但存在 OVERRIDE.YAML 文件用于记录两者之间的映射关系
        // *.规则利用规则集名称和覆写命名一致的特点，自动检索真实规则文件并自动创建这些规则集
        // *.双向同步机制同样利用这点来完成内置规则 ORIGINAL/SPECIAL、自定义规则 ADDITION 等不同向的同步操作
        const file = fs.readFileSync(settings.override, "utf8");
        const result = yaml.parse(file);

        emptyDirectory("./commons/rules/addition");

        // !.根据规则类型进行不同向的同步操作（双向同步）
        // !.该步骤是为了确保 OVERRIDE.YAML 中存在规则映射：
        // >.无论什么类型的规则，新增时都需要在 MIHOMO PARTY 中新增对应的覆写（重点）
        result.items.forEach(item => {
            if (item.name.includes("addition")) {
                // !.将自定义的规则从 MIHOMO RULES FOLDER 复制到 COMMONS RULES FOLDER 中
                // *.ADDITION RULES：MIHOMO RULES FOLDER => COMMONS RULES FOLDER
                // >.新增此类型规则需在 MIHOMO PARTY 中新增 addition 前缀的规则文件，并编写具体的分流规则
                // >.具体的分流规则会直接从 MIHOMO RULES FOLDER 中检索，规则同时会被同步至 COMMONS RULES FOLDER 中
                fs.copyFileSync(
                    path.join(settings.override.replace(/\./gm, "/" + item.id + ".")),      // _.MIHOMO RULES FOLDER
                    path.join("./commons/rules", item.name.replace("-", "/") + ".yaml")     // _.COMMONS RULES FOLDER
                );
            } else if (item.name.includes("original") || item.name.includes("special")) {
                // !.将内置的规则从 COMMONS RULES FOLDER 复制到 MIHOMO RULES FOLDER 中
                // *.ORIGINAL/SPECIAL RULES：COMMONS RULES FOLDER => MIHOMO RULES FOLDER
                // >.新增此类型规则需在 MIHOMO PARTY 中新增 original/special 前缀的规则文件，但不需要编写具体的分流规则
                // >.具体的分流规则会自行从 COMMONS RULES FOLDER 中检索，规则会被同步至 MIHOMO RULES FOLDER 中
                fs.copyFileSync(
                    path.join("./commons/rules", item.name.replace("-", "/") + ".yaml"),    // _.COMMONS RULES FOLDER
                    path.join(settings.override.replace(/\./gm, "/" + item.id + "."))       // _.MIHOMO RULES FOLDER
                );
            }
        });

        // *.将 commons rules folder 中的规则转换为 loon 支持的规则格式
        delete require.cache[require.resolve(settings.transform)];
        const transform = require(settings.transform);
        transform.transform(log);

        log.info(mark(funcName), "done.");
    } catch (error) {
        log.error(mark(funcName), error);
    }
}
module.exports = { run };

// *.清空目录函数
function emptyDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        fs.unlinkSync(fullPath);
    }
}