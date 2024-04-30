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

    static async createFarm({destPath, farmPath}) {
        farmPath = farmPath.replace("farm", "newFarm_");
        console.log(777, farmPath)
        const isExist = await FsManager.isExist({srcPath: farmPath});
        if(isExist) {
            await FsManager.remove({srcPath: farmPath});
        }
        const res = await FsManager.makeDir({destPath: farmPath}); 

        const mainAvatarsActivePath = path.resolve(farmPath, "data", "main", "images", "avatars", "active");
        const mainAvatarsDraftPath = path.resolve(farmPath, "data", "main", "images", "avatars", "draft");
        const mainBackgroundsActivePath = path.resolve(farmPath, "data", "main", "images", "backgrounds", "active");
        const mainBackgroundsDraftPath = path.resolve(farmPath, "data", "main", "images", "backgrounds", "draft");

        const extraAvatarsActivePath = path.resolve(farmPath, "data", "extra", "images", "avatars", "active");
        const extraAvatarsDraftPath = path.resolve(farmPath, "data", "extra", "images", "avatars", "draft");
        const extraBackgroundsActivePath = path.resolve(farmPath, "data", "extra", "images", "backgrounds", "active");
        const extraBackgroundsDraftPath = path.resolve(farmPath, "data", "extra", "images", "backgrounds", "draft");

        const tgAccountsPath = path.resolve(farmPath, "tg", "accounts");
        const tgDraftPath = path.resolve(farmPath, "tg", "draft");
        const tgImportNewPath = path.resolve(farmPath, "tg", "import", "new");
        const tgImportOldPath = path.resolve(farmPath, "tg", "import", "old");
        const exportPath = path.resolve(farmPath, "tg", "export");

        const res2 = await Promise.all([
            FsManager.makeDir({destPath: mainAvatarsActivePath}),
            FsManager.makeDir({destPath: mainAvatarsDraftPath}),
            FsManager.makeDir({destPath: mainBackgroundsActivePath}),
            FsManager.makeDir({destPath: mainBackgroundsDraftPath}),

            FsManager.makeDir({destPath: extraAvatarsActivePath}),
            FsManager.makeDir({destPath: extraAvatarsDraftPath}),
            FsManager.makeDir({destPath: extraBackgroundsActivePath}),
            FsManager.makeDir({destPath: extraBackgroundsDraftPath}),

            FsManager.makeDir({destPath: path.resolve(tgAccountsPath, "extra x1")}),
            FsManager.makeDir({destPath: path.resolve(tgAccountsPath, "extra x3")}),
            FsManager.makeDir({destPath: path.resolve(tgAccountsPath, "main x1")}),
            FsManager.makeDir({destPath: path.resolve(tgAccountsPath, "main x3")}),

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