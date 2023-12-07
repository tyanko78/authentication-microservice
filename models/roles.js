"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
mongoose_1.default.set('strictQuery', true);
var RoleSchema = new mongoose_1.Schema({
    role_no: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String },
});
exports.default = mongoose_1.default.model('role', RoleSchema);
