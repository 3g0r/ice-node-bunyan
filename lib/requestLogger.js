"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ice_1 = require("ice");
function default_1(parent, current, extra) {
    var requestId = current.requestId, operation = current.operation, id = current.id;
    return parent.child(__assign({ iceRequestId: requestId, iceOperation: operation, iceIdentity: ice_1.Ice.identityToString(id) }, extra), true);
}
exports.default = default_1;
