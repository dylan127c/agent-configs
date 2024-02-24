以下命令用于生成 CV 配置文件，同时尝试更新本地规则：

```bash
node -e "require('./generator').main()"
```

脚本需要 node.js 及以下模块的支持：

```bash
npm install yaml
npm install axios
```

执行上述命令可在当前目录下安装模块，不建议使用全局安装（-g）。
