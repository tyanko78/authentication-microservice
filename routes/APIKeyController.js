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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// base class
var RouteBase_1 = require("./RouteBase");
// packages
var jsonwebtoken_1 = require("jsonwebtoken");
// helpers
var logger_1 = require("../helpers/logger");
var auth_1 = require("../middleware/auth");
// models
var apikeys_1 = require("../models/apikeys");
var missingKeys_1 = require("../helpers/missingKeys");
// data
var JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
var RoleController = /** @class */ (function (_super) {
    __extends(RoleController, _super);
    function RoleController() {
        var _this = _super.call(this, '/api-key') || this;
        _this.initialiseRoutes();
        return _this;
    }
    RoleController.prototype.initialiseRoutes = function () {
        // get all keys
        this.router.get(this.path + 's', auth_1.default, this.getAllKeys.bind(this));
        this.router.post(this.path + 's', auth_1.default, this.getAllKeys.bind(this));
        this.router.post(this.path + '/query', auth_1.default, this.getAllKeys.bind(this));
        // interact with a specific key
        this.router.post(this.path, auth_1.default, this.postCreate.bind(this));
        this.router.post(this.path + '/gen/:id', auth_1.default, this.genKey.bind(this));
        this.router.get(this.path + '/:id', auth_1.default, this.getAllKeys.bind(this));
        this.router.post(this.path + '/:id', auth_1.default, this.getAllKeys.bind(this));
        this.router.put(this.path + '/:id', auth_1.default, this.putUpdateById.bind(this));
        this.router.delete(this.path + '/:id', auth_1.default, this.deleteDeleteById.bind(this));
    };
    /**
     * GET
     * Get a list of all keys or a specific key by ID
     * Provided key is owned by requester
     *
     * @param {Request} req Request
     * @param {Response} res Response
     * @returns {Response}
     */
    RoleController.prototype.getAllKeys = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, limit, _c, page, filters, count, keys, err_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (req.user.role > 1) {
                            (0, logger_1.default)(1, "".concat(req.user.username, " is not authorised to get users."));
                            return [2 /*return*/, res.status(401).json({ success: false, message: 'Unable to authenticate user.' })];
                        }
                        _a = req.body, _b = _a.limit, limit = _b === void 0 ? 0 : _b, _c = _a.page, page = _c === void 0 ? 0 : _c, filters = __rest(_a, ["limit", "page"]);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, apikeys_1.default.find(filters).countDocuments()];
                    case 2:
                        count = _d.sent();
                        return [4 /*yield*/, apikeys_1.default.find(filters)
                                .limit(limit)
                                .skip(page * limit)];
                    case 3:
                        keys = _d.sent();
                        res.status(200).json({ count: count, keys: keys, success: true, message: 'OK' });
                        (0, logger_1.default)(0, "Successfully returning ".concat(keys.length, " result").concat(keys.length === 1 ? '' : 's'));
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _d.sent();
                        (0, logger_1.default)(1, err_1);
                        res.status(500).json({ success: false, message: err_1 });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * POST
     * Generate a new JWT that can be used for a set time
     *
     * @param {Request} req Request
     * @param {Response} res Response
     * @returns {Response}
     */
    RoleController.prototype.genKey = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, owner, _a, life, key, token, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = req.params.id;
                        owner = req.user._id;
                        _a = req.body.life, life = _a === void 0 ? 604800 : _a;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, apikeys_1.default.findOne({ _id: id, owner: owner })];
                    case 2:
                        key = _b.sent();
                        if (!key) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'No key exists with this ID.',
                                })];
                        }
                        token = jsonwebtoken_1.default.sign({ key: { id: id } }, JWT_SECRET_KEY, { expiresIn: life });
                        return [2 /*return*/, res.status(200).json({
                                success: true,
                                message: 'OK',
                                key: token,
                            })];
                    case 3:
                        err_2 = _b.sent();
                        (0, logger_1.default)(1, err_2);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: err_2,
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * POST
     * Creates a user in the database.
     *
     * @param {Request} req Request
     * @param {Response} res Response
     * @returns {Response}
     */
    RoleController.prototype.postCreate = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, _role, _b, name, description, _c, role, error, key, err_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = req.user, owner = _a._id, _role = _a.role;
                        _b = req.body, name = _b.name, description = _b.description, _c = _b.role, role = _c === void 0 ? _role : _c;
                        error = (0, missingKeys_1.missingKeys)(['name'], req.body);
                        if (error.length) {
                            (0, logger_1.default)(1, "Missing ".concat(error.join(', '), " from body upon user creation request."));
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: "Missing ".concat(error.join(', '), " from body."),
                                })];
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        key = new apikeys_1.default({ owner: owner, name: name, description: description, role: Math.max(_role, role) });
                        return [4 /*yield*/, key.save()];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, res.status(200).json({
                                success: true,
                                message: 'Successfully created a new key.',
                                key: key,
                            })];
                    case 3:
                        err_3 = _d.sent();
                        (0, logger_1.default)(1, err_3);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: err_3,
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * PUT
     * Updates key data by ID.
     *
     * @param {Request} req Request
     * @param {Response} res Response
     * @returns {Response}
     */
    RoleController.prototype.putUpdateById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, name, description, role, key, isUser, isAdmin, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = req.params.id;
                        _a = req.body, name = _a.name, description = _a.description, role = _a.role;
                        if (!name && !description && !role) {
                            return [2 /*return*/, res.status(400).json({
                                    success: true,
                                    message: 'No update requested.',
                                })];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, apikeys_1.default.findById(id)];
                    case 2:
                        key = _b.sent();
                        if (!key) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'No key exists with this ID.',
                                })];
                        }
                        isUser = String(req.user._id) === String(key._id);
                        isAdmin = req.user.role <= 1;
                        if (!isUser && !isAdmin) {
                            (0, logger_1.default)(1, "Account does not have permissions to edit this key.");
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: 'You do not have permissions to edit this key.',
                                })];
                        }
                        if (name)
                            key.name = name;
                        if (description)
                            key.description = description;
                        if (role)
                            key.role = Math.max(req.user.role, role);
                        return [4 /*yield*/, key.save()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, res.status(200).json({
                                key: key.toObject(),
                                success: true,
                                message: 'OK',
                            })];
                    case 4:
                        err_4 = _b.sent();
                        (0, logger_1.default)(1, err_4);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: err_4,
                            })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * DELETE
     * Deletes a key by ID.
     *
     * @param {Request} req Request
     * @param {Response} res Response
     * @returns {Response}
     */
    RoleController.prototype.deleteDeleteById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, key, isUser, isAdmin, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, apikeys_1.default.findById(id)];
                    case 2:
                        key = _a.sent();
                        if (!key) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'No key exists with this ID.',
                                })];
                        }
                        isUser = String(req.user._id) === String(key._id);
                        isAdmin = req.user.role <= 1;
                        if (!isUser && !isAdmin) {
                            (0, logger_1.default)(1, "Account does not have permissions to edit this key.");
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: 'You do not have permissions to edit this key.',
                                })];
                        }
                        return [4 /*yield*/, apikeys_1.default.deleteOne({ _id: String(key._id) })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                success: true,
                                message: 'OK',
                            })];
                    case 4:
                        err_5 = _a.sent();
                        (0, logger_1.default)(1, err_5);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: err_5,
                            })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return RoleController;
}(RouteBase_1.default));
exports.default = RoleController;
