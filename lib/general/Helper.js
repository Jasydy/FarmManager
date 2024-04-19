const chalk = require("chalk");
const AdmZip = require("adm-zip");
const childProcess = require("child_process");
const path = require("path");

const {ExecFileError, } = require("./errors.js");
const FsManager = require("./FsManager.js");
const Logger = require("./Logger.js");


class Helper {
    static async sleep(ms) {
        return new Promise(res => setTimeout(res, ms, ms));
    }

    static async createFarm({destPath}) {
        const farmPath = path.resolve(destPath, "farm");
        const isExist = await FsManager.isExist({srcPath: farmPath});
        if(isExist) {
            await FsManager.remove({srcPath: farmPath});
        }
        const res = await FsManager.makeDir({destPath: farmPath}); 

        const avatarsActivePath = path.resolve(farmPath, "data", "images", "avatars", "active");
        const avatarsDraftPath = path.resolve(farmPath, "data", "images", "avatars", "draft");
        const backgroundsActivePath = path.resolve(farmPath, "data", "images", "backgrounds", "active");
        const backgroundsDraftPath = path.resolve(farmPath, "data", "images", "backgrounds", "draft");

        const textPath = path.resolve(farmPath, "data", "text");

        const tgAccountsPath = path.resolve(farmPath, "tg", "accounts");
        const tgDraftPath = path.resolve(farmPath, "tg", "draft");
        const tgImportNewPath = path.resolve(farmPath, "tg", "import", "new");
        const tgImportOldPath = path.resolve(farmPath, "tg", "import", "old");
        const exportPath = path.resolve(farmPath, "tg", "export");

        const res2 = await Promise.all([
            FsManager.makeDir({destPath: avatarsActivePath}),
            FsManager.makeDir({destPath: avatarsDraftPath}),
            FsManager.makeDir({destPath: backgroundsActivePath}),
            FsManager.makeDir({destPath: backgroundsDraftPath}),
            FsManager.makeDir({destPath: textPath}),
            FsManager.makeDir({destPath: tgAccountsPath}),
            FsManager.makeDir({destPath: tgDraftPath}),
            FsManager.makeDir({destPath: tgImportNewPath}),
            FsManager.makeDir({destPath: tgImportOldPath}),
            FsManager.makeDir({destPath: exportPath}),
        ]);

        Logger.done(this.createFarm.name);
        return true;
    }

    static async execFile({srcPath, }) {
        try {
            const child_process = childProcess.spawn(srcPath, [], {
                detached: true,
                stdio: 'ignore'
              });
              
              // Unref the child process to allow the parent process to exit independently
              child_process.unref();
              return child_process;
        } catch(err) {
            throw(new ExecFileError(err));
        }
    }

    static async execFileTemp({srcPath, }) {
        try {
            const child_process = childProcess.execFile(srcPath);
            return child_process;
              
        } catch(err) {
            throw(new ExecFileError(err));
        }
    }

    static correctAccounts({accounts = ""}) {
        accounts = accounts.trim();

        let resAccounts = [];
        if(accounts.match(/^\d+$/g, )) {
            resAccounts.push(accounts);
            return resAccounts;
        }

        if(accounts.match(/-/g)) {
            const accountsArr = accounts.split(/\s*-\s*/);
            for(let i = 0; i < accountsArr[accountsArr.length - 1] - accountsArr[0] + 1; i++) {
                resAccounts.push(String(+accountsArr[0] + i))
            }
            return resAccounts;
        } 
        
        if(accounts.match(/,|\s/g, )) {
            resAccounts = accounts.split(/,|\s/);
            resAccounts = resAccounts.map(item => item.trim()).filter(item => item);
            return resAccounts;
        } 

        Logger.done(this.correctAccounts.name);
    }

    // static async zip({zipPath = "", zipData = []}) {
    //     let zip;
    //     if(zipPath) {
    //         zip = new AdmZip(zipPath);
    //     } else {
    //         zip = new AdmZip();
    //     }


    // }
}

module.exports = Helper;