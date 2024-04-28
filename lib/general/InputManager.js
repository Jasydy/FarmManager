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

    static async number({message =  "Enter something: "}) {
        try {
            const {inputNum, } = await prompts({
                type: "number",
                name: "inputNum",
                message: chalk.yellow(message),
            });
            return inputNum;
        } catch(err) {
            throw new InputManagerError(err);
        }
    }

    static async multiselectAll({choices, message = "Pick an option: "}) {
        try {
            choices = ["all", ...choices];
            const {choice, } = await prompts({
                type: "multiselect",
                name: "choice",
                message: chalk.yellow(message),
                choices,
                
            });
            if(choice[0] == 0) {
                return choices.filter(item => item.match(/\d/g));
            }
            return choice.map(item => choices[item]);
        } catch(err) {
            throw new InputManagerError(err);
        }
    }
}

module.exports = InputManager;