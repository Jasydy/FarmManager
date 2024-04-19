const chalk = require("chalk");

class ErrorRed extends Error {
    constructor(message) {
        super(message);
        this.name = chalk.red(this.constructor.name);
        this.message = chalk.blue(message);
    }
}

class FsManagerError extends ErrorRed{}
class InputManagerError extends ErrorRed{}
class ExecFileError extends ErrorRed{}
class ImportError extends ErrorRed{}

module.exports = {
    FsManagerError,
    InputManagerError,
    ExecFileError,
    ImportError,

}