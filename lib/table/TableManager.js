const FsManager = require("../general/FsManager.js");
const Logger = require("./../general/Logger.js");

class TableManager {
    static async correctTGMnemos({tgMnemoPath}) {
        const mnemos = await FsManager.readFile({srcPath: tgMnemoPath});
        let resMnemos = mnemos.replace(/\d|\./g, "").trim();
        await FsManager.writeFile({destPath: tgMnemoPath, data: resMnemos});
        Logger.done(this.correctTGMnemos.name);
        return resMnemos;
    }

    static async correctProxyAccounts({accountsPerProxy = 2, proxiesPath, resultsPath}) {
        const proxies = await FsManager.readFileToArr({srcPath: proxiesPath});
        let resStrAll = "";
        let resStrProxies = "";
        for(let i = 0; i < proxies.length; i++) {
            for(let j = 0; j < accountsPerProxy; j++) {
                resStrAll += `${(i*accountsPerProxy)+j+2}\t${proxies[i]}\n`;
                resStrProxies += `${proxies[i]}\n`;
            }
        }

        await FsManager.writeFile({destPath: resultsPath, data: `${resStrAll}${"-".repeat(90)}\n${resStrProxies}`})
    }
}

module.exports = TableManager;