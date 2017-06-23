import * as Logger from "bunyan";
import {Ice} from "ice";
import {stdSerializers} from "bunyan";

function toPlainObject(anyValue: any, depth: number = 1): any {
  if (anyValue instanceof Ice.Long)
    return anyValue.toNumber();

  if (anyValue instanceof Ice.HashMap) {
    const result: any = {};
    anyValue.forEach((key: any, value: any) => {
      result[toPlainObject(key)] = toPlainObject(value);
    });
    return result;
  }

  if (anyValue instanceof Ice.Exception) {
    return Object.assign({
      stack: anyValue.stack,
      ice_name: anyValue.ice_name(),
    }, anyValue);
  }

  if (anyValue instanceof Error)
    return stdSerializers.err(anyValue);

  if (anyValue instanceof Ice.EnumBase)
    return anyValue.name;

  if (anyValue instanceof Ice.Identity)
    return Ice.identityToString(anyValue);

  if (Array.isArray(anyValue))
    return anyValue.map(anyValue => toPlainObject(anyValue, depth));

  if (anyValue instanceof Ice.ObjectPrx)
    return anyValue.toString();

  if (anyValue instanceof Ice.Object) {
    const result: any = {iceId: anyValue.ice_id()};
    for (const [key, value] of Object.entries(anyValue))
      result[key] = toPlainObject(value, depth + 1);
    return result;
  }

  if (depth < 2 &&
      anyValue instanceof Object && Object.keys(anyValue).length > 0) {
    const result: any = {};
    for (const [key, value] of Object.entries(anyValue))
      result[key] = toPlainObject(value, depth + 1);
    return result;
  }

  return anyValue;
}

const requestInfoKeys = ['iceRequestId', 'iceOperation', 'iceIdentity'];

export default class IceLogger extends Logger {
}

(IceLogger as any).prototype._applySerializers =
  function (fields: any, excludeFields?: Object) {
    for (const [fieldName, value] of Object.entries(fields)) {
      if (requestInfoKeys.includes(fieldName))
        continue;

      if (this.serializers[fieldName])
        continue;

      fields[fieldName] = toPlainObject(value);
    }
    return (Logger as any)
      .prototype
      ._applySerializers
      .call(this, fields, excludeFields);
  };


