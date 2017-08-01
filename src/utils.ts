import * as bunyan from "bunyan";

export function getLevelFromName(
  name: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
): number {
  return (bunyan as any).levelFromName[name];
}

export function getNameFromLevel(
  level: number,
): 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' {
  return (bunyan as any).nameFromLevel[level];
}
