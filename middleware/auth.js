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
var jsonwebtoken_1 = require("jsonwebtoken");
var apikeys_1 = require("../models/apikeys");
var user_1 = require("../models/user");
var _a = process.env, JWT_SECRET_KEY = _a.JWT_SECRET_KEY, JWT_TOKEN_EXPIRE = _a.JWT_TOKEN_EXPIRE;
// Middleware function for authentication
function auth(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, cookie, cookieToken, token, user, userQuery, key, keyQuery, _b, user_2, remember, exp, expiresIn, newToken, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    apiKey = req.headers['api-key'];
                    cookie = req.headers.cookie;
                    cookieToken = (_a = cookie === null || cookie === void 0 ? void 0 : cookie.split('; ')) === null || _a === void 0 ? void 0 : _a.find(function (c) { return /^AuthToken=.*$/.test(c); });
                    token = cookieToken ? cookieToken.split('=')[1] : req.headers['token'];
                    user = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY).user;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 8, , 9]);
                    userQuery = void 0;
                    if (!apiKey) return [3 /*break*/, 4];
                    key = jsonwebtoken_1.default.verify(apiKey, JWT_SECRET_KEY).key;
                    return [4 /*yield*/, apikeys_1.default.findById(key.id)
                        // If key is not found, throw an error
                    ];
                case 2:
                    keyQuery = _c.sent();
                    // If key is not found, throw an error
                    if (!keyQuery)
                        throw new Error('Invalid Key');
                    return [4 /*yield*/, user_1.default.findById(user.id).select({ password: false })
                        // Set the user's role and additional fields
                    ];
                case 3:
                    // Find the user associated with the key
                    userQuery = _c.sent();
                    // Set the user's role and additional fields
                    userQuery.role = Math.max(keyQuery.role, userQuery.role);
                    userQuery.additionalFields = userQuery.additionalFields || {};
                    userQuery.additionalFields.apiKey = keyQuery;
                    return [3 /*break*/, 7];
                case 4:
                    if (!token) return [3 /*break*/, 6];
                    _b = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY), user_2 = _b.user, remember = _b.remember, exp = _b.exp;
                    return [4 /*yield*/, user_1.default.findById(user_2.id).select({ password: false })
                        // Set the token expiration time
                    ];
                case 5:
                    // Find the user associated with the token
                    userQuery = _c.sent();
                    expiresIn = remember ? parseInt(JWT_TOKEN_EXPIRE) : 7200;
                    // If the token is about to expire, create a new one
                    if ((exp - Date.now() / 1000) / 60 / 60 / 24 < 2) {
                        newToken = jsonwebtoken_1.default.sign({ user: user_2, remember: remember }, JWT_SECRET_KEY, { expiresIn: expiresIn });
                        req.update = { token: newToken, expiresIn: expiresIn };
                        res.setHeader('Set-Cookie', "AuthToken=".concat(newToken, "; Path=/;").concat(remember ? " Max-Age=".concat(expiresIn, ";") : ''));
                    }
                    return [3 /*break*/, 7];
                case 6: throw new Error('TOKEN_ERROR');
                case 7:
                    // If the user is not found or not active, throw an error
                    if (!userQuery || userQuery.status !== 1)
                        throw new Error('Auth Error');
                    // Attach the user to the request object
                    req.user = userQuery;
                    // Proceed to the next middleware
                    return [2 /*return*/, next()];
                case 8:
                    err_1 = _c.sent();
                    // If the error is related to the token, delete the token
                    if (err_1.message === 'TOKEN_ERROR') {
                        res.setHeader('Set-Cookie', 'AuthToken=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;');
                    }
                    // Send an error response
                    return [2 /*return*/, res.status(500).send({ status: 500, message: err_1.message })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.default = auth;
