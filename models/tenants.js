"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
mongoose_1.default.set('strictQuery', true);
var TenantSchema = new mongoose_1.Schema({
    name: { type: String, unique: true, required: true },
    status: { type: Number, enum: [1, 0], default: 1 },
});
exports.default = mongoose_1.default.model('tenant', TenantSchema);
