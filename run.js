const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const axios = require("axios");

delete require.cache[require.resolve("./settings.json")];
const settings = require("./settings.json");

/* 将 console.log 的输出重定向至日志文件中 */
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
    delete require.cache[require.resolve(settings.generator)];
    const generator = require(settings.generator);
    generator.generate(log, yaml);

    // *.用于 commons rules folder 的更新（更新那些 original/special 字段的规则）
    delete require.cache[require.resolve(settings.update)];
    const update = require(settings.update);
    update.updateCheck(log, axios);

    // *.规则同步，用于处理 mihomo rules folder 与 commons rules folder 之间的同步，需保持两者的规则内容一致
    // *.这样就允许在 Mihomo Party 中直接对 addition 字段规则进行修改，运行 run.js 将仅同步这些修改到 commons rules folder 中
    // *.并同时将 original/special 字段规则同步到 mihomo rules folder 中，以完成所有规则的同步，符合此前的规则更新逻辑
    const file = fs.readFileSync(settings.override, "utf8");
    const result = yaml.parse(file);

    // *.清空 addition 中的规则，以防从 mihomo 中移除某些规则后，这些规则仍然存在于 commons rules folder 中
    // *.对于 mihomo 中增删改的规则，它会自行处理，因此不需要在代码中对它们进行操作
    emptyDirectory("./commons/rules/addition");

    result.items.forEach(item => {
      // *.该目录下可能包含一些 .log 和 .js 文件，而规则文件 .yaml 包含对应关键字 addition、original、special 等字段
      // *.逻辑需要根据规则文件对应的关键字字段，来判断文件同步的方向
      if (item.name.includes("addition")) { // *.包含 addition 字段则属于自定义规则，允许更改其内容
        fs.copyFileSync(
          path.join(settings.override.replace(/\./gm, "/" + item.id + ".")), // *.mihomo rules folder
          path.join("./commons/rules", item.name.replace("-", "/") + ".yaml") // *.commons rules folder
        );
      } else if (item.name.includes("original") || item.name.includes("special")) { // *.不包含 addition 字段则属于内置规则，不允许更改其内容
        fs.copyFileSync(
          path.join("./commons/rules", item.name.replace("-", "/") + ".yaml"), // *.commons rules folder
          path.join(settings.override.replace(/\./gm, "/" + item.id + ".")) // *.mihomo rules folder
        );
      }
    });

    // *.将 commons rules folder 中的规则转换为 loon 支持的规则格式
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