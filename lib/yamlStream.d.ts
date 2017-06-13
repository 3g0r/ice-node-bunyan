export interface BunyanRecord {
    name: string;
    level: number;
    msg: string;
    pid: number;
    hostname: string;
    time: Date;
    v: string;
    err?: {
        message: string;
        name: string;
        stack: string;
    };
}
export default class YamlStream {
    basePath: RegExp;
    constructor(configuration: {
        basePath: string;
    });
    write(record: BunyanRecord): void;
}
