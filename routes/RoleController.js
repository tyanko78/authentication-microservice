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
var express_1 = require("express");
var logger_1 = require("../helpers/logger");
var auth_1 = require("../middleware/auth");
var roles_1 = require("../models/roles");
// Define a class for the Role controller
var RoleController = /** @class */ (function () {
    // Define a constructor that initializes the roles and routes
    function RoleController() {
        // Define the path for the Role routes
        this.path = '/role';
        // Initialize an instance of the express Router
        this.router = (0, express_1.Router)();
        this.initialiseRoles();
        this.initialiseRoutes();
    }
    // This method initializes the roles in the database
    // It checks if there are any roles, and if not, it creates a SuperAdmin role
    RoleController.prototype.initialiseRoles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hasRoles, superAdmin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roles_1.default.countDocuments({})];
                    case 1:
                        hasRoles = (_a.sent()) > 0;
                        if (hasRoles)
                            return [2 /*return*/];
                        superAdmin = new roles_1.default({
                            role_no: 0,
                            name: 'SuperAdmin',
                            description: 'Highest user level, this account can do anything.',
                        });
                        return [4 /*yield*/, superAdmin.save()];
                    case 2:
                        _a.sent();
                        (0, logger_1.default)(0, 'SuperAdmin role has been created.');
                        return [2 /*return*/];
                }
            });
        });
    };
    // This method initializes the routes for this controller
    // It sets up GET and POST routes for the /role path
    RoleController.prototype.initialiseRoutes = function () {
        this.router.get(this.path, auth_1.default, this.getRoles.bind(this));
        this.router.post(this.path, auth_1.default, this.createRole.bind(this));
    };
    // This method handles GET requests to the /role route
    // It retrieves all the roles from the database and sends them in the response
    RoleController.prototype.getRoles = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var roles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roles_1.default.find({})];
                    case 1:
                        roles = _a.sent();
                        res.status(200).json({ roles: roles });
                        return [2 /*return*/];
                }
            });
        });
    };
    // This method handles POST requests to the /role route
    // It creates a new role with the data from the request body and saves it to the database
    RoleController.prototype.createRole = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var roleData, newRole;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        roleData = req.body;
                        newRole = new roles_1.default(roleData);
                        return [4 /*yield*/, newRole.save()];
                    case 1:
                        _a.sent();
                        res.status(201).json({ role: newRole });
                        return [2 /*return*/];
                }
            });
        });
    };
    return RoleController;
}());
exports.default = RoleController;
