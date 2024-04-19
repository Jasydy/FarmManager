const prompts = require("prompts");
const chalk = require("chalk");
const {InputManagerError, } = require("./errors.js");

class InputManager {
    static async select({choices, message = "Pick an option: "}) {
        try {
            const {choice, } = await prompts({
                type: "select",
                name: "choice",
                message: chalk.yellow(message),
                choices,
            });
            return choices[choice];
        } catch(err) {
            throw new InputManagerError(err);
        }
    }

    static async input({message = "Enter something: "}) {
        try {
            const {inputContent, } = await prompts({
                type: "text",
                name: "inputContent",
                message: chalk.yellow(message),
            });
            return inputContent
        } catch(err) {
            throw new InputManagerError(err);
        }
    }
}

module.exports = InputManager;