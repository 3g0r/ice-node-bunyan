"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan_1 = require("bunyan");
var ice_1 = require("ice");
exports.serializers = {
    err: function (error) {
        if (error instanceof ice_1.Ice.Exception) {
            return Object.assign({
                ice_name: error.ice_name(),
            }, error);
        }
        return bunyan_1.stdSerializers.err(error);
    },
};
