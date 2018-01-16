import {pick, omit} from "lodash";
import {Ice} from "ice";
import {stdSerializers} from "bunyan";
import {getNameFromLevel} from "./utils";


export interface BunyanRecord {
  name: string;
  level: number;
  msg: string;
  pid: number;
  hostname: string;
  time: Date;
  v: string;
  $$originalStack: string;
  err?: {
    stack: string;
    message?: string; name?: string;
    ice_name?: string; ice_cause?: string;
  };
}

const metaDataKeys = ['module', 'iceRequestId', 'iceOperation', 'iceIdentity'];

const excludeKeys = [
  ...metaDataKeys,
  'msg', 'level', 'name', 'pid',
  'hostname', 'time', 'v', 'err',
  '$$originalStack',
];

function indent(str: string, spaceCount: number = 2): string {
  if (str.length === 0)
    return str;
  const indent = ' '.repeat(spaceCount);
  return str.replace(/^(.+)$/mg, `${indent}$1`);
}

function escapeRegExp(str: string): string {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export default class YamlStream {
  private basePath: string;
  private showDate: boolean;

  constructor(configuration: { basePath: string; showDate?: boolean }) {
    this.basePath = configuration.basePath;
    this.showDate = configuration.showDate || false;
  }

  write(record: BunyanRecord) {
    const msg = record.msg;
    const level = record.level;
    const {name} = record;
    const dateString = this.showDate
      ? `${record.time} - `
      : '';
    const {basePath} = this;
    const context = toYmlString(omit(record, excludeKeys), {basePath});
    const contextString = context
      ? `${indent(context)}\n`
      : '';
    const metaData = toYmlString(pick(record, metaDataKeys), {basePath});
    const metaDataString = metaData
      ? `${metaData}\n`
      : '';
    const error = toYmlString(record.err, {basePath});
    const errorString = error
      ? `Error: ${indent(error)}\n`
      : '';
    const info = indent(`${metaDataString}${contextString}${errorString}`);
    const levelName = getNameFromLevel(level).toUpperCase();
    process.stdout.write(
      `${dateString}[${levelName}] ${name}: ${msg || ''}\n${info}`
        .replace(/^\s*[\r\n]/gm, '')
    );
  }
}

const isNotPrimitiveStringify = (anyValue: any) => {
  return (
           !(anyValue instanceof Date) &&
           !(anyValue instanceof Ice.ObjectPrx) &&
           !(anyValue instanceof Ice.Identity) &&
           !(anyValue instanceof Ice.EnumBase) &&
           !(anyValue instanceof Ice.Long)
         ) && (
           Array.isArray(anyValue) ||
           anyValue instanceof Object
         );
};

function toYmlString(anyValue: any, conf: any): string {
  const {basePath, depth = 0} = conf;

  if (anyValue instanceof Ice.Long)
    return '' + anyValue.toNumber();

  if (anyValue instanceof Date)
    return anyValue.toLocaleString();

  if (anyValue instanceof Ice.HashMap) {
    let ymlString = '';
    const nextConf = {basePath, depth: depth + 1};
    anyValue.forEach((value: any, key: any) => {
      let valueString = toYmlString(value, nextConf);
      if (valueString === '') {
        return;
      }

      let divider = ': ';
      if (isNotPrimitiveStringify(value)) {
        divider = ':\n';
        valueString = indent(valueString);
      }
      ymlString += `${toYmlString(key, nextConf)}${divider}${valueString}\n`;
    });
    return ymlString;
  }

  if (anyValue instanceof Map) {
    let ymlString = '';
    const nextConf = {basePath, depth: depth + 1};
    anyValue.forEach((value: any, key: any) => {
      let valueString = toYmlString(value, nextConf);
      if (valueString === '') {
        return;
      }

      let divider = ': ';
      if (isNotPrimitiveStringify(value)) {
        divider = ':\n';
        valueString = indent(valueString);
      }
      ymlString += `${toYmlString(key, nextConf)}${divider}${valueString}\n`;
    });
    return ymlString;
  }

  if (anyValue instanceof Ice.Exception) {
    return formatError(basePath, Object.assign({
      stack: (anyValue as any).stack,
      ice_name: anyValue.ice_name(),
      ice_cause: anyValue.ice_cause,
    }, anyValue) as BunyanRecord['err']);
  }

  if (anyValue instanceof Error)
    return formatError(
      basePath,
      stdSerializers.err(anyValue) as BunyanRecord['err']);

  if (anyValue instanceof Ice.EnumBase)
    return anyValue.name;

  if (anyValue instanceof Ice.Identity)
    return Ice.identityToString(anyValue);

  if (Array.isArray(anyValue)) {
    let ymlString = '';
    const nextConf = {basePath, depth: depth + 1};
    for (const value of anyValue) {
      let valueString = toYmlString(value, nextConf);
      if (valueString === '') {
        valueString = '""';
      }

      if (isNotPrimitiveStringify(value)) {
        const [firstLine, ...tail] = valueString.split('\n');
        valueString = `${firstLine}\n${indent(tail.join('\n'))}`;
      }
      ymlString += `- ${valueString}\n`;
    }
    return ymlString;
  }

  if (anyValue instanceof Set) {
    let ymlString = '';
    const nextConf = {basePath, depth: depth + 1};
    anyValue.forEach((value: any) => {
      let valueString = toYmlString(value, nextConf);
      if (valueString === '') {
        valueString = '""';
      }

      if (isNotPrimitiveStringify(value)) {
        const [firstLine, ...tail] = valueString.split('\n');
        valueString = `${firstLine}\n${indent(tail.join('\n'))}`;
      }
      ymlString += `- ${valueString}\n`;
    });
    return ymlString;
  }

  if (anyValue instanceof Ice.ObjectPrx || anyValue instanceof Ice.Object)
    return anyValue.toString();

  if (anyValue instanceof Ice.Value) {
    let ymlString = `iceId: ${anyValue.ice_id()}\n`;
    const nextConf = {basePath, depth: depth + 1};
    for (const [key, value] of Object.entries(anyValue)) {
      if (key.startsWith('__')) {
        continue;
      }
      let valueString = toYmlString(value, nextConf);
      if (valueString === '') {
        continue;
      }

      let divider = ': ';
      if (isNotPrimitiveStringify(value)) {
        divider = ':\n';
        valueString = indent(valueString);
      }
      ymlString += `${key}${divider}${valueString}\n`;
    }
    return ymlString;
  }

  if (anyValue instanceof Object) {
    if (Object.keys(anyValue).length === 0) {
      return '';
    }
    if (depth < 3) {
      let ymlString = '';
      const nextConf = {basePath, depth: depth + 1};
      for (const [key, value] of Object.entries(anyValue)) {
        let valueString = toYmlString(value, nextConf);
        if (valueString === '') {
          valueString = '""';
        }

        let divider = ': ';
        if (isNotPrimitiveStringify(value)) {
          divider = ':\n';
          valueString = indent(valueString);
        }
        ymlString += `${key}${divider}${valueString}\n`;
      }
      return ymlString;
    } else {
      return JSON.stringify(toPlainObject(anyValue));
    }
  }

  return anyValue;
}


function formatError(basePath: string, err?: BunyanRecord['err']): string {
  if (!err)
    return '';

  const stackLines = err.stack.split('\n');
  const {ice_name, ice_cause, message} = err;

  const errorHeader = err.ice_name
    ? `${ice_name}: ${ice_cause || message || ''}`
    : stackLines[0];

  // Remove `basePath` from stacktrace
  const basePathRegExp =
    new RegExp(`(\\()(${escapeRegExp(basePath)})(.*\\))`);
  const stackTrace = stackLines.slice(1).map(
    line => line.replace(basePathRegExp, '$1$3')
  );

  const errorData = {
    errorData: omit(err, ['stack', 'message', 'ice_name', 'ice_cause']),
  };

  return [
    errorHeader,
    toYmlString(errorData, {}),
    'stackTrace:',
    ...stackTrace,
  ].join('\n');
}


function toPlainObject(anyValue: any): any {
  if (anyValue instanceof Ice.Long)
    return anyValue.toNumber();

  if (anyValue instanceof Date)
    return anyValue.toLocaleString();

  if (anyValue instanceof Ice.HashMap) {
    const result: any = {};
    anyValue.forEach((value: any, key: any) => {
      result[toPlainObject(key)] = toPlainObject(value);
    });
    return result;
  }

  if (anyValue instanceof Map) {
    const result: any = {};
    anyValue.forEach((value: any, key: any) => {
      result[toPlainObject(key)] = toPlainObject(value);
    });
    return result;
  }

  if (anyValue instanceof Ice.Exception) {
    return Object.assign({
      stack: (anyValue as any).stack,
      ice_name: anyValue.ice_name(),
      ice_cause: anyValue.ice_cause(),
    }, anyValue);
  }

  if (anyValue instanceof Error)
    return stdSerializers.err(anyValue);

  if (anyValue instanceof Ice.EnumBase)
    return anyValue.name;

  if (anyValue instanceof Ice.Identity)
    return Ice.identityToString(anyValue);

  if (Array.isArray(anyValue))
    return anyValue.map(anyValue => toPlainObject(anyValue));

  if (anyValue instanceof Ice.ObjectPrx || anyValue instanceof Ice.Object)
    return anyValue.toString();

  if (anyValue instanceof Ice.Value) {
    const result: any = {iceId: anyValue.ice_id()};
    for (const [key, value] of Object.entries(anyValue))
      result[key] = toPlainObject(value);
    return result;
  }

  if (anyValue instanceof Object && Object.keys(anyValue).length > 0) {
    const result: any = {};
    for (const [key, value] of Object.entries(anyValue))
      result[key] = toPlainObject(value);
    return result;
  }

  return anyValue;
}
