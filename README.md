# logger
A configurable nodejs logger.
## Install
```
npm install simple-nodejs-logger --save
```

### How to use
```javascript
let logger = require("simple-nodejs-logger")("MyLoggerName");
logger.log("Hello World!");
// [MyLoggerName] At myFile:myFunction:2 => Hello World
logger.warn("This is an error");
// [MyLoggerName] At myFile:myFunction:2 => This is an error (in red)
logger.assert(true,"Assert true");
// 
logger.assert(false,"Assert false")
// Throws assertion error. [MyLoggerName] Assert false
``` 
### Configuration in code.
```javascript
let options = {
    enable: true,
    stack: false,
    all: true,
    logs: true,
    asserts: true,
    warnings: true,
    colour: true,
    loggers: []
};
let logger = require("simple-nodejs-logger");
logger.options(options);
```
### Configuration through command line parameters
 *  `--logger-enable <boolean>`
 *  `--logger-stack <boolean>`
 *  `--logger-all <boolean>`
 *  `--logger-logs <boolean>`
 *  `--logger-asserts <boolean>`
 *  `--logger-warnings <boolean>`
 *  `--logger-colour <boolean>`
 *  `--logger-loggers <count> <String1> <String2> ...`
 
### Configuration documentation.  
*  `enable: <boolean> To enable logging in general. If this is false all other options will be ignored and there won't be anything logged. Default : true.`
*  `stack: <boolean> To enable stack information, the line and function where the logger was called. Default: false. WARNING! Expensive operation do not use in production.`
*  `all: <boolean> To enable all loggers. Default: true, except when loggers is not empty.`
*  `logs: <boolean> To enable default logging. Default: true.`
*  `asserts: <boolean> To enable assertion logging. If enabled all asserts will be logged even if the other loggers are not enabled. Default: true. This may not work if the built-in assertions flags are disabled.`
*  `warnings: <boolean> To enable warning logging. Default: true.`
*  `colours: <boolean> To enable colours in logging. Default: true.`
*  `loggers: <Array> If not all loggers enabled, this array should contain the name of the enabled loggers.`

