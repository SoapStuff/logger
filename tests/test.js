const logger = require("../index");

require("simple-tests-js").run({
    test1: function () {
        let logger1 = logger("Logger1");
        logger1.log("This is a log");
        logger1.warning("This is a warning");
        try {
            logger1.assert(false, "This is an assertion")
        } catch (error) {
            logger1.warning(error)
        }
        logger1.assert(true,"You can't see this!");

        let logger2 = logger("Logger2");
        logger2.log("This is a log of logger 2");
    }
}, "loggerTest");