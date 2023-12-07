"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing required modules
var fs = require("fs");
var node_cron_1 = require("node-cron");
var dotenv = require("dotenv");
// Loading environment variables
dotenv.config();
// Destructuring environment variables
var _a = process.env, LOG_LEVEL = _a.LOG_LEVEL, LOG_HISTORY = _a.LOG_HISTORY, LOG_NAME = _a.LOG_NAME;
// Defining log types and corresponding colors
var logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
var logColors = ['36m', '33m', '31m', '32m'];
// Parsing log count and level from environment variables
var logCount = parseInt(LOG_HISTORY || '7', 10);
var logLevel = parseInt(LOG_LEVEL || '0', 10);
// Scheduling a cron job to rotate logs at midnight every day
node_cron_1.default.schedule('0 0 * * *', function () {
    for (var _i = 0, logTypes_1 = logTypes; _i < logTypes_1.length; _i++) {
        var type = logTypes_1[_i];
        if (logTypes.indexOf(type) < logLevel)
            continue;
        var fileName = "./log/".concat(LOG_NAME, ".").concat(type.toLowerCase());
        for (var i = logCount; i >= 0; i--) {
            var logFile = "".concat(fileName, ".").concat(i === 0 ? '' : "".concat(i, "."), "log");
            if (!fs.existsSync(logFile))
                continue;
            // Add your log rotation logic here
        }
    }
});
// Exporting the log function
function log(type, message) {
    // If the log type is less than the log level, return
    if (type < logLevel)
        return;
    // Getting the current date and time
    var now = Date.now();
    var date = Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Europe/London',
    }).format(now);
    var time = Intl.DateTimeFormat('en-GB', { timeStyle: 'medium', hour12: false, timeZone: 'Europe/London' }).format(now);
    // Logging the message with type, date, and time
    console.log("[\u001B[".concat(logColors[type]).concat(logTypes[type]).concat('\x1b[0m', "] ").concat(date, " ").concat(time, " - ").concat(message, "\u001B[0m"));
    // Appending the message to the log file
    fs.appendFileSync("./log/".concat(LOG_NAME, ".").concat(logTypes[type].toLowerCase(), ".log"), "".concat(date, " ").concat(time, ": ").concat(message, "\r\n"));
}
exports.default = log;
