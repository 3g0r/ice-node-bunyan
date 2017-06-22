import {pick, omit} from "lodash";
import {TRACE, DEBUG, INFO, WARN, ERROR, FATAL, stdSerializers} from "bunyan";
import {stringify} from "yamljs";


export interface BunyanRecord {
  name: string;
  level: number;
  msg: string;
  pid: number;
  hostname: string;
  time: Date;
  v: string;
  err?: {
    message: string;
    name: string;
    stack: string;
    ice_name?: string;
    ice_cause?: string;
  };
}

const metaDataKeys = ['module', 'iceRequestId', 'iceOperation', 'iceIdentity'];

const excludeKeys = [
  ...metaDataKeys,
  'msg', 'level', 'name', 'pid',
  'hostname', 'time', 'v', 'err',
];

const excludeErrorKeys = ['stack', 'message', 'name', 'ice_name', 'ice_cause'];

const levelName = (level: number): string | undefined => {
  switch (level) {
    case TRACE:
      return 'TRACE';
    case DEBUG:
      return 'DEBUG';
    case INFO:
      return 'INFO';
    case WARN:
      return 'WARN';
    case ERROR:
      return 'ERROR';
    case FATAL:
      return 'FATAL';
    default:
      return ;
  }
};

function indent(str: string, spaceCount: number = 2): string {
  if (str.length === 0)
    return str;
  const indent = ' '.repeat(spaceCount);
  return str.replace(/^(.+)$/mg, `${indent}$1`);
}

function escapeRegExp(str: string): string {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const formatError = (basePath: string, err?: BunyanRecord['err']): string => {
  if (!err)
    return '';
  
  const [, ...stackLines] = (err.stack || '').split('\n');
  const {ice_name, ice_cause, message, name} = err;

  const errorHeader = err.ice_name
    ? `Error: ${ice_name}: ${ice_cause || message || ''}`
    : `Error: ${name}: ${message}`;

  // Remove `basePath` from stacktrace
  const basePathRegExp = new RegExp(`(\\()(${escapeRegExp(basePath)})(.*\\))`,
                                    'gm');

  const stackTrace = stackLines.join('\n').replace(basePathRegExp, '$1$3');

  const errorData = omit(err, excludeErrorKeys);
  
  return [
    errorHeader, '\n',
    indent(stringify(Object.keys(errorData).length > 0 ? {errorData} : {})),
    indent('stackTrace:'), '\n',
    stackTrace, '\n',
  ].join('');
};


export default class YamlStream {
  basePath: string;
  showDate: boolean;

  constructor(configuration: {basePath: string; showDate?: boolean}) {
    this.basePath = configuration.basePath;
    this.showDate = configuration.showDate || false;
  }

  write(record: BunyanRecord) {
    const context = omit(record, excludeKeys);
    const metaData = pick(record, metaDataKeys);

    const metaDataString = Object.keys(metaData).length > 0
      ? stringify(metaData, 10, 2)
      : '';

    const dateString = this.showDate
      ? `${record.time} - `
      : '';

    const {name} = record;
    let info, msg, level;

    try {
      const contextDataString = Object.keys(context).length > 0
        ? stringify({context}, 10, 2)
        : '';

      const err = formatError(this.basePath, record.err);
      msg = record.msg;
      level = record.level;
      info = indent(`${metaDataString}${contextDataString}${err}`);
    } catch (e) {
      const err = stdSerializers.err(e).stack;
      const contextDataString =
        stringify({context: JSON.stringify(context)}, 10, 2);
      msg = 'Yaml serialization error.';
      level = ERROR;
      info = indent(`${metaDataString}${contextDataString}${err}\n`);
    }
    process.stdout.write(
      `${dateString}[${levelName(level)}] ${name}: ${msg || ''}\n${info}`
    );
  }
}
