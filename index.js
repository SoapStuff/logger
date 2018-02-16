const colours = require("colours-logger");

// HashMap of all the loggers.
const loggers = {};
// Global logging options.
const options = {
    stack: false,
    all: true,
    logs: true,
    asserts: true,
    warnings: true,
    colour: true,
    loggers: []
};

/**
 * The logger class the contains all the method for logging an object.
 */
class Logger {

    /**
     * @constructor
     * @param {string} name
     */
    constructor(name) {
        if (typeof name !== "string") {
            throw new Error("Type mismatch, name should be a string.")
        }
        this.name = name;
        loggers[name] = this;
    }

    /**
     * Logs the object if the assertion failed, only when assertions are enabled in the options or all logging is enabled in options.
     * @param {*} assertion The expression that evaluates to a truthy or falsy value
     * @param {*} object The object to log to the console.
     */
    assert(assertion, object) {
        if (options.asserts) {
            let string = this._getString_(object, 'red', false);
            console.assert(assertion, string)
        }
    }

    /**
     * Logs the given object to console, only when logging is enabled in the options and the current logger is enabled in the options.
     * @param {*} object the object to log.
     */
    log(object) {
        if ((options.all || options.loggers.indexOf(this.name) > -1) && options.logs) {
            let string = this._getString_(object, 'black', options.colour);
            console.log(string)
        }
    }

    /**
     * Logs the given object, only when the warnings are enabled in the options and the current logger is enabled in the options.
     * @param {*} object
     */
    warning(object) {
        if ((options.all || options.loggers.indexOf(this.name) > -1) && options.warnings) {
            let string = this._getString_(object, 'red', options.colour);
            console.log(string)
        }
    }

    /**
     * Gets the formatted string
     * @param {*} object the object to log.
     * @param {*} color the color to log in.
     * @param {boolean} useColour if to use the colour.
     * @return {string}
     * @private
     */
    _getString_(object, color, useColour) {
        if (useColour) {
            if (options.stack) {
                return colours.formatter(`[@{${color}}${this.name}@{!${color}}]@{${color}} At ${__from_file}:${__from_function}:${__from_line} => ${object}@{!${color}}`);
            }
            return colours.formatter(`[@{${color}}${this.name}@{!${color}}] @{${color}}${object}@{!${color}}`);
        } else {
            if (options.stack) {
                return `[${this.name}] At ${__from_file}:${__from_function}:${__from_line} => ${object}`;
            }
            return `[${this.name}] ${object}`;
        }
    }
}

/**
 * Get a new logger with the given name.
 * If no name is specified the default logger is returned.
 * @param {string} [name] The logger name
 * @return {Logger}
 */
module.exports = function (name) {
    if (!name) {
        return loggers.default;
    }
    if (typeof name !== "string") {
        throw new Error("Name must be a string");
    }
    if (!loggers[name]) {
        loggers[name] = new Logger(name);
    }
    return loggers[name];
};

/**
 * Sets the global logging options.
 * options = {
 *  enable: <boolean> To enable logging in general. If this is false all other options will be ignored and there won't be anything logged. Default : true.
 *  stack: <boolean> To enable stack information, the line and function where the logger was called. Default: false. WARNING! Expensive operation do not use in production.
 *  all: <boolean> To enable all loggers. Default: true, except when loggers is not empty.
 *  logs: <boolean> To enable default logging. Default: true.
 *  asserts: <boolean> To enable assertion logging. Default: true.
 *  warnings: <boolean> To enable warning logging. Default: true.
 *  colours: <boolean> To enable colours in logging. Default: true.
 *  loggers: <Array> If not all loggers enabled, this array should contain the name of the enabled loggers.
 *  }
 * @param {*} json The json objects with the options.
 */
module.exports.options = setOptions = function (json) {
    /** @namespace json.enable */

    if (json.enable === false) {
        options.all = false;
        options.logs = false;
        options.warnings = false;
        options.asserts = false;
        return;
    }

    if (typeof json.stack === "boolean") {
        options.stack = json.stack;
        if (options.stack) {
            enableStack();
            console.log(colours.formatter("[nodejs-logger]@{red} Stack enabled, this may decrease performance!! @{!red}"));
        } else {
            disableStack();
        }
    }

    if (typeof json.all === "boolean") {
        options.all = json.all
    }
    if (typeof json.asserts === "boolean") {
        options.asserts = json.asserts;
    }
    if (typeof json.warnings === "boolean") {
        options.warnings = json.warnings;
    }
    if (typeof json.logs === "boolean") {
        options.logs = json.logs;
    }
    if (typeof json.colour === "boolean") {
        options.colour = json.colour;
    }
    if (json.loggers instanceof Array) {
        if (json.all === undefined) options.all = false;
        options.loggers = json.loggers;
    }
};

/**
 * Initializes the global variable for the stack line and stack functions.
 * WARNING expensive operations.
 */
function enableStack() {
    //https://stackoverflow.com/questions/14172455/get-name-and-line-of-calling-function-in-node-js/14172822
    Object.defineProperty(global, '__stack', {
        get: function () {
            let orig = Error.prepareStackTrace;
            Error.prepareStackTrace = function (_, stack) {
                return stack;
            };
            let err = new Error;
            Error.captureStackTrace(err, arguments.callee);
            let stack = err.stack;
            Error.prepareStackTrace = orig;
            return stack;
        }
    });

    Object.defineProperty(global, '__from_line', {
        get: function () {
            return __stack[3].getLineNumber();
        }
    });

    Object.defineProperty(global, '__from_function', {
        get: function () {
            return __stack[3].getFunctionName() || 'anonymous';
        }
    });

    Object.defineProperty(global, '__from_file', {
        get: function () {
            let file = __stack[3].getFileName();
            let index = file.lastIndexOf('\\');
            return index > -1 ? file.substr(index + 1) : file;
        }
    });
}

/**
 * Disables the stack global variables.
 */
function disableStack() {
    Object.defineProperty(global, '__stack', {
        get: function () {
            return null;
        }
    });
}

/**
 * Sets the global logging options through the process.argv arguments using flags.
 *  --logger-enable: <boolean>
 *  --logger-stack: <boolean>
 *  --logger-all: <boolean>
 *  --logger-logs: <boolean>
 *  --logger-asserts: <boolean>
 *  --logger-warnings: <boolean>
 *  --logger-colour: <boolean>
 *  --logger-loggers: <count> <String1> <String2> ...
 */
(function init() {
    loggers.default = new Logger("Logger");

    const args = process.argv;
    const prefix = "--logger-";
    const options = {};

    getBooleanOption("enable");
    getBooleanOption("stack");
    getBooleanOption("all");
    getBooleanOption("logs");
    getBooleanOption("asserts");
    getBooleanOption("warnings");
    getBooleanOption("colour");
    getArrayOption("loggers");


    function getArrayOption(_option) {
        const option = prefix + _option;
        const index = args.indexOf(option);

        if (index > -1) {
            let total = parseInt(args[index + 1]);
            if (isNaN(total)) total = 0;
            if (total <= 0) {
                console.log(colours.formatter(`[nodejs-logger]@{red} Invalid argument ${option}:${total} @{!red}`));
            } else {
                options[_option] = args.slice(index + 2, index + 2 + total);
            }
        }
    }

    function getBooleanOption(_option) {
        const option = prefix + _option;
        const index = args.indexOf(option);
        if (index > -1) {
            const value = args[index + 1];
            if (value !== "true" && value !== "false") {
                console.log(colours.formatter(`[nodejs-logger]@{red} Invalid argument ${option}:${value} @{!red}`));
            } else {
                options[_option] = value === "true";
            }
        }
    }

    setOptions(options);
})();