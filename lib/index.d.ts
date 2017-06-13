/// <reference types="bunyan" />
import * as Logger from "bunyan";
export default Logger;
export { default as requestLogger } from "./requestLogger";
export { default as YamlStream } from "./yamlStream";
export { serializers } from "./serializers";
export declare function createDefaultRootLogger(config: {
    name: string;
    basePath: string;
    level?: number;
}): Logger;
