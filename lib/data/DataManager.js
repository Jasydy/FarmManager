const ImageManager = require("./ImageManager.js");

class DataManager {
    static #ImageManager = ImageManager;
    
    static async enumImages({activeImagesPath, draftImagesPath}) {
        const res = await this.#ImageManager.enumImages({activeImagesPath, draftImagesPath});
        return res;
    }
}

module.exports = DataManager;