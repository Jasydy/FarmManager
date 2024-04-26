const ImageManager = require("./ImageManager.js");

class DataManager {
    static #ImageManager = ImageManager;
    
    static async enumImages({activeImagesPath, draftImagesPath, minImageNum}) {
        const res = await this.#ImageManager.enumImages({activeImagesPath, draftImagesPath, minImageNum});
        return res;
    }
}

module.exports = DataManager;