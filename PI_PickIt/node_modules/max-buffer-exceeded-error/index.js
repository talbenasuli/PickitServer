/*!
 * max-buffer-exceeded-error | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/max-buffer-exceeded-error
*/
'use strict';

var createErrorClass = require('create-error-class');

module.exports = createErrorClass('MaxBufferExceededError', function(name, maxBuffer) {
  if (typeof name !== 'string') {
    throw new TypeError(String(name) + ' is not a string. Expected a non-empty string.');
  }

  if (name === '') {
    throw new TypeError('Expected a non-empty string but recieved an empty string.');
  }

  if (typeof maxBuffer !== 'number') {
    throw new TypeError(String(maxBuffer) + ' is not a number. Expected a number of max buffer size.');
  }

  this.message = name + ' maxBuffer exceeded. (>' + String(maxBuffer) + ')';
  this.maxBuffer = maxBuffer;
});
