import {pick, omit} from "lodash";
import {TRACE, DEBUG, INFO, WARN, ERROR, FATAL} from "bunyan";
import {stringify} from "yamljs";

export interface BunyanRecord {
  name: string;
  level: number;
  msg: string;
  pid: number;
  hostname: string;
  time: Date;
  v: string;
  err?: { message: string; name: string; stack: string };
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

const formatError = (basePath: RegExp, err?: BunyanRecord['err']): string => {
  if (!err)
    return '';

  return err.stack.replace(basePath, '');
};

function indentation(str: string, spaceCount: number = 2): string {
  if (str.length === 0)
    return str;
  const indent = ' '.repeat(spaceCount);
  return str.replace(/^(.+)$/mg, `${indent}$1`);
}

export default class YamlStream {
  basePath: RegExp;

  constructor(configuration: {basePath: string}) {
    this.basePath = new RegExp(configuration.basePath, 'g');
  }

  write(record: BunyanRecord) {
    const context = omit(record, excludeKeys);
    const contextString = Object.keys(context).length > 0
      ? stringify({context}, 10, 2)
      : '';
    const err = formatError(this.basePath, record.err);
    const meta = stringify(pick(record, metaDataKeys));
    const {msg, level, name} = record;
    const logContextString = indentation(`${meta}${contextString}${err}`);
    process.stdout.write(
      `[${levelName(level)}] ${name}: ${msg}\n${logContextString}`
    );
  }
}
