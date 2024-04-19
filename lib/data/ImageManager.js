const FsManager = require("./../general/FsManager.js");
const path = require("path");
const Logger = require("./../general/Logger.js");

class ImageManager {
    static async enumImages({activeImagesPath, draftImagesPath}) {
        const [activeImages, draftImages] = await Promise.all([
            FsManager.readDir({srcPath: activeImagesPath}),
            FsManager.readDir({srcPath: draftImagesPath}),
        ]);

    
        let lastImageNum = Math.max(...(activeImages.map(item => item.replace(/\..+/g, ""))));

        if(!Number.isFinite(lastImageNum)) {
            lastImageNum = 2;
        }


        for(let i = 0; i < draftImages.length; i++) {
            let ext = path.extname(draftImages[i]).toLowerCase();
            if(ext === ".jfif") {
                await FsManager.rename({
                    srcPath: path.resolve(draftImagesPath, draftImages[i]),
                    destPath: path.resolve(draftImagesPath, draftImages[i].replace(/\..+/, ".jpg")),
                })
                ext = ".jpg";
    
            }
            if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
                await FsManager.remove({srcPath: path.resolve(draftImagesPath, draftImages[i])});
                continue;
            }

            await FsManager.rename({
                srcPath: path.resolve(draftImagesPath, draftImages[i].replace(/\..+/, ".jpg")),
                destPath: path.resolve(activeImagesPath, (lastImageNum + i + 1) + ext),
            });
        }
        Logger.done(this.enumImages.name)
    }
}

module.exports = ImageManager;