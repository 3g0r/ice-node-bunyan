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


const formatError = (basePath: RegExp, err?: BunyanRecord['err']): string => {
  if (!err)
    return '';
  let stack = err.stack;

  if (err.ice_name) {
    const {ice_name, ice_cause, message} = err;
    const header = `Error: ${ice_name}: ${ice_cause || message || ''}`;
    stack = header + '\n' + stack.replace(/.*?\n/, '');
  }

  const stackLines = stack.split('\n');
  const errorContext = {
    context: omit(err, ['stack', 'message', 'ice_name', 'ice_cause']),
  };
  const stackTrace = stackLines.slice(1).map(
    line => line.replace(basePath, '')
  );
  return [
    stackLines[0],
    indent(stringify(errorContext), 2),
    indent('stacktrace:'),
    ...stackTrace,
  ].join('\n');
};


export default class YamlStream {
  basePath: RegExp;
  showDate: boolean;

  constructor(configuration: {basePath: string; showDate?: boolean}) {
    this.basePath = new RegExp(configuration.basePath, 'g');
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
