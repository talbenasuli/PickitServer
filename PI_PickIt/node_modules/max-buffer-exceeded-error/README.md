# max-buffer-exceeded-error

[![NPM version](https://img.shields.io/npm/v/max-buffer-exceeded-error.svg)](https://www.npmjs.com/package/max-buffer-exceeded-error)
[![Build Status](https://travis-ci.org/shinnn/max-buffer-exceeded-error.svg?branch=master)](https://travis-ci.org/shinnn/max-buffer-exceeded-error)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/max-buffer-exceeded-error.svg)](https://coveralls.io/github/shinnn/max-buffer-exceeded-error)
[![Dependency Status](https://david-dm.org/shinnn/max-buffer-exceeded-error.svg)](https://david-dm.org/shinnn/max-buffer-exceeded-error)
[![devDependency Status](https://david-dm.org/shinnn/max-buffer-exceeded-error/dev-status.svg)](https://david-dm.org/shinnn/max-buffer-exceeded-error#info=devDependencies)

A better `Error` class for "maxBuffer exceeded" errors

```javascript
const {execFile} = require('child_process');

execFile('npm', {maxBuffer: 10}, err => {
  err; //=> Error: stdout maxBuffer exceeded
});
```

```javascript
const MaxBufferExceededError = require('max-buffer-exceeded-error');

new MaxBufferExceededError('stdout', 10);
/*
  => { [MaxBufferExceededError: stdout maxBuffer exceeded. (>10)]
       message: 'stdout maxBuffer exceeded. (>10)',
       maxBuffer: 10 }
*/
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install max-buffer-exceeded-error
```

## API

```javascript
const MaxBufferExceededError = require('max-buffer-exceeded-error');
```

### new MaxBufferExceededError(*name*. *maxBuffer*)

*name*: `String` (a name of what limits the buffer size e.g. `stdout`, `stderr`)  
*maxBuffer*: `number` (size of the max buffer)  
Return: `MaxBufferExceededError` instance

## License

Copyright (c) 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
