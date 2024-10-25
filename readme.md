## AGENT CONFIGS

Quickly generating Clash configuration files. 

<div align="center"><img src="images/readme.images/Snipaste_2024-07-22_04-02-57.png" alt="Snipaste_2024-07-22_04-02-57" style="width:70%;" /></div>

In fact, if you have the subscription configuration file which provided by the service provider already, then you can directly use those files to generate the new configuration file, at that time the Clash GUI could be useless.

Of course, by modifying few core code, you can even get that new configuration file by just providing the subscription link. But in any case, users generally choose to use the Clash GUI on Windows system, so it is more appropriate to leave the task of obtaining the service configuration file to Clash GUI.

### DEPENDENCE

Script requires the support of Node.js and these following modules:

```bash
npm install yaml
npm install axios
```

NOTE: Global installation (-g) is not recommended.

### CONFIGURATION

#### profile.js

Basic configuration of proxy groups and rules.

#### params.js

This file contains some basic configuration that doesn't change often, therefore it can be ignored.

#### generate.js

Responsible for generating configuration files, generally no changes are needed.

<div align="center"><img src="images/readme.images/Snipaste_2024-10-26_06-45-00.png" alt="Snipaste_2024-10-26_06-45-00" style="width:70%;" /></div>

|         OVERRIDE SETUP          |        DESC or REF        |
| :-----------------------------: | :-----------------------: |
|         `comprehensive`         | `Integrated Configuraton` |
|            `profile`            |  `/generator/profile.js`  |
|           `group-xxx`           | `/generator/override.js`  |
| `addition/original/special-xxx` |    `/commons/rules/**`    |

### USAGE

After completing the configuration of the `profile.js` file, the following command can be used to generate the specific clash configuration:

```bash
node -e "require('./run').run()"
```

Command above will also checks whether the rule files need to be updated or not, meanwhile, converts these files into Loon supported rules files.

Note that the rule conversion always occurs regardless of whether the rule files need to be updated. Beside, all output logs are stored in log files with the same name as the script.

### TIPS

Some File Search Tool support to run command line directly, such as Listary: 

<div align="center"><img src="images/readme.images/Snipaste_2024-07-14_05-24-09.png" alt="Snipaste_2024-07-14_05-24-09" style="width:60%;" /></div>

By using them, there is no need to activate the terminal so frequently.

