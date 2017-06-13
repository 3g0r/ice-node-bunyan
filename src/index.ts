import * as Logger from "bunyan";
import {stdSerializers, createLogger} from "bunyan";
import {default as YamlStream} from "./yamlStream";
import {serializers} from "./serializers";

export default Logger;
export {default as requestLogger} from "./requestLogger";
export {default as YamlStream} from "./yamlStream";
export {serializers} from "./serializers";

export function createDefaultRootLogger(config: {name: string;
                                                 basePath: string;
                                                 level?: number; }): Logger {
  const {name, level, basePath} = config;
  return createLogger({
    name,
    streams: [{
      type: 'raw',
      level,
      stream: new YamlStream({
        basePath,
      }),
    }],
    serializers: {
      ...stdSerializers,
      ...serializers,
    },
  });
}
