import * as Logger from "bunyan";
import {stdSerializers, createLogger, Serializer} from "bunyan";
import {default as YamlStream} from "./yamlStream";
import {serializers} from "./serializers";

export {default as requestLogger} from "./requestLogger";
export {default as YamlStream} from "./yamlStream";
export {serializers} from "./serializers";

export interface LoggerConf {
  name: string;
  basePath: string;
  serializers?: Serializer[];
  showDate?: boolean;
  level?: number;
}

export function createDefaultRootLogger(config: LoggerConf): Logger {
  const {name, level, basePath, showDate} = config;
  return createLogger({
    name,
    streams: [{
      type: 'raw',
      level,
      stream: new YamlStream({
        basePath,
        showDate,
      }),
    }],
    serializers: {
      ...stdSerializers,
      ...serializers,
      ...(config.serializers || []),
    },
  });
}
