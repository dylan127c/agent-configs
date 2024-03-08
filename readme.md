## PROXY RULES

📡 ONLY FOR PERSONAL USE!!! 

### PURPOSE

For quickly generating clash configuration files.

### DEPENDENCE

Script requires node.js and the support of the following modules:

```bash
npm install yaml
npm install axios
```

Global installation (-g) is not recommended for modules.

### CONFIGURATION

The key configuration files are located in the `generator` directory.

#### providers.js

Used to configure information about `proxy-providers`.

In order to allow different hosts to use the same configuration, `providers.js` needs to be placed in the `%homepath%/.run/` directory.

|        PARMAS         |                       USAGE                        |
| :-------------------: | :------------------------------------------------: |
| `PROXY_PROVIDER_PATH` |                 Configs file path.                 |
| `PROXY_PROVIDER_TYPE` |                 Configs file type.                 |
| `PROXY_PROVIDERS_MAP` | Mapping between provider and its config file name. |
| `ALL_PROFILES_OUTPUT` |                 Final config name.                 |

Note that the key in the `PROXY_PROVIDERS_MAP` parameter is the proxy provider, which needs to correspond to the key of the `PROVIDER_GROUPS` parameter in `profile.js`.

#### profile.js

Used to configure information about `rules`, `rule-providers` and `proxy-groups`.

|        PARMAS        |          USAGE          |
| :------------------: | :---------------------: |
|       `GROUPS`       |      Gourp policy.      |
|  `PROVIDER_GROUPS`   |    Provider policy.     |
| `RULE_PROVIDER_PATH` |     Rule file path.     |
| `RULE_PROVIDER_TYPE` |     Rule file type.     |
|       `RULES`        | Specific traffic rules. |

### USAGE

The following command is used to generate configuration：

```bash
node -e "require('./run').run()"
```

Command above will also checks whether the rule files need to be updated, meanwhile, converts these files into Loon supported rules files.

All output logs will be stored in log files with the same name as the script.

Note that the rule conversion always occurs regardless of whether the rule files need to be updated.
