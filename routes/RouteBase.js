"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
// Define a base class for routes
var RouteBase = /** @class */ (function () {
    // Define a constructor that takes a path as an argument
    function RouteBase(path) {
        // Initialize an instance of the express Router
        this.router = (0, express_1.Router)();
        // Assign the path argument to the path property
        this.path = path;
    }
    return RouteBase;
}());
exports.default = RouteBase;
