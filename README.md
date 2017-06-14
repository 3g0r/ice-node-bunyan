# Ice node-bunyan logging library with yaml formatter

## Installation

```
npm install --save ice-node-bunyan
```

## API

### createDefaultRootLogger(config: LoggerConf) :Logger

Helper for fast creation root logger with basic setup for work with ice.

**Example**

```js
const rootLogger = createDefaultRootLogger({
  name: 'service',
  basePath: __dirname,
  showDate: true,
  level: TRACE,
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

Add `ice_name` key into Error object if it instance of Ice.Exception.

**Log example**

```
[INFO] service: Simple info message.
  module: Servant
  context:
    identity:
      type: user
      domain: test
      username: admin
    sessionId: my-session-id
[WARN] service: Simple warning message.
[ERROR] service: Oops! Uncaught error.
  iceRequestId: 8
  iceOperation: somethingAction
  iceIdentity: Servant/Fun
  context:
    remoteHost: null
    remotePort: 28841
  Error: Fun
      at Servant.<anonymous> (/path/servants/Servant.ts:33:13)
      at Generator.next (<anonymous>)
      at /servants/Servant.ts:13:71
      at __awaiter (/servants/Servant.ts:9:12)
      at Servant.somethingAction (/servants/Servant.ts:31:16)
      at Servant.Object.assign._b.(anonymous function) [as createProject_async] (/opt/service/node_modules/ice-utils/lib/operation.js:93:62)
      at __dispatchImpl (/opt/service/node_modules/ice/src/Ice/Operation.js:430:24)
      at Function.method (/opt/service/node_modules/ice/src/Ice/Operation.js:599:24)
      at Servant.classType.__dispatch (/opt/service/node_modules/ice/src/Ice/Operation.js:749:23)
      at __init__.invoke (/opt/service/node_modules/ice/src/Ice/IncomingAsync.js:510:34)
      at __init__.invokeAll (/opt/service/node_modules/ice/src/Ice/ConnectionI.js:1902:21)
      at __init__.dispatch (/opt/service/node_modules/ice/src/Ice/ConnectionI.js:910:22)
      at __init__.message (/opt/service/node_modules/ice/src/Ice/ConnectionI.js:878:14)
      at __init__._bytesAvailableCallback (/opt/service/node_modules/ice/src/Ice/ConnectionI.js:162:35)
      at __init__.socketBytesAvailable (/opt/service/node_modules/ice/src/Ice/TcpTransceiver.js:318:18)
```
