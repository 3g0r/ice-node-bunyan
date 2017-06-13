import {Ice} from "ice";
import * as Logger from "bunyan";

export default function (parent: Logger, current: Ice.Current,
                         extra?: any): Logger {
  const {requestId, operation, id} = current;

  return parent.child({
    iceRequestId: requestId,
    iceOperation: operation,
    iceIdentity: Ice.identityToString(id),
    ...extra,
  }, true);
}
