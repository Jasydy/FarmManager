const chalk = require("chalk");
const path = require("path");
const cwd = process.cwd();

const Helper = require("./../general/Helper.js");
const DataManager = require("./../data/DataManager.js");
const InputManager = require("./../general/InputManager.js");
const TableManager = require("./../table/TableManager.js");
const TgManager = require("./../tg/TgManager.js");


class FarmManager {
    #farmPath;

    #avatarsActivePath;
    #avatarsDraftPath;
    #backgroundsActivePath;
    #backgroundsDraftPath;

    #tgDirPath;

    // #tgAccountsPath;
    // #tgImportNewPath;
    // #tgImportOldPath;
    // #tgExportPath;
    // #tgDraftPath;

    #resultsPath;

    #tgManager;
    
    constructor(farmPath) {
        this.#farmPath = farmPath;

        this.#avatarsActivePath = path.resolve(farmPath, "data", "images", "avatars", "active")
        this.#avatarsDraftPath = path.resolve(farmPath, "data", "images", "avatars", "draft")
        this.#backgroundsActivePath = path.resolve(farmPath, "data", "images", "backgrounds", "active")
        this.#backgroundsDraftPath = path.resolve(farmPath, "data", "images", "backgrounds", "draft")

        this.#tgDirPath = path.resolve(farmPath, "tg");
        
        // this.#tgAccountsPath = path.resolve(farmPath, "tg", "accounts");
        // this.#tgImportNewPath = path.resolve(farmPath, "tg", "import", "new");
        // this.#tgImportOldPath = path.resolve(farmPath, "tg", "import", "old");
        // this.#tgExportPath = path.resolve(farmPath, "tg", "export");
        // this.#tgDraftPath = path.resolve(farmPath, "tg", "draft");

        this.#resultsPath = path.resolve(cwd, "results", );

        this.#tgManager = new TgManager({tgDirPath: this.#tgDirPath});
    }

    async act({action, }) {
        switch(action.trim()) {
            //Others
            case("CreateFarm"): {
                const res = await Helper.createFarm({destPath: cwd, });
                break;
            }
            case("CorrectMnemoTG"): {
                const res = await TableManager.correctTGMnemos({tgMnemoPath: path.resolve(this.#resultsPath, "correctMnemosTg.txt")})
                break;
            }

            case("CorrectProxyAccounts"): {
                const accountsPerProxy = await InputManager.number({message: "How many accounts per proxy?"});
                const res = await TableManager.correctProxyAccounts({
                    accountsPerProxy: accountsPerProxy,
                    proxiesPath: path.resolve(this.#resultsPath, "proxy", "proxies.txt"),
                    resultsPath: path.resolve(this.#resultsPath, "proxy", "accountsPerProxy.txt"),
                });

                break;
            }

            //Data
            case("EnumImages"): {
                const res = await Promise.all([
                    DataManager.enumImages({activeImagesPath: this.#avatarsActivePath, draftImagesPath: this.#avatarsDraftPath}),
                    DataManager.enumImages({activeImagesPath: this.#backgroundsActivePath, draftImagesPath: this.#backgroundsDraftPath})
                ]);
                break;
            }

            //Tg
            case("LaunchAccounts"): {
                const accounts = await InputManager.input({message: "Enter accounts to launch"});
                await this.#tgManager.launchAccounts({accounts: accounts});
                break;
            }
            case("LaunchAccountsTemp"): {
                const accounts = await InputManager.input({message: "Enter accounts to launch"});
                await this.#tgManager.launchAccountsTemp({accounts: accounts});
                break;
            }
            case("Export"): {
                await this.#tgManager.exportAccounts();
                break;
            }
            case("Import"): {
                const type = await InputManager.select({choices: ["Old", "New", ], message: "What accounts to import?"});
                switch(type) {
                    case("Old"): {
                        await this.#tgManager.importOldAccounts();
                        break;
                    }
                    case("New"): {
                        await this.#tgManager.importNewAccounts();
                        break;
                    }
                }
                break;
            }
            case("UpdateTg"): {
                await this.#tgManager.updateTg();
                break;
            }
            case("..."): {
                process.exit(0);
                break;
            }
            default: {
                console.log(chalk.red("No such action :'("));
                return false;
            }
        }
    }
}

module.exports = FarmManager;