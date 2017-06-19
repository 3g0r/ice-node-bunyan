import {Serializers} from "bunyan";
import IceLogger from "./IceLogger";
import {default as YamlStream} from "./yamlStream";

export {default as requestLogger} from "./requestLogger";
export {default as YamlStream} from "./yamlStream";

export interface LoggerConf {
  name: string;
  basePath: string;
  serializers?: Serializers;
  showDate?: boolean;
  level?: number;
}

export function createDefaultRootLogger(config: LoggerConf): IceLogger {
  const {name, level, basePath, showDate, serializers} = config;
  return new IceLogger({
    name,
    streams: [{
      type: 'raw',
      level,
      stream: new YamlStream({
        basePath,
        showDate,
      }),
    }],
    serializers: serializers || {},
  });
}
