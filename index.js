"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
// helpers
require("./config");
var logger_1 = require("./helpers/logger");
var database_1 = require("./helpers/database");
// routes
var express_1 = require("./routes/express");
var AuthController_1 = require("./routes/AuthController");
var UserController_1 = require("./routes/UserController");
var RoleController_1 = require("./routes/RoleController");
var APIKeyController_1 = require("./routes/APIKeyController");
var TenantController_1 = require("./routes/TenantController");
// enable environment variables
var dotenv = require("dotenv");
dotenv.config();
/**
 * Service class
 */
var Service = /** @class */ (function () {
    function Service() {
        var _this = this;
        this._initialiseDB()
            .then(function () {
            // initialise endpoints
            _this.app = new express_1.default([
                new AuthController_1.default(),
                new RoleController_1.default(),
                new UserController_1.default(),
                new APIKeyController_1.default(),
                new TenantController_1.default(),
            ]);
        })
            .catch(function (err) {
            (0, logger_1.default)(2, err);
            process.exit(110);
        });
    }
    /**
     * initialise the database
     */
    Service.prototype._initialiseDB = function () {
        return __awaiter(this, void 0, void 0, function () {
            var timeout, waitingLoop;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeout = 20 // number of seconds between each attempt
                        ;
                        waitingLoop = function (attempt) {
                            if (attempt === void 0) { attempt = 0; }
                            return __awaiter(_this, void 0, void 0, function () {
                                var err_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (attempt >= 3)
                                                throw new Error("Connection to database failed after ".concat(attempt, " attempts."));
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 6]);
                                            (0, logger_1.default)(0, "Attempting to connect to database.".concat(attempt ? " This is attempt number ".concat(attempt + 1, ".") : ''));
                                            return [4 /*yield*/, (0, database_1.default)()];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 6];
                                        case 3:
                                            err_1 = _a.sent();
                                            (0, logger_1.default)(1, "Connection to database failed. Attempting again in ".concat(timeout, " seconds."));
                                            (0, logger_1.default)(3, err_1);
                                            return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(undefined); }, timeout * 1000); })];
                                        case 4:
                                            _a.sent();
                                            return [4 /*yield*/, waitingLoop(attempt + 1)];
                                        case 5:
                                            _a.sent();
                                            return [3 /*break*/, 6];
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        return [4 /*yield*/, waitingLoop(0)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Service;
}());
exports.Service = Service;
new Service();
