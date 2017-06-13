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
var Logger = require("bunyan");
var bunyan_1 = require("bunyan");
var yamlStream_1 = require("./yamlStream");
var serializers_1 = require("./serializers");
exports.default = Logger;
var requestLogger_1 = require("./requestLogger");
exports.requestLogger = requestLogger_1.default;
var yamlStream_2 = require("./yamlStream");
exports.YamlStream = yamlStream_2.default;
var serializers_2 = require("./serializers");
exports.serializers = serializers_2.serializers;
function createDefaultRootLogger(config) {
    var name = config.name, level = config.level, basePath = config.basePath;
    return bunyan_1.createLogger({
        name: name,
        streams: [{
                type: 'raw',
                level: level,
                stream: new yamlStream_1.default({
                    basePath: basePath,
                }),
            }],
        serializers: __assign({}, bunyan_1.stdSerializers, serializers_1.serializers),
    });
}
exports.createDefaultRootLogger = createDefaultRootLogger;
