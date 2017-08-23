import * as bunyan from "bunyan";

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export function getLevelFromName(
  name: LogLevel,
): number {
  return (bunyan as any).levelFromName[name];
}

export function getNameFromLevel(
  level: number,
): LogLevel {
  return (bunyan as any).nameFromLevel[level];
}
