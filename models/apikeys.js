"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
mongoose_1.default.set('strictQuery', true);
var APIKeysSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users', required: true },
    name: { type: String, required: true },
    role: { type: Number, required: true },
    description: { type: String },
});
exports.default = mongoose_1.default.model('api-key', APIKeysSchema);
