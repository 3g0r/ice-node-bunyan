import {Stream, Serializers} from "bunyan";
import * as Logger from "bunyan";

import {default as YamlStream} from "./yamlStream";

export {default as requestLogger} from "./requestLogger";
export {default as YamlStream} from "./yamlStream";
export {getLevelFromName, getNameFromLevel} from "./utils";

export interface LoggerConf {
  name: string;
  basePath: string;
  serializers?: Serializers;
  showDate?: boolean;
  level?: number;
}

export function createDefaultRootLogger(config: LoggerConf): Logger {
  const {name, level, basePath, showDate, serializers} = config;
  return new Logger({
    name,
    streams: [{
      type: 'raw',
      level,
      stream: new YamlStream({
        basePath,
        showDate,
      }),
    } as Stream],
    serializers: serializers || {},
  });
}
