"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var mongoose_1 = require("mongoose");
var RouteBase_1 = require("./RouteBase");
var auth_1 = require("../middleware/auth");
var tenants_1 = require("../models/tenants");
var user_1 = require("../models/user");
var logger_1 = require("../helpers/logger");
// Get MULTI_TENANCY from environment variables
var MULTI_TENANCY = process.env.MULTI_TENANCY;
// TenantController class extends RouteBase
var TenantController = /** @class */ (function (_super) {
    __extends(TenantController, _super);
    function TenantController() {
        // Call parent constructor with the path
        var _this = _super.call(this, '/tenant') || this;
        // If MULTI_TENANCY is not set or set to 'false', return
        if (!MULTI_TENANCY || (MULTI_TENANCY === null || MULTI_TENANCY === void 0 ? void 0 : MULTI_TENANCY.toLowerCase()) === 'false')
            return _this;
        // Initialise endpoints
        _this.initialiseEndpoints();
        return _this;
    }
    // Method to initialise endpoints
    TenantController.prototype.initialiseEndpoints = function () {
        // Create tenant endpoint
        this.router.post(this.path, auth_1.default, this.createTenant);
        // Read tenants endpoints
        this.router.get(this.path + 's', auth_1.default, this.readTenants);
        this.router.post(this.path + 's', auth_1.default, this.readTenants);
        this.router.get(this.path + '/:id', auth_1.default, this.readTenants);
        // Update tenant endpoint
        this.router.put(this.path + '/:id', auth_1.default, this.updateTenant);
        // Delete tenant endpoint
        this.router.delete(this.path + '/:id', auth_1.default, this.deleteTenant);
    };
    // Method to create a tenant
    TenantController.prototype.createTenant = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var role, name, exists, tenant, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        role = ((req === null || req === void 0 ? void 0 : req.user) || {}).role;
                        name = ((req === null || req === void 0 ? void 0 : req.body) || {}).name;
                        if (role > 0) {
                            return [2 /*return*/, res
                                    .status(403)
                                    .json({ status: 403, success: false, message: 'This action requires a higher level of authentication.' })];
                        }
                        if (!name) {
                            return [2 /*return*/, res.status(400).json({ status: 400, success: false, message: 'Missing name from body.' })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, tenants_1.default.exists({ name: name })];
                    case 2:
                        exists = _a.sent();
                        if (exists) {
                            return [2 /*return*/, res.status(400).json({ status: 400, success: false, message: 'Tenant with this name already exists.' })];
                        }
                        tenant = new tenants_1.default({ name: name });
                        return [4 /*yield*/, tenant.save()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({ status: 200, success: true, message: 'Success.', tenant: tenant })];
                    case 4:
                        err_1 = _a.sent();
                        (0, logger_1.default)(2, err_1);
                        return [2 /*return*/, res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Method to read tenants
    TenantController.prototype.readTenants = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var role, id, _a, limit, page, search, sort, tenant, err_2, query, _b, tenantCount, tenants, err_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        role = ((req === null || req === void 0 ? void 0 : req.user) || {}).role;
                        id = ((req === null || req === void 0 ? void 0 : req.params) || {}).id;
                        _a = (req === null || req === void 0 ? void 0 : req.body) || {}, limit = _a.limit, page = _a.page, search = _a.search, sort = _a.sort;
                        if (role > 0) {
                            return [2 /*return*/, res
                                    .status(403)
                                    .json({ status: 403, success: false, message: 'This action requires a higher level of authentication.' })];
                        }
                        if (!id) return [3 /*break*/, 4];
                        if (!mongoose_1.Types.ObjectId.isValid(id)) {
                            return [2 /*return*/, res.status(404).json({ status: 404, success: false, message: 'Not found.' })];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, tenants_1.default.findById(id)];
                    case 2:
                        tenant = _c.sent();
                        return [2 /*return*/, res.status(200).json({ status: 200, success: true, message: 'Success.', data: tenant })];
                    case 3:
                        err_2 = _c.sent();
                        (0, logger_1.default)(2, err_2);
                        return [2 /*return*/, res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })];
                    case 4:
                        query = {};
                        if (search)
                            query.name = { $regex: search, $options: 'i' };
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, Promise.all([
                                tenants_1.default.find(query).count(),
                                tenants_1.default.find(query)
                                    .sort(sort)
                                    .limit(limit || 0)
                                    .skip((page || 0) * (limit || 0)),
                            ])];
                    case 6:
                        _b = _c.sent(), tenantCount = _b[0], tenants = _b[1];
                        return [2 /*return*/, res
                                .status(200)
                                .json({ status: 200, success: true, message: 'Success.', data: tenants, count: tenantCount })];
                    case 7:
                        err_3 = _c.sent();
                        (0, logger_1.default)(2, err_3);
                        return [2 /*return*/, res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Method to update a tenant
    TenantController.prototype.updateTenant = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, name, status, role, valid, updatedRecord, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = ((req === null || req === void 0 ? void 0 : req.params) || {}).id;
                        _a = (req === null || req === void 0 ? void 0 : req.body) || {}, name = _a.name, status = _a.status;
                        role = ((req === null || req === void 0 ? void 0 : req.user) || {}).role;
                        if (role > 0) {
                            return [2 /*return*/, res
                                    .status(403)
                                    .json({ status: 403, success: false, message: 'This action requires a higher level of authentication.' })];
                        }
                        if (!id)
                            return [2 /*return*/, res.status(400).json({ status: 400, success: false, message: 'Missing id param.' })];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, tenants_1.default.findByIdAndUpdate(id, { name: name, status: status })];
                    case 2:
                        valid = _b.sent();
                        if (!valid)
                            return [2 /*return*/, res.status(404).json({ status: 404, success: false, message: 'Not found.' })];
                        return [4 /*yield*/, tenants_1.default.findById(id)];
                    case 3:
                        updatedRecord = _b.sent();
                        return [2 /*return*/, res.status(200).json({ status: 200, success: true, message: 'Success.', data: updatedRecord })];
                    case 4:
                        err_4 = _b.sent();
                        (0, logger_1.default)(2, err_4);
                        return [2 /*return*/, res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Method to delete a tenant
    TenantController.prototype.deleteTenant = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, role, valid, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = ((req === null || req === void 0 ? void 0 : req.params) || {}).id;
                        role = ((req === null || req === void 0 ? void 0 : req.user) || {}).role;
                        if (role > 0) {
                            return [2 /*return*/, res
                                    .status(403)
                                    .json({ status: 403, success: false, message: 'This action requires a higher level of authentication.' })];
                        }
                        if (!id)
                            return [2 /*return*/, res.status(400).json({ status: 400, success: false, message: 'Missing id param.' })];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                tenants_1.default.findByIdAndUpdate(id, { status: 0 }),
                                user_1.default.updateMany({ tenant: id }, { status: 0 }),
                            ])];
                    case 2:
                        valid = (_a.sent())[0];
                        if (!valid)
                            return [2 /*return*/, res.status(404).json({ status: 404, success: false, message: 'Not found.' })];
                        return [2 /*return*/, res.status(200).json({ status: 200, success: true, message: 'Success.' })];
                    case 3:
                        err_5 = _a.sent();
                        (0, logger_1.default)(2, err_5);
                        return [2 /*return*/, res.status(500).json({ status: 500, success: false, message: 'Internal server error.' })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return TenantController;
}(RouteBase_1.default));
exports.default = TenantController;
