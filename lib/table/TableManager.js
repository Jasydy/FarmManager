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
}

module.exports = TableManager;