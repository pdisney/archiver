
const fs = require('fs');
const path = require('path');

/**
 * Listen for uncaughtException
 **/
var handleUncaughtException = (err) => {
    console.error("[SERVER] Uncaught Exception: " + err);
    console.error("[SERVER] Stack Trace: " + err.stack, function (err) {
        process.exit(1);
    });
    return false;
}

/**
 * 
 * @param {*} dir 
 */
var dirExists = (dir) => {
    return new Promise((resolve) => {
        fs.exists(dir, (exists) => {
            return resolve(exists);
        })
    })
}
/**
 * 
 * @param {*} dir 
 */
var mkDir = (dir) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, (err) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            return resolve();
        });
    })
}



var loggingInit = async () => {
    var winston = require('winston');

    if (!global.config) {
        global.config = {};
    }

    global.config.log_level = process.env.LOG_LEVEL || "info";
    global.config.log_file_directory = process.env.LOG_FILE_DIRECTORY || path.join(__dirname, "/../../log");;

    var direxists = await dirExists(global.config.log_file_directory);
    if (!direxists) {
        await mkDir(global.config.log_file_directory)
    }


    var fileExceptionTransport = new (winston.transports.File)({
        name: "exception-log",
        filename: path.join(global.config.log_file_directory, '/exception.log'),
        json: false,
        handleExceptions: true,
        level: "error",
        maxsize: 5242880, //5MB
        maxFiles: 1000
    });


    var fileProcessTransport = new (winston.transports.File)({
        name: "process-log",
        filename: path.join(global.config.log_file_directory, 'process.log'),
        json: false,
        level: global.config.log_level,
        maxsize: 5242880, //5MB
        maxFiles: 1000
    });


    var consoleTransport = new (winston.transports.Console)({
        json: false,
        level: global.config.log_level
    });

    // log to console if running locally
    var transport = [];
    transport.push(fileExceptionTransport);
    transport.push(fileProcessTransport);
    transport.push(consoleTransport);
    if (global.config.redis_address) {
        transport.push(redisTransport);
    }
    global.logger = new (winston.Logger)({
        transports: transport,
        exitOnError: handleUncaughtException
    });


    global.logger.extend = function (target) {
        var self = this;
        ['log', 'profile', 'startTimer']
            .concat(Object.keys(logger.levels))
            .forEach(function (method) {
                console[method] = function () {
                    return logger[method].apply(logger, arguments);
                };
            });
    }

    global.logger.extend(console);
    var log = console.log;



    console.log = function hijacked_log(level) {
        if (arguments.length > 1 && level in this) {
            log.apply(this, arguments);

        } else {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('debug');
            log.apply(this, args);

        }
    }
    console.info("Logging Initialized");
    return;
};


module.exports.loggingInit = loggingInit;