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

    delete require.cache[require.resolve(settings.update)];
    const update = require(settings.update);
    update.updateCheck(log, axios);

    delete require.cache[require.resolve(settings.transform)];
    const transform = require(settings.transform);
    transform.transform(log);

    log.info(mark(funcName), "done.");
  } catch (error) {
    log.error(mark(funcName), error);
  }
}
module.exports = { run };