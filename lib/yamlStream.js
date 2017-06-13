"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var bunyan_1 = require("bunyan");
var yamljs_1 = require("yamljs");
var metaDataKeys = ['module', 'iceRequestId', 'iceOperation', 'iceIdentity'];
var excludeKeys = metaDataKeys.concat([
    'msg', 'level', 'name', 'pid',
    'hostname', 'time', 'v', 'err',
]);
var levelName = function (level) {
    switch (level) {
        case bunyan_1.TRACE:
            return 'TRACE';
        case bunyan_1.DEBUG:
            return 'DEBUG';
        case bunyan_1.INFO:
            return 'INFO';
        case bunyan_1.WARN:
            return 'WARN';
        case bunyan_1.ERROR:
            return 'ERROR';
        case bunyan_1.FATAL:
            return 'FATAL';
        default:
            return;
    }
};
var formatError = function (basePath, err) {
    if (!err)
        return '';
    return err.stack.replace(basePath, '');
};
var YamlStream = (function () {
    function YamlStream(configuration) {
        this.basePath = new RegExp(configuration.basePath, 'g');
    }
    YamlStream.prototype.write = function (record) {
        var context = lodash_1.omit(record, excludeKeys);
        var contextString = Object.keys(context).length > 0
            ? yamljs_1.stringify({ context: context }, 10)
            : '';
        var err = formatError(this.basePath, record.err);
        var meta = yamljs_1.stringify(lodash_1.pick(record, metaDataKeys));
        var msg = record.msg, level = record.level, name = record.name;
        process.stdout.write("[" + levelName(level) + "] " + name + ": " + msg + "\n" + meta + contextString + err);
    };
    return YamlStream;
}());
exports.default = YamlStream;
