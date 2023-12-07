"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missingKeys = void 0;
/**
 * Returns array of missing keys from provided body
 *
 * @param {string[]} keys array of strings
 * @param {Record<string, unknown>} body request body
 * @returns string[] array of missing keys
 */
function missingKeys(keys, body) {
    if (body === void 0) { body = {}; }
    return keys.filter(function (key) { return !Boolean(body[key]); });
}
exports.missingKeys = missingKeys;
