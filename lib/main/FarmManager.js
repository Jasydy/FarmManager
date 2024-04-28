const chalk = require("chalk");
const path = require("path");
const cwd = process.cwd();

const Helper = require("./../general/Helper.js");
const DataManager = require("./../data/DataManager.js");
const InputManager = require("./../general/InputManager.js");
const TableManager = require("./../table/TableManager.js");
const TgManager = require("./../tg/TgManager.js");
const FsManager = require("./../general/FsManager.js")


class FarmManager {
    #farmPath;

    #dataPath

    #tgDirPath;

    #inputPath;
    #resultsPath;

    #tgManager;
    
    constructor(farmPath) {
        this.#farmPath = farmPath;

        this.#dataPath = path.resolve(farmPath, "data");

        this.#tgDirPath = path.resolve(farmPath, "tg");
        
        this.#inputPath = path.resolve(cwd, "input.txt", );
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
                const res = await TableManager.correctTGMnemos({inputPath: this.#inputPath, resultsPath: path.resolve(this.#resultsPath, "correctMnemosTg.txt")})
                break;
            }

            case("CorrectProxyAccounts"): {
                const accountsPerProxy = await InputManager.number({message: "How many accounts per proxy?"});
                const res = await TableManager.correctProxyAccounts({
                    accountsPerProxy: accountsPerProxy,
                    inputProxiesPath: this.#inputPath,
                    resultsPath: path.resolve(this.#resultsPath, "accountsPerProxy.txt"),
                });

                break;
            }

            //Data
            case("EnumImages"): {
                const res = await Promise.all([
                    DataManager.enumImages({
                        minImageNum: 4,
                        activeImagesPath: path.resolve(this.#dataPath, "main", "images", "avatars", "active"),
                        draftImagesPath: path.resolve(this.#dataPath, "main", "images", "avatars", "draft"),
                    }),
                    DataManager.enumImages({
                        minImageNum: 4,
                        activeImagesPath: path.resolve(this.#dataPath, "main", "images", "backgrounds", "active"),
                        draftImagesPath: path.resolve(this.#dataPath, "main", "images", "backgrounds", "draft"),
                    }),

                    DataManager.enumImages({
                        minImageNum: 1,
                        activeImagesPath: path.resolve(this.#dataPath, "extra", "images", "avatars", "active"),
                        draftImagesPath: path.resolve(this.#dataPath, "extra", "images", "avatars", "draft"),
                    }),
                    DataManager.enumImages({
                        minImageNum: 1,
                        activeImagesPath: path.resolve(this.#dataPath, "extra", "images", "backgrounds", "active"),
                        draftImagesPath: path.resolve(this.#dataPath, "extra", "images", "backgrounds", "draft"),
                    }),
                ]);
                break;
            }

            //Tg
            case("LaunchAccounts"): {
                const type = await InputManager.select({choices: ["main x1", "main x3", "extra x1", "extra x3",]});
                // const accounts = await InputManager.input({message: "Enter accounts to launch"});
                const accountsInDir = await FsManager.readDir({srcPath: path.resolve(this.#tgDirPath, "accounts", type)});
                const accounts = await InputManager.multiselectAll({choices: accountsInDir});
                await this.#tgManager.launchAccounts({accounts: accounts, type: type});
                break;
            }
            // case("LaunchAccountsTemp"): {
            //     const type = await InputManager.select({choices: ["main x1", "main x3", "extra x1", "extra x3",]});
            //     // const accounts = await InputManager.input({message: "Enter accounts to launch"});
            //     const accountsInDir = await FsManager.readDir({srcPath: path.resolve(this.#tgDirPath, "accounts", type)});
            //     const accounts = await InputManager.multiselectAll({choices: accountsInDir});
            //     console.log(777, accounts)
            //     await this.#tgManager.launchAccountsTemp({accounts: accounts, type: type});
            //     break;
            // }
            case("Export"): {
                const type = await InputManager.select({choices: ["all", "main x1", "main x3", "extra x1", "extra x3",]});
                await this.#tgManager.exportAccounts({type, });
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