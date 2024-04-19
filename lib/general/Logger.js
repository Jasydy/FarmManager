const chalk = require("chalk");

class Logger {
    static done(functionName, message = "") {
        console.log(chalk.green.bold("Done:"), `${functionName}. ${message}`);
    }

}

module.exports = Logger;