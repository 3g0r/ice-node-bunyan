import {stdSerializers} from "bunyan";
import {Ice} from "ice";

export const serializers = {
  err(error: any) {
    if (error instanceof Ice.Exception) {
      return Object.assign({
        stack: error.stack,
        ice_name: error.ice_name(),
      }, error);
    }
    return stdSerializers.err(error);
  },
};
