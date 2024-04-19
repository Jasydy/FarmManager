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

    async exportAccounts() {
        let accounts;

        const answer = await InputManager.select({choices: ["All", "Specific", ], message: "What accounts to export?"});
        switch(answer) {
            case("All"): {
                accounts = await FsManager.readDir({srcPath: this.#tgAccountsPath});
                break;
            }
            default: {
                accounts = await InputManager.input({message: "Enter accounts: "});
                accounts = Helper.correctAccounts({accounts, });
                break;
            }
        }
        const exportUnits = await FsManager.readDir({srcPath: this.#tgExportPath});
        const exportDirName = exportUnits.length + 1;

        accounts = accounts.filter(account => account.match(/^\d+$/g));
        console.log(accounts);

        const zip = new AdmZip();
        for(let i = 0; i < accounts.length; i++) {
            await zip.addLocalFolderPromise(path.resolve(this.#tgAccountsPath, accounts[i], "tdata"), {
                zipPath: `${accounts[i]}/tdata`,
            });
            console.log(`Account ${accounts[i]} ${chalk.green("done")}`);
            // zip.addLocalFile("Telegram.exe", `${tgAccs[i]}`)
        }

        console.log("Finalizing...")
        await zip.addLocalFolderPromise(path.resolve(this.#tgAccountsPath, "___"), {
            zipPath: `___`,
        })
        await zip.writeZipPromise(path.resolve(this.#tgExportPath, `Accounts ${exportDirName}.zip`));
        console.log(`${chalk.green("Exported")} to ${chalk.magenta("Accounts " + exportDirName + ".zip")}`)
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

    async launchAccounts({accounts}) {
        const accountsArr = Helper.correctAccounts({accounts, });
        console.log(accountsArr);
        for(let i = 0; i < accountsArr.length; i++) {
            await this.#launchAccount({account: accountsArr[i]});
        }
        console.log(chalk.black("-".repeat(40)))
    }

    async #launchAccount({account}) {
        const accountExePath = path.resolve(this.#tgAccountsPath, String(account), "Telegram.exe");
        const res = await Helper.execFile({srcPath: accountExePath});

        console.log(`Account ${account} ${chalk.green("launched")}`);
        return true;
    }
    async launchAccountsTemp({accounts}) {
        const accountsArr = Helper.correctAccounts({accounts, });
        console.log(accountsArr);
        for(let i = 0; i < accountsArr.length; i++) {
            await this.#launchAccountTemp({account: accountsArr[i]});
        }
        console.log(chalk.black("-".repeat(40)))
    }

    async #launchAccountTemp({account}) {
        const accountExePath = path.resolve(this.#tgAccountsPath, String(account), "Telegram.exe");
        const res = await Helper.execFileTemp({srcPath: accountExePath});

        console.log(`Account ${account} ${chalk.green("launched")}`);
        return true;
    }
    

    async updateTg({accounts = [], } = {}) {
        if(accounts.length == 0) {
            accounts = await FsManager.readDir({srcPath: this.#tgAccountsPath});
            accounts = accounts.filter(dir => dir.match(/^\d+$/g));
        }

        await Promise.all(accounts.map(async account => {
            FsManager.copyFile({
                srcPath: path.resolve(this.#tgAccountsPath, "___", "Telegram.exe"),
                destPath: path.resolve(this.#tgAccountsPath, account, "Telegram.exe"),
            });
        }));
        Logger.done(this.updateTg.name);
    }
}


module.exports = TgManager;




