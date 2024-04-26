const FsManager = require("./lib/general/FsManager.js");
const FarmManager = require("./lib/main/FarmManager.js");
const InputManager = require("./lib/general/InputManager.js");
const settings = require("./settings.js");

const chalk = require("chalk");

const path = require("path");
const cwd = process.cwd();

!async function main() {

    while(true) {
        const res = await startFarmManager();
        // process.exit(0);
    }

    async function startFarmManager() {
        const farmManager = new FarmManager(settings.farmPath);

        const topic = await InputManager.select(({
            choices: ["Tg", "Data", "Others", "..."],
            message: "Pick a topic: ",
        }));

        let actionChoices;
        switch(topic.trim()) {
            case("Tg"): {
                actionChoices = ["LaunchAccounts", "LaunchAccountsTemp", "Export", "UpdateTg", "..."];
                break;
            } 
            case("Data"): {
                actionChoices = ["EnumImages", "..."];
                break;
            } 
            case("Others"): {
                actionChoices = ["CorrectMnemoTG",  "CreateFarm", "CorrectProxyAccounts", "..."];
                break;
            }
            case("..."): {
                process.exit(0);
                break;
            }
            default: {
                console.log(chalk.red("No such action :'("));
                return false;
            }
        }

        const action = await InputManager.select(({
            choices: actionChoices,
            message: "Pick an action: ",
        }));

        const actionRes = await farmManager.act({action, });


        return true;
    }
}()