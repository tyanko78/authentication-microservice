"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var cors_1 = require("cors");
var logger_1 = require("../helpers/logger");
// Extract necessary environment variables
var _a = process.env, MICROSERVICE_NAME = _a.MICROSERVICE_NAME, EXTERNAL_PORT = _a.EXTERNAL_PORT, INTERNAL_PORT = _a.INTERNAL_PORT, BASE_HOST = _a.BASE_HOST, npm_package_version = _a.npm_package_version;
// Define a class for the microservice
var Microservice = /** @class */ (function () {
    // Define a constructor that takes an array of controllers as an argument
    function Microservice(controllers) {
        var _this = this;
        // Initialize an instance of the express app
        this.app = (0, express_1.default)();
        // Use the json middleware to parse JSON request bodies
        this.app.use((0, body_parser_1.json)());
        // Use the urlencoded middleware to parse URL-encoded request bodies
        this.app.use((0, body_parser_1.urlencoded)({ extended: true }));
        // Use the cors middleware to enable CORS
        this.app.use((0, cors_1.default)({
            credentials: true,
            origin: function (origin, callback) {
                // If there is no origin, call the callback function with false as the second argument
                if (!origin)
                    return callback(null, false);
                // Extract the hostname from the origin
                var hostname = new URL(origin).hostname;
                // Define an array of allowed origins
                var allowedOrigins = __spreadArray(__spreadArray([], BASE_HOST.split(','), true), ['localhost'], false);
                // Call the callback function with true as the second argument if the hostname is in the array of allowed origins
                callback(null, allowedOrigins.includes(hostname));
            },
        }));
        // Set up a route that matches all HTTP methods and paths and calls the allDefaultMessage method
        this.app.all('/', this.allDefaultMessage);
        // For each controller in the array of controllers, use its router with the express app
        controllers.forEach(function (controller) { return _this.app.use('/', controller.router); });
        // Start the server on the internal port and log a message
        this.server = this.app.listen(INTERNAL_PORT, function () {
            (0, logger_1.default)(0, "Microservice (".concat(MICROSERVICE_NAME, " - v").concat(npm_package_version, ") started. ").concat(INTERNAL_PORT, ":").concat(EXTERNAL_PORT));
        });
    }
    // Define a method that returns a default message
    Microservice.prototype.allDefaultMessage = function (req, res) {
        // Log a message
        (0, logger_1.default)(0, 'Returning default message.');
        // Return a response with a status of 200 and a JSON body
        return res.status(200).json({
            name: "".concat(MICROSERVICE_NAME, " Microservice"),
            version: npm_package_version,
            success: true,
            message: "This microservice is running as expected.",
        });
    };
    return Microservice;
}());
exports.default = Microservice;
