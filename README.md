# Ice node-bunyan logging library with yaml formatter

## Installation

```
npm install --save ice-utils
```

## API

### createDefaultRootLogger(config: {name: string; basePath: string; level?: number;}) :Logger)

Helper for fast creation root logger with basic setup for work with ice.

**Example**

```js
const rootLogger = createDefaultRootLogger({
  name: 'ganymede',
  basePath: __dirname,
});
```

### requestLogger(parent: Logger, current: Ice.Current, extra?: any): Logger

The helper add `iceRequestId`, `iceOperation`, `iceIdentity` keys into BunyanRecord object.

**Example**

```js
const moduleLogger = rootLogger.child({module: __dirname});
class Servant{
  async method(current) {
    const logger = requestLogger(moduleLogger, current);
    logger.info('Started...');
    return 0;
  } 
}
```

### YamlStream

Simple Bunyan stream class for yaml output format

### serializers.err

Wrapped default error serializer Bunyan for work with Ice.Exception.

Add ice_name key into Error object if it instance of Ice.Exception.

[npm-image]: https://badge.fury.io/js/ice-utils.svg
[npm-url]: https://badge.fury.io/js/ice-utils
[travis-image]: https://travis-ci.org/aikoven/ice-utils.svg?branch=master
[travis-url]: https://travis-ci.org/aikoven/ice-utils
