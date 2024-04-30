const chalk = require("chalk");
const AdmZip = require("adm-zip");
const path = require("path");

const Helper = require("./../general/Helper.js");
const FsManager = require("./../general/FsManager.js");
const InputManager = require("./../general/InputManager.js");
const {ImportError, } = require("./../general/errors.js");
const Logger = require("./../general/Logger.js");

const cwd = process.cwd();

class TgManager {
    #tgDirPath;

    #tgImportNewPath;
    #tgImportOldPath;
    #tgExportPath;
    #tgAccountsPath;
    #tgDraftPath;

    constructor({tgDirPath, }) {
        this.#tgDirPath = tgDirPath;
        this.#tgImportNewPath = path.resolve(tgDirPath, "import", "new");
        this.#tgImportOldPath = path.resolve(tgDirPath, "import", "old");
        this.#tgExportPath = path.resolve(tgDirPath, "export");
        this.#tgAccountsPath = path.resolve(tgDirPath, "accounts");
        this.#tgDraftPath = path.resolve(tgDirPath, "draft");
    }

    async exportAccounts({type,}) {
        const accounts = {};
        const exportUnits = await FsManager.readDir({srcPath: this.#tgExportPath});
        const exportDirName = exportUnits.length + 1;

        if(type == "all") {
            let types = await FsManager.readDir({srcPath: this.#tgAccountsPath, });
            types = types.filter(item => !item.includes("Telegram") && !item.includes("draft"));

            for(let i = 0; i < types.length; i++) {
                accounts[types[i]] = await FsManager.readDir({srcPath: path.resolve(this.#tgAccountsPath, types[i])});
            }
        } else {
            accounts[type] = await FsManager.readDir({srcPath: path.resolve(this.#tgAccountsPath, type)});
        }
        
        
        const accountsKeys = Object.keys(accounts);
        await FsManager.makeDir({destPath: path.resolve(this.#tgExportPath, `Export ${exportDirName}`)});
        await FsManager.copyFile({srcPath: path.resolve(this.#tgAccountsPath, "Telegram.exe"), destPath: path.resolve(this.#tgExportPath, `Export ${exportDirName}`, "Telegram.exe")})

        for(const accountType in accounts) {
            console.log(`-`.repeat(15) + accountType + `-`.repeat(15));
            const zip = new AdmZip();

            for(const account of accounts[accountType]) {
                await zip.addLocalFolderPromise(path.resolve(this.#tgAccountsPath, accountType, account, "tdata"), {
                        zipPath: `${account}/tdata`,
                });
                console.log(`Account ${account} ${chalk.green("done")}`);
            }

            // await zip.addLocalFile(path.resolve(this.#tgAccountsPath, "Telegram.exe"))

            await zip.writeZipPromise(path.resolve(this.#tgExportPath, `Export ${exportDirName}`, `${accountType}.zip`));
            console.log(`${chalk.green("Exported")} to ${chalk.magenta(`${accountType}.zip`)}`)
        }


        // for(let i = 0; i < accountsKeys.length; i++) {
        //     // const zip = new AdmZip();
        //     // console.log(accounts)
        //     console.log(`-`.repeat(10) + accounts[accountsKeys[i]] + `-`.repeat(10));
        //     // for(let j = 0; j < accounts.accountsKeys[i].length; j++) {
        //     //     await zip.addLocalFolderPromise(path.resolve(this.#tgAccountsPath, accounts.accountsKeys[i], accounts.accountsKeys[i][j], "tdata"), {
        //     //         zipPath: `${accounts.accountsKeys[i][j]}/tdata`,
        //     //     });
        //     //     console.log(`Account ${accounts.accountsKeys[i][j]} ${chalk.green("done")}`);
        //     // }
        // }

        // const zip = new AdmZip();
        // for(let i = 0; i < accounts.length; i++) {
        //     await zip.addLocalFolderPromise(path.resolve(this.#tgAccountsPath, accounts[i], "tdata"), {
        //         zipPath: `${accounts[i]}/tdata`,
        //     });
        //     console.log(`Account ${accounts[i]} ${chalk.green("done")}`);
        //     // zip.addLocalFile("Telegram.exe", `${tgAccs[i]}`)
        // }

        // console.log("Finalizing...")
        // await zip.addLocalFolderPromise(path.resolve(this.#tgAccountsPath, "___"), {
        //     zipPath: `___`,
        // })
        // await zip.writeZipPromise(path.resolve(this.#tgExportPath, `Accounts ${exportDirName}.zip`));
        // console.log(`${chalk.green("Exported")} to ${chalk.magenta("Accounts " + exportDirName + ".zip")}`)
    }
    
    async importNewAccounts() {
        console.log("Importing... new...")
        let accountsZips = await FsManager.readDir({srcPath: this.#tgImportNewPath});
        accountsZips = accountsZips.filter(account => account.includes(".zip"))
        
        await Promise.all(accountsZips.map(async account => {
            const zip = new AdmZip(path.resolve(this.#tgImportNewPath, account));
            await zip.extractAllTo(this.#tgImportNewPath);
        }));

        let accounts = await FsManager.readDir({srcPath: this.#tgAccountsPath});
        accounts = accounts.filter(dir => dir.match(/^\d+$/g))
        const lastAccountNum = Math.max(...accounts);

        let accountsToImport = await FsManager.readDir({srcPath: this.#tgImportNewPath});
        accountsToImport = accountsToImport.filter(dir => !dir.includes(".zip"));

        console.log(accountsZips)
        console.log(accountsToImport)
        let resStr = "";
        let resArr = [];
        for(let i = 0; i < accountsToImport.length; i++) {
            const accountNum = String(lastAccountNum + i + 1);

            await FsManager.move({
                srcPath: path.resolve(this.#tgImportNewPath, accountsToImport[i]),
                destPath: path.resolve(this.#tgAccountsPath, accountNum)
            });

            resArr.push(accountNum);
            resStr += `${accountNum}\t${accountsToImport[i]}\n`;
        }
        await this.updateTg({accounts: resArr});

        await Promise.all(accountsZips.map(async zip => {
            await FsManager.move({
                srcPath: path.resolve(this.#tgImportNewPath, zip),
                destPath: path.resolve(this.#tgDraftPath, zip)
            })
        }));

        await FsManager.writeFile({destPath: path.resolve(cwd, "results", "importedAccounts.txt"), data: resStr});
        Logger.done(this.#tgImportOldPath);
    }

    async importOldAccounts() {
        const isAccountsDirExist = await FsManager.isExist({srcPath: this.#tgAccountsPath})
        if(!isAccountsDirExist) {
            await FsManager.makeDir({destPath: this.#tgAccountsPath});
        }

        let importZips = await FsManager.readDir({srcPath: this.#tgImportOldPath});
        importZips = importZips.filter(file => file.includes(".zip"));
        if(importZips.length == 0) {
            throw new ImportError("Import dir is empty");
        }
        const importZip = importZips[0];
        const zip = new AdmZip(path.resolve(this.#tgImportOldPath, importZip));

        console.log("Importing... old...")
        zip.extractAllTo(this.#tgImportOldPath);

        let importedDirs = await FsManager.readDir({srcPath: this.#tgImportOldPath});
        importedDirs = importedDirs.filter(file => !file.includes(".zip"));

        const importedAccounts = importedDirs.filter(importedAccount => importedAccount.match(/^\d+$/g));

        console.log(importedDirs)


        for(let i = 0; i < importedDirs.length; i++) {
            await FsManager.move({
                srcPath: path.resolve(this.#tgImportOldPath, importedDirs[i]),
                destPath: path.resolve(this.#tgAccountsPath, importedDirs[i]),
            });
        }

        for(let i = 0; i < importedAccounts.length; i++) {
            await FsManager.copyFile({
                srcPath: path.resolve(this.#tgAccountsPath, "___", "Telegram.exe"),
                destPath: path.resolve(this.#tgAccountsPath, String(importedAccounts[i]), "Telegram.exe"),
            });
        }
        console.log(`${chalk.green("Imported:")} ${importedDirs}`);
    }

    // async launchAccounts({accounts, type = "main x3"}) {
    //     const accountsArr = Helper.correctAccounts({accounts, });
    //     console.log(accountsArr);
    //     for(let i = 0; i < accountsArr.length; i++) {
    //         await this.#launchAccount({account: accountsArr[i], type: type});
    //     }
    //     console.log(chalk.black("-".repeat(40)))
    // }

    // async #launchAccount({account, type = "main x3"}) {
    //     const accountExePath = path.resolve(this.#tgAccountsPath, type, String(account), "Telegram.exe");
    //     const res = await Helper.execFile({srcPath: accountExePath});

    //     console.log(`Account ${account} ${chalk.green("launched")}`);
    //     return true;
    // }
    
    //добавить checkbox аккаунтов? all, choices, input?
    async launchAccounts({accounts, type = "main x3"}) {
        // const inputAccounts = Helper.correctAccounts({accounts, });
        const inputAccounts = accounts;
        let resAccounts;
        
        if(type.includes("x3")) {
            resAccounts = [];
            const dirs = await FsManager.readDir({srcPath: path.resolve(this.#tgAccountsPath, type)});
            for(let i = 0; i < dirs.length; i++) {
                for(let j = 0; j < inputAccounts.length; j++) {
                    const regExp = new RegExp(`\\b${inputAccounts[j]}\\b`);
                    if(dirs[i].match(regExp) && !resAccounts.includes(dirs[i])) {
                        resAccounts.push(dirs[i]);
                    }
    
                }
            }
        } else {
            resAccounts = [...inputAccounts];
        }

        console.log(resAccounts);
        const children = [];
        for(let i = 0; i < resAccounts.length; i++) {
            const child_process = await this.#launchAccountTemp({account: resAccounts[i], type: type});
            children.push(child_process);
            await Helper.sleep(100);
        }
        console.log(chalk.black("-".repeat(40)));
        const answer = await InputManager.select({choices: ["Done"], message: "Enter to close accounts", });
        for(let i = 0; i < children.length; i++) {
            children[i].kill();
        };
    }

    async #launchAccountTemp({account, type = "main x3"}) {
        const accountExePath = path.resolve(this.#tgAccountsPath, type, String(account), "Telegram.exe");
        const child_process = await Helper.execFileTemp({srcPath: accountExePath});

        console.log(`Account ${account} ${chalk.green("launched")}`);
        return child_process; 
    }
    
    async updateTg({accounts = [], } = {}) {
        const extra1AccountsPath = path.resolve(this.#tgAccountsPath, "extra x1", );
        const extra1Accounts = await FsManager.readDir({srcPath: extra1AccountsPath, });

        const extra3AccountsPath = path.resolve(this.#tgAccountsPath, "extra x3", );
        const extra3Accounts = await FsManager.readDir({srcPath: extra3AccountsPath, });

        const main1AccountsPath = path.resolve(this.#tgAccountsPath, "main x1", );
        const main1Accounts = await FsManager.readDir({srcPath: main1AccountsPath, });

        const main3AccountsPath = path.resolve(this.#tgAccountsPath, "main x3", );
        const main3Accounts = await FsManager.readDir({srcPath: main3AccountsPath, });

        console.log({
            extra1Accounts,
            extra3Accounts,
            main1Accounts,
            main3Accounts
        })

        await Promise.all(extra1Accounts.map(async account => {
            await FsManager.copyFile({
                srcPath: path.resolve(this.#tgAccountsPath, "Telegram.exe"),
                destPath: path.resolve(this.#tgAccountsPath, "extra x1", account, "Telegram.exe")
            });
        }))

        await Promise.all(extra3Accounts.map(async account => {
            await FsManager.copyFile({
                srcPath: path.resolve(this.#tgAccountsPath, "Telegram.exe"),
                destPath: path.resolve(this.#tgAccountsPath, "extra x3", account, "Telegram.exe")
            });
        }))

        await Promise.all(main1Accounts.map(async account => {
            await FsManager.copyFile({
                srcPath: path.resolve(this.#tgAccountsPath, "Telegram.exe"),
                destPath: path.resolve(this.#tgAccountsPath, "main x1", account, "Telegram.exe")
            });
        }))

        await Promise.all(main3Accounts.map(async account => {
            await FsManager.copyFile({
                srcPath: path.resolve(this.#tgAccountsPath, "Telegram.exe"),
                destPath: path.resolve(this.#tgAccountsPath, "main x3", account, "Telegram.exe")
            });
        }))
        Logger.done(this.updateTg.name);
    }
}


module.exports = TgManager;




