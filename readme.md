## PROXY RULES

📡 ONLY FOR PERSONAL USE!!! 

### PURPOSE

For quickly generating clash configuration files.

### USAGE

The following command is used to generate configuration：

```bash
node -e "require('./run').run()"
```

Command above will also checks whether the rule files need to be updated, meanwhile, converts these files into Loon supported rules files.

All output logs will be stored in log files with the same name as the script.

Note that the rule conversion always occurs regardless of whether the rule files need to be updated.

### DEPENDENCE

Script requires node.js and the support of the following modules:

```bash
npm install yaml
npm install axios
```

Global installation (-g) is not recommended for modules.
