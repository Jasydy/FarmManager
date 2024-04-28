const FsManager = require("./../general/FsManager.js");
const path = require("path");
const Logger = require("./../general/Logger.js");

class ImageManager {
    static async enumImages({activeImagesPath, draftImagesPath}) {
        const [activeImages, draftImages] = await Promise.all([
            FsManager.readDir({srcPath: activeImagesPath}),
            FsManager.readDir({srcPath: draftImagesPath}),
        ]);

    
        let lastImageNum = Math.max(...activeImages.map(item => item.replace(/\.\w+$/g, "")));
        console.log("start:", lastImageNum)

        if(!isFinite(lastImageNum)) {
            lastImageNum = "1.2";
        }
        if(!String(lastImageNum).match(/\.\d/g)) {
            lastImageNum = String(lastImageNum) + ".0";
        }

        for(let i = 1; i < draftImages.length+1; i++) {
            let ext = path.extname(draftImages[i-1]).toLowerCase();
            const oldExt = ext;
            if(ext === ".jfif") {
                await FsManager.rename({
                    srcPath: path.resolve(draftImagesPath, draftImages[i-1]),
                    destPath: path.resolve(draftImagesPath, draftImages[i-1].replace(/\..+/, ".jpg")),
                })
                ext = ".jpg";
    
            }
            if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
                await FsManager.remove({srcPath: path.resolve(draftImagesPath, draftImages[i-1])});
                continue;
            }
            if(String(lastImageNum).includes(".0")) {
                lastImageNum = String(lastImageNum).replace(".0", ".1");
            } else if(String(lastImageNum).includes(".1")) {
                lastImageNum = String(lastImageNum).replace(".1", ".2");
            } else if(String(lastImageNum).includes(".2")) {
                lastImageNum = String((+lastImageNum + 1)).replace(".2", ".0")

            }
            await FsManager.rename({
                srcPath: path.resolve(draftImagesPath, draftImages[i-1]),
                destPath: path.resolve(activeImagesPath, lastImageNum + ext),
            });
        }
        Logger.done(this.enumImages.name)
    }

}

module.exports = ImageManager;
