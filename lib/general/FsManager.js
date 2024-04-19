const chalk = require("chalk");
const fs = require("fs-extra");

const {FsManagerError, } = require("./errors.js");
const Helper = require("./Helper.js");

class FsManager {
    static async move({srcPath, destPath}) {
        try {
            let res = await fs.move(srcPath, destPath, {overwrite: true, });
            while(true) {
                const isExist = await this.isExist({srcPath: destPath});
                if(isExist) {
                    break;
                } else {
                    await Helper.sleep(100);
                }
            }
            return true;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }
    
    static async readDir({srcPath, }) {
        try {
            const dirContent = await fs.readdir(srcPath);
            return dirContent;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async readFile({srcPath}) {
        try {
            let fileData = await fs.readFile(srcPath, "utf-8");
            return fileData;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async readFileToArr({srcPath, }) {
        try {
            let fileData = await fs.readFile(srcPath, "utf-8");
            fileData = fileData.split("\r\n").map(str => str.trim()).filter(str => str);
            return fileData;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async writeFile({destPath, data = ""}) {
        try {
            const res = await fs.writeFile(destPath, data);
            return true;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async isExist({srcPath}) {
        const isExist = await fs.exists(srcPath);
        return isExist;
    }

    static async copyDir({srcPath, destPath}) {
        try {
            const res = await fs.copy(srcPath, destPath);
            return true;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async copyFile({srcPath, destPath}) {
        try {
            const res = await fs.copyFile(srcPath, destPath);
            return true;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async rename({srcPath, destPath}) {
        try {
            const res = await fs.rename(srcPath, destPath);
            return true;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async makeDir({destPath}) {
        try {
            const res = await fs.mkdir(destPath, {recursive: true});
            return true;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async makeFile({destPath, }) {
        try {
            const res = await fs.writeFile(destPath, "");
            return true;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }

    static async remove({srcPath, }) {
        try {
            const res = await fs.remove(srcPath, );
            return true;
        } catch(err) {
            throw new FsManagerError(err);
        }
    }
}

module.exports = FsManager;