// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../inherits/inherits_browser.js":[function(require,module,exports) {
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/base64-js/index.js":[function(require,module,exports) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/ieee754/index.js":[function(require,module,exports) {
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/isarray/index.js":[function(require,module,exports) {
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/buffer/index.js":[function(require,module,exports) {

var global = arguments[3];
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/base64-js/index.js","ieee754":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/ieee754/index.js","isarray":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/isarray/index.js","buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/buffer/index.js"}],"../../safe-buffer/index.js":[function(require,module,exports) {

/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/buffer/index.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/events/events.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function' ? R.apply : function ReflectApply(target, receiver, args) {
  return Function.prototype.apply.call(target, receiver, args);
};
var ReflectOwnKeys;

if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter() {
  EventEmitter.init.call(this);
}

module.exports = EventEmitter; // Backwards-compat with node 0.10.x

EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined; // By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.

var defaultMaxListeners = 10;
Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function () {
    return defaultMaxListeners;
  },
  set: function (arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }

    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function () {
  if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}; // Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.


EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }

  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];

  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);

  var doError = type === 'error';
  var events = this._events;
  if (events !== undefined) doError = doError && events.error === undefined;else if (!doError) return false; // If there is no 'error' event listener then throw.

  if (doError) {
    var er;
    if (args.length > 0) er = args[0];

    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    } // At least give some kind of context to the user


    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];
  if (handler === undefined) return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }

  events = target._events;

  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type, listener.listener ? listener.listener : listener); // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object

      events = target._events;
    }

    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] : [existing, listener]; // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    } // Check for listener leak


    m = $getMaxListeners(target);

    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true; // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax

      var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + String(type) + ' listeners ' + 'added. Use emitter.setMaxListeners() to ' + 'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};

function onceWrapper() {
  var args = [];

  for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);

  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    ReflectApply(this.listener, this.target, args);
  }
}

function _onceWrap(target, type, listener) {
  var state = {
    fired: false,
    wrapFn: undefined,
    target: target,
    type: type,
    listener: listener
  };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }

  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }

  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
}; // Emits a 'removeListener' event if and only if the listener was removed.


EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events, position, i, originalListener;

  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }

  events = this._events;
  if (events === undefined) return this;
  list = events[type];
  if (list === undefined) return this;

  if (list === listener || list.listener === listener) {
    if (--this._eventsCount === 0) this._events = Object.create(null);else {
      delete events[type];
      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }

    if (position < 0) return this;
    if (position === 0) list.shift();else {
      spliceOne(list, position);
    }
    if (list.length === 1) events[type] = list[0];
    if (events.removeListener !== undefined) this.emit('removeListener', type, originalListener || listener);
  }

  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners, events, i;
  events = this._events;
  if (events === undefined) return this; // not listening for removeListener, no need to emit

  if (events.removeListener === undefined) {
    if (arguments.length === 0) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    } else if (events[type] !== undefined) {
      if (--this._eventsCount === 0) this._events = Object.create(null);else delete events[type];
    }

    return this;
  } // emit removeListener for all listeners on all events


  if (arguments.length === 0) {
    var keys = Object.keys(events);
    var key;

    for (i = 0; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }

    this.removeAllListeners('removeListener');
    this._events = Object.create(null);
    this._eventsCount = 0;
    return this;
  }

  listeners = events[type];

  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners !== undefined) {
    // LIFO order
    for (i = listeners.length - 1; i >= 0; i--) {
      this.removeListener(type, listeners[i]);
    }
  }

  return this;
};

function _listeners(target, type, unwrap) {
  var events = target._events;
  if (events === undefined) return [];
  var evlistener = events[type];
  if (evlistener === undefined) return [];
  if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];
  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function (emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;

function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);

  for (var i = 0; i < n; ++i) copy[i] = arr[i];

  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1];

  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);

  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }

  return ret;
}
},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/inherits/inherits_browser.js":[function(require,module,exports) {
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process-nextick-args/index.js":[function(require,module,exports) {
var process = require("process");
'use strict';

if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


},{"process":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process/browser.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/internal/streams/stream-browser.js":[function(require,module,exports) {
module.exports = require('events').EventEmitter;

},{"events":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/events/events.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/safe-buffer/index.js":[function(require,module,exports) {

/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/buffer/index.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/core-util-is/lib/util.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

},{"buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/buffer/index.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/src/builtins/_empty.js":[function(require,module,exports) {

},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/internal/streams/BufferList.js":[function(require,module,exports) {

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/safe-buffer/index.js","util":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/src/builtins/_empty.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/internal/streams/destroy.js":[function(require,module,exports) {
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process-nextick-args/index.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/util-deprecate/browser.js":[function(require,module,exports) {
var global = arguments[3];

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

},{}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_writable.js":[function(require,module,exports) {
var process = require("process");

var global = arguments[3];
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.
'use strict';
/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/


module.exports = Writable;
/* <replacement> */

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
} // It seems a linked list but it is not
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/


var asyncWrite = !true && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/

var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;
/*<replacement>*/

var util = require('core-util-is');

util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/

var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/

var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/


var Buffer = require('safe-buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/


var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.

  var isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm; // cast to ints.

  this.highWaterMark = Math.floor(this.highWaterMark); // if _final has been called

  this.finalCalled = false; // drain event flag.

  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // has it been destroyed

  this.destroyed = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})(); // Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.


var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex'); // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.
  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.

  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.


Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end'); // TODO: defer error events consistently everywhere, not just the cb

  stream.emit('error', er);
  pna.nextTick(cb, er);
} // Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.


function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }

  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }

  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;
  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
}); // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er); // this can emit finish, and it will always happen
    // after error

    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er); // this can emit finish, but finish must
    // always follow error

    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      stream.emit('error', err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }

  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;

Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
},{"process-nextick-args":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process-nextick-args/index.js","core-util-is":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/core-util-is/lib/util.js","inherits":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/inherits/inherits_browser.js","util-deprecate":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/util-deprecate/browser.js","./internal/streams/stream":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/internal/streams/stream-browser.js","safe-buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/safe-buffer/index.js","./internal/streams/destroy":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/internal/streams/destroy.js","./_stream_duplex":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_duplex.js","process":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process/browser.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_duplex.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"process-nextick-args":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process-nextick-args/index.js","core-util-is":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/core-util-is/lib/util.js","inherits":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/inherits/inherits_browser.js","./_stream_readable":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_readable.js","./_stream_writable":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_writable.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/string_decoder/lib/string_decoder.js":[function(require,module,exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/safe-buffer/index.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_readable.js":[function(require,module,exports) {

var global = arguments[3];
var process = require("process");
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
},{"process-nextick-args":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process-nextick-args/index.js","isarray":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/isarray/index.js","events":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/events/events.js","./internal/streams/stream":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/internal/streams/stream-browser.js","safe-buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/safe-buffer/index.js","core-util-is":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/core-util-is/lib/util.js","inherits":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/inherits/inherits_browser.js","util":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/src/builtins/_empty.js","./internal/streams/BufferList":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/internal/streams/BufferList.js","./internal/streams/destroy":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/internal/streams/destroy.js","./_stream_duplex":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_duplex.js","string_decoder/":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/string_decoder/lib/string_decoder.js","process":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process/browser.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_transform.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_duplex.js","core-util-is":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/core-util-is/lib/util.js","inherits":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/inherits/inherits_browser.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_passthrough.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_transform.js","core-util-is":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/core-util-is/lib/util.js","inherits":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/inherits/inherits_browser.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/readable-browser.js":[function(require,module,exports) {
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_readable.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_readable.js","./lib/_stream_writable.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_writable.js","./lib/_stream_duplex.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_duplex.js","./lib/_stream_transform.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_transform.js","./lib/_stream_passthrough.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_passthrough.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/writable-browser.js":[function(require,module,exports) {
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_writable.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/duplex-browser.js":[function(require,module,exports) {
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/lib/_stream_duplex.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/transform.js":[function(require,module,exports) {
module.exports = require('./readable').Transform

},{"./readable":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/readable-browser.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/passthrough.js":[function(require,module,exports) {
module.exports = require('./readable').PassThrough

},{"./readable":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/readable-browser.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/stream-browserify/index.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/events/events.js","inherits":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/inherits/inherits_browser.js","readable-stream/readable.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/readable-browser.js","readable-stream/writable.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/writable-browser.js","readable-stream/duplex.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/duplex-browser.js","readable-stream/transform.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/transform.js","readable-stream/passthrough.js":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/readable-stream/passthrough.js"}],"../../hash-base/index.js":[function(require,module,exports) {

'use strict';

var Buffer = require('safe-buffer').Buffer;

var Transform = require('stream').Transform;

var inherits = require('inherits');

function throwIfNotStringOrBuffer(val, prefix) {
  if (!Buffer.isBuffer(val) && typeof val !== 'string') {
    throw new TypeError(prefix + ' must be a string or a buffer');
  }
}

function HashBase(blockSize) {
  Transform.call(this);
  this._block = Buffer.allocUnsafe(blockSize);
  this._blockSize = blockSize;
  this._blockOffset = 0;
  this._length = [0, 0, 0, 0];
  this._finalized = false;
}

inherits(HashBase, Transform);

HashBase.prototype._transform = function (chunk, encoding, callback) {
  var error = null;

  try {
    this.update(chunk, encoding);
  } catch (err) {
    error = err;
  }

  callback(error);
};

HashBase.prototype._flush = function (callback) {
  var error = null;

  try {
    this.push(this.digest());
  } catch (err) {
    error = err;
  }

  callback(error);
};

HashBase.prototype.update = function (data, encoding) {
  throwIfNotStringOrBuffer(data, 'Data');
  if (this._finalized) throw new Error('Digest already called');
  if (!Buffer.isBuffer(data)) data = Buffer.from(data, encoding); // consume data

  var block = this._block;
  var offset = 0;

  while (this._blockOffset + data.length - offset >= this._blockSize) {
    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++];

    this._update();

    this._blockOffset = 0;
  }

  while (offset < data.length) block[this._blockOffset++] = data[offset++]; // update length


  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
    this._length[j] += carry;
    carry = this._length[j] / 0x0100000000 | 0;
    if (carry > 0) this._length[j] -= 0x0100000000 * carry;
  }

  return this;
};

HashBase.prototype._update = function () {
  throw new Error('_update is not implemented');
};

HashBase.prototype.digest = function (encoding) {
  if (this._finalized) throw new Error('Digest already called');
  this._finalized = true;

  var digest = this._digest();

  if (encoding !== undefined) digest = digest.toString(encoding); // reset state

  this._block.fill(0);

  this._blockOffset = 0;

  for (var i = 0; i < 4; ++i) this._length[i] = 0;

  return digest;
};

HashBase.prototype._digest = function () {
  throw new Error('_digest is not implemented');
};

module.exports = HashBase;
},{"safe-buffer":"../../safe-buffer/index.js","stream":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/stream-browserify/index.js","inherits":"../../inherits/inherits_browser.js"}],"../../md5.js/index.js":[function(require,module,exports) {

'use strict'
var inherits = require('inherits')
var HashBase = require('hash-base')
var Buffer = require('safe-buffer').Buffer

var ARRAY16 = new Array(16)

function MD5 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
}

inherits(MD5, HashBase)

MD5.prototype._update = function () {
  var M = ARRAY16
  for (var i = 0; i < 16; ++i) M[i] = this._block.readInt32LE(i * 4)

  var a = this._a
  var b = this._b
  var c = this._c
  var d = this._d

  a = fnF(a, b, c, d, M[0], 0xd76aa478, 7)
  d = fnF(d, a, b, c, M[1], 0xe8c7b756, 12)
  c = fnF(c, d, a, b, M[2], 0x242070db, 17)
  b = fnF(b, c, d, a, M[3], 0xc1bdceee, 22)
  a = fnF(a, b, c, d, M[4], 0xf57c0faf, 7)
  d = fnF(d, a, b, c, M[5], 0x4787c62a, 12)
  c = fnF(c, d, a, b, M[6], 0xa8304613, 17)
  b = fnF(b, c, d, a, M[7], 0xfd469501, 22)
  a = fnF(a, b, c, d, M[8], 0x698098d8, 7)
  d = fnF(d, a, b, c, M[9], 0x8b44f7af, 12)
  c = fnF(c, d, a, b, M[10], 0xffff5bb1, 17)
  b = fnF(b, c, d, a, M[11], 0x895cd7be, 22)
  a = fnF(a, b, c, d, M[12], 0x6b901122, 7)
  d = fnF(d, a, b, c, M[13], 0xfd987193, 12)
  c = fnF(c, d, a, b, M[14], 0xa679438e, 17)
  b = fnF(b, c, d, a, M[15], 0x49b40821, 22)

  a = fnG(a, b, c, d, M[1], 0xf61e2562, 5)
  d = fnG(d, a, b, c, M[6], 0xc040b340, 9)
  c = fnG(c, d, a, b, M[11], 0x265e5a51, 14)
  b = fnG(b, c, d, a, M[0], 0xe9b6c7aa, 20)
  a = fnG(a, b, c, d, M[5], 0xd62f105d, 5)
  d = fnG(d, a, b, c, M[10], 0x02441453, 9)
  c = fnG(c, d, a, b, M[15], 0xd8a1e681, 14)
  b = fnG(b, c, d, a, M[4], 0xe7d3fbc8, 20)
  a = fnG(a, b, c, d, M[9], 0x21e1cde6, 5)
  d = fnG(d, a, b, c, M[14], 0xc33707d6, 9)
  c = fnG(c, d, a, b, M[3], 0xf4d50d87, 14)
  b = fnG(b, c, d, a, M[8], 0x455a14ed, 20)
  a = fnG(a, b, c, d, M[13], 0xa9e3e905, 5)
  d = fnG(d, a, b, c, M[2], 0xfcefa3f8, 9)
  c = fnG(c, d, a, b, M[7], 0x676f02d9, 14)
  b = fnG(b, c, d, a, M[12], 0x8d2a4c8a, 20)

  a = fnH(a, b, c, d, M[5], 0xfffa3942, 4)
  d = fnH(d, a, b, c, M[8], 0x8771f681, 11)
  c = fnH(c, d, a, b, M[11], 0x6d9d6122, 16)
  b = fnH(b, c, d, a, M[14], 0xfde5380c, 23)
  a = fnH(a, b, c, d, M[1], 0xa4beea44, 4)
  d = fnH(d, a, b, c, M[4], 0x4bdecfa9, 11)
  c = fnH(c, d, a, b, M[7], 0xf6bb4b60, 16)
  b = fnH(b, c, d, a, M[10], 0xbebfbc70, 23)
  a = fnH(a, b, c, d, M[13], 0x289b7ec6, 4)
  d = fnH(d, a, b, c, M[0], 0xeaa127fa, 11)
  c = fnH(c, d, a, b, M[3], 0xd4ef3085, 16)
  b = fnH(b, c, d, a, M[6], 0x04881d05, 23)
  a = fnH(a, b, c, d, M[9], 0xd9d4d039, 4)
  d = fnH(d, a, b, c, M[12], 0xe6db99e5, 11)
  c = fnH(c, d, a, b, M[15], 0x1fa27cf8, 16)
  b = fnH(b, c, d, a, M[2], 0xc4ac5665, 23)

  a = fnI(a, b, c, d, M[0], 0xf4292244, 6)
  d = fnI(d, a, b, c, M[7], 0x432aff97, 10)
  c = fnI(c, d, a, b, M[14], 0xab9423a7, 15)
  b = fnI(b, c, d, a, M[5], 0xfc93a039, 21)
  a = fnI(a, b, c, d, M[12], 0x655b59c3, 6)
  d = fnI(d, a, b, c, M[3], 0x8f0ccc92, 10)
  c = fnI(c, d, a, b, M[10], 0xffeff47d, 15)
  b = fnI(b, c, d, a, M[1], 0x85845dd1, 21)
  a = fnI(a, b, c, d, M[8], 0x6fa87e4f, 6)
  d = fnI(d, a, b, c, M[15], 0xfe2ce6e0, 10)
  c = fnI(c, d, a, b, M[6], 0xa3014314, 15)
  b = fnI(b, c, d, a, M[13], 0x4e0811a1, 21)
  a = fnI(a, b, c, d, M[4], 0xf7537e82, 6)
  d = fnI(d, a, b, c, M[11], 0xbd3af235, 10)
  c = fnI(c, d, a, b, M[2], 0x2ad7d2bb, 15)
  b = fnI(b, c, d, a, M[9], 0xeb86d391, 21)

  this._a = (this._a + a) | 0
  this._b = (this._b + b) | 0
  this._c = (this._c + c) | 0
  this._d = (this._d + d) | 0
}

MD5.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = Buffer.allocUnsafe(16)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fnF (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + b) | 0
}

function fnG (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + b) | 0
}

function fnH (a, b, c, d, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + b) | 0
}

function fnI (a, b, c, d, m, k, s) {
  return (rotl((a + ((c ^ (b | (~d)))) + m + k) | 0, s) + b) | 0
}

module.exports = MD5

},{"inherits":"../../inherits/inherits_browser.js","hash-base":"../../hash-base/index.js","safe-buffer":"../../safe-buffer/index.js"}],"../../ripemd160/index.js":[function(require,module,exports) {

'use strict'
var Buffer = require('buffer').Buffer
var inherits = require('inherits')
var HashBase = require('hash-base')

var ARRAY16 = new Array(16)

var zl = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
]

var zr = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
]

var sl = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
]

var sr = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
]

var hl = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]
var hr = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000]

function RIPEMD160 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0
}

inherits(RIPEMD160, HashBase)

RIPEMD160.prototype._update = function () {
  var words = ARRAY16
  for (var j = 0; j < 16; ++j) words[j] = this._block.readInt32LE(j * 4)

  var al = this._a | 0
  var bl = this._b | 0
  var cl = this._c | 0
  var dl = this._d | 0
  var el = this._e | 0

  var ar = this._a | 0
  var br = this._b | 0
  var cr = this._c | 0
  var dr = this._d | 0
  var er = this._e | 0

  // computation
  for (var i = 0; i < 80; i += 1) {
    var tl
    var tr
    if (i < 16) {
      tl = fn1(al, bl, cl, dl, el, words[zl[i]], hl[0], sl[i])
      tr = fn5(ar, br, cr, dr, er, words[zr[i]], hr[0], sr[i])
    } else if (i < 32) {
      tl = fn2(al, bl, cl, dl, el, words[zl[i]], hl[1], sl[i])
      tr = fn4(ar, br, cr, dr, er, words[zr[i]], hr[1], sr[i])
    } else if (i < 48) {
      tl = fn3(al, bl, cl, dl, el, words[zl[i]], hl[2], sl[i])
      tr = fn3(ar, br, cr, dr, er, words[zr[i]], hr[2], sr[i])
    } else if (i < 64) {
      tl = fn4(al, bl, cl, dl, el, words[zl[i]], hl[3], sl[i])
      tr = fn2(ar, br, cr, dr, er, words[zr[i]], hr[3], sr[i])
    } else { // if (i<80) {
      tl = fn5(al, bl, cl, dl, el, words[zl[i]], hl[4], sl[i])
      tr = fn1(ar, br, cr, dr, er, words[zr[i]], hr[4], sr[i])
    }

    al = el
    el = dl
    dl = rotl(cl, 10)
    cl = bl
    bl = tl

    ar = er
    er = dr
    dr = rotl(cr, 10)
    cr = br
    br = tr
  }

  // update state
  var t = (this._b + cl + dr) | 0
  this._b = (this._c + dl + er) | 0
  this._c = (this._d + el + ar) | 0
  this._d = (this._e + al + br) | 0
  this._e = (this._a + bl + cr) | 0
  this._a = t
}

RIPEMD160.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = Buffer.alloc ? Buffer.alloc(20) : new Buffer(20)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  buffer.writeInt32LE(this._e, 16)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fn1 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
}

function fn2 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
}

function fn3 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
}

function fn4 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
}

function fn5 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
}

module.exports = RIPEMD160

},{"buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/buffer/index.js","inherits":"../../inherits/inherits_browser.js","hash-base":"../../hash-base/index.js"}],"../../sha.js/hash.js":[function(require,module,exports) {

var Buffer = require('safe-buffer').Buffer

// prototype class for hash functions
function Hash (blockSize, finalSize) {
  this._block = Buffer.alloc(blockSize)
  this._finalSize = finalSize
  this._blockSize = blockSize
  this._len = 0
}

Hash.prototype.update = function (data, enc) {
  if (typeof data === 'string') {
    enc = enc || 'utf8'
    data = Buffer.from(data, enc)
  }

  var block = this._block
  var blockSize = this._blockSize
  var length = data.length
  var accum = this._len

  for (var offset = 0; offset < length;) {
    var assigned = accum % blockSize
    var remainder = Math.min(length - offset, blockSize - assigned)

    for (var i = 0; i < remainder; i++) {
      block[assigned + i] = data[offset + i]
    }

    accum += remainder
    offset += remainder

    if ((accum % blockSize) === 0) {
      this._update(block)
    }
  }

  this._len += length
  return this
}

Hash.prototype.digest = function (enc) {
  var rem = this._len % this._blockSize

  this._block[rem] = 0x80

  // zero (rem + 1) trailing bits, where (rem + 1) is the smallest
  // non-negative solution to the equation (length + 1 + (rem + 1)) === finalSize mod blockSize
  this._block.fill(0, rem + 1)

  if (rem >= this._finalSize) {
    this._update(this._block)
    this._block.fill(0)
  }

  var bits = this._len * 8

  // uint32
  if (bits <= 0xffffffff) {
    this._block.writeUInt32BE(bits, this._blockSize - 4)

  // uint64
  } else {
    var lowBits = (bits & 0xffffffff) >>> 0
    var highBits = (bits - lowBits) / 0x100000000

    this._block.writeUInt32BE(highBits, this._blockSize - 8)
    this._block.writeUInt32BE(lowBits, this._blockSize - 4)
  }

  this._update(this._block)
  var hash = this._hash()

  return enc ? hash.toString(enc) : hash
}

Hash.prototype._update = function () {
  throw new Error('_update must be implemented by subclass')
}

module.exports = Hash

},{"safe-buffer":"../../safe-buffer/index.js"}],"../../sha.js/sha.js":[function(require,module,exports) {

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-0, as defined
 * in FIPS PUB 180-1
 * This source code is derived from sha1.js of the same repository.
 * The difference between SHA-0 and SHA-1 is just a bitwise rotate left
 * operation was added.
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha, Hash)

Sha.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha.prototype._hash = function () {
  var H = Buffer.allocUnsafe(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha

},{"inherits":"../../inherits/inherits_browser.js","./hash":"../../sha.js/hash.js","safe-buffer":"../../safe-buffer/index.js"}],"../../sha.js/sha1.js":[function(require,module,exports) {

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha1 () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha1, Hash)

Sha1.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl1 (num) {
  return (num << 1) | (num >>> 31)
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha1.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = rotl1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16])

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha1.prototype._hash = function () {
  var H = Buffer.allocUnsafe(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha1

},{"inherits":"../../inherits/inherits_browser.js","./hash":"../../sha.js/hash.js","safe-buffer":"../../safe-buffer/index.js"}],"../../sha.js/sha256.js":[function(require,module,exports) {

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
]

var W = new Array(64)

function Sha256 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha256, Hash)

Sha256.prototype.init = function () {
  this._a = 0x6a09e667
  this._b = 0xbb67ae85
  this._c = 0x3c6ef372
  this._d = 0xa54ff53a
  this._e = 0x510e527f
  this._f = 0x9b05688c
  this._g = 0x1f83d9ab
  this._h = 0x5be0cd19

  return this
}

function ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x) {
  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10)
}

function sigma1 (x) {
  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7)
}

function gamma0 (x) {
  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)
}

function gamma1 (x) {
  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10)
}

Sha256.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0
  var f = this._f | 0
  var g = this._g | 0
  var h = this._h | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 64; ++i) W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0

  for (var j = 0; j < 64; ++j) {
    var T1 = (h + sigma1(e) + ch(e, f, g) + K[j] + W[j]) | 0
    var T2 = (sigma0(a) + maj(a, b, c)) | 0

    h = g
    g = f
    f = e
    e = (d + T1) | 0
    d = c
    c = b
    b = a
    a = (T1 + T2) | 0
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
  this._f = (f + this._f) | 0
  this._g = (g + this._g) | 0
  this._h = (h + this._h) | 0
}

Sha256.prototype._hash = function () {
  var H = Buffer.allocUnsafe(32)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)
  H.writeInt32BE(this._h, 28)

  return H
}

module.exports = Sha256

},{"inherits":"../../inherits/inherits_browser.js","./hash":"../../sha.js/hash.js","safe-buffer":"../../safe-buffer/index.js"}],"../../sha.js/sha224.js":[function(require,module,exports) {

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('inherits')
var Sha256 = require('./sha256')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var W = new Array(64)

function Sha224 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha224, Sha256)

Sha224.prototype.init = function () {
  this._a = 0xc1059ed8
  this._b = 0x367cd507
  this._c = 0x3070dd17
  this._d = 0xf70e5939
  this._e = 0xffc00b31
  this._f = 0x68581511
  this._g = 0x64f98fa7
  this._h = 0xbefa4fa4

  return this
}

Sha224.prototype._hash = function () {
  var H = Buffer.allocUnsafe(28)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)

  return H
}

module.exports = Sha224

},{"inherits":"../../inherits/inherits_browser.js","./sha256":"../../sha.js/sha256.js","./hash":"../../sha.js/hash.js","safe-buffer":"../../safe-buffer/index.js"}],"../../sha.js/sha512.js":[function(require,module,exports) {

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
]

var W = new Array(160)

function Sha512 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha512, Hash)

Sha512.prototype.init = function () {
  this._ah = 0x6a09e667
  this._bh = 0xbb67ae85
  this._ch = 0x3c6ef372
  this._dh = 0xa54ff53a
  this._eh = 0x510e527f
  this._fh = 0x9b05688c
  this._gh = 0x1f83d9ab
  this._hh = 0x5be0cd19

  this._al = 0xf3bcc908
  this._bl = 0x84caa73b
  this._cl = 0xfe94f82b
  this._dl = 0x5f1d36f1
  this._el = 0xade682d1
  this._fl = 0x2b3e6c1f
  this._gl = 0xfb41bd6b
  this._hl = 0x137e2179

  return this
}

function Ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x, xl) {
  return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25)
}

function sigma1 (x, xl) {
  return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23)
}

function Gamma0 (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7)
}

function Gamma0l (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25)
}

function Gamma1 (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6)
}

function Gamma1l (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26)
}

function getCarry (a, b) {
  return (a >>> 0) < (b >>> 0) ? 1 : 0
}

Sha512.prototype._update = function (M) {
  var W = this._w

  var ah = this._ah | 0
  var bh = this._bh | 0
  var ch = this._ch | 0
  var dh = this._dh | 0
  var eh = this._eh | 0
  var fh = this._fh | 0
  var gh = this._gh | 0
  var hh = this._hh | 0

  var al = this._al | 0
  var bl = this._bl | 0
  var cl = this._cl | 0
  var dl = this._dl | 0
  var el = this._el | 0
  var fl = this._fl | 0
  var gl = this._gl | 0
  var hl = this._hl | 0

  for (var i = 0; i < 32; i += 2) {
    W[i] = M.readInt32BE(i * 4)
    W[i + 1] = M.readInt32BE(i * 4 + 4)
  }
  for (; i < 160; i += 2) {
    var xh = W[i - 15 * 2]
    var xl = W[i - 15 * 2 + 1]
    var gamma0 = Gamma0(xh, xl)
    var gamma0l = Gamma0l(xl, xh)

    xh = W[i - 2 * 2]
    xl = W[i - 2 * 2 + 1]
    var gamma1 = Gamma1(xh, xl)
    var gamma1l = Gamma1l(xl, xh)

    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
    var Wi7h = W[i - 7 * 2]
    var Wi7l = W[i - 7 * 2 + 1]

    var Wi16h = W[i - 16 * 2]
    var Wi16l = W[i - 16 * 2 + 1]

    var Wil = (gamma0l + Wi7l) | 0
    var Wih = (gamma0 + Wi7h + getCarry(Wil, gamma0l)) | 0
    Wil = (Wil + gamma1l) | 0
    Wih = (Wih + gamma1 + getCarry(Wil, gamma1l)) | 0
    Wil = (Wil + Wi16l) | 0
    Wih = (Wih + Wi16h + getCarry(Wil, Wi16l)) | 0

    W[i] = Wih
    W[i + 1] = Wil
  }

  for (var j = 0; j < 160; j += 2) {
    Wih = W[j]
    Wil = W[j + 1]

    var majh = maj(ah, bh, ch)
    var majl = maj(al, bl, cl)

    var sigma0h = sigma0(ah, al)
    var sigma0l = sigma0(al, ah)
    var sigma1h = sigma1(eh, el)
    var sigma1l = sigma1(el, eh)

    // t1 = h + sigma1 + ch + K[j] + W[j]
    var Kih = K[j]
    var Kil = K[j + 1]

    var chh = Ch(eh, fh, gh)
    var chl = Ch(el, fl, gl)

    var t1l = (hl + sigma1l) | 0
    var t1h = (hh + sigma1h + getCarry(t1l, hl)) | 0
    t1l = (t1l + chl) | 0
    t1h = (t1h + chh + getCarry(t1l, chl)) | 0
    t1l = (t1l + Kil) | 0
    t1h = (t1h + Kih + getCarry(t1l, Kil)) | 0
    t1l = (t1l + Wil) | 0
    t1h = (t1h + Wih + getCarry(t1l, Wil)) | 0

    // t2 = sigma0 + maj
    var t2l = (sigma0l + majl) | 0
    var t2h = (sigma0h + majh + getCarry(t2l, sigma0l)) | 0

    hh = gh
    hl = gl
    gh = fh
    gl = fl
    fh = eh
    fl = el
    el = (dl + t1l) | 0
    eh = (dh + t1h + getCarry(el, dl)) | 0
    dh = ch
    dl = cl
    ch = bh
    cl = bl
    bh = ah
    bl = al
    al = (t1l + t2l) | 0
    ah = (t1h + t2h + getCarry(al, t1l)) | 0
  }

  this._al = (this._al + al) | 0
  this._bl = (this._bl + bl) | 0
  this._cl = (this._cl + cl) | 0
  this._dl = (this._dl + dl) | 0
  this._el = (this._el + el) | 0
  this._fl = (this._fl + fl) | 0
  this._gl = (this._gl + gl) | 0
  this._hl = (this._hl + hl) | 0

  this._ah = (this._ah + ah + getCarry(this._al, al)) | 0
  this._bh = (this._bh + bh + getCarry(this._bl, bl)) | 0
  this._ch = (this._ch + ch + getCarry(this._cl, cl)) | 0
  this._dh = (this._dh + dh + getCarry(this._dl, dl)) | 0
  this._eh = (this._eh + eh + getCarry(this._el, el)) | 0
  this._fh = (this._fh + fh + getCarry(this._fl, fl)) | 0
  this._gh = (this._gh + gh + getCarry(this._gl, gl)) | 0
  this._hh = (this._hh + hh + getCarry(this._hl, hl)) | 0
}

Sha512.prototype._hash = function () {
  var H = Buffer.allocUnsafe(64)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)
  writeInt64BE(this._gh, this._gl, 48)
  writeInt64BE(this._hh, this._hl, 56)

  return H
}

module.exports = Sha512

},{"inherits":"../../inherits/inherits_browser.js","./hash":"../../sha.js/hash.js","safe-buffer":"../../safe-buffer/index.js"}],"../../sha.js/sha384.js":[function(require,module,exports) {

var inherits = require('inherits')
var SHA512 = require('./sha512')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var W = new Array(160)

function Sha384 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha384, SHA512)

Sha384.prototype.init = function () {
  this._ah = 0xcbbb9d5d
  this._bh = 0x629a292a
  this._ch = 0x9159015a
  this._dh = 0x152fecd8
  this._eh = 0x67332667
  this._fh = 0x8eb44a87
  this._gh = 0xdb0c2e0d
  this._hh = 0x47b5481d

  this._al = 0xc1059ed8
  this._bl = 0x367cd507
  this._cl = 0x3070dd17
  this._dl = 0xf70e5939
  this._el = 0xffc00b31
  this._fl = 0x68581511
  this._gl = 0x64f98fa7
  this._hl = 0xbefa4fa4

  return this
}

Sha384.prototype._hash = function () {
  var H = Buffer.allocUnsafe(48)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)

  return H
}

module.exports = Sha384

},{"inherits":"../../inherits/inherits_browser.js","./sha512":"../../sha.js/sha512.js","./hash":"../../sha.js/hash.js","safe-buffer":"../../safe-buffer/index.js"}],"../../sha.js/index.js":[function(require,module,exports) {
var exports = module.exports = function SHA (algorithm) {
  algorithm = algorithm.toLowerCase()

  var Algorithm = exports[algorithm]
  if (!Algorithm) throw new Error(algorithm + ' is not supported (we accept pull requests)')

  return new Algorithm()
}

exports.sha = require('./sha')
exports.sha1 = require('./sha1')
exports.sha224 = require('./sha224')
exports.sha256 = require('./sha256')
exports.sha384 = require('./sha384')
exports.sha512 = require('./sha512')

},{"./sha":"../../sha.js/sha.js","./sha1":"../../sha.js/sha1.js","./sha224":"../../sha.js/sha224.js","./sha256":"../../sha.js/sha256.js","./sha384":"../../sha.js/sha384.js","./sha512":"../../sha.js/sha512.js"}],"../../cipher-base/index.js":[function(require,module,exports) {

var Buffer = require('safe-buffer').Buffer
var Transform = require('stream').Transform
var StringDecoder = require('string_decoder').StringDecoder
var inherits = require('inherits')

function CipherBase (hashMode) {
  Transform.call(this)
  this.hashMode = typeof hashMode === 'string'
  if (this.hashMode) {
    this[hashMode] = this._finalOrDigest
  } else {
    this.final = this._finalOrDigest
  }
  if (this._final) {
    this.__final = this._final
    this._final = null
  }
  this._decoder = null
  this._encoding = null
}
inherits(CipherBase, Transform)

CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
  if (typeof data === 'string') {
    data = Buffer.from(data, inputEnc)
  }

  var outData = this._update(data)
  if (this.hashMode) return this

  if (outputEnc) {
    outData = this._toString(outData, outputEnc)
  }

  return outData
}

CipherBase.prototype.setAutoPadding = function () {}
CipherBase.prototype.getAuthTag = function () {
  throw new Error('trying to get auth tag in unsupported state')
}

CipherBase.prototype.setAuthTag = function () {
  throw new Error('trying to set auth tag in unsupported state')
}

CipherBase.prototype.setAAD = function () {
  throw new Error('trying to set aad in unsupported state')
}

CipherBase.prototype._transform = function (data, _, next) {
  var err
  try {
    if (this.hashMode) {
      this._update(data)
    } else {
      this.push(this._update(data))
    }
  } catch (e) {
    err = e
  } finally {
    next(err)
  }
}
CipherBase.prototype._flush = function (done) {
  var err
  try {
    this.push(this.__final())
  } catch (e) {
    err = e
  }

  done(err)
}
CipherBase.prototype._finalOrDigest = function (outputEnc) {
  var outData = this.__final() || Buffer.alloc(0)
  if (outputEnc) {
    outData = this._toString(outData, outputEnc, true)
  }
  return outData
}

CipherBase.prototype._toString = function (value, enc, fin) {
  if (!this._decoder) {
    this._decoder = new StringDecoder(enc)
    this._encoding = enc
  }

  if (this._encoding !== enc) throw new Error('can\'t switch encodings')

  var out = this._decoder.write(value)
  if (fin) {
    out += this._decoder.end()
  }

  return out
}

module.exports = CipherBase

},{"safe-buffer":"../../safe-buffer/index.js","stream":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/stream-browserify/index.js","string_decoder":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/string_decoder/lib/string_decoder.js","inherits":"../../inherits/inherits_browser.js"}],"../../create-hash/browser.js":[function(require,module,exports) {
'use strict'
var inherits = require('inherits')
var MD5 = require('md5.js')
var RIPEMD160 = require('ripemd160')
var sha = require('sha.js')
var Base = require('cipher-base')

function Hash (hash) {
  Base.call(this, 'digest')

  this._hash = hash
}

inherits(Hash, Base)

Hash.prototype._update = function (data) {
  this._hash.update(data)
}

Hash.prototype._final = function () {
  return this._hash.digest()
}

module.exports = function createHash (alg) {
  alg = alg.toLowerCase()
  if (alg === 'md5') return new MD5()
  if (alg === 'rmd160' || alg === 'ripemd160') return new RIPEMD160()

  return new Hash(sha(alg))
}

},{"inherits":"../../inherits/inherits_browser.js","md5.js":"../../md5.js/index.js","ripemd160":"../../ripemd160/index.js","sha.js":"../../sha.js/index.js","cipher-base":"../../cipher-base/index.js"}],"../../pbkdf2/lib/precondition.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
var MAX_ALLOC = Math.pow(2, 30) - 1; // default in iojs

function checkBuffer(buf, name) {
  if (typeof buf !== 'string' && !Buffer.isBuffer(buf)) {
    throw new TypeError(name + ' must be a buffer or string');
  }
}

module.exports = function (password, salt, iterations, keylen) {
  checkBuffer(password, 'Password');
  checkBuffer(salt, 'Salt');

  if (typeof iterations !== 'number') {
    throw new TypeError('Iterations not a number');
  }

  if (iterations < 0) {
    throw new TypeError('Bad iterations');
  }

  if (typeof keylen !== 'number') {
    throw new TypeError('Key length not a number');
  }

  if (keylen < 0 || keylen > MAX_ALLOC || keylen !== keylen) {
    /* eslint no-self-compare: 0 */
    throw new TypeError('Bad key length');
  }
};
},{"buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/buffer/index.js"}],"../../pbkdf2/lib/default-encoding.js":[function(require,module,exports) {
var process = require("process");
var defaultEncoding;
/* istanbul ignore next */

if (true) {
  defaultEncoding = 'utf-8';
} else {
  var pVersionMajor = parseInt(process.version.split('.')[0].slice(1), 10);
  defaultEncoding = pVersionMajor >= 6 ? 'utf-8' : 'binary';
}

module.exports = defaultEncoding;
},{"process":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process/browser.js"}],"../../create-hash/md5.js":[function(require,module,exports) {
var MD5 = require('md5.js')

module.exports = function (buffer) {
  return new MD5().update(buffer).digest()
}

},{"md5.js":"../../md5.js/index.js"}],"../../pbkdf2/lib/sync-browser.js":[function(require,module,exports) {

var md5 = require('create-hash/md5');

var RIPEMD160 = require('ripemd160');

var sha = require('sha.js');

var checkParameters = require('./precondition');

var defaultEncoding = require('./default-encoding');

var Buffer = require('safe-buffer').Buffer;

var ZEROS = Buffer.alloc(128);
var sizes = {
  md5: 16,
  sha1: 20,
  sha224: 28,
  sha256: 32,
  sha384: 48,
  sha512: 64,
  rmd160: 20,
  ripemd160: 20
};

function Hmac(alg, key, saltLen) {
  var hash = getDigest(alg);
  var blocksize = alg === 'sha512' || alg === 'sha384' ? 128 : 64;

  if (key.length > blocksize) {
    key = hash(key);
  } else if (key.length < blocksize) {
    key = Buffer.concat([key, ZEROS], blocksize);
  }

  var ipad = Buffer.allocUnsafe(blocksize + sizes[alg]);
  var opad = Buffer.allocUnsafe(blocksize + sizes[alg]);

  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5C;
  }

  var ipad1 = Buffer.allocUnsafe(blocksize + saltLen + 4);
  ipad.copy(ipad1, 0, 0, blocksize);
  this.ipad1 = ipad1;
  this.ipad2 = ipad;
  this.opad = opad;
  this.alg = alg;
  this.blocksize = blocksize;
  this.hash = hash;
  this.size = sizes[alg];
}

Hmac.prototype.run = function (data, ipad) {
  data.copy(ipad, this.blocksize);
  var h = this.hash(ipad);
  h.copy(this.opad, this.blocksize);
  return this.hash(this.opad);
};

function getDigest(alg) {
  function shaFunc(data) {
    return sha(alg).update(data).digest();
  }

  function rmd160Func(data) {
    return new RIPEMD160().update(data).digest();
  }

  if (alg === 'rmd160' || alg === 'ripemd160') return rmd160Func;
  if (alg === 'md5') return md5;
  return shaFunc;
}

function pbkdf2(password, salt, iterations, keylen, digest) {
  checkParameters(password, salt, iterations, keylen);
  if (!Buffer.isBuffer(password)) password = Buffer.from(password, defaultEncoding);
  if (!Buffer.isBuffer(salt)) salt = Buffer.from(salt, defaultEncoding);
  digest = digest || 'sha1';
  var hmac = new Hmac(digest, password, salt.length);
  var DK = Buffer.allocUnsafe(keylen);
  var block1 = Buffer.allocUnsafe(salt.length + 4);
  salt.copy(block1, 0, 0, salt.length);
  var destPos = 0;
  var hLen = sizes[digest];
  var l = Math.ceil(keylen / hLen);

  for (var i = 1; i <= l; i++) {
    block1.writeUInt32BE(i, salt.length);
    var T = hmac.run(block1, hmac.ipad1);
    var U = T;

    for (var j = 1; j < iterations; j++) {
      U = hmac.run(U, hmac.ipad2);

      for (var k = 0; k < hLen; k++) T[k] ^= U[k];
    }

    T.copy(DK, destPos);
    destPos += hLen;
  }

  return DK;
}

module.exports = pbkdf2;
},{"create-hash/md5":"../../create-hash/md5.js","ripemd160":"../../ripemd160/index.js","sha.js":"../../sha.js/index.js","./precondition":"../../pbkdf2/lib/precondition.js","./default-encoding":"../../pbkdf2/lib/default-encoding.js","safe-buffer":"../../safe-buffer/index.js"}],"../../pbkdf2/lib/async.js":[function(require,module,exports) {

var global = arguments[3];
var process = require("process");
var checkParameters = require('./precondition');

var defaultEncoding = require('./default-encoding');

var sync = require('./sync');

var Buffer = require('safe-buffer').Buffer;

var ZERO_BUF;
var subtle = global.crypto && global.crypto.subtle;
var toBrowser = {
  'sha': 'SHA-1',
  'sha-1': 'SHA-1',
  'sha1': 'SHA-1',
  'sha256': 'SHA-256',
  'sha-256': 'SHA-256',
  'sha384': 'SHA-384',
  'sha-384': 'SHA-384',
  'sha-512': 'SHA-512',
  'sha512': 'SHA-512'
};
var checks = [];

function checkNative(algo) {
  if (global.process && !global.process.browser) {
    return Promise.resolve(false);
  }

  if (!subtle || !subtle.importKey || !subtle.deriveBits) {
    return Promise.resolve(false);
  }

  if (checks[algo] !== undefined) {
    return checks[algo];
  }

  ZERO_BUF = ZERO_BUF || Buffer.alloc(8);
  var prom = browserPbkdf2(ZERO_BUF, ZERO_BUF, 10, 128, algo).then(function () {
    return true;
  }).catch(function () {
    return false;
  });
  checks[algo] = prom;
  return prom;
}

function browserPbkdf2(password, salt, iterations, length, algo) {
  return subtle.importKey('raw', password, {
    name: 'PBKDF2'
  }, false, ['deriveBits']).then(function (key) {
    return subtle.deriveBits({
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: {
        name: algo
      }
    }, key, length << 3);
  }).then(function (res) {
    return Buffer.from(res);
  });
}

function resolvePromise(promise, callback) {
  promise.then(function (out) {
    process.nextTick(function () {
      callback(null, out);
    });
  }, function (e) {
    process.nextTick(function () {
      callback(e);
    });
  });
}

module.exports = function (password, salt, iterations, keylen, digest, callback) {
  if (typeof digest === 'function') {
    callback = digest;
    digest = undefined;
  }

  digest = digest || 'sha1';
  var algo = toBrowser[digest.toLowerCase()];

  if (!algo || typeof global.Promise !== 'function') {
    return process.nextTick(function () {
      var out;

      try {
        out = sync(password, salt, iterations, keylen, digest);
      } catch (e) {
        return callback(e);
      }

      callback(null, out);
    });
  }

  checkParameters(password, salt, iterations, keylen);
  if (typeof callback !== 'function') throw new Error('No callback provided to pbkdf2');
  if (!Buffer.isBuffer(password)) password = Buffer.from(password, defaultEncoding);
  if (!Buffer.isBuffer(salt)) salt = Buffer.from(salt, defaultEncoding);
  resolvePromise(checkNative(algo).then(function (resp) {
    if (resp) return browserPbkdf2(password, salt, iterations, keylen, algo);
    return sync(password, salt, iterations, keylen, digest);
  }), callback);
};
},{"./precondition":"../../pbkdf2/lib/precondition.js","./default-encoding":"../../pbkdf2/lib/default-encoding.js","./sync":"../../pbkdf2/lib/sync-browser.js","safe-buffer":"../../safe-buffer/index.js","process":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process/browser.js"}],"../../pbkdf2/browser.js":[function(require,module,exports) {
exports.pbkdf2 = require('./lib/async');
exports.pbkdf2Sync = require('./lib/sync');
},{"./lib/async":"../../pbkdf2/lib/async.js","./lib/sync":"../../pbkdf2/lib/sync-browser.js"}],"../../randombytes/browser.js":[function(require,module,exports) {

var global = arguments[3];
var process = require("process");
'use strict'

// limit of Crypto.getRandomValues()
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
var MAX_BYTES = 65536

// Node supports requesting up to this number of bytes
// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
var MAX_UINT32 = 4294967295

function oldBrowser () {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
}

var Buffer = require('safe-buffer').Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = oldBrowser
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')

  var bytes = Buffer.allocUnsafe(size)

  if (size > 0) {  // getRandomValues fails on IE if size == 0
    if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
      // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
      for (var generated = 0; generated < size; generated += MAX_BYTES) {
        // buffer.slice automatically checks if the end is past the end of
        // the buffer so we don't have to here
        crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES))
      }
    } else {
      crypto.getRandomValues(bytes)
    }
  }

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

},{"safe-buffer":"../../safe-buffer/index.js","process":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/process/browser.js"}],"wordlists/chinese_simplified.json":[function(require,module,exports) {
module.exports = [
    "的",
    "一",
    "是",
    "在",
    "不",
    "了",
    "有",
    "和",
    "人",
    "这",
    "中",
    "大",
    "为",
    "上",
    "个",
    "国",
    "我",
    "以",
    "要",
    "他",
    "时",
    "来",
    "用",
    "们",
    "生",
    "到",
    "作",
    "地",
    "于",
    "出",
    "就",
    "分",
    "对",
    "成",
    "会",
    "可",
    "主",
    "发",
    "年",
    "动",
    "同",
    "工",
    "也",
    "能",
    "下",
    "过",
    "子",
    "说",
    "产",
    "种",
    "面",
    "而",
    "方",
    "后",
    "多",
    "定",
    "行",
    "学",
    "法",
    "所",
    "民",
    "得",
    "经",
    "十",
    "三",
    "之",
    "进",
    "着",
    "等",
    "部",
    "度",
    "家",
    "电",
    "力",
    "里",
    "如",
    "水",
    "化",
    "高",
    "自",
    "二",
    "理",
    "起",
    "小",
    "物",
    "现",
    "实",
    "加",
    "量",
    "都",
    "两",
    "体",
    "制",
    "机",
    "当",
    "使",
    "点",
    "从",
    "业",
    "本",
    "去",
    "把",
    "性",
    "好",
    "应",
    "开",
    "它",
    "合",
    "还",
    "因",
    "由",
    "其",
    "些",
    "然",
    "前",
    "外",
    "天",
    "政",
    "四",
    "日",
    "那",
    "社",
    "义",
    "事",
    "平",
    "形",
    "相",
    "全",
    "表",
    "间",
    "样",
    "与",
    "关",
    "各",
    "重",
    "新",
    "线",
    "内",
    "数",
    "正",
    "心",
    "反",
    "你",
    "明",
    "看",
    "原",
    "又",
    "么",
    "利",
    "比",
    "或",
    "但",
    "质",
    "气",
    "第",
    "向",
    "道",
    "命",
    "此",
    "变",
    "条",
    "只",
    "没",
    "结",
    "解",
    "问",
    "意",
    "建",
    "月",
    "公",
    "无",
    "系",
    "军",
    "很",
    "情",
    "者",
    "最",
    "立",
    "代",
    "想",
    "已",
    "通",
    "并",
    "提",
    "直",
    "题",
    "党",
    "程",
    "展",
    "五",
    "果",
    "料",
    "象",
    "员",
    "革",
    "位",
    "入",
    "常",
    "文",
    "总",
    "次",
    "品",
    "式",
    "活",
    "设",
    "及",
    "管",
    "特",
    "件",
    "长",
    "求",
    "老",
    "头",
    "基",
    "资",
    "边",
    "流",
    "路",
    "级",
    "少",
    "图",
    "山",
    "统",
    "接",
    "知",
    "较",
    "将",
    "组",
    "见",
    "计",
    "别",
    "她",
    "手",
    "角",
    "期",
    "根",
    "论",
    "运",
    "农",
    "指",
    "几",
    "九",
    "区",
    "强",
    "放",
    "决",
    "西",
    "被",
    "干",
    "做",
    "必",
    "战",
    "先",
    "回",
    "则",
    "任",
    "取",
    "据",
    "处",
    "队",
    "南",
    "给",
    "色",
    "光",
    "门",
    "即",
    "保",
    "治",
    "北",
    "造",
    "百",
    "规",
    "热",
    "领",
    "七",
    "海",
    "口",
    "东",
    "导",
    "器",
    "压",
    "志",
    "世",
    "金",
    "增",
    "争",
    "济",
    "阶",
    "油",
    "思",
    "术",
    "极",
    "交",
    "受",
    "联",
    "什",
    "认",
    "六",
    "共",
    "权",
    "收",
    "证",
    "改",
    "清",
    "美",
    "再",
    "采",
    "转",
    "更",
    "单",
    "风",
    "切",
    "打",
    "白",
    "教",
    "速",
    "花",
    "带",
    "安",
    "场",
    "身",
    "车",
    "例",
    "真",
    "务",
    "具",
    "万",
    "每",
    "目",
    "至",
    "达",
    "走",
    "积",
    "示",
    "议",
    "声",
    "报",
    "斗",
    "完",
    "类",
    "八",
    "离",
    "华",
    "名",
    "确",
    "才",
    "科",
    "张",
    "信",
    "马",
    "节",
    "话",
    "米",
    "整",
    "空",
    "元",
    "况",
    "今",
    "集",
    "温",
    "传",
    "土",
    "许",
    "步",
    "群",
    "广",
    "石",
    "记",
    "需",
    "段",
    "研",
    "界",
    "拉",
    "林",
    "律",
    "叫",
    "且",
    "究",
    "观",
    "越",
    "织",
    "装",
    "影",
    "算",
    "低",
    "持",
    "音",
    "众",
    "书",
    "布",
    "复",
    "容",
    "儿",
    "须",
    "际",
    "商",
    "非",
    "验",
    "连",
    "断",
    "深",
    "难",
    "近",
    "矿",
    "千",
    "周",
    "委",
    "素",
    "技",
    "备",
    "半",
    "办",
    "青",
    "省",
    "列",
    "习",
    "响",
    "约",
    "支",
    "般",
    "史",
    "感",
    "劳",
    "便",
    "团",
    "往",
    "酸",
    "历",
    "市",
    "克",
    "何",
    "除",
    "消",
    "构",
    "府",
    "称",
    "太",
    "准",
    "精",
    "值",
    "号",
    "率",
    "族",
    "维",
    "划",
    "选",
    "标",
    "写",
    "存",
    "候",
    "毛",
    "亲",
    "快",
    "效",
    "斯",
    "院",
    "查",
    "江",
    "型",
    "眼",
    "王",
    "按",
    "格",
    "养",
    "易",
    "置",
    "派",
    "层",
    "片",
    "始",
    "却",
    "专",
    "状",
    "育",
    "厂",
    "京",
    "识",
    "适",
    "属",
    "圆",
    "包",
    "火",
    "住",
    "调",
    "满",
    "县",
    "局",
    "照",
    "参",
    "红",
    "细",
    "引",
    "听",
    "该",
    "铁",
    "价",
    "严",
    "首",
    "底",
    "液",
    "官",
    "德",
    "随",
    "病",
    "苏",
    "失",
    "尔",
    "死",
    "讲",
    "配",
    "女",
    "黄",
    "推",
    "显",
    "谈",
    "罪",
    "神",
    "艺",
    "呢",
    "席",
    "含",
    "企",
    "望",
    "密",
    "批",
    "营",
    "项",
    "防",
    "举",
    "球",
    "英",
    "氧",
    "势",
    "告",
    "李",
    "台",
    "落",
    "木",
    "帮",
    "轮",
    "破",
    "亚",
    "师",
    "围",
    "注",
    "远",
    "字",
    "材",
    "排",
    "供",
    "河",
    "态",
    "封",
    "另",
    "施",
    "减",
    "树",
    "溶",
    "怎",
    "止",
    "案",
    "言",
    "士",
    "均",
    "武",
    "固",
    "叶",
    "鱼",
    "波",
    "视",
    "仅",
    "费",
    "紧",
    "爱",
    "左",
    "章",
    "早",
    "朝",
    "害",
    "续",
    "轻",
    "服",
    "试",
    "食",
    "充",
    "兵",
    "源",
    "判",
    "护",
    "司",
    "足",
    "某",
    "练",
    "差",
    "致",
    "板",
    "田",
    "降",
    "黑",
    "犯",
    "负",
    "击",
    "范",
    "继",
    "兴",
    "似",
    "余",
    "坚",
    "曲",
    "输",
    "修",
    "故",
    "城",
    "夫",
    "够",
    "送",
    "笔",
    "船",
    "占",
    "右",
    "财",
    "吃",
    "富",
    "春",
    "职",
    "觉",
    "汉",
    "画",
    "功",
    "巴",
    "跟",
    "虽",
    "杂",
    "飞",
    "检",
    "吸",
    "助",
    "升",
    "阳",
    "互",
    "初",
    "创",
    "抗",
    "考",
    "投",
    "坏",
    "策",
    "古",
    "径",
    "换",
    "未",
    "跑",
    "留",
    "钢",
    "曾",
    "端",
    "责",
    "站",
    "简",
    "述",
    "钱",
    "副",
    "尽",
    "帝",
    "射",
    "草",
    "冲",
    "承",
    "独",
    "令",
    "限",
    "阿",
    "宣",
    "环",
    "双",
    "请",
    "超",
    "微",
    "让",
    "控",
    "州",
    "良",
    "轴",
    "找",
    "否",
    "纪",
    "益",
    "依",
    "优",
    "顶",
    "础",
    "载",
    "倒",
    "房",
    "突",
    "坐",
    "粉",
    "敌",
    "略",
    "客",
    "袁",
    "冷",
    "胜",
    "绝",
    "析",
    "块",
    "剂",
    "测",
    "丝",
    "协",
    "诉",
    "念",
    "陈",
    "仍",
    "罗",
    "盐",
    "友",
    "洋",
    "错",
    "苦",
    "夜",
    "刑",
    "移",
    "频",
    "逐",
    "靠",
    "混",
    "母",
    "短",
    "皮",
    "终",
    "聚",
    "汽",
    "村",
    "云",
    "哪",
    "既",
    "距",
    "卫",
    "停",
    "烈",
    "央",
    "察",
    "烧",
    "迅",
    "境",
    "若",
    "印",
    "洲",
    "刻",
    "括",
    "激",
    "孔",
    "搞",
    "甚",
    "室",
    "待",
    "核",
    "校",
    "散",
    "侵",
    "吧",
    "甲",
    "游",
    "久",
    "菜",
    "味",
    "旧",
    "模",
    "湖",
    "货",
    "损",
    "预",
    "阻",
    "毫",
    "普",
    "稳",
    "乙",
    "妈",
    "植",
    "息",
    "扩",
    "银",
    "语",
    "挥",
    "酒",
    "守",
    "拿",
    "序",
    "纸",
    "医",
    "缺",
    "雨",
    "吗",
    "针",
    "刘",
    "啊",
    "急",
    "唱",
    "误",
    "训",
    "愿",
    "审",
    "附",
    "获",
    "茶",
    "鲜",
    "粮",
    "斤",
    "孩",
    "脱",
    "硫",
    "肥",
    "善",
    "龙",
    "演",
    "父",
    "渐",
    "血",
    "欢",
    "械",
    "掌",
    "歌",
    "沙",
    "刚",
    "攻",
    "谓",
    "盾",
    "讨",
    "晚",
    "粒",
    "乱",
    "燃",
    "矛",
    "乎",
    "杀",
    "药",
    "宁",
    "鲁",
    "贵",
    "钟",
    "煤",
    "读",
    "班",
    "伯",
    "香",
    "介",
    "迫",
    "句",
    "丰",
    "培",
    "握",
    "兰",
    "担",
    "弦",
    "蛋",
    "沉",
    "假",
    "穿",
    "执",
    "答",
    "乐",
    "谁",
    "顺",
    "烟",
    "缩",
    "征",
    "脸",
    "喜",
    "松",
    "脚",
    "困",
    "异",
    "免",
    "背",
    "星",
    "福",
    "买",
    "染",
    "井",
    "概",
    "慢",
    "怕",
    "磁",
    "倍",
    "祖",
    "皇",
    "促",
    "静",
    "补",
    "评",
    "翻",
    "肉",
    "践",
    "尼",
    "衣",
    "宽",
    "扬",
    "棉",
    "希",
    "伤",
    "操",
    "垂",
    "秋",
    "宜",
    "氢",
    "套",
    "督",
    "振",
    "架",
    "亮",
    "末",
    "宪",
    "庆",
    "编",
    "牛",
    "触",
    "映",
    "雷",
    "销",
    "诗",
    "座",
    "居",
    "抓",
    "裂",
    "胞",
    "呼",
    "娘",
    "景",
    "威",
    "绿",
    "晶",
    "厚",
    "盟",
    "衡",
    "鸡",
    "孙",
    "延",
    "危",
    "胶",
    "屋",
    "乡",
    "临",
    "陆",
    "顾",
    "掉",
    "呀",
    "灯",
    "岁",
    "措",
    "束",
    "耐",
    "剧",
    "玉",
    "赵",
    "跳",
    "哥",
    "季",
    "课",
    "凯",
    "胡",
    "额",
    "款",
    "绍",
    "卷",
    "齐",
    "伟",
    "蒸",
    "殖",
    "永",
    "宗",
    "苗",
    "川",
    "炉",
    "岩",
    "弱",
    "零",
    "杨",
    "奏",
    "沿",
    "露",
    "杆",
    "探",
    "滑",
    "镇",
    "饭",
    "浓",
    "航",
    "怀",
    "赶",
    "库",
    "夺",
    "伊",
    "灵",
    "税",
    "途",
    "灭",
    "赛",
    "归",
    "召",
    "鼓",
    "播",
    "盘",
    "裁",
    "险",
    "康",
    "唯",
    "录",
    "菌",
    "纯",
    "借",
    "糖",
    "盖",
    "横",
    "符",
    "私",
    "努",
    "堂",
    "域",
    "枪",
    "润",
    "幅",
    "哈",
    "竟",
    "熟",
    "虫",
    "泽",
    "脑",
    "壤",
    "碳",
    "欧",
    "遍",
    "侧",
    "寨",
    "敢",
    "彻",
    "虑",
    "斜",
    "薄",
    "庭",
    "纳",
    "弹",
    "饲",
    "伸",
    "折",
    "麦",
    "湿",
    "暗",
    "荷",
    "瓦",
    "塞",
    "床",
    "筑",
    "恶",
    "户",
    "访",
    "塔",
    "奇",
    "透",
    "梁",
    "刀",
    "旋",
    "迹",
    "卡",
    "氯",
    "遇",
    "份",
    "毒",
    "泥",
    "退",
    "洗",
    "摆",
    "灰",
    "彩",
    "卖",
    "耗",
    "夏",
    "择",
    "忙",
    "铜",
    "献",
    "硬",
    "予",
    "繁",
    "圈",
    "雪",
    "函",
    "亦",
    "抽",
    "篇",
    "阵",
    "阴",
    "丁",
    "尺",
    "追",
    "堆",
    "雄",
    "迎",
    "泛",
    "爸",
    "楼",
    "避",
    "谋",
    "吨",
    "野",
    "猪",
    "旗",
    "累",
    "偏",
    "典",
    "馆",
    "索",
    "秦",
    "脂",
    "潮",
    "爷",
    "豆",
    "忽",
    "托",
    "惊",
    "塑",
    "遗",
    "愈",
    "朱",
    "替",
    "纤",
    "粗",
    "倾",
    "尚",
    "痛",
    "楚",
    "谢",
    "奋",
    "购",
    "磨",
    "君",
    "池",
    "旁",
    "碎",
    "骨",
    "监",
    "捕",
    "弟",
    "暴",
    "割",
    "贯",
    "殊",
    "释",
    "词",
    "亡",
    "壁",
    "顿",
    "宝",
    "午",
    "尘",
    "闻",
    "揭",
    "炮",
    "残",
    "冬",
    "桥",
    "妇",
    "警",
    "综",
    "招",
    "吴",
    "付",
    "浮",
    "遭",
    "徐",
    "您",
    "摇",
    "谷",
    "赞",
    "箱",
    "隔",
    "订",
    "男",
    "吹",
    "园",
    "纷",
    "唐",
    "败",
    "宋",
    "玻",
    "巨",
    "耕",
    "坦",
    "荣",
    "闭",
    "湾",
    "键",
    "凡",
    "驻",
    "锅",
    "救",
    "恩",
    "剥",
    "凝",
    "碱",
    "齿",
    "截",
    "炼",
    "麻",
    "纺",
    "禁",
    "废",
    "盛",
    "版",
    "缓",
    "净",
    "睛",
    "昌",
    "婚",
    "涉",
    "筒",
    "嘴",
    "插",
    "岸",
    "朗",
    "庄",
    "街",
    "藏",
    "姑",
    "贸",
    "腐",
    "奴",
    "啦",
    "惯",
    "乘",
    "伙",
    "恢",
    "匀",
    "纱",
    "扎",
    "辩",
    "耳",
    "彪",
    "臣",
    "亿",
    "璃",
    "抵",
    "脉",
    "秀",
    "萨",
    "俄",
    "网",
    "舞",
    "店",
    "喷",
    "纵",
    "寸",
    "汗",
    "挂",
    "洪",
    "贺",
    "闪",
    "柬",
    "爆",
    "烯",
    "津",
    "稻",
    "墙",
    "软",
    "勇",
    "像",
    "滚",
    "厘",
    "蒙",
    "芳",
    "肯",
    "坡",
    "柱",
    "荡",
    "腿",
    "仪",
    "旅",
    "尾",
    "轧",
    "冰",
    "贡",
    "登",
    "黎",
    "削",
    "钻",
    "勒",
    "逃",
    "障",
    "氨",
    "郭",
    "峰",
    "币",
    "港",
    "伏",
    "轨",
    "亩",
    "毕",
    "擦",
    "莫",
    "刺",
    "浪",
    "秘",
    "援",
    "株",
    "健",
    "售",
    "股",
    "岛",
    "甘",
    "泡",
    "睡",
    "童",
    "铸",
    "汤",
    "阀",
    "休",
    "汇",
    "舍",
    "牧",
    "绕",
    "炸",
    "哲",
    "磷",
    "绩",
    "朋",
    "淡",
    "尖",
    "启",
    "陷",
    "柴",
    "呈",
    "徒",
    "颜",
    "泪",
    "稍",
    "忘",
    "泵",
    "蓝",
    "拖",
    "洞",
    "授",
    "镜",
    "辛",
    "壮",
    "锋",
    "贫",
    "虚",
    "弯",
    "摩",
    "泰",
    "幼",
    "廷",
    "尊",
    "窗",
    "纲",
    "弄",
    "隶",
    "疑",
    "氏",
    "宫",
    "姐",
    "震",
    "瑞",
    "怪",
    "尤",
    "琴",
    "循",
    "描",
    "膜",
    "违",
    "夹",
    "腰",
    "缘",
    "珠",
    "穷",
    "森",
    "枝",
    "竹",
    "沟",
    "催",
    "绳",
    "忆",
    "邦",
    "剩",
    "幸",
    "浆",
    "栏",
    "拥",
    "牙",
    "贮",
    "礼",
    "滤",
    "钠",
    "纹",
    "罢",
    "拍",
    "咱",
    "喊",
    "袖",
    "埃",
    "勤",
    "罚",
    "焦",
    "潜",
    "伍",
    "墨",
    "欲",
    "缝",
    "姓",
    "刊",
    "饱",
    "仿",
    "奖",
    "铝",
    "鬼",
    "丽",
    "跨",
    "默",
    "挖",
    "链",
    "扫",
    "喝",
    "袋",
    "炭",
    "污",
    "幕",
    "诸",
    "弧",
    "励",
    "梅",
    "奶",
    "洁",
    "灾",
    "舟",
    "鉴",
    "苯",
    "讼",
    "抱",
    "毁",
    "懂",
    "寒",
    "智",
    "埔",
    "寄",
    "届",
    "跃",
    "渡",
    "挑",
    "丹",
    "艰",
    "贝",
    "碰",
    "拔",
    "爹",
    "戴",
    "码",
    "梦",
    "芽",
    "熔",
    "赤",
    "渔",
    "哭",
    "敬",
    "颗",
    "奔",
    "铅",
    "仲",
    "虎",
    "稀",
    "妹",
    "乏",
    "珍",
    "申",
    "桌",
    "遵",
    "允",
    "隆",
    "螺",
    "仓",
    "魏",
    "锐",
    "晓",
    "氮",
    "兼",
    "隐",
    "碍",
    "赫",
    "拨",
    "忠",
    "肃",
    "缸",
    "牵",
    "抢",
    "博",
    "巧",
    "壳",
    "兄",
    "杜",
    "讯",
    "诚",
    "碧",
    "祥",
    "柯",
    "页",
    "巡",
    "矩",
    "悲",
    "灌",
    "龄",
    "伦",
    "票",
    "寻",
    "桂",
    "铺",
    "圣",
    "恐",
    "恰",
    "郑",
    "趣",
    "抬",
    "荒",
    "腾",
    "贴",
    "柔",
    "滴",
    "猛",
    "阔",
    "辆",
    "妻",
    "填",
    "撤",
    "储",
    "签",
    "闹",
    "扰",
    "紫",
    "砂",
    "递",
    "戏",
    "吊",
    "陶",
    "伐",
    "喂",
    "疗",
    "瓶",
    "婆",
    "抚",
    "臂",
    "摸",
    "忍",
    "虾",
    "蜡",
    "邻",
    "胸",
    "巩",
    "挤",
    "偶",
    "弃",
    "槽",
    "劲",
    "乳",
    "邓",
    "吉",
    "仁",
    "烂",
    "砖",
    "租",
    "乌",
    "舰",
    "伴",
    "瓜",
    "浅",
    "丙",
    "暂",
    "燥",
    "橡",
    "柳",
    "迷",
    "暖",
    "牌",
    "秧",
    "胆",
    "详",
    "簧",
    "踏",
    "瓷",
    "谱",
    "呆",
    "宾",
    "糊",
    "洛",
    "辉",
    "愤",
    "竞",
    "隙",
    "怒",
    "粘",
    "乃",
    "绪",
    "肩",
    "籍",
    "敏",
    "涂",
    "熙",
    "皆",
    "侦",
    "悬",
    "掘",
    "享",
    "纠",
    "醒",
    "狂",
    "锁",
    "淀",
    "恨",
    "牲",
    "霸",
    "爬",
    "赏",
    "逆",
    "玩",
    "陵",
    "祝",
    "秒",
    "浙",
    "貌",
    "役",
    "彼",
    "悉",
    "鸭",
    "趋",
    "凤",
    "晨",
    "畜",
    "辈",
    "秩",
    "卵",
    "署",
    "梯",
    "炎",
    "滩",
    "棋",
    "驱",
    "筛",
    "峡",
    "冒",
    "啥",
    "寿",
    "译",
    "浸",
    "泉",
    "帽",
    "迟",
    "硅",
    "疆",
    "贷",
    "漏",
    "稿",
    "冠",
    "嫩",
    "胁",
    "芯",
    "牢",
    "叛",
    "蚀",
    "奥",
    "鸣",
    "岭",
    "羊",
    "凭",
    "串",
    "塘",
    "绘",
    "酵",
    "融",
    "盆",
    "锡",
    "庙",
    "筹",
    "冻",
    "辅",
    "摄",
    "袭",
    "筋",
    "拒",
    "僚",
    "旱",
    "钾",
    "鸟",
    "漆",
    "沈",
    "眉",
    "疏",
    "添",
    "棒",
    "穗",
    "硝",
    "韩",
    "逼",
    "扭",
    "侨",
    "凉",
    "挺",
    "碗",
    "栽",
    "炒",
    "杯",
    "患",
    "馏",
    "劝",
    "豪",
    "辽",
    "勃",
    "鸿",
    "旦",
    "吏",
    "拜",
    "狗",
    "埋",
    "辊",
    "掩",
    "饮",
    "搬",
    "骂",
    "辞",
    "勾",
    "扣",
    "估",
    "蒋",
    "绒",
    "雾",
    "丈",
    "朵",
    "姆",
    "拟",
    "宇",
    "辑",
    "陕",
    "雕",
    "偿",
    "蓄",
    "崇",
    "剪",
    "倡",
    "厅",
    "咬",
    "驶",
    "薯",
    "刷",
    "斥",
    "番",
    "赋",
    "奉",
    "佛",
    "浇",
    "漫",
    "曼",
    "扇",
    "钙",
    "桃",
    "扶",
    "仔",
    "返",
    "俗",
    "亏",
    "腔",
    "鞋",
    "棱",
    "覆",
    "框",
    "悄",
    "叔",
    "撞",
    "骗",
    "勘",
    "旺",
    "沸",
    "孤",
    "吐",
    "孟",
    "渠",
    "屈",
    "疾",
    "妙",
    "惜",
    "仰",
    "狠",
    "胀",
    "谐",
    "抛",
    "霉",
    "桑",
    "岗",
    "嘛",
    "衰",
    "盗",
    "渗",
    "脏",
    "赖",
    "涌",
    "甜",
    "曹",
    "阅",
    "肌",
    "哩",
    "厉",
    "烃",
    "纬",
    "毅",
    "昨",
    "伪",
    "症",
    "煮",
    "叹",
    "钉",
    "搭",
    "茎",
    "笼",
    "酷",
    "偷",
    "弓",
    "锥",
    "恒",
    "杰",
    "坑",
    "鼻",
    "翼",
    "纶",
    "叙",
    "狱",
    "逮",
    "罐",
    "络",
    "棚",
    "抑",
    "膨",
    "蔬",
    "寺",
    "骤",
    "穆",
    "冶",
    "枯",
    "册",
    "尸",
    "凸",
    "绅",
    "坯",
    "牺",
    "焰",
    "轰",
    "欣",
    "晋",
    "瘦",
    "御",
    "锭",
    "锦",
    "丧",
    "旬",
    "锻",
    "垄",
    "搜",
    "扑",
    "邀",
    "亭",
    "酯",
    "迈",
    "舒",
    "脆",
    "酶",
    "闲",
    "忧",
    "酚",
    "顽",
    "羽",
    "涨",
    "卸",
    "仗",
    "陪",
    "辟",
    "惩",
    "杭",
    "姚",
    "肚",
    "捉",
    "飘",
    "漂",
    "昆",
    "欺",
    "吾",
    "郎",
    "烷",
    "汁",
    "呵",
    "饰",
    "萧",
    "雅",
    "邮",
    "迁",
    "燕",
    "撒",
    "姻",
    "赴",
    "宴",
    "烦",
    "债",
    "帐",
    "斑",
    "铃",
    "旨",
    "醇",
    "董",
    "饼",
    "雏",
    "姿",
    "拌",
    "傅",
    "腹",
    "妥",
    "揉",
    "贤",
    "拆",
    "歪",
    "葡",
    "胺",
    "丢",
    "浩",
    "徽",
    "昂",
    "垫",
    "挡",
    "览",
    "贪",
    "慰",
    "缴",
    "汪",
    "慌",
    "冯",
    "诺",
    "姜",
    "谊",
    "凶",
    "劣",
    "诬",
    "耀",
    "昏",
    "躺",
    "盈",
    "骑",
    "乔",
    "溪",
    "丛",
    "卢",
    "抹",
    "闷",
    "咨",
    "刮",
    "驾",
    "缆",
    "悟",
    "摘",
    "铒",
    "掷",
    "颇",
    "幻",
    "柄",
    "惠",
    "惨",
    "佳",
    "仇",
    "腊",
    "窝",
    "涤",
    "剑",
    "瞧",
    "堡",
    "泼",
    "葱",
    "罩",
    "霍",
    "捞",
    "胎",
    "苍",
    "滨",
    "俩",
    "捅",
    "湘",
    "砍",
    "霞",
    "邵",
    "萄",
    "疯",
    "淮",
    "遂",
    "熊",
    "粪",
    "烘",
    "宿",
    "档",
    "戈",
    "驳",
    "嫂",
    "裕",
    "徙",
    "箭",
    "捐",
    "肠",
    "撑",
    "晒",
    "辨",
    "殿",
    "莲",
    "摊",
    "搅",
    "酱",
    "屏",
    "疫",
    "哀",
    "蔡",
    "堵",
    "沫",
    "皱",
    "畅",
    "叠",
    "阁",
    "莱",
    "敲",
    "辖",
    "钩",
    "痕",
    "坝",
    "巷",
    "饿",
    "祸",
    "丘",
    "玄",
    "溜",
    "曰",
    "逻",
    "彭",
    "尝",
    "卿",
    "妨",
    "艇",
    "吞",
    "韦",
    "怨",
    "矮",
    "歇"
]
;
},{}],"wordlists/chinese_traditional.json":[function(require,module,exports) {
module.exports = [
    "的",
    "一",
    "是",
    "在",
    "不",
    "了",
    "有",
    "和",
    "人",
    "這",
    "中",
    "大",
    "為",
    "上",
    "個",
    "國",
    "我",
    "以",
    "要",
    "他",
    "時",
    "來",
    "用",
    "們",
    "生",
    "到",
    "作",
    "地",
    "於",
    "出",
    "就",
    "分",
    "對",
    "成",
    "會",
    "可",
    "主",
    "發",
    "年",
    "動",
    "同",
    "工",
    "也",
    "能",
    "下",
    "過",
    "子",
    "說",
    "產",
    "種",
    "面",
    "而",
    "方",
    "後",
    "多",
    "定",
    "行",
    "學",
    "法",
    "所",
    "民",
    "得",
    "經",
    "十",
    "三",
    "之",
    "進",
    "著",
    "等",
    "部",
    "度",
    "家",
    "電",
    "力",
    "裡",
    "如",
    "水",
    "化",
    "高",
    "自",
    "二",
    "理",
    "起",
    "小",
    "物",
    "現",
    "實",
    "加",
    "量",
    "都",
    "兩",
    "體",
    "制",
    "機",
    "當",
    "使",
    "點",
    "從",
    "業",
    "本",
    "去",
    "把",
    "性",
    "好",
    "應",
    "開",
    "它",
    "合",
    "還",
    "因",
    "由",
    "其",
    "些",
    "然",
    "前",
    "外",
    "天",
    "政",
    "四",
    "日",
    "那",
    "社",
    "義",
    "事",
    "平",
    "形",
    "相",
    "全",
    "表",
    "間",
    "樣",
    "與",
    "關",
    "各",
    "重",
    "新",
    "線",
    "內",
    "數",
    "正",
    "心",
    "反",
    "你",
    "明",
    "看",
    "原",
    "又",
    "麼",
    "利",
    "比",
    "或",
    "但",
    "質",
    "氣",
    "第",
    "向",
    "道",
    "命",
    "此",
    "變",
    "條",
    "只",
    "沒",
    "結",
    "解",
    "問",
    "意",
    "建",
    "月",
    "公",
    "無",
    "系",
    "軍",
    "很",
    "情",
    "者",
    "最",
    "立",
    "代",
    "想",
    "已",
    "通",
    "並",
    "提",
    "直",
    "題",
    "黨",
    "程",
    "展",
    "五",
    "果",
    "料",
    "象",
    "員",
    "革",
    "位",
    "入",
    "常",
    "文",
    "總",
    "次",
    "品",
    "式",
    "活",
    "設",
    "及",
    "管",
    "特",
    "件",
    "長",
    "求",
    "老",
    "頭",
    "基",
    "資",
    "邊",
    "流",
    "路",
    "級",
    "少",
    "圖",
    "山",
    "統",
    "接",
    "知",
    "較",
    "將",
    "組",
    "見",
    "計",
    "別",
    "她",
    "手",
    "角",
    "期",
    "根",
    "論",
    "運",
    "農",
    "指",
    "幾",
    "九",
    "區",
    "強",
    "放",
    "決",
    "西",
    "被",
    "幹",
    "做",
    "必",
    "戰",
    "先",
    "回",
    "則",
    "任",
    "取",
    "據",
    "處",
    "隊",
    "南",
    "給",
    "色",
    "光",
    "門",
    "即",
    "保",
    "治",
    "北",
    "造",
    "百",
    "規",
    "熱",
    "領",
    "七",
    "海",
    "口",
    "東",
    "導",
    "器",
    "壓",
    "志",
    "世",
    "金",
    "增",
    "爭",
    "濟",
    "階",
    "油",
    "思",
    "術",
    "極",
    "交",
    "受",
    "聯",
    "什",
    "認",
    "六",
    "共",
    "權",
    "收",
    "證",
    "改",
    "清",
    "美",
    "再",
    "採",
    "轉",
    "更",
    "單",
    "風",
    "切",
    "打",
    "白",
    "教",
    "速",
    "花",
    "帶",
    "安",
    "場",
    "身",
    "車",
    "例",
    "真",
    "務",
    "具",
    "萬",
    "每",
    "目",
    "至",
    "達",
    "走",
    "積",
    "示",
    "議",
    "聲",
    "報",
    "鬥",
    "完",
    "類",
    "八",
    "離",
    "華",
    "名",
    "確",
    "才",
    "科",
    "張",
    "信",
    "馬",
    "節",
    "話",
    "米",
    "整",
    "空",
    "元",
    "況",
    "今",
    "集",
    "溫",
    "傳",
    "土",
    "許",
    "步",
    "群",
    "廣",
    "石",
    "記",
    "需",
    "段",
    "研",
    "界",
    "拉",
    "林",
    "律",
    "叫",
    "且",
    "究",
    "觀",
    "越",
    "織",
    "裝",
    "影",
    "算",
    "低",
    "持",
    "音",
    "眾",
    "書",
    "布",
    "复",
    "容",
    "兒",
    "須",
    "際",
    "商",
    "非",
    "驗",
    "連",
    "斷",
    "深",
    "難",
    "近",
    "礦",
    "千",
    "週",
    "委",
    "素",
    "技",
    "備",
    "半",
    "辦",
    "青",
    "省",
    "列",
    "習",
    "響",
    "約",
    "支",
    "般",
    "史",
    "感",
    "勞",
    "便",
    "團",
    "往",
    "酸",
    "歷",
    "市",
    "克",
    "何",
    "除",
    "消",
    "構",
    "府",
    "稱",
    "太",
    "準",
    "精",
    "值",
    "號",
    "率",
    "族",
    "維",
    "劃",
    "選",
    "標",
    "寫",
    "存",
    "候",
    "毛",
    "親",
    "快",
    "效",
    "斯",
    "院",
    "查",
    "江",
    "型",
    "眼",
    "王",
    "按",
    "格",
    "養",
    "易",
    "置",
    "派",
    "層",
    "片",
    "始",
    "卻",
    "專",
    "狀",
    "育",
    "廠",
    "京",
    "識",
    "適",
    "屬",
    "圓",
    "包",
    "火",
    "住",
    "調",
    "滿",
    "縣",
    "局",
    "照",
    "參",
    "紅",
    "細",
    "引",
    "聽",
    "該",
    "鐵",
    "價",
    "嚴",
    "首",
    "底",
    "液",
    "官",
    "德",
    "隨",
    "病",
    "蘇",
    "失",
    "爾",
    "死",
    "講",
    "配",
    "女",
    "黃",
    "推",
    "顯",
    "談",
    "罪",
    "神",
    "藝",
    "呢",
    "席",
    "含",
    "企",
    "望",
    "密",
    "批",
    "營",
    "項",
    "防",
    "舉",
    "球",
    "英",
    "氧",
    "勢",
    "告",
    "李",
    "台",
    "落",
    "木",
    "幫",
    "輪",
    "破",
    "亞",
    "師",
    "圍",
    "注",
    "遠",
    "字",
    "材",
    "排",
    "供",
    "河",
    "態",
    "封",
    "另",
    "施",
    "減",
    "樹",
    "溶",
    "怎",
    "止",
    "案",
    "言",
    "士",
    "均",
    "武",
    "固",
    "葉",
    "魚",
    "波",
    "視",
    "僅",
    "費",
    "緊",
    "愛",
    "左",
    "章",
    "早",
    "朝",
    "害",
    "續",
    "輕",
    "服",
    "試",
    "食",
    "充",
    "兵",
    "源",
    "判",
    "護",
    "司",
    "足",
    "某",
    "練",
    "差",
    "致",
    "板",
    "田",
    "降",
    "黑",
    "犯",
    "負",
    "擊",
    "范",
    "繼",
    "興",
    "似",
    "餘",
    "堅",
    "曲",
    "輸",
    "修",
    "故",
    "城",
    "夫",
    "夠",
    "送",
    "筆",
    "船",
    "佔",
    "右",
    "財",
    "吃",
    "富",
    "春",
    "職",
    "覺",
    "漢",
    "畫",
    "功",
    "巴",
    "跟",
    "雖",
    "雜",
    "飛",
    "檢",
    "吸",
    "助",
    "昇",
    "陽",
    "互",
    "初",
    "創",
    "抗",
    "考",
    "投",
    "壞",
    "策",
    "古",
    "徑",
    "換",
    "未",
    "跑",
    "留",
    "鋼",
    "曾",
    "端",
    "責",
    "站",
    "簡",
    "述",
    "錢",
    "副",
    "盡",
    "帝",
    "射",
    "草",
    "衝",
    "承",
    "獨",
    "令",
    "限",
    "阿",
    "宣",
    "環",
    "雙",
    "請",
    "超",
    "微",
    "讓",
    "控",
    "州",
    "良",
    "軸",
    "找",
    "否",
    "紀",
    "益",
    "依",
    "優",
    "頂",
    "礎",
    "載",
    "倒",
    "房",
    "突",
    "坐",
    "粉",
    "敵",
    "略",
    "客",
    "袁",
    "冷",
    "勝",
    "絕",
    "析",
    "塊",
    "劑",
    "測",
    "絲",
    "協",
    "訴",
    "念",
    "陳",
    "仍",
    "羅",
    "鹽",
    "友",
    "洋",
    "錯",
    "苦",
    "夜",
    "刑",
    "移",
    "頻",
    "逐",
    "靠",
    "混",
    "母",
    "短",
    "皮",
    "終",
    "聚",
    "汽",
    "村",
    "雲",
    "哪",
    "既",
    "距",
    "衛",
    "停",
    "烈",
    "央",
    "察",
    "燒",
    "迅",
    "境",
    "若",
    "印",
    "洲",
    "刻",
    "括",
    "激",
    "孔",
    "搞",
    "甚",
    "室",
    "待",
    "核",
    "校",
    "散",
    "侵",
    "吧",
    "甲",
    "遊",
    "久",
    "菜",
    "味",
    "舊",
    "模",
    "湖",
    "貨",
    "損",
    "預",
    "阻",
    "毫",
    "普",
    "穩",
    "乙",
    "媽",
    "植",
    "息",
    "擴",
    "銀",
    "語",
    "揮",
    "酒",
    "守",
    "拿",
    "序",
    "紙",
    "醫",
    "缺",
    "雨",
    "嗎",
    "針",
    "劉",
    "啊",
    "急",
    "唱",
    "誤",
    "訓",
    "願",
    "審",
    "附",
    "獲",
    "茶",
    "鮮",
    "糧",
    "斤",
    "孩",
    "脫",
    "硫",
    "肥",
    "善",
    "龍",
    "演",
    "父",
    "漸",
    "血",
    "歡",
    "械",
    "掌",
    "歌",
    "沙",
    "剛",
    "攻",
    "謂",
    "盾",
    "討",
    "晚",
    "粒",
    "亂",
    "燃",
    "矛",
    "乎",
    "殺",
    "藥",
    "寧",
    "魯",
    "貴",
    "鐘",
    "煤",
    "讀",
    "班",
    "伯",
    "香",
    "介",
    "迫",
    "句",
    "豐",
    "培",
    "握",
    "蘭",
    "擔",
    "弦",
    "蛋",
    "沉",
    "假",
    "穿",
    "執",
    "答",
    "樂",
    "誰",
    "順",
    "煙",
    "縮",
    "徵",
    "臉",
    "喜",
    "松",
    "腳",
    "困",
    "異",
    "免",
    "背",
    "星",
    "福",
    "買",
    "染",
    "井",
    "概",
    "慢",
    "怕",
    "磁",
    "倍",
    "祖",
    "皇",
    "促",
    "靜",
    "補",
    "評",
    "翻",
    "肉",
    "踐",
    "尼",
    "衣",
    "寬",
    "揚",
    "棉",
    "希",
    "傷",
    "操",
    "垂",
    "秋",
    "宜",
    "氫",
    "套",
    "督",
    "振",
    "架",
    "亮",
    "末",
    "憲",
    "慶",
    "編",
    "牛",
    "觸",
    "映",
    "雷",
    "銷",
    "詩",
    "座",
    "居",
    "抓",
    "裂",
    "胞",
    "呼",
    "娘",
    "景",
    "威",
    "綠",
    "晶",
    "厚",
    "盟",
    "衡",
    "雞",
    "孫",
    "延",
    "危",
    "膠",
    "屋",
    "鄉",
    "臨",
    "陸",
    "顧",
    "掉",
    "呀",
    "燈",
    "歲",
    "措",
    "束",
    "耐",
    "劇",
    "玉",
    "趙",
    "跳",
    "哥",
    "季",
    "課",
    "凱",
    "胡",
    "額",
    "款",
    "紹",
    "卷",
    "齊",
    "偉",
    "蒸",
    "殖",
    "永",
    "宗",
    "苗",
    "川",
    "爐",
    "岩",
    "弱",
    "零",
    "楊",
    "奏",
    "沿",
    "露",
    "桿",
    "探",
    "滑",
    "鎮",
    "飯",
    "濃",
    "航",
    "懷",
    "趕",
    "庫",
    "奪",
    "伊",
    "靈",
    "稅",
    "途",
    "滅",
    "賽",
    "歸",
    "召",
    "鼓",
    "播",
    "盤",
    "裁",
    "險",
    "康",
    "唯",
    "錄",
    "菌",
    "純",
    "借",
    "糖",
    "蓋",
    "橫",
    "符",
    "私",
    "努",
    "堂",
    "域",
    "槍",
    "潤",
    "幅",
    "哈",
    "竟",
    "熟",
    "蟲",
    "澤",
    "腦",
    "壤",
    "碳",
    "歐",
    "遍",
    "側",
    "寨",
    "敢",
    "徹",
    "慮",
    "斜",
    "薄",
    "庭",
    "納",
    "彈",
    "飼",
    "伸",
    "折",
    "麥",
    "濕",
    "暗",
    "荷",
    "瓦",
    "塞",
    "床",
    "築",
    "惡",
    "戶",
    "訪",
    "塔",
    "奇",
    "透",
    "梁",
    "刀",
    "旋",
    "跡",
    "卡",
    "氯",
    "遇",
    "份",
    "毒",
    "泥",
    "退",
    "洗",
    "擺",
    "灰",
    "彩",
    "賣",
    "耗",
    "夏",
    "擇",
    "忙",
    "銅",
    "獻",
    "硬",
    "予",
    "繁",
    "圈",
    "雪",
    "函",
    "亦",
    "抽",
    "篇",
    "陣",
    "陰",
    "丁",
    "尺",
    "追",
    "堆",
    "雄",
    "迎",
    "泛",
    "爸",
    "樓",
    "避",
    "謀",
    "噸",
    "野",
    "豬",
    "旗",
    "累",
    "偏",
    "典",
    "館",
    "索",
    "秦",
    "脂",
    "潮",
    "爺",
    "豆",
    "忽",
    "托",
    "驚",
    "塑",
    "遺",
    "愈",
    "朱",
    "替",
    "纖",
    "粗",
    "傾",
    "尚",
    "痛",
    "楚",
    "謝",
    "奮",
    "購",
    "磨",
    "君",
    "池",
    "旁",
    "碎",
    "骨",
    "監",
    "捕",
    "弟",
    "暴",
    "割",
    "貫",
    "殊",
    "釋",
    "詞",
    "亡",
    "壁",
    "頓",
    "寶",
    "午",
    "塵",
    "聞",
    "揭",
    "炮",
    "殘",
    "冬",
    "橋",
    "婦",
    "警",
    "綜",
    "招",
    "吳",
    "付",
    "浮",
    "遭",
    "徐",
    "您",
    "搖",
    "谷",
    "贊",
    "箱",
    "隔",
    "訂",
    "男",
    "吹",
    "園",
    "紛",
    "唐",
    "敗",
    "宋",
    "玻",
    "巨",
    "耕",
    "坦",
    "榮",
    "閉",
    "灣",
    "鍵",
    "凡",
    "駐",
    "鍋",
    "救",
    "恩",
    "剝",
    "凝",
    "鹼",
    "齒",
    "截",
    "煉",
    "麻",
    "紡",
    "禁",
    "廢",
    "盛",
    "版",
    "緩",
    "淨",
    "睛",
    "昌",
    "婚",
    "涉",
    "筒",
    "嘴",
    "插",
    "岸",
    "朗",
    "莊",
    "街",
    "藏",
    "姑",
    "貿",
    "腐",
    "奴",
    "啦",
    "慣",
    "乘",
    "夥",
    "恢",
    "勻",
    "紗",
    "扎",
    "辯",
    "耳",
    "彪",
    "臣",
    "億",
    "璃",
    "抵",
    "脈",
    "秀",
    "薩",
    "俄",
    "網",
    "舞",
    "店",
    "噴",
    "縱",
    "寸",
    "汗",
    "掛",
    "洪",
    "賀",
    "閃",
    "柬",
    "爆",
    "烯",
    "津",
    "稻",
    "牆",
    "軟",
    "勇",
    "像",
    "滾",
    "厘",
    "蒙",
    "芳",
    "肯",
    "坡",
    "柱",
    "盪",
    "腿",
    "儀",
    "旅",
    "尾",
    "軋",
    "冰",
    "貢",
    "登",
    "黎",
    "削",
    "鑽",
    "勒",
    "逃",
    "障",
    "氨",
    "郭",
    "峰",
    "幣",
    "港",
    "伏",
    "軌",
    "畝",
    "畢",
    "擦",
    "莫",
    "刺",
    "浪",
    "秘",
    "援",
    "株",
    "健",
    "售",
    "股",
    "島",
    "甘",
    "泡",
    "睡",
    "童",
    "鑄",
    "湯",
    "閥",
    "休",
    "匯",
    "舍",
    "牧",
    "繞",
    "炸",
    "哲",
    "磷",
    "績",
    "朋",
    "淡",
    "尖",
    "啟",
    "陷",
    "柴",
    "呈",
    "徒",
    "顏",
    "淚",
    "稍",
    "忘",
    "泵",
    "藍",
    "拖",
    "洞",
    "授",
    "鏡",
    "辛",
    "壯",
    "鋒",
    "貧",
    "虛",
    "彎",
    "摩",
    "泰",
    "幼",
    "廷",
    "尊",
    "窗",
    "綱",
    "弄",
    "隸",
    "疑",
    "氏",
    "宮",
    "姐",
    "震",
    "瑞",
    "怪",
    "尤",
    "琴",
    "循",
    "描",
    "膜",
    "違",
    "夾",
    "腰",
    "緣",
    "珠",
    "窮",
    "森",
    "枝",
    "竹",
    "溝",
    "催",
    "繩",
    "憶",
    "邦",
    "剩",
    "幸",
    "漿",
    "欄",
    "擁",
    "牙",
    "貯",
    "禮",
    "濾",
    "鈉",
    "紋",
    "罷",
    "拍",
    "咱",
    "喊",
    "袖",
    "埃",
    "勤",
    "罰",
    "焦",
    "潛",
    "伍",
    "墨",
    "欲",
    "縫",
    "姓",
    "刊",
    "飽",
    "仿",
    "獎",
    "鋁",
    "鬼",
    "麗",
    "跨",
    "默",
    "挖",
    "鏈",
    "掃",
    "喝",
    "袋",
    "炭",
    "污",
    "幕",
    "諸",
    "弧",
    "勵",
    "梅",
    "奶",
    "潔",
    "災",
    "舟",
    "鑑",
    "苯",
    "訟",
    "抱",
    "毀",
    "懂",
    "寒",
    "智",
    "埔",
    "寄",
    "屆",
    "躍",
    "渡",
    "挑",
    "丹",
    "艱",
    "貝",
    "碰",
    "拔",
    "爹",
    "戴",
    "碼",
    "夢",
    "芽",
    "熔",
    "赤",
    "漁",
    "哭",
    "敬",
    "顆",
    "奔",
    "鉛",
    "仲",
    "虎",
    "稀",
    "妹",
    "乏",
    "珍",
    "申",
    "桌",
    "遵",
    "允",
    "隆",
    "螺",
    "倉",
    "魏",
    "銳",
    "曉",
    "氮",
    "兼",
    "隱",
    "礙",
    "赫",
    "撥",
    "忠",
    "肅",
    "缸",
    "牽",
    "搶",
    "博",
    "巧",
    "殼",
    "兄",
    "杜",
    "訊",
    "誠",
    "碧",
    "祥",
    "柯",
    "頁",
    "巡",
    "矩",
    "悲",
    "灌",
    "齡",
    "倫",
    "票",
    "尋",
    "桂",
    "鋪",
    "聖",
    "恐",
    "恰",
    "鄭",
    "趣",
    "抬",
    "荒",
    "騰",
    "貼",
    "柔",
    "滴",
    "猛",
    "闊",
    "輛",
    "妻",
    "填",
    "撤",
    "儲",
    "簽",
    "鬧",
    "擾",
    "紫",
    "砂",
    "遞",
    "戲",
    "吊",
    "陶",
    "伐",
    "餵",
    "療",
    "瓶",
    "婆",
    "撫",
    "臂",
    "摸",
    "忍",
    "蝦",
    "蠟",
    "鄰",
    "胸",
    "鞏",
    "擠",
    "偶",
    "棄",
    "槽",
    "勁",
    "乳",
    "鄧",
    "吉",
    "仁",
    "爛",
    "磚",
    "租",
    "烏",
    "艦",
    "伴",
    "瓜",
    "淺",
    "丙",
    "暫",
    "燥",
    "橡",
    "柳",
    "迷",
    "暖",
    "牌",
    "秧",
    "膽",
    "詳",
    "簧",
    "踏",
    "瓷",
    "譜",
    "呆",
    "賓",
    "糊",
    "洛",
    "輝",
    "憤",
    "競",
    "隙",
    "怒",
    "粘",
    "乃",
    "緒",
    "肩",
    "籍",
    "敏",
    "塗",
    "熙",
    "皆",
    "偵",
    "懸",
    "掘",
    "享",
    "糾",
    "醒",
    "狂",
    "鎖",
    "淀",
    "恨",
    "牲",
    "霸",
    "爬",
    "賞",
    "逆",
    "玩",
    "陵",
    "祝",
    "秒",
    "浙",
    "貌",
    "役",
    "彼",
    "悉",
    "鴨",
    "趨",
    "鳳",
    "晨",
    "畜",
    "輩",
    "秩",
    "卵",
    "署",
    "梯",
    "炎",
    "灘",
    "棋",
    "驅",
    "篩",
    "峽",
    "冒",
    "啥",
    "壽",
    "譯",
    "浸",
    "泉",
    "帽",
    "遲",
    "矽",
    "疆",
    "貸",
    "漏",
    "稿",
    "冠",
    "嫩",
    "脅",
    "芯",
    "牢",
    "叛",
    "蝕",
    "奧",
    "鳴",
    "嶺",
    "羊",
    "憑",
    "串",
    "塘",
    "繪",
    "酵",
    "融",
    "盆",
    "錫",
    "廟",
    "籌",
    "凍",
    "輔",
    "攝",
    "襲",
    "筋",
    "拒",
    "僚",
    "旱",
    "鉀",
    "鳥",
    "漆",
    "沈",
    "眉",
    "疏",
    "添",
    "棒",
    "穗",
    "硝",
    "韓",
    "逼",
    "扭",
    "僑",
    "涼",
    "挺",
    "碗",
    "栽",
    "炒",
    "杯",
    "患",
    "餾",
    "勸",
    "豪",
    "遼",
    "勃",
    "鴻",
    "旦",
    "吏",
    "拜",
    "狗",
    "埋",
    "輥",
    "掩",
    "飲",
    "搬",
    "罵",
    "辭",
    "勾",
    "扣",
    "估",
    "蔣",
    "絨",
    "霧",
    "丈",
    "朵",
    "姆",
    "擬",
    "宇",
    "輯",
    "陝",
    "雕",
    "償",
    "蓄",
    "崇",
    "剪",
    "倡",
    "廳",
    "咬",
    "駛",
    "薯",
    "刷",
    "斥",
    "番",
    "賦",
    "奉",
    "佛",
    "澆",
    "漫",
    "曼",
    "扇",
    "鈣",
    "桃",
    "扶",
    "仔",
    "返",
    "俗",
    "虧",
    "腔",
    "鞋",
    "棱",
    "覆",
    "框",
    "悄",
    "叔",
    "撞",
    "騙",
    "勘",
    "旺",
    "沸",
    "孤",
    "吐",
    "孟",
    "渠",
    "屈",
    "疾",
    "妙",
    "惜",
    "仰",
    "狠",
    "脹",
    "諧",
    "拋",
    "黴",
    "桑",
    "崗",
    "嘛",
    "衰",
    "盜",
    "滲",
    "臟",
    "賴",
    "湧",
    "甜",
    "曹",
    "閱",
    "肌",
    "哩",
    "厲",
    "烴",
    "緯",
    "毅",
    "昨",
    "偽",
    "症",
    "煮",
    "嘆",
    "釘",
    "搭",
    "莖",
    "籠",
    "酷",
    "偷",
    "弓",
    "錐",
    "恆",
    "傑",
    "坑",
    "鼻",
    "翼",
    "綸",
    "敘",
    "獄",
    "逮",
    "罐",
    "絡",
    "棚",
    "抑",
    "膨",
    "蔬",
    "寺",
    "驟",
    "穆",
    "冶",
    "枯",
    "冊",
    "屍",
    "凸",
    "紳",
    "坯",
    "犧",
    "焰",
    "轟",
    "欣",
    "晉",
    "瘦",
    "禦",
    "錠",
    "錦",
    "喪",
    "旬",
    "鍛",
    "壟",
    "搜",
    "撲",
    "邀",
    "亭",
    "酯",
    "邁",
    "舒",
    "脆",
    "酶",
    "閒",
    "憂",
    "酚",
    "頑",
    "羽",
    "漲",
    "卸",
    "仗",
    "陪",
    "闢",
    "懲",
    "杭",
    "姚",
    "肚",
    "捉",
    "飄",
    "漂",
    "昆",
    "欺",
    "吾",
    "郎",
    "烷",
    "汁",
    "呵",
    "飾",
    "蕭",
    "雅",
    "郵",
    "遷",
    "燕",
    "撒",
    "姻",
    "赴",
    "宴",
    "煩",
    "債",
    "帳",
    "斑",
    "鈴",
    "旨",
    "醇",
    "董",
    "餅",
    "雛",
    "姿",
    "拌",
    "傅",
    "腹",
    "妥",
    "揉",
    "賢",
    "拆",
    "歪",
    "葡",
    "胺",
    "丟",
    "浩",
    "徽",
    "昂",
    "墊",
    "擋",
    "覽",
    "貪",
    "慰",
    "繳",
    "汪",
    "慌",
    "馮",
    "諾",
    "姜",
    "誼",
    "兇",
    "劣",
    "誣",
    "耀",
    "昏",
    "躺",
    "盈",
    "騎",
    "喬",
    "溪",
    "叢",
    "盧",
    "抹",
    "悶",
    "諮",
    "刮",
    "駕",
    "纜",
    "悟",
    "摘",
    "鉺",
    "擲",
    "頗",
    "幻",
    "柄",
    "惠",
    "慘",
    "佳",
    "仇",
    "臘",
    "窩",
    "滌",
    "劍",
    "瞧",
    "堡",
    "潑",
    "蔥",
    "罩",
    "霍",
    "撈",
    "胎",
    "蒼",
    "濱",
    "倆",
    "捅",
    "湘",
    "砍",
    "霞",
    "邵",
    "萄",
    "瘋",
    "淮",
    "遂",
    "熊",
    "糞",
    "烘",
    "宿",
    "檔",
    "戈",
    "駁",
    "嫂",
    "裕",
    "徙",
    "箭",
    "捐",
    "腸",
    "撐",
    "曬",
    "辨",
    "殿",
    "蓮",
    "攤",
    "攪",
    "醬",
    "屏",
    "疫",
    "哀",
    "蔡",
    "堵",
    "沫",
    "皺",
    "暢",
    "疊",
    "閣",
    "萊",
    "敲",
    "轄",
    "鉤",
    "痕",
    "壩",
    "巷",
    "餓",
    "禍",
    "丘",
    "玄",
    "溜",
    "曰",
    "邏",
    "彭",
    "嘗",
    "卿",
    "妨",
    "艇",
    "吞",
    "韋",
    "怨",
    "矮",
    "歇"
]
;
},{}],"wordlists/korean.json":[function(require,module,exports) {
module.exports = [
    "가격",
    "가끔",
    "가난",
    "가능",
    "가득",
    "가르침",
    "가뭄",
    "가방",
    "가상",
    "가슴",
    "가운데",
    "가을",
    "가이드",
    "가입",
    "가장",
    "가정",
    "가족",
    "가죽",
    "각오",
    "각자",
    "간격",
    "간부",
    "간섭",
    "간장",
    "간접",
    "간판",
    "갈등",
    "갈비",
    "갈색",
    "갈증",
    "감각",
    "감기",
    "감소",
    "감수성",
    "감자",
    "감정",
    "갑자기",
    "강남",
    "강당",
    "강도",
    "강력히",
    "강변",
    "강북",
    "강사",
    "강수량",
    "강아지",
    "강원도",
    "강의",
    "강제",
    "강조",
    "같이",
    "개구리",
    "개나리",
    "개방",
    "개별",
    "개선",
    "개성",
    "개인",
    "객관적",
    "거실",
    "거액",
    "거울",
    "거짓",
    "거품",
    "걱정",
    "건강",
    "건물",
    "건설",
    "건조",
    "건축",
    "걸음",
    "검사",
    "검토",
    "게시판",
    "게임",
    "겨울",
    "견해",
    "결과",
    "결국",
    "결론",
    "결석",
    "결승",
    "결심",
    "결정",
    "결혼",
    "경계",
    "경고",
    "경기",
    "경력",
    "경복궁",
    "경비",
    "경상도",
    "경영",
    "경우",
    "경쟁",
    "경제",
    "경주",
    "경찰",
    "경치",
    "경향",
    "경험",
    "계곡",
    "계단",
    "계란",
    "계산",
    "계속",
    "계약",
    "계절",
    "계층",
    "계획",
    "고객",
    "고구려",
    "고궁",
    "고급",
    "고등학생",
    "고무신",
    "고민",
    "고양이",
    "고장",
    "고전",
    "고집",
    "고춧가루",
    "고통",
    "고향",
    "곡식",
    "골목",
    "골짜기",
    "골프",
    "공간",
    "공개",
    "공격",
    "공군",
    "공급",
    "공기",
    "공동",
    "공무원",
    "공부",
    "공사",
    "공식",
    "공업",
    "공연",
    "공원",
    "공장",
    "공짜",
    "공책",
    "공통",
    "공포",
    "공항",
    "공휴일",
    "과목",
    "과일",
    "과장",
    "과정",
    "과학",
    "관객",
    "관계",
    "관광",
    "관념",
    "관람",
    "관련",
    "관리",
    "관습",
    "관심",
    "관점",
    "관찰",
    "광경",
    "광고",
    "광장",
    "광주",
    "괴로움",
    "굉장히",
    "교과서",
    "교문",
    "교복",
    "교실",
    "교양",
    "교육",
    "교장",
    "교직",
    "교통",
    "교환",
    "교훈",
    "구경",
    "구름",
    "구멍",
    "구별",
    "구분",
    "구석",
    "구성",
    "구속",
    "구역",
    "구입",
    "구청",
    "구체적",
    "국가",
    "국기",
    "국내",
    "국립",
    "국물",
    "국민",
    "국수",
    "국어",
    "국왕",
    "국적",
    "국제",
    "국회",
    "군대",
    "군사",
    "군인",
    "궁극적",
    "권리",
    "권위",
    "권투",
    "귀국",
    "귀신",
    "규정",
    "규칙",
    "균형",
    "그날",
    "그냥",
    "그늘",
    "그러나",
    "그룹",
    "그릇",
    "그림",
    "그제서야",
    "그토록",
    "극복",
    "극히",
    "근거",
    "근교",
    "근래",
    "근로",
    "근무",
    "근본",
    "근원",
    "근육",
    "근처",
    "글씨",
    "글자",
    "금강산",
    "금고",
    "금년",
    "금메달",
    "금액",
    "금연",
    "금요일",
    "금지",
    "긍정적",
    "기간",
    "기관",
    "기념",
    "기능",
    "기독교",
    "기둥",
    "기록",
    "기름",
    "기법",
    "기본",
    "기분",
    "기쁨",
    "기숙사",
    "기술",
    "기억",
    "기업",
    "기온",
    "기운",
    "기원",
    "기적",
    "기준",
    "기침",
    "기혼",
    "기획",
    "긴급",
    "긴장",
    "길이",
    "김밥",
    "김치",
    "김포공항",
    "깍두기",
    "깜빡",
    "깨달음",
    "깨소금",
    "껍질",
    "꼭대기",
    "꽃잎",
    "나들이",
    "나란히",
    "나머지",
    "나물",
    "나침반",
    "나흘",
    "낙엽",
    "난방",
    "날개",
    "날씨",
    "날짜",
    "남녀",
    "남대문",
    "남매",
    "남산",
    "남자",
    "남편",
    "남학생",
    "낭비",
    "낱말",
    "내년",
    "내용",
    "내일",
    "냄비",
    "냄새",
    "냇물",
    "냉동",
    "냉면",
    "냉방",
    "냉장고",
    "넥타이",
    "넷째",
    "노동",
    "노란색",
    "노력",
    "노인",
    "녹음",
    "녹차",
    "녹화",
    "논리",
    "논문",
    "논쟁",
    "놀이",
    "농구",
    "농담",
    "농민",
    "농부",
    "농업",
    "농장",
    "농촌",
    "높이",
    "눈동자",
    "눈물",
    "눈썹",
    "뉴욕",
    "느낌",
    "늑대",
    "능동적",
    "능력",
    "다방",
    "다양성",
    "다음",
    "다이어트",
    "다행",
    "단계",
    "단골",
    "단독",
    "단맛",
    "단순",
    "단어",
    "단위",
    "단점",
    "단체",
    "단추",
    "단편",
    "단풍",
    "달걀",
    "달러",
    "달력",
    "달리",
    "닭고기",
    "담당",
    "담배",
    "담요",
    "담임",
    "답변",
    "답장",
    "당근",
    "당분간",
    "당연히",
    "당장",
    "대규모",
    "대낮",
    "대단히",
    "대답",
    "대도시",
    "대략",
    "대량",
    "대륙",
    "대문",
    "대부분",
    "대신",
    "대응",
    "대장",
    "대전",
    "대접",
    "대중",
    "대책",
    "대출",
    "대충",
    "대통령",
    "대학",
    "대한민국",
    "대합실",
    "대형",
    "덩어리",
    "데이트",
    "도대체",
    "도덕",
    "도둑",
    "도망",
    "도서관",
    "도심",
    "도움",
    "도입",
    "도자기",
    "도저히",
    "도전",
    "도중",
    "도착",
    "독감",
    "독립",
    "독서",
    "독일",
    "독창적",
    "동화책",
    "뒷모습",
    "뒷산",
    "딸아이",
    "마누라",
    "마늘",
    "마당",
    "마라톤",
    "마련",
    "마무리",
    "마사지",
    "마약",
    "마요네즈",
    "마을",
    "마음",
    "마이크",
    "마중",
    "마지막",
    "마찬가지",
    "마찰",
    "마흔",
    "막걸리",
    "막내",
    "막상",
    "만남",
    "만두",
    "만세",
    "만약",
    "만일",
    "만점",
    "만족",
    "만화",
    "많이",
    "말기",
    "말씀",
    "말투",
    "맘대로",
    "망원경",
    "매년",
    "매달",
    "매력",
    "매번",
    "매스컴",
    "매일",
    "매장",
    "맥주",
    "먹이",
    "먼저",
    "먼지",
    "멀리",
    "메일",
    "며느리",
    "며칠",
    "면담",
    "멸치",
    "명단",
    "명령",
    "명예",
    "명의",
    "명절",
    "명칭",
    "명함",
    "모금",
    "모니터",
    "모델",
    "모든",
    "모범",
    "모습",
    "모양",
    "모임",
    "모조리",
    "모집",
    "모퉁이",
    "목걸이",
    "목록",
    "목사",
    "목소리",
    "목숨",
    "목적",
    "목표",
    "몰래",
    "몸매",
    "몸무게",
    "몸살",
    "몸속",
    "몸짓",
    "몸통",
    "몹시",
    "무관심",
    "무궁화",
    "무더위",
    "무덤",
    "무릎",
    "무슨",
    "무엇",
    "무역",
    "무용",
    "무조건",
    "무지개",
    "무척",
    "문구",
    "문득",
    "문법",
    "문서",
    "문제",
    "문학",
    "문화",
    "물가",
    "물건",
    "물결",
    "물고기",
    "물론",
    "물리학",
    "물음",
    "물질",
    "물체",
    "미국",
    "미디어",
    "미사일",
    "미술",
    "미역",
    "미용실",
    "미움",
    "미인",
    "미팅",
    "미혼",
    "민간",
    "민족",
    "민주",
    "믿음",
    "밀가루",
    "밀리미터",
    "밑바닥",
    "바가지",
    "바구니",
    "바나나",
    "바늘",
    "바닥",
    "바닷가",
    "바람",
    "바이러스",
    "바탕",
    "박물관",
    "박사",
    "박수",
    "반대",
    "반드시",
    "반말",
    "반발",
    "반성",
    "반응",
    "반장",
    "반죽",
    "반지",
    "반찬",
    "받침",
    "발가락",
    "발걸음",
    "발견",
    "발달",
    "발레",
    "발목",
    "발바닥",
    "발생",
    "발음",
    "발자국",
    "발전",
    "발톱",
    "발표",
    "밤하늘",
    "밥그릇",
    "밥맛",
    "밥상",
    "밥솥",
    "방금",
    "방면",
    "방문",
    "방바닥",
    "방법",
    "방송",
    "방식",
    "방안",
    "방울",
    "방지",
    "방학",
    "방해",
    "방향",
    "배경",
    "배꼽",
    "배달",
    "배드민턴",
    "백두산",
    "백색",
    "백성",
    "백인",
    "백제",
    "백화점",
    "버릇",
    "버섯",
    "버튼",
    "번개",
    "번역",
    "번지",
    "번호",
    "벌금",
    "벌레",
    "벌써",
    "범위",
    "범인",
    "범죄",
    "법률",
    "법원",
    "법적",
    "법칙",
    "베이징",
    "벨트",
    "변경",
    "변동",
    "변명",
    "변신",
    "변호사",
    "변화",
    "별도",
    "별명",
    "별일",
    "병실",
    "병아리",
    "병원",
    "보관",
    "보너스",
    "보라색",
    "보람",
    "보름",
    "보상",
    "보안",
    "보자기",
    "보장",
    "보전",
    "보존",
    "보통",
    "보편적",
    "보험",
    "복도",
    "복사",
    "복숭아",
    "복습",
    "볶음",
    "본격적",
    "본래",
    "본부",
    "본사",
    "본성",
    "본인",
    "본질",
    "볼펜",
    "봉사",
    "봉지",
    "봉투",
    "부근",
    "부끄러움",
    "부담",
    "부동산",
    "부문",
    "부분",
    "부산",
    "부상",
    "부엌",
    "부인",
    "부작용",
    "부장",
    "부정",
    "부족",
    "부지런히",
    "부친",
    "부탁",
    "부품",
    "부회장",
    "북부",
    "북한",
    "분노",
    "분량",
    "분리",
    "분명",
    "분석",
    "분야",
    "분위기",
    "분필",
    "분홍색",
    "불고기",
    "불과",
    "불교",
    "불꽃",
    "불만",
    "불법",
    "불빛",
    "불안",
    "불이익",
    "불행",
    "브랜드",
    "비극",
    "비난",
    "비닐",
    "비둘기",
    "비디오",
    "비로소",
    "비만",
    "비명",
    "비밀",
    "비바람",
    "비빔밥",
    "비상",
    "비용",
    "비율",
    "비중",
    "비타민",
    "비판",
    "빌딩",
    "빗물",
    "빗방울",
    "빗줄기",
    "빛깔",
    "빨간색",
    "빨래",
    "빨리",
    "사건",
    "사계절",
    "사나이",
    "사냥",
    "사람",
    "사랑",
    "사립",
    "사모님",
    "사물",
    "사방",
    "사상",
    "사생활",
    "사설",
    "사슴",
    "사실",
    "사업",
    "사용",
    "사월",
    "사장",
    "사전",
    "사진",
    "사촌",
    "사춘기",
    "사탕",
    "사투리",
    "사흘",
    "산길",
    "산부인과",
    "산업",
    "산책",
    "살림",
    "살인",
    "살짝",
    "삼계탕",
    "삼국",
    "삼십",
    "삼월",
    "삼촌",
    "상관",
    "상금",
    "상대",
    "상류",
    "상반기",
    "상상",
    "상식",
    "상업",
    "상인",
    "상자",
    "상점",
    "상처",
    "상추",
    "상태",
    "상표",
    "상품",
    "상황",
    "새벽",
    "색깔",
    "색연필",
    "생각",
    "생명",
    "생물",
    "생방송",
    "생산",
    "생선",
    "생신",
    "생일",
    "생활",
    "서랍",
    "서른",
    "서명",
    "서민",
    "서비스",
    "서양",
    "서울",
    "서적",
    "서점",
    "서쪽",
    "서클",
    "석사",
    "석유",
    "선거",
    "선물",
    "선배",
    "선생",
    "선수",
    "선원",
    "선장",
    "선전",
    "선택",
    "선풍기",
    "설거지",
    "설날",
    "설렁탕",
    "설명",
    "설문",
    "설사",
    "설악산",
    "설치",
    "설탕",
    "섭씨",
    "성공",
    "성당",
    "성명",
    "성별",
    "성인",
    "성장",
    "성적",
    "성질",
    "성함",
    "세금",
    "세미나",
    "세상",
    "세월",
    "세종대왕",
    "세탁",
    "센터",
    "센티미터",
    "셋째",
    "소규모",
    "소극적",
    "소금",
    "소나기",
    "소년",
    "소득",
    "소망",
    "소문",
    "소설",
    "소속",
    "소아과",
    "소용",
    "소원",
    "소음",
    "소중히",
    "소지품",
    "소질",
    "소풍",
    "소형",
    "속담",
    "속도",
    "속옷",
    "손가락",
    "손길",
    "손녀",
    "손님",
    "손등",
    "손목",
    "손뼉",
    "손실",
    "손질",
    "손톱",
    "손해",
    "솔직히",
    "솜씨",
    "송아지",
    "송이",
    "송편",
    "쇠고기",
    "쇼핑",
    "수건",
    "수년",
    "수단",
    "수돗물",
    "수동적",
    "수면",
    "수명",
    "수박",
    "수상",
    "수석",
    "수술",
    "수시로",
    "수업",
    "수염",
    "수영",
    "수입",
    "수준",
    "수집",
    "수출",
    "수컷",
    "수필",
    "수학",
    "수험생",
    "수화기",
    "숙녀",
    "숙소",
    "숙제",
    "순간",
    "순서",
    "순수",
    "순식간",
    "순위",
    "숟가락",
    "술병",
    "술집",
    "숫자",
    "스님",
    "스물",
    "스스로",
    "스승",
    "스웨터",
    "스위치",
    "스케이트",
    "스튜디오",
    "스트레스",
    "스포츠",
    "슬쩍",
    "슬픔",
    "습관",
    "습기",
    "승객",
    "승리",
    "승부",
    "승용차",
    "승진",
    "시각",
    "시간",
    "시골",
    "시금치",
    "시나리오",
    "시댁",
    "시리즈",
    "시멘트",
    "시민",
    "시부모",
    "시선",
    "시설",
    "시스템",
    "시아버지",
    "시어머니",
    "시월",
    "시인",
    "시일",
    "시작",
    "시장",
    "시절",
    "시점",
    "시중",
    "시즌",
    "시집",
    "시청",
    "시합",
    "시험",
    "식구",
    "식기",
    "식당",
    "식량",
    "식료품",
    "식물",
    "식빵",
    "식사",
    "식생활",
    "식초",
    "식탁",
    "식품",
    "신고",
    "신규",
    "신념",
    "신문",
    "신발",
    "신비",
    "신사",
    "신세",
    "신용",
    "신제품",
    "신청",
    "신체",
    "신화",
    "실감",
    "실내",
    "실력",
    "실례",
    "실망",
    "실수",
    "실습",
    "실시",
    "실장",
    "실정",
    "실질적",
    "실천",
    "실체",
    "실컷",
    "실태",
    "실패",
    "실험",
    "실현",
    "심리",
    "심부름",
    "심사",
    "심장",
    "심정",
    "심판",
    "쌍둥이",
    "씨름",
    "씨앗",
    "아가씨",
    "아나운서",
    "아드님",
    "아들",
    "아쉬움",
    "아스팔트",
    "아시아",
    "아울러",
    "아저씨",
    "아줌마",
    "아직",
    "아침",
    "아파트",
    "아프리카",
    "아픔",
    "아홉",
    "아흔",
    "악기",
    "악몽",
    "악수",
    "안개",
    "안경",
    "안과",
    "안내",
    "안녕",
    "안동",
    "안방",
    "안부",
    "안주",
    "알루미늄",
    "알코올",
    "암시",
    "암컷",
    "압력",
    "앞날",
    "앞문",
    "애인",
    "애정",
    "액수",
    "앨범",
    "야간",
    "야단",
    "야옹",
    "약간",
    "약국",
    "약속",
    "약수",
    "약점",
    "약품",
    "약혼녀",
    "양념",
    "양력",
    "양말",
    "양배추",
    "양주",
    "양파",
    "어둠",
    "어려움",
    "어른",
    "어젯밤",
    "어쨌든",
    "어쩌다가",
    "어쩐지",
    "언니",
    "언덕",
    "언론",
    "언어",
    "얼굴",
    "얼른",
    "얼음",
    "얼핏",
    "엄마",
    "업무",
    "업종",
    "업체",
    "엉덩이",
    "엉망",
    "엉터리",
    "엊그제",
    "에너지",
    "에어컨",
    "엔진",
    "여건",
    "여고생",
    "여관",
    "여군",
    "여권",
    "여대생",
    "여덟",
    "여동생",
    "여든",
    "여론",
    "여름",
    "여섯",
    "여성",
    "여왕",
    "여인",
    "여전히",
    "여직원",
    "여학생",
    "여행",
    "역사",
    "역시",
    "역할",
    "연결",
    "연구",
    "연극",
    "연기",
    "연락",
    "연설",
    "연세",
    "연속",
    "연습",
    "연애",
    "연예인",
    "연인",
    "연장",
    "연주",
    "연출",
    "연필",
    "연합",
    "연휴",
    "열기",
    "열매",
    "열쇠",
    "열심히",
    "열정",
    "열차",
    "열흘",
    "염려",
    "엽서",
    "영국",
    "영남",
    "영상",
    "영양",
    "영역",
    "영웅",
    "영원히",
    "영하",
    "영향",
    "영혼",
    "영화",
    "옆구리",
    "옆방",
    "옆집",
    "예감",
    "예금",
    "예방",
    "예산",
    "예상",
    "예선",
    "예술",
    "예습",
    "예식장",
    "예약",
    "예전",
    "예절",
    "예정",
    "예컨대",
    "옛날",
    "오늘",
    "오락",
    "오랫동안",
    "오렌지",
    "오로지",
    "오른발",
    "오븐",
    "오십",
    "오염",
    "오월",
    "오전",
    "오직",
    "오징어",
    "오페라",
    "오피스텔",
    "오히려",
    "옥상",
    "옥수수",
    "온갖",
    "온라인",
    "온몸",
    "온종일",
    "온통",
    "올가을",
    "올림픽",
    "올해",
    "옷차림",
    "와이셔츠",
    "와인",
    "완성",
    "완전",
    "왕비",
    "왕자",
    "왜냐하면",
    "왠지",
    "외갓집",
    "외국",
    "외로움",
    "외삼촌",
    "외출",
    "외침",
    "외할머니",
    "왼발",
    "왼손",
    "왼쪽",
    "요금",
    "요일",
    "요즘",
    "요청",
    "용기",
    "용서",
    "용어",
    "우산",
    "우선",
    "우승",
    "우연히",
    "우정",
    "우체국",
    "우편",
    "운동",
    "운명",
    "운반",
    "운전",
    "운행",
    "울산",
    "울음",
    "움직임",
    "웃어른",
    "웃음",
    "워낙",
    "원고",
    "원래",
    "원서",
    "원숭이",
    "원인",
    "원장",
    "원피스",
    "월급",
    "월드컵",
    "월세",
    "월요일",
    "웨이터",
    "위반",
    "위법",
    "위성",
    "위원",
    "위험",
    "위협",
    "윗사람",
    "유난히",
    "유럽",
    "유명",
    "유물",
    "유산",
    "유적",
    "유치원",
    "유학",
    "유행",
    "유형",
    "육군",
    "육상",
    "육십",
    "육체",
    "은행",
    "음력",
    "음료",
    "음반",
    "음성",
    "음식",
    "음악",
    "음주",
    "의견",
    "의논",
    "의문",
    "의복",
    "의식",
    "의심",
    "의외로",
    "의욕",
    "의원",
    "의학",
    "이것",
    "이곳",
    "이념",
    "이놈",
    "이달",
    "이대로",
    "이동",
    "이렇게",
    "이력서",
    "이론적",
    "이름",
    "이민",
    "이발소",
    "이별",
    "이불",
    "이빨",
    "이상",
    "이성",
    "이슬",
    "이야기",
    "이용",
    "이웃",
    "이월",
    "이윽고",
    "이익",
    "이전",
    "이중",
    "이튿날",
    "이틀",
    "이혼",
    "인간",
    "인격",
    "인공",
    "인구",
    "인근",
    "인기",
    "인도",
    "인류",
    "인물",
    "인생",
    "인쇄",
    "인연",
    "인원",
    "인재",
    "인종",
    "인천",
    "인체",
    "인터넷",
    "인하",
    "인형",
    "일곱",
    "일기",
    "일단",
    "일대",
    "일등",
    "일반",
    "일본",
    "일부",
    "일상",
    "일생",
    "일손",
    "일요일",
    "일월",
    "일정",
    "일종",
    "일주일",
    "일찍",
    "일체",
    "일치",
    "일행",
    "일회용",
    "임금",
    "임무",
    "입대",
    "입력",
    "입맛",
    "입사",
    "입술",
    "입시",
    "입원",
    "입장",
    "입학",
    "자가용",
    "자격",
    "자극",
    "자동",
    "자랑",
    "자부심",
    "자식",
    "자신",
    "자연",
    "자원",
    "자율",
    "자전거",
    "자정",
    "자존심",
    "자판",
    "작가",
    "작년",
    "작성",
    "작업",
    "작용",
    "작은딸",
    "작품",
    "잔디",
    "잔뜩",
    "잔치",
    "잘못",
    "잠깐",
    "잠수함",
    "잠시",
    "잠옷",
    "잠자리",
    "잡지",
    "장관",
    "장군",
    "장기간",
    "장래",
    "장례",
    "장르",
    "장마",
    "장면",
    "장모",
    "장미",
    "장비",
    "장사",
    "장소",
    "장식",
    "장애인",
    "장인",
    "장점",
    "장차",
    "장학금",
    "재능",
    "재빨리",
    "재산",
    "재생",
    "재작년",
    "재정",
    "재채기",
    "재판",
    "재학",
    "재활용",
    "저것",
    "저고리",
    "저곳",
    "저녁",
    "저런",
    "저렇게",
    "저번",
    "저울",
    "저절로",
    "저축",
    "적극",
    "적당히",
    "적성",
    "적용",
    "적응",
    "전개",
    "전공",
    "전기",
    "전달",
    "전라도",
    "전망",
    "전문",
    "전반",
    "전부",
    "전세",
    "전시",
    "전용",
    "전자",
    "전쟁",
    "전주",
    "전철",
    "전체",
    "전통",
    "전혀",
    "전후",
    "절대",
    "절망",
    "절반",
    "절약",
    "절차",
    "점검",
    "점수",
    "점심",
    "점원",
    "점점",
    "점차",
    "접근",
    "접시",
    "접촉",
    "젓가락",
    "정거장",
    "정도",
    "정류장",
    "정리",
    "정말",
    "정면",
    "정문",
    "정반대",
    "정보",
    "정부",
    "정비",
    "정상",
    "정성",
    "정오",
    "정원",
    "정장",
    "정지",
    "정치",
    "정확히",
    "제공",
    "제과점",
    "제대로",
    "제목",
    "제발",
    "제법",
    "제삿날",
    "제안",
    "제일",
    "제작",
    "제주도",
    "제출",
    "제품",
    "제한",
    "조각",
    "조건",
    "조금",
    "조깅",
    "조명",
    "조미료",
    "조상",
    "조선",
    "조용히",
    "조절",
    "조정",
    "조직",
    "존댓말",
    "존재",
    "졸업",
    "졸음",
    "종교",
    "종로",
    "종류",
    "종소리",
    "종업원",
    "종종",
    "종합",
    "좌석",
    "죄인",
    "주관적",
    "주름",
    "주말",
    "주머니",
    "주먹",
    "주문",
    "주민",
    "주방",
    "주변",
    "주식",
    "주인",
    "주일",
    "주장",
    "주전자",
    "주택",
    "준비",
    "줄거리",
    "줄기",
    "줄무늬",
    "중간",
    "중계방송",
    "중국",
    "중년",
    "중단",
    "중독",
    "중반",
    "중부",
    "중세",
    "중소기업",
    "중순",
    "중앙",
    "중요",
    "중학교",
    "즉석",
    "즉시",
    "즐거움",
    "증가",
    "증거",
    "증권",
    "증상",
    "증세",
    "지각",
    "지갑",
    "지경",
    "지극히",
    "지금",
    "지급",
    "지능",
    "지름길",
    "지리산",
    "지방",
    "지붕",
    "지식",
    "지역",
    "지우개",
    "지원",
    "지적",
    "지점",
    "지진",
    "지출",
    "직선",
    "직업",
    "직원",
    "직장",
    "진급",
    "진동",
    "진로",
    "진료",
    "진리",
    "진짜",
    "진찰",
    "진출",
    "진통",
    "진행",
    "질문",
    "질병",
    "질서",
    "짐작",
    "집단",
    "집안",
    "집중",
    "짜증",
    "찌꺼기",
    "차남",
    "차라리",
    "차량",
    "차림",
    "차별",
    "차선",
    "차츰",
    "착각",
    "찬물",
    "찬성",
    "참가",
    "참기름",
    "참새",
    "참석",
    "참여",
    "참외",
    "참조",
    "찻잔",
    "창가",
    "창고",
    "창구",
    "창문",
    "창밖",
    "창작",
    "창조",
    "채널",
    "채점",
    "책가방",
    "책방",
    "책상",
    "책임",
    "챔피언",
    "처벌",
    "처음",
    "천국",
    "천둥",
    "천장",
    "천재",
    "천천히",
    "철도",
    "철저히",
    "철학",
    "첫날",
    "첫째",
    "청년",
    "청바지",
    "청소",
    "청춘",
    "체계",
    "체력",
    "체온",
    "체육",
    "체중",
    "체험",
    "초등학생",
    "초반",
    "초밥",
    "초상화",
    "초순",
    "초여름",
    "초원",
    "초저녁",
    "초점",
    "초청",
    "초콜릿",
    "촛불",
    "총각",
    "총리",
    "총장",
    "촬영",
    "최근",
    "최상",
    "최선",
    "최신",
    "최악",
    "최종",
    "추석",
    "추억",
    "추진",
    "추천",
    "추측",
    "축구",
    "축소",
    "축제",
    "축하",
    "출근",
    "출발",
    "출산",
    "출신",
    "출연",
    "출입",
    "출장",
    "출판",
    "충격",
    "충고",
    "충돌",
    "충분히",
    "충청도",
    "취업",
    "취직",
    "취향",
    "치약",
    "친구",
    "친척",
    "칠십",
    "칠월",
    "칠판",
    "침대",
    "침묵",
    "침실",
    "칫솔",
    "칭찬",
    "카메라",
    "카운터",
    "칼국수",
    "캐릭터",
    "캠퍼스",
    "캠페인",
    "커튼",
    "컨디션",
    "컬러",
    "컴퓨터",
    "코끼리",
    "코미디",
    "콘서트",
    "콜라",
    "콤플렉스",
    "콩나물",
    "쾌감",
    "쿠데타",
    "크림",
    "큰길",
    "큰딸",
    "큰소리",
    "큰아들",
    "큰어머니",
    "큰일",
    "큰절",
    "클래식",
    "클럽",
    "킬로",
    "타입",
    "타자기",
    "탁구",
    "탁자",
    "탄생",
    "태권도",
    "태양",
    "태풍",
    "택시",
    "탤런트",
    "터널",
    "터미널",
    "테니스",
    "테스트",
    "테이블",
    "텔레비전",
    "토론",
    "토마토",
    "토요일",
    "통계",
    "통과",
    "통로",
    "통신",
    "통역",
    "통일",
    "통장",
    "통제",
    "통증",
    "통합",
    "통화",
    "퇴근",
    "퇴원",
    "퇴직금",
    "튀김",
    "트럭",
    "특급",
    "특별",
    "특성",
    "특수",
    "특징",
    "특히",
    "튼튼히",
    "티셔츠",
    "파란색",
    "파일",
    "파출소",
    "판결",
    "판단",
    "판매",
    "판사",
    "팔십",
    "팔월",
    "팝송",
    "패션",
    "팩스",
    "팩시밀리",
    "팬티",
    "퍼센트",
    "페인트",
    "편견",
    "편의",
    "편지",
    "편히",
    "평가",
    "평균",
    "평생",
    "평소",
    "평양",
    "평일",
    "평화",
    "포스터",
    "포인트",
    "포장",
    "포함",
    "표면",
    "표정",
    "표준",
    "표현",
    "품목",
    "품질",
    "풍경",
    "풍속",
    "풍습",
    "프랑스",
    "프린터",
    "플라스틱",
    "피곤",
    "피망",
    "피아노",
    "필름",
    "필수",
    "필요",
    "필자",
    "필통",
    "핑계",
    "하느님",
    "하늘",
    "하드웨어",
    "하룻밤",
    "하반기",
    "하숙집",
    "하순",
    "하여튼",
    "하지만",
    "하천",
    "하품",
    "하필",
    "학과",
    "학교",
    "학급",
    "학기",
    "학년",
    "학력",
    "학번",
    "학부모",
    "학비",
    "학생",
    "학술",
    "학습",
    "학용품",
    "학원",
    "학위",
    "학자",
    "학점",
    "한계",
    "한글",
    "한꺼번에",
    "한낮",
    "한눈",
    "한동안",
    "한때",
    "한라산",
    "한마디",
    "한문",
    "한번",
    "한복",
    "한식",
    "한여름",
    "한쪽",
    "할머니",
    "할아버지",
    "할인",
    "함께",
    "함부로",
    "합격",
    "합리적",
    "항공",
    "항구",
    "항상",
    "항의",
    "해결",
    "해군",
    "해답",
    "해당",
    "해물",
    "해석",
    "해설",
    "해수욕장",
    "해안",
    "핵심",
    "핸드백",
    "햄버거",
    "햇볕",
    "햇살",
    "행동",
    "행복",
    "행사",
    "행운",
    "행위",
    "향기",
    "향상",
    "향수",
    "허락",
    "허용",
    "헬기",
    "현관",
    "현금",
    "현대",
    "현상",
    "현실",
    "현장",
    "현재",
    "현지",
    "혈액",
    "협력",
    "형부",
    "형사",
    "형수",
    "형식",
    "형제",
    "형태",
    "형편",
    "혜택",
    "호기심",
    "호남",
    "호랑이",
    "호박",
    "호텔",
    "호흡",
    "혹시",
    "홀로",
    "홈페이지",
    "홍보",
    "홍수",
    "홍차",
    "화면",
    "화분",
    "화살",
    "화요일",
    "화장",
    "화학",
    "확보",
    "확인",
    "확장",
    "확정",
    "환갑",
    "환경",
    "환영",
    "환율",
    "환자",
    "활기",
    "활동",
    "활발히",
    "활용",
    "활짝",
    "회견",
    "회관",
    "회복",
    "회색",
    "회원",
    "회장",
    "회전",
    "횟수",
    "횡단보도",
    "효율적",
    "후반",
    "후춧가루",
    "훈련",
    "훨씬",
    "휴식",
    "휴일",
    "흉내",
    "흐름",
    "흑백",
    "흑인",
    "흔적",
    "흔히",
    "흥미",
    "흥분",
    "희곡",
    "희망",
    "희생",
    "흰색",
    "힘껏"
]
;
},{}],"wordlists/french.json":[function(require,module,exports) {
module.exports = [
    "abaisser",
    "abandon",
    "abdiquer",
    "abeille",
    "abolir",
    "aborder",
    "aboutir",
    "aboyer",
    "abrasif",
    "abreuver",
    "abriter",
    "abroger",
    "abrupt",
    "absence",
    "absolu",
    "absurde",
    "abusif",
    "abyssal",
    "académie",
    "acajou",
    "acarien",
    "accabler",
    "accepter",
    "acclamer",
    "accolade",
    "accroche",
    "accuser",
    "acerbe",
    "achat",
    "acheter",
    "aciduler",
    "acier",
    "acompte",
    "acquérir",
    "acronyme",
    "acteur",
    "actif",
    "actuel",
    "adepte",
    "adéquat",
    "adhésif",
    "adjectif",
    "adjuger",
    "admettre",
    "admirer",
    "adopter",
    "adorer",
    "adoucir",
    "adresse",
    "adroit",
    "adulte",
    "adverbe",
    "aérer",
    "aéronef",
    "affaire",
    "affecter",
    "affiche",
    "affreux",
    "affubler",
    "agacer",
    "agencer",
    "agile",
    "agiter",
    "agrafer",
    "agréable",
    "agrume",
    "aider",
    "aiguille",
    "ailier",
    "aimable",
    "aisance",
    "ajouter",
    "ajuster",
    "alarmer",
    "alchimie",
    "alerte",
    "algèbre",
    "algue",
    "aliéner",
    "aliment",
    "alléger",
    "alliage",
    "allouer",
    "allumer",
    "alourdir",
    "alpaga",
    "altesse",
    "alvéole",
    "amateur",
    "ambigu",
    "ambre",
    "aménager",
    "amertume",
    "amidon",
    "amiral",
    "amorcer",
    "amour",
    "amovible",
    "amphibie",
    "ampleur",
    "amusant",
    "analyse",
    "anaphore",
    "anarchie",
    "anatomie",
    "ancien",
    "anéantir",
    "angle",
    "angoisse",
    "anguleux",
    "animal",
    "annexer",
    "annonce",
    "annuel",
    "anodin",
    "anomalie",
    "anonyme",
    "anormal",
    "antenne",
    "antidote",
    "anxieux",
    "apaiser",
    "apéritif",
    "aplanir",
    "apologie",
    "appareil",
    "appeler",
    "apporter",
    "appuyer",
    "aquarium",
    "aqueduc",
    "arbitre",
    "arbuste",
    "ardeur",
    "ardoise",
    "argent",
    "arlequin",
    "armature",
    "armement",
    "armoire",
    "armure",
    "arpenter",
    "arracher",
    "arriver",
    "arroser",
    "arsenic",
    "artériel",
    "article",
    "aspect",
    "asphalte",
    "aspirer",
    "assaut",
    "asservir",
    "assiette",
    "associer",
    "assurer",
    "asticot",
    "astre",
    "astuce",
    "atelier",
    "atome",
    "atrium",
    "atroce",
    "attaque",
    "attentif",
    "attirer",
    "attraper",
    "aubaine",
    "auberge",
    "audace",
    "audible",
    "augurer",
    "aurore",
    "automne",
    "autruche",
    "avaler",
    "avancer",
    "avarice",
    "avenir",
    "averse",
    "aveugle",
    "aviateur",
    "avide",
    "avion",
    "aviser",
    "avoine",
    "avouer",
    "avril",
    "axial",
    "axiome",
    "badge",
    "bafouer",
    "bagage",
    "baguette",
    "baignade",
    "balancer",
    "balcon",
    "baleine",
    "balisage",
    "bambin",
    "bancaire",
    "bandage",
    "banlieue",
    "bannière",
    "banquier",
    "barbier",
    "baril",
    "baron",
    "barque",
    "barrage",
    "bassin",
    "bastion",
    "bataille",
    "bateau",
    "batterie",
    "baudrier",
    "bavarder",
    "belette",
    "bélier",
    "belote",
    "bénéfice",
    "berceau",
    "berger",
    "berline",
    "bermuda",
    "besace",
    "besogne",
    "bétail",
    "beurre",
    "biberon",
    "bicycle",
    "bidule",
    "bijou",
    "bilan",
    "bilingue",
    "billard",
    "binaire",
    "biologie",
    "biopsie",
    "biotype",
    "biscuit",
    "bison",
    "bistouri",
    "bitume",
    "bizarre",
    "blafard",
    "blague",
    "blanchir",
    "blessant",
    "blinder",
    "blond",
    "bloquer",
    "blouson",
    "bobard",
    "bobine",
    "boire",
    "boiser",
    "bolide",
    "bonbon",
    "bondir",
    "bonheur",
    "bonifier",
    "bonus",
    "bordure",
    "borne",
    "botte",
    "boucle",
    "boueux",
    "bougie",
    "boulon",
    "bouquin",
    "bourse",
    "boussole",
    "boutique",
    "boxeur",
    "branche",
    "brasier",
    "brave",
    "brebis",
    "brèche",
    "breuvage",
    "bricoler",
    "brigade",
    "brillant",
    "brioche",
    "brique",
    "brochure",
    "broder",
    "bronzer",
    "brousse",
    "broyeur",
    "brume",
    "brusque",
    "brutal",
    "bruyant",
    "buffle",
    "buisson",
    "bulletin",
    "bureau",
    "burin",
    "bustier",
    "butiner",
    "butoir",
    "buvable",
    "buvette",
    "cabanon",
    "cabine",
    "cachette",
    "cadeau",
    "cadre",
    "caféine",
    "caillou",
    "caisson",
    "calculer",
    "calepin",
    "calibre",
    "calmer",
    "calomnie",
    "calvaire",
    "camarade",
    "caméra",
    "camion",
    "campagne",
    "canal",
    "caneton",
    "canon",
    "cantine",
    "canular",
    "capable",
    "caporal",
    "caprice",
    "capsule",
    "capter",
    "capuche",
    "carabine",
    "carbone",
    "caresser",
    "caribou",
    "carnage",
    "carotte",
    "carreau",
    "carton",
    "cascade",
    "casier",
    "casque",
    "cassure",
    "causer",
    "caution",
    "cavalier",
    "caverne",
    "caviar",
    "cédille",
    "ceinture",
    "céleste",
    "cellule",
    "cendrier",
    "censurer",
    "central",
    "cercle",
    "cérébral",
    "cerise",
    "cerner",
    "cerveau",
    "cesser",
    "chagrin",
    "chaise",
    "chaleur",
    "chambre",
    "chance",
    "chapitre",
    "charbon",
    "chasseur",
    "chaton",
    "chausson",
    "chavirer",
    "chemise",
    "chenille",
    "chéquier",
    "chercher",
    "cheval",
    "chien",
    "chiffre",
    "chignon",
    "chimère",
    "chiot",
    "chlorure",
    "chocolat",
    "choisir",
    "chose",
    "chouette",
    "chrome",
    "chute",
    "cigare",
    "cigogne",
    "cimenter",
    "cinéma",
    "cintrer",
    "circuler",
    "cirer",
    "cirque",
    "citerne",
    "citoyen",
    "citron",
    "civil",
    "clairon",
    "clameur",
    "claquer",
    "classe",
    "clavier",
    "client",
    "cligner",
    "climat",
    "clivage",
    "cloche",
    "clonage",
    "cloporte",
    "cobalt",
    "cobra",
    "cocasse",
    "cocotier",
    "coder",
    "codifier",
    "coffre",
    "cogner",
    "cohésion",
    "coiffer",
    "coincer",
    "colère",
    "colibri",
    "colline",
    "colmater",
    "colonel",
    "combat",
    "comédie",
    "commande",
    "compact",
    "concert",
    "conduire",
    "confier",
    "congeler",
    "connoter",
    "consonne",
    "contact",
    "convexe",
    "copain",
    "copie",
    "corail",
    "corbeau",
    "cordage",
    "corniche",
    "corpus",
    "correct",
    "cortège",
    "cosmique",
    "costume",
    "coton",
    "coude",
    "coupure",
    "courage",
    "couteau",
    "couvrir",
    "coyote",
    "crabe",
    "crainte",
    "cravate",
    "crayon",
    "créature",
    "créditer",
    "crémeux",
    "creuser",
    "crevette",
    "cribler",
    "crier",
    "cristal",
    "critère",
    "croire",
    "croquer",
    "crotale",
    "crucial",
    "cruel",
    "crypter",
    "cubique",
    "cueillir",
    "cuillère",
    "cuisine",
    "cuivre",
    "culminer",
    "cultiver",
    "cumuler",
    "cupide",
    "curatif",
    "curseur",
    "cyanure",
    "cycle",
    "cylindre",
    "cynique",
    "daigner",
    "damier",
    "danger",
    "danseur",
    "dauphin",
    "débattre",
    "débiter",
    "déborder",
    "débrider",
    "débutant",
    "décaler",
    "décembre",
    "déchirer",
    "décider",
    "déclarer",
    "décorer",
    "décrire",
    "décupler",
    "dédale",
    "déductif",
    "déesse",
    "défensif",
    "défiler",
    "défrayer",
    "dégager",
    "dégivrer",
    "déglutir",
    "dégrafer",
    "déjeuner",
    "délice",
    "déloger",
    "demander",
    "demeurer",
    "démolir",
    "dénicher",
    "dénouer",
    "dentelle",
    "dénuder",
    "départ",
    "dépenser",
    "déphaser",
    "déplacer",
    "déposer",
    "déranger",
    "dérober",
    "désastre",
    "descente",
    "désert",
    "désigner",
    "désobéir",
    "dessiner",
    "destrier",
    "détacher",
    "détester",
    "détourer",
    "détresse",
    "devancer",
    "devenir",
    "deviner",
    "devoir",
    "diable",
    "dialogue",
    "diamant",
    "dicter",
    "différer",
    "digérer",
    "digital",
    "digne",
    "diluer",
    "dimanche",
    "diminuer",
    "dioxyde",
    "directif",
    "diriger",
    "discuter",
    "disposer",
    "dissiper",
    "distance",
    "divertir",
    "diviser",
    "docile",
    "docteur",
    "dogme",
    "doigt",
    "domaine",
    "domicile",
    "dompter",
    "donateur",
    "donjon",
    "donner",
    "dopamine",
    "dortoir",
    "dorure",
    "dosage",
    "doseur",
    "dossier",
    "dotation",
    "douanier",
    "double",
    "douceur",
    "douter",
    "doyen",
    "dragon",
    "draper",
    "dresser",
    "dribbler",
    "droiture",
    "duperie",
    "duplexe",
    "durable",
    "durcir",
    "dynastie",
    "éblouir",
    "écarter",
    "écharpe",
    "échelle",
    "éclairer",
    "éclipse",
    "éclore",
    "écluse",
    "école",
    "économie",
    "écorce",
    "écouter",
    "écraser",
    "écrémer",
    "écrivain",
    "écrou",
    "écume",
    "écureuil",
    "édifier",
    "éduquer",
    "effacer",
    "effectif",
    "effigie",
    "effort",
    "effrayer",
    "effusion",
    "égaliser",
    "égarer",
    "éjecter",
    "élaborer",
    "élargir",
    "électron",
    "élégant",
    "éléphant",
    "élève",
    "éligible",
    "élitisme",
    "éloge",
    "élucider",
    "éluder",
    "emballer",
    "embellir",
    "embryon",
    "émeraude",
    "émission",
    "emmener",
    "émotion",
    "émouvoir",
    "empereur",
    "employer",
    "emporter",
    "emprise",
    "émulsion",
    "encadrer",
    "enchère",
    "enclave",
    "encoche",
    "endiguer",
    "endosser",
    "endroit",
    "enduire",
    "énergie",
    "enfance",
    "enfermer",
    "enfouir",
    "engager",
    "engin",
    "englober",
    "énigme",
    "enjamber",
    "enjeu",
    "enlever",
    "ennemi",
    "ennuyeux",
    "enrichir",
    "enrobage",
    "enseigne",
    "entasser",
    "entendre",
    "entier",
    "entourer",
    "entraver",
    "énumérer",
    "envahir",
    "enviable",
    "envoyer",
    "enzyme",
    "éolien",
    "épaissir",
    "épargne",
    "épatant",
    "épaule",
    "épicerie",
    "épidémie",
    "épier",
    "épilogue",
    "épine",
    "épisode",
    "épitaphe",
    "époque",
    "épreuve",
    "éprouver",
    "épuisant",
    "équerre",
    "équipe",
    "ériger",
    "érosion",
    "erreur",
    "éruption",
    "escalier",
    "espadon",
    "espèce",
    "espiègle",
    "espoir",
    "esprit",
    "esquiver",
    "essayer",
    "essence",
    "essieu",
    "essorer",
    "estime",
    "estomac",
    "estrade",
    "étagère",
    "étaler",
    "étanche",
    "étatique",
    "éteindre",
    "étendoir",
    "éternel",
    "éthanol",
    "éthique",
    "ethnie",
    "étirer",
    "étoffer",
    "étoile",
    "étonnant",
    "étourdir",
    "étrange",
    "étroit",
    "étude",
    "euphorie",
    "évaluer",
    "évasion",
    "éventail",
    "évidence",
    "éviter",
    "évolutif",
    "évoquer",
    "exact",
    "exagérer",
    "exaucer",
    "exceller",
    "excitant",
    "exclusif",
    "excuse",
    "exécuter",
    "exemple",
    "exercer",
    "exhaler",
    "exhorter",
    "exigence",
    "exiler",
    "exister",
    "exotique",
    "expédier",
    "explorer",
    "exposer",
    "exprimer",
    "exquis",
    "extensif",
    "extraire",
    "exulter",
    "fable",
    "fabuleux",
    "facette",
    "facile",
    "facture",
    "faiblir",
    "falaise",
    "fameux",
    "famille",
    "farceur",
    "farfelu",
    "farine",
    "farouche",
    "fasciner",
    "fatal",
    "fatigue",
    "faucon",
    "fautif",
    "faveur",
    "favori",
    "fébrile",
    "féconder",
    "fédérer",
    "félin",
    "femme",
    "fémur",
    "fendoir",
    "féodal",
    "fermer",
    "féroce",
    "ferveur",
    "festival",
    "feuille",
    "feutre",
    "février",
    "fiasco",
    "ficeler",
    "fictif",
    "fidèle",
    "figure",
    "filature",
    "filetage",
    "filière",
    "filleul",
    "filmer",
    "filou",
    "filtrer",
    "financer",
    "finir",
    "fiole",
    "firme",
    "fissure",
    "fixer",
    "flairer",
    "flamme",
    "flasque",
    "flatteur",
    "fléau",
    "flèche",
    "fleur",
    "flexion",
    "flocon",
    "flore",
    "fluctuer",
    "fluide",
    "fluvial",
    "folie",
    "fonderie",
    "fongible",
    "fontaine",
    "forcer",
    "forgeron",
    "formuler",
    "fortune",
    "fossile",
    "foudre",
    "fougère",
    "fouiller",
    "foulure",
    "fourmi",
    "fragile",
    "fraise",
    "franchir",
    "frapper",
    "frayeur",
    "frégate",
    "freiner",
    "frelon",
    "frémir",
    "frénésie",
    "frère",
    "friable",
    "friction",
    "frisson",
    "frivole",
    "froid",
    "fromage",
    "frontal",
    "frotter",
    "fruit",
    "fugitif",
    "fuite",
    "fureur",
    "furieux",
    "furtif",
    "fusion",
    "futur",
    "gagner",
    "galaxie",
    "galerie",
    "gambader",
    "garantir",
    "gardien",
    "garnir",
    "garrigue",
    "gazelle",
    "gazon",
    "géant",
    "gélatine",
    "gélule",
    "gendarme",
    "général",
    "génie",
    "genou",
    "gentil",
    "géologie",
    "géomètre",
    "géranium",
    "germe",
    "gestuel",
    "geyser",
    "gibier",
    "gicler",
    "girafe",
    "givre",
    "glace",
    "glaive",
    "glisser",
    "globe",
    "gloire",
    "glorieux",
    "golfeur",
    "gomme",
    "gonfler",
    "gorge",
    "gorille",
    "goudron",
    "gouffre",
    "goulot",
    "goupille",
    "gourmand",
    "goutte",
    "graduel",
    "graffiti",
    "graine",
    "grand",
    "grappin",
    "gratuit",
    "gravir",
    "grenat",
    "griffure",
    "griller",
    "grimper",
    "grogner",
    "gronder",
    "grotte",
    "groupe",
    "gruger",
    "grutier",
    "gruyère",
    "guépard",
    "guerrier",
    "guide",
    "guimauve",
    "guitare",
    "gustatif",
    "gymnaste",
    "gyrostat",
    "habitude",
    "hachoir",
    "halte",
    "hameau",
    "hangar",
    "hanneton",
    "haricot",
    "harmonie",
    "harpon",
    "hasard",
    "hélium",
    "hématome",
    "herbe",
    "hérisson",
    "hermine",
    "héron",
    "hésiter",
    "heureux",
    "hiberner",
    "hibou",
    "hilarant",
    "histoire",
    "hiver",
    "homard",
    "hommage",
    "homogène",
    "honneur",
    "honorer",
    "honteux",
    "horde",
    "horizon",
    "horloge",
    "hormone",
    "horrible",
    "houleux",
    "housse",
    "hublot",
    "huileux",
    "humain",
    "humble",
    "humide",
    "humour",
    "hurler",
    "hydromel",
    "hygiène",
    "hymne",
    "hypnose",
    "idylle",
    "ignorer",
    "iguane",
    "illicite",
    "illusion",
    "image",
    "imbiber",
    "imiter",
    "immense",
    "immobile",
    "immuable",
    "impact",
    "impérial",
    "implorer",
    "imposer",
    "imprimer",
    "imputer",
    "incarner",
    "incendie",
    "incident",
    "incliner",
    "incolore",
    "indexer",
    "indice",
    "inductif",
    "inédit",
    "ineptie",
    "inexact",
    "infini",
    "infliger",
    "informer",
    "infusion",
    "ingérer",
    "inhaler",
    "inhiber",
    "injecter",
    "injure",
    "innocent",
    "inoculer",
    "inonder",
    "inscrire",
    "insecte",
    "insigne",
    "insolite",
    "inspirer",
    "instinct",
    "insulter",
    "intact",
    "intense",
    "intime",
    "intrigue",
    "intuitif",
    "inutile",
    "invasion",
    "inventer",
    "inviter",
    "invoquer",
    "ironique",
    "irradier",
    "irréel",
    "irriter",
    "isoler",
    "ivoire",
    "ivresse",
    "jaguar",
    "jaillir",
    "jambe",
    "janvier",
    "jardin",
    "jauger",
    "jaune",
    "javelot",
    "jetable",
    "jeton",
    "jeudi",
    "jeunesse",
    "joindre",
    "joncher",
    "jongler",
    "joueur",
    "jouissif",
    "journal",
    "jovial",
    "joyau",
    "joyeux",
    "jubiler",
    "jugement",
    "junior",
    "jupon",
    "juriste",
    "justice",
    "juteux",
    "juvénile",
    "kayak",
    "kimono",
    "kiosque",
    "label",
    "labial",
    "labourer",
    "lacérer",
    "lactose",
    "lagune",
    "laine",
    "laisser",
    "laitier",
    "lambeau",
    "lamelle",
    "lampe",
    "lanceur",
    "langage",
    "lanterne",
    "lapin",
    "largeur",
    "larme",
    "laurier",
    "lavabo",
    "lavoir",
    "lecture",
    "légal",
    "léger",
    "légume",
    "lessive",
    "lettre",
    "levier",
    "lexique",
    "lézard",
    "liasse",
    "libérer",
    "libre",
    "licence",
    "licorne",
    "liège",
    "lièvre",
    "ligature",
    "ligoter",
    "ligue",
    "limer",
    "limite",
    "limonade",
    "limpide",
    "linéaire",
    "lingot",
    "lionceau",
    "liquide",
    "lisière",
    "lister",
    "lithium",
    "litige",
    "littoral",
    "livreur",
    "logique",
    "lointain",
    "loisir",
    "lombric",
    "loterie",
    "louer",
    "lourd",
    "loutre",
    "louve",
    "loyal",
    "lubie",
    "lucide",
    "lucratif",
    "lueur",
    "lugubre",
    "luisant",
    "lumière",
    "lunaire",
    "lundi",
    "luron",
    "lutter",
    "luxueux",
    "machine",
    "magasin",
    "magenta",
    "magique",
    "maigre",
    "maillon",
    "maintien",
    "mairie",
    "maison",
    "majorer",
    "malaxer",
    "maléfice",
    "malheur",
    "malice",
    "mallette",
    "mammouth",
    "mandater",
    "maniable",
    "manquant",
    "manteau",
    "manuel",
    "marathon",
    "marbre",
    "marchand",
    "mardi",
    "maritime",
    "marqueur",
    "marron",
    "marteler",
    "mascotte",
    "massif",
    "matériel",
    "matière",
    "matraque",
    "maudire",
    "maussade",
    "mauve",
    "maximal",
    "méchant",
    "méconnu",
    "médaille",
    "médecin",
    "méditer",
    "méduse",
    "meilleur",
    "mélange",
    "mélodie",
    "membre",
    "mémoire",
    "menacer",
    "mener",
    "menhir",
    "mensonge",
    "mentor",
    "mercredi",
    "mérite",
    "merle",
    "messager",
    "mesure",
    "métal",
    "météore",
    "méthode",
    "métier",
    "meuble",
    "miauler",
    "microbe",
    "miette",
    "mignon",
    "migrer",
    "milieu",
    "million",
    "mimique",
    "mince",
    "minéral",
    "minimal",
    "minorer",
    "minute",
    "miracle",
    "miroiter",
    "missile",
    "mixte",
    "mobile",
    "moderne",
    "moelleux",
    "mondial",
    "moniteur",
    "monnaie",
    "monotone",
    "monstre",
    "montagne",
    "monument",
    "moqueur",
    "morceau",
    "morsure",
    "mortier",
    "moteur",
    "motif",
    "mouche",
    "moufle",
    "moulin",
    "mousson",
    "mouton",
    "mouvant",
    "multiple",
    "munition",
    "muraille",
    "murène",
    "murmure",
    "muscle",
    "muséum",
    "musicien",
    "mutation",
    "muter",
    "mutuel",
    "myriade",
    "myrtille",
    "mystère",
    "mythique",
    "nageur",
    "nappe",
    "narquois",
    "narrer",
    "natation",
    "nation",
    "nature",
    "naufrage",
    "nautique",
    "navire",
    "nébuleux",
    "nectar",
    "néfaste",
    "négation",
    "négliger",
    "négocier",
    "neige",
    "nerveux",
    "nettoyer",
    "neurone",
    "neutron",
    "neveu",
    "niche",
    "nickel",
    "nitrate",
    "niveau",
    "noble",
    "nocif",
    "nocturne",
    "noirceur",
    "noisette",
    "nomade",
    "nombreux",
    "nommer",
    "normatif",
    "notable",
    "notifier",
    "notoire",
    "nourrir",
    "nouveau",
    "novateur",
    "novembre",
    "novice",
    "nuage",
    "nuancer",
    "nuire",
    "nuisible",
    "numéro",
    "nuptial",
    "nuque",
    "nutritif",
    "obéir",
    "objectif",
    "obliger",
    "obscur",
    "observer",
    "obstacle",
    "obtenir",
    "obturer",
    "occasion",
    "occuper",
    "océan",
    "octobre",
    "octroyer",
    "octupler",
    "oculaire",
    "odeur",
    "odorant",
    "offenser",
    "officier",
    "offrir",
    "ogive",
    "oiseau",
    "oisillon",
    "olfactif",
    "olivier",
    "ombrage",
    "omettre",
    "onctueux",
    "onduler",
    "onéreux",
    "onirique",
    "opale",
    "opaque",
    "opérer",
    "opinion",
    "opportun",
    "opprimer",
    "opter",
    "optique",
    "orageux",
    "orange",
    "orbite",
    "ordonner",
    "oreille",
    "organe",
    "orgueil",
    "orifice",
    "ornement",
    "orque",
    "ortie",
    "osciller",
    "osmose",
    "ossature",
    "otarie",
    "ouragan",
    "ourson",
    "outil",
    "outrager",
    "ouvrage",
    "ovation",
    "oxyde",
    "oxygène",
    "ozone",
    "paisible",
    "palace",
    "palmarès",
    "palourde",
    "palper",
    "panache",
    "panda",
    "pangolin",
    "paniquer",
    "panneau",
    "panorama",
    "pantalon",
    "papaye",
    "papier",
    "papoter",
    "papyrus",
    "paradoxe",
    "parcelle",
    "paresse",
    "parfumer",
    "parler",
    "parole",
    "parrain",
    "parsemer",
    "partager",
    "parure",
    "parvenir",
    "passion",
    "pastèque",
    "paternel",
    "patience",
    "patron",
    "pavillon",
    "pavoiser",
    "payer",
    "paysage",
    "peigne",
    "peintre",
    "pelage",
    "pélican",
    "pelle",
    "pelouse",
    "peluche",
    "pendule",
    "pénétrer",
    "pénible",
    "pensif",
    "pénurie",
    "pépite",
    "péplum",
    "perdrix",
    "perforer",
    "période",
    "permuter",
    "perplexe",
    "persil",
    "perte",
    "peser",
    "pétale",
    "petit",
    "pétrir",
    "peuple",
    "pharaon",
    "phobie",
    "phoque",
    "photon",
    "phrase",
    "physique",
    "piano",
    "pictural",
    "pièce",
    "pierre",
    "pieuvre",
    "pilote",
    "pinceau",
    "pipette",
    "piquer",
    "pirogue",
    "piscine",
    "piston",
    "pivoter",
    "pixel",
    "pizza",
    "placard",
    "plafond",
    "plaisir",
    "planer",
    "plaque",
    "plastron",
    "plateau",
    "pleurer",
    "plexus",
    "pliage",
    "plomb",
    "plonger",
    "pluie",
    "plumage",
    "pochette",
    "poésie",
    "poète",
    "pointe",
    "poirier",
    "poisson",
    "poivre",
    "polaire",
    "policier",
    "pollen",
    "polygone",
    "pommade",
    "pompier",
    "ponctuel",
    "pondérer",
    "poney",
    "portique",
    "position",
    "posséder",
    "posture",
    "potager",
    "poteau",
    "potion",
    "pouce",
    "poulain",
    "poumon",
    "pourpre",
    "poussin",
    "pouvoir",
    "prairie",
    "pratique",
    "précieux",
    "prédire",
    "préfixe",
    "prélude",
    "prénom",
    "présence",
    "prétexte",
    "prévoir",
    "primitif",
    "prince",
    "prison",
    "priver",
    "problème",
    "procéder",
    "prodige",
    "profond",
    "progrès",
    "proie",
    "projeter",
    "prologue",
    "promener",
    "propre",
    "prospère",
    "protéger",
    "prouesse",
    "proverbe",
    "prudence",
    "pruneau",
    "psychose",
    "public",
    "puceron",
    "puiser",
    "pulpe",
    "pulsar",
    "punaise",
    "punitif",
    "pupitre",
    "purifier",
    "puzzle",
    "pyramide",
    "quasar",
    "querelle",
    "question",
    "quiétude",
    "quitter",
    "quotient",
    "racine",
    "raconter",
    "radieux",
    "ragondin",
    "raideur",
    "raisin",
    "ralentir",
    "rallonge",
    "ramasser",
    "rapide",
    "rasage",
    "ratisser",
    "ravager",
    "ravin",
    "rayonner",
    "réactif",
    "réagir",
    "réaliser",
    "réanimer",
    "recevoir",
    "réciter",
    "réclamer",
    "récolter",
    "recruter",
    "reculer",
    "recycler",
    "rédiger",
    "redouter",
    "refaire",
    "réflexe",
    "réformer",
    "refrain",
    "refuge",
    "régalien",
    "région",
    "réglage",
    "régulier",
    "réitérer",
    "rejeter",
    "rejouer",
    "relatif",
    "relever",
    "relief",
    "remarque",
    "remède",
    "remise",
    "remonter",
    "remplir",
    "remuer",
    "renard",
    "renfort",
    "renifler",
    "renoncer",
    "rentrer",
    "renvoi",
    "replier",
    "reporter",
    "reprise",
    "reptile",
    "requin",
    "réserve",
    "résineux",
    "résoudre",
    "respect",
    "rester",
    "résultat",
    "rétablir",
    "retenir",
    "réticule",
    "retomber",
    "retracer",
    "réunion",
    "réussir",
    "revanche",
    "revivre",
    "révolte",
    "révulsif",
    "richesse",
    "rideau",
    "rieur",
    "rigide",
    "rigoler",
    "rincer",
    "riposter",
    "risible",
    "risque",
    "rituel",
    "rival",
    "rivière",
    "rocheux",
    "romance",
    "rompre",
    "ronce",
    "rondin",
    "roseau",
    "rosier",
    "rotatif",
    "rotor",
    "rotule",
    "rouge",
    "rouille",
    "rouleau",
    "routine",
    "royaume",
    "ruban",
    "rubis",
    "ruche",
    "ruelle",
    "rugueux",
    "ruiner",
    "ruisseau",
    "ruser",
    "rustique",
    "rythme",
    "sabler",
    "saboter",
    "sabre",
    "sacoche",
    "safari",
    "sagesse",
    "saisir",
    "salade",
    "salive",
    "salon",
    "saluer",
    "samedi",
    "sanction",
    "sanglier",
    "sarcasme",
    "sardine",
    "saturer",
    "saugrenu",
    "saumon",
    "sauter",
    "sauvage",
    "savant",
    "savonner",
    "scalpel",
    "scandale",
    "scélérat",
    "scénario",
    "sceptre",
    "schéma",
    "science",
    "scinder",
    "score",
    "scrutin",
    "sculpter",
    "séance",
    "sécable",
    "sécher",
    "secouer",
    "sécréter",
    "sédatif",
    "séduire",
    "seigneur",
    "séjour",
    "sélectif",
    "semaine",
    "sembler",
    "semence",
    "séminal",
    "sénateur",
    "sensible",
    "sentence",
    "séparer",
    "séquence",
    "serein",
    "sergent",
    "sérieux",
    "serrure",
    "sérum",
    "service",
    "sésame",
    "sévir",
    "sevrage",
    "sextuple",
    "sidéral",
    "siècle",
    "siéger",
    "siffler",
    "sigle",
    "signal",
    "silence",
    "silicium",
    "simple",
    "sincère",
    "sinistre",
    "siphon",
    "sirop",
    "sismique",
    "situer",
    "skier",
    "social",
    "socle",
    "sodium",
    "soigneux",
    "soldat",
    "soleil",
    "solitude",
    "soluble",
    "sombre",
    "sommeil",
    "somnoler",
    "sonde",
    "songeur",
    "sonnette",
    "sonore",
    "sorcier",
    "sortir",
    "sosie",
    "sottise",
    "soucieux",
    "soudure",
    "souffle",
    "soulever",
    "soupape",
    "source",
    "soutirer",
    "souvenir",
    "spacieux",
    "spatial",
    "spécial",
    "sphère",
    "spiral",
    "stable",
    "station",
    "sternum",
    "stimulus",
    "stipuler",
    "strict",
    "studieux",
    "stupeur",
    "styliste",
    "sublime",
    "substrat",
    "subtil",
    "subvenir",
    "succès",
    "sucre",
    "suffixe",
    "suggérer",
    "suiveur",
    "sulfate",
    "superbe",
    "supplier",
    "surface",
    "suricate",
    "surmener",
    "surprise",
    "sursaut",
    "survie",
    "suspect",
    "syllabe",
    "symbole",
    "symétrie",
    "synapse",
    "syntaxe",
    "système",
    "tabac",
    "tablier",
    "tactile",
    "tailler",
    "talent",
    "talisman",
    "talonner",
    "tambour",
    "tamiser",
    "tangible",
    "tapis",
    "taquiner",
    "tarder",
    "tarif",
    "tartine",
    "tasse",
    "tatami",
    "tatouage",
    "taupe",
    "taureau",
    "taxer",
    "témoin",
    "temporel",
    "tenaille",
    "tendre",
    "teneur",
    "tenir",
    "tension",
    "terminer",
    "terne",
    "terrible",
    "tétine",
    "texte",
    "thème",
    "théorie",
    "thérapie",
    "thorax",
    "tibia",
    "tiède",
    "timide",
    "tirelire",
    "tiroir",
    "tissu",
    "titane",
    "titre",
    "tituber",
    "toboggan",
    "tolérant",
    "tomate",
    "tonique",
    "tonneau",
    "toponyme",
    "torche",
    "tordre",
    "tornade",
    "torpille",
    "torrent",
    "torse",
    "tortue",
    "totem",
    "toucher",
    "tournage",
    "tousser",
    "toxine",
    "traction",
    "trafic",
    "tragique",
    "trahir",
    "train",
    "trancher",
    "travail",
    "trèfle",
    "tremper",
    "trésor",
    "treuil",
    "triage",
    "tribunal",
    "tricoter",
    "trilogie",
    "triomphe",
    "tripler",
    "triturer",
    "trivial",
    "trombone",
    "tronc",
    "tropical",
    "troupeau",
    "tuile",
    "tulipe",
    "tumulte",
    "tunnel",
    "turbine",
    "tuteur",
    "tutoyer",
    "tuyau",
    "tympan",
    "typhon",
    "typique",
    "tyran",
    "ubuesque",
    "ultime",
    "ultrason",
    "unanime",
    "unifier",
    "union",
    "unique",
    "unitaire",
    "univers",
    "uranium",
    "urbain",
    "urticant",
    "usage",
    "usine",
    "usuel",
    "usure",
    "utile",
    "utopie",
    "vacarme",
    "vaccin",
    "vagabond",
    "vague",
    "vaillant",
    "vaincre",
    "vaisseau",
    "valable",
    "valise",
    "vallon",
    "valve",
    "vampire",
    "vanille",
    "vapeur",
    "varier",
    "vaseux",
    "vassal",
    "vaste",
    "vecteur",
    "vedette",
    "végétal",
    "véhicule",
    "veinard",
    "véloce",
    "vendredi",
    "vénérer",
    "venger",
    "venimeux",
    "ventouse",
    "verdure",
    "vérin",
    "vernir",
    "verrou",
    "verser",
    "vertu",
    "veston",
    "vétéran",
    "vétuste",
    "vexant",
    "vexer",
    "viaduc",
    "viande",
    "victoire",
    "vidange",
    "vidéo",
    "vignette",
    "vigueur",
    "vilain",
    "village",
    "vinaigre",
    "violon",
    "vipère",
    "virement",
    "virtuose",
    "virus",
    "visage",
    "viseur",
    "vision",
    "visqueux",
    "visuel",
    "vital",
    "vitesse",
    "viticole",
    "vitrine",
    "vivace",
    "vivipare",
    "vocation",
    "voguer",
    "voile",
    "voisin",
    "voiture",
    "volaille",
    "volcan",
    "voltiger",
    "volume",
    "vorace",
    "vortex",
    "voter",
    "vouloir",
    "voyage",
    "voyelle",
    "wagon",
    "xénon",
    "yacht",
    "zèbre",
    "zénith",
    "zeste",
    "zoologie"
]
;
},{}],"wordlists/italian.json":[function(require,module,exports) {
module.exports = [
    "abaco",
    "abbaglio",
    "abbinato",
    "abete",
    "abisso",
    "abolire",
    "abrasivo",
    "abrogato",
    "accadere",
    "accenno",
    "accusato",
    "acetone",
    "achille",
    "acido",
    "acqua",
    "acre",
    "acrilico",
    "acrobata",
    "acuto",
    "adagio",
    "addebito",
    "addome",
    "adeguato",
    "aderire",
    "adipe",
    "adottare",
    "adulare",
    "affabile",
    "affetto",
    "affisso",
    "affranto",
    "aforisma",
    "afoso",
    "africano",
    "agave",
    "agente",
    "agevole",
    "aggancio",
    "agire",
    "agitare",
    "agonismo",
    "agricolo",
    "agrumeto",
    "aguzzo",
    "alabarda",
    "alato",
    "albatro",
    "alberato",
    "albo",
    "albume",
    "alce",
    "alcolico",
    "alettone",
    "alfa",
    "algebra",
    "aliante",
    "alibi",
    "alimento",
    "allagato",
    "allegro",
    "allievo",
    "allodola",
    "allusivo",
    "almeno",
    "alogeno",
    "alpaca",
    "alpestre",
    "altalena",
    "alterno",
    "alticcio",
    "altrove",
    "alunno",
    "alveolo",
    "alzare",
    "amalgama",
    "amanita",
    "amarena",
    "ambito",
    "ambrato",
    "ameba",
    "america",
    "ametista",
    "amico",
    "ammasso",
    "ammenda",
    "ammirare",
    "ammonito",
    "amore",
    "ampio",
    "ampliare",
    "amuleto",
    "anacardo",
    "anagrafe",
    "analista",
    "anarchia",
    "anatra",
    "anca",
    "ancella",
    "ancora",
    "andare",
    "andrea",
    "anello",
    "angelo",
    "angolare",
    "angusto",
    "anima",
    "annegare",
    "annidato",
    "anno",
    "annuncio",
    "anonimo",
    "anticipo",
    "anzi",
    "apatico",
    "apertura",
    "apode",
    "apparire",
    "appetito",
    "appoggio",
    "approdo",
    "appunto",
    "aprile",
    "arabica",
    "arachide",
    "aragosta",
    "araldica",
    "arancio",
    "aratura",
    "arazzo",
    "arbitro",
    "archivio",
    "ardito",
    "arenile",
    "argento",
    "argine",
    "arguto",
    "aria",
    "armonia",
    "arnese",
    "arredato",
    "arringa",
    "arrosto",
    "arsenico",
    "arso",
    "artefice",
    "arzillo",
    "asciutto",
    "ascolto",
    "asepsi",
    "asettico",
    "asfalto",
    "asino",
    "asola",
    "aspirato",
    "aspro",
    "assaggio",
    "asse",
    "assoluto",
    "assurdo",
    "asta",
    "astenuto",
    "astice",
    "astratto",
    "atavico",
    "ateismo",
    "atomico",
    "atono",
    "attesa",
    "attivare",
    "attorno",
    "attrito",
    "attuale",
    "ausilio",
    "austria",
    "autista",
    "autonomo",
    "autunno",
    "avanzato",
    "avere",
    "avvenire",
    "avviso",
    "avvolgere",
    "azione",
    "azoto",
    "azzimo",
    "azzurro",
    "babele",
    "baccano",
    "bacino",
    "baco",
    "badessa",
    "badilata",
    "bagnato",
    "baita",
    "balcone",
    "baldo",
    "balena",
    "ballata",
    "balzano",
    "bambino",
    "bandire",
    "baraonda",
    "barbaro",
    "barca",
    "baritono",
    "barlume",
    "barocco",
    "basilico",
    "basso",
    "batosta",
    "battuto",
    "baule",
    "bava",
    "bavosa",
    "becco",
    "beffa",
    "belgio",
    "belva",
    "benda",
    "benevole",
    "benigno",
    "benzina",
    "bere",
    "berlina",
    "beta",
    "bibita",
    "bici",
    "bidone",
    "bifido",
    "biga",
    "bilancia",
    "bimbo",
    "binocolo",
    "biologo",
    "bipede",
    "bipolare",
    "birbante",
    "birra",
    "biscotto",
    "bisesto",
    "bisnonno",
    "bisonte",
    "bisturi",
    "bizzarro",
    "blando",
    "blatta",
    "bollito",
    "bonifico",
    "bordo",
    "bosco",
    "botanico",
    "bottino",
    "bozzolo",
    "braccio",
    "bradipo",
    "brama",
    "branca",
    "bravura",
    "bretella",
    "brevetto",
    "brezza",
    "briglia",
    "brillante",
    "brindare",
    "broccolo",
    "brodo",
    "bronzina",
    "brullo",
    "bruno",
    "bubbone",
    "buca",
    "budino",
    "buffone",
    "buio",
    "bulbo",
    "buono",
    "burlone",
    "burrasca",
    "bussola",
    "busta",
    "cadetto",
    "caduco",
    "calamaro",
    "calcolo",
    "calesse",
    "calibro",
    "calmo",
    "caloria",
    "cambusa",
    "camerata",
    "camicia",
    "cammino",
    "camola",
    "campale",
    "canapa",
    "candela",
    "cane",
    "canino",
    "canotto",
    "cantina",
    "capace",
    "capello",
    "capitolo",
    "capogiro",
    "cappero",
    "capra",
    "capsula",
    "carapace",
    "carcassa",
    "cardo",
    "carisma",
    "carovana",
    "carretto",
    "cartolina",
    "casaccio",
    "cascata",
    "caserma",
    "caso",
    "cassone",
    "castello",
    "casuale",
    "catasta",
    "catena",
    "catrame",
    "cauto",
    "cavillo",
    "cedibile",
    "cedrata",
    "cefalo",
    "celebre",
    "cellulare",
    "cena",
    "cenone",
    "centesimo",
    "ceramica",
    "cercare",
    "certo",
    "cerume",
    "cervello",
    "cesoia",
    "cespo",
    "ceto",
    "chela",
    "chiaro",
    "chicca",
    "chiedere",
    "chimera",
    "china",
    "chirurgo",
    "chitarra",
    "ciao",
    "ciclismo",
    "cifrare",
    "cigno",
    "cilindro",
    "ciottolo",
    "circa",
    "cirrosi",
    "citrico",
    "cittadino",
    "ciuffo",
    "civetta",
    "civile",
    "classico",
    "clinica",
    "cloro",
    "cocco",
    "codardo",
    "codice",
    "coerente",
    "cognome",
    "collare",
    "colmato",
    "colore",
    "colposo",
    "coltivato",
    "colza",
    "coma",
    "cometa",
    "commando",
    "comodo",
    "computer",
    "comune",
    "conciso",
    "condurre",
    "conferma",
    "congelare",
    "coniuge",
    "connesso",
    "conoscere",
    "consumo",
    "continuo",
    "convegno",
    "coperto",
    "copione",
    "coppia",
    "copricapo",
    "corazza",
    "cordata",
    "coricato",
    "cornice",
    "corolla",
    "corpo",
    "corredo",
    "corsia",
    "cortese",
    "cosmico",
    "costante",
    "cottura",
    "covato",
    "cratere",
    "cravatta",
    "creato",
    "credere",
    "cremoso",
    "crescita",
    "creta",
    "criceto",
    "crinale",
    "crisi",
    "critico",
    "croce",
    "cronaca",
    "crostata",
    "cruciale",
    "crusca",
    "cucire",
    "cuculo",
    "cugino",
    "cullato",
    "cupola",
    "curatore",
    "cursore",
    "curvo",
    "cuscino",
    "custode",
    "dado",
    "daino",
    "dalmata",
    "damerino",
    "daniela",
    "dannoso",
    "danzare",
    "datato",
    "davanti",
    "davvero",
    "debutto",
    "decennio",
    "deciso",
    "declino",
    "decollo",
    "decreto",
    "dedicato",
    "definito",
    "deforme",
    "degno",
    "delegare",
    "delfino",
    "delirio",
    "delta",
    "demenza",
    "denotato",
    "dentro",
    "deposito",
    "derapata",
    "derivare",
    "deroga",
    "descritto",
    "deserto",
    "desiderio",
    "desumere",
    "detersivo",
    "devoto",
    "diametro",
    "dicembre",
    "diedro",
    "difeso",
    "diffuso",
    "digerire",
    "digitale",
    "diluvio",
    "dinamico",
    "dinnanzi",
    "dipinto",
    "diploma",
    "dipolo",
    "diradare",
    "dire",
    "dirotto",
    "dirupo",
    "disagio",
    "discreto",
    "disfare",
    "disgelo",
    "disposto",
    "distanza",
    "disumano",
    "dito",
    "divano",
    "divelto",
    "dividere",
    "divorato",
    "doblone",
    "docente",
    "doganale",
    "dogma",
    "dolce",
    "domato",
    "domenica",
    "dominare",
    "dondolo",
    "dono",
    "dormire",
    "dote",
    "dottore",
    "dovuto",
    "dozzina",
    "drago",
    "druido",
    "dubbio",
    "dubitare",
    "ducale",
    "duna",
    "duomo",
    "duplice",
    "duraturo",
    "ebano",
    "eccesso",
    "ecco",
    "eclissi",
    "economia",
    "edera",
    "edicola",
    "edile",
    "editoria",
    "educare",
    "egemonia",
    "egli",
    "egoismo",
    "egregio",
    "elaborato",
    "elargire",
    "elegante",
    "elencato",
    "eletto",
    "elevare",
    "elfico",
    "elica",
    "elmo",
    "elsa",
    "eluso",
    "emanato",
    "emblema",
    "emesso",
    "emiro",
    "emotivo",
    "emozione",
    "empirico",
    "emulo",
    "endemico",
    "enduro",
    "energia",
    "enfasi",
    "enoteca",
    "entrare",
    "enzima",
    "epatite",
    "epilogo",
    "episodio",
    "epocale",
    "eppure",
    "equatore",
    "erario",
    "erba",
    "erboso",
    "erede",
    "eremita",
    "erigere",
    "ermetico",
    "eroe",
    "erosivo",
    "errante",
    "esagono",
    "esame",
    "esanime",
    "esaudire",
    "esca",
    "esempio",
    "esercito",
    "esibito",
    "esigente",
    "esistere",
    "esito",
    "esofago",
    "esortato",
    "esoso",
    "espanso",
    "espresso",
    "essenza",
    "esso",
    "esteso",
    "estimare",
    "estonia",
    "estroso",
    "esultare",
    "etilico",
    "etnico",
    "etrusco",
    "etto",
    "euclideo",
    "europa",
    "evaso",
    "evidenza",
    "evitato",
    "evoluto",
    "evviva",
    "fabbrica",
    "faccenda",
    "fachiro",
    "falco",
    "famiglia",
    "fanale",
    "fanfara",
    "fango",
    "fantasma",
    "fare",
    "farfalla",
    "farinoso",
    "farmaco",
    "fascia",
    "fastoso",
    "fasullo",
    "faticare",
    "fato",
    "favoloso",
    "febbre",
    "fecola",
    "fede",
    "fegato",
    "felpa",
    "feltro",
    "femmina",
    "fendere",
    "fenomeno",
    "fermento",
    "ferro",
    "fertile",
    "fessura",
    "festivo",
    "fetta",
    "feudo",
    "fiaba",
    "fiducia",
    "fifa",
    "figurato",
    "filo",
    "finanza",
    "finestra",
    "finire",
    "fiore",
    "fiscale",
    "fisico",
    "fiume",
    "flacone",
    "flamenco",
    "flebo",
    "flemma",
    "florido",
    "fluente",
    "fluoro",
    "fobico",
    "focaccia",
    "focoso",
    "foderato",
    "foglio",
    "folata",
    "folclore",
    "folgore",
    "fondente",
    "fonetico",
    "fonia",
    "fontana",
    "forbito",
    "forchetta",
    "foresta",
    "formica",
    "fornaio",
    "foro",
    "fortezza",
    "forzare",
    "fosfato",
    "fosso",
    "fracasso",
    "frana",
    "frassino",
    "fratello",
    "freccetta",
    "frenata",
    "fresco",
    "frigo",
    "frollino",
    "fronde",
    "frugale",
    "frutta",
    "fucilata",
    "fucsia",
    "fuggente",
    "fulmine",
    "fulvo",
    "fumante",
    "fumetto",
    "fumoso",
    "fune",
    "funzione",
    "fuoco",
    "furbo",
    "furgone",
    "furore",
    "fuso",
    "futile",
    "gabbiano",
    "gaffe",
    "galateo",
    "gallina",
    "galoppo",
    "gambero",
    "gamma",
    "garanzia",
    "garbo",
    "garofano",
    "garzone",
    "gasdotto",
    "gasolio",
    "gastrico",
    "gatto",
    "gaudio",
    "gazebo",
    "gazzella",
    "geco",
    "gelatina",
    "gelso",
    "gemello",
    "gemmato",
    "gene",
    "genitore",
    "gennaio",
    "genotipo",
    "gergo",
    "ghepardo",
    "ghiaccio",
    "ghisa",
    "giallo",
    "gilda",
    "ginepro",
    "giocare",
    "gioiello",
    "giorno",
    "giove",
    "girato",
    "girone",
    "gittata",
    "giudizio",
    "giurato",
    "giusto",
    "globulo",
    "glutine",
    "gnomo",
    "gobba",
    "golf",
    "gomito",
    "gommone",
    "gonfio",
    "gonna",
    "governo",
    "gracile",
    "grado",
    "grafico",
    "grammo",
    "grande",
    "grattare",
    "gravoso",
    "grazia",
    "greca",
    "gregge",
    "grifone",
    "grigio",
    "grinza",
    "grotta",
    "gruppo",
    "guadagno",
    "guaio",
    "guanto",
    "guardare",
    "gufo",
    "guidare",
    "ibernato",
    "icona",
    "identico",
    "idillio",
    "idolo",
    "idra",
    "idrico",
    "idrogeno",
    "igiene",
    "ignaro",
    "ignorato",
    "ilare",
    "illeso",
    "illogico",
    "illudere",
    "imballo",
    "imbevuto",
    "imbocco",
    "imbuto",
    "immane",
    "immerso",
    "immolato",
    "impacco",
    "impeto",
    "impiego",
    "importo",
    "impronta",
    "inalare",
    "inarcare",
    "inattivo",
    "incanto",
    "incendio",
    "inchino",
    "incisivo",
    "incluso",
    "incontro",
    "incrocio",
    "incubo",
    "indagine",
    "india",
    "indole",
    "inedito",
    "infatti",
    "infilare",
    "inflitto",
    "ingaggio",
    "ingegno",
    "inglese",
    "ingordo",
    "ingrosso",
    "innesco",
    "inodore",
    "inoltrare",
    "inondato",
    "insano",
    "insetto",
    "insieme",
    "insonnia",
    "insulina",
    "intasato",
    "intero",
    "intonaco",
    "intuito",
    "inumidire",
    "invalido",
    "invece",
    "invito",
    "iperbole",
    "ipnotico",
    "ipotesi",
    "ippica",
    "iride",
    "irlanda",
    "ironico",
    "irrigato",
    "irrorare",
    "isolato",
    "isotopo",
    "isterico",
    "istituto",
    "istrice",
    "italia",
    "iterare",
    "labbro",
    "labirinto",
    "lacca",
    "lacerato",
    "lacrima",
    "lacuna",
    "laddove",
    "lago",
    "lampo",
    "lancetta",
    "lanterna",
    "lardoso",
    "larga",
    "laringe",
    "lastra",
    "latenza",
    "latino",
    "lattuga",
    "lavagna",
    "lavoro",
    "legale",
    "leggero",
    "lembo",
    "lentezza",
    "lenza",
    "leone",
    "lepre",
    "lesivo",
    "lessato",
    "lesto",
    "letterale",
    "leva",
    "levigato",
    "libero",
    "lido",
    "lievito",
    "lilla",
    "limatura",
    "limitare",
    "limpido",
    "lineare",
    "lingua",
    "liquido",
    "lira",
    "lirica",
    "lisca",
    "lite",
    "litigio",
    "livrea",
    "locanda",
    "lode",
    "logica",
    "lombare",
    "londra",
    "longevo",
    "loquace",
    "lorenzo",
    "loto",
    "lotteria",
    "luce",
    "lucidato",
    "lumaca",
    "luminoso",
    "lungo",
    "lupo",
    "luppolo",
    "lusinga",
    "lusso",
    "lutto",
    "macabro",
    "macchina",
    "macero",
    "macinato",
    "madama",
    "magico",
    "maglia",
    "magnete",
    "magro",
    "maiolica",
    "malafede",
    "malgrado",
    "malinteso",
    "malsano",
    "malto",
    "malumore",
    "mana",
    "mancia",
    "mandorla",
    "mangiare",
    "manifesto",
    "mannaro",
    "manovra",
    "mansarda",
    "mantide",
    "manubrio",
    "mappa",
    "maratona",
    "marcire",
    "maretta",
    "marmo",
    "marsupio",
    "maschera",
    "massaia",
    "mastino",
    "materasso",
    "matricola",
    "mattone",
    "maturo",
    "mazurca",
    "meandro",
    "meccanico",
    "mecenate",
    "medesimo",
    "meditare",
    "mega",
    "melassa",
    "melis",
    "melodia",
    "meninge",
    "meno",
    "mensola",
    "mercurio",
    "merenda",
    "merlo",
    "meschino",
    "mese",
    "messere",
    "mestolo",
    "metallo",
    "metodo",
    "mettere",
    "miagolare",
    "mica",
    "micelio",
    "michele",
    "microbo",
    "midollo",
    "miele",
    "migliore",
    "milano",
    "milite",
    "mimosa",
    "minerale",
    "mini",
    "minore",
    "mirino",
    "mirtillo",
    "miscela",
    "missiva",
    "misto",
    "misurare",
    "mitezza",
    "mitigare",
    "mitra",
    "mittente",
    "mnemonico",
    "modello",
    "modifica",
    "modulo",
    "mogano",
    "mogio",
    "mole",
    "molosso",
    "monastero",
    "monco",
    "mondina",
    "monetario",
    "monile",
    "monotono",
    "monsone",
    "montato",
    "monviso",
    "mora",
    "mordere",
    "morsicato",
    "mostro",
    "motivato",
    "motosega",
    "motto",
    "movenza",
    "movimento",
    "mozzo",
    "mucca",
    "mucosa",
    "muffa",
    "mughetto",
    "mugnaio",
    "mulatto",
    "mulinello",
    "multiplo",
    "mummia",
    "munto",
    "muovere",
    "murale",
    "musa",
    "muscolo",
    "musica",
    "mutevole",
    "muto",
    "nababbo",
    "nafta",
    "nanometro",
    "narciso",
    "narice",
    "narrato",
    "nascere",
    "nastrare",
    "naturale",
    "nautica",
    "naviglio",
    "nebulosa",
    "necrosi",
    "negativo",
    "negozio",
    "nemmeno",
    "neofita",
    "neretto",
    "nervo",
    "nessuno",
    "nettuno",
    "neutrale",
    "neve",
    "nevrotico",
    "nicchia",
    "ninfa",
    "nitido",
    "nobile",
    "nocivo",
    "nodo",
    "nome",
    "nomina",
    "nordico",
    "normale",
    "norvegese",
    "nostrano",
    "notare",
    "notizia",
    "notturno",
    "novella",
    "nucleo",
    "nulla",
    "numero",
    "nuovo",
    "nutrire",
    "nuvola",
    "nuziale",
    "oasi",
    "obbedire",
    "obbligo",
    "obelisco",
    "oblio",
    "obolo",
    "obsoleto",
    "occasione",
    "occhio",
    "occidente",
    "occorrere",
    "occultare",
    "ocra",
    "oculato",
    "odierno",
    "odorare",
    "offerta",
    "offrire",
    "offuscato",
    "oggetto",
    "oggi",
    "ognuno",
    "olandese",
    "olfatto",
    "oliato",
    "oliva",
    "ologramma",
    "oltre",
    "omaggio",
    "ombelico",
    "ombra",
    "omega",
    "omissione",
    "ondoso",
    "onere",
    "onice",
    "onnivoro",
    "onorevole",
    "onta",
    "operato",
    "opinione",
    "opposto",
    "oracolo",
    "orafo",
    "ordine",
    "orecchino",
    "orefice",
    "orfano",
    "organico",
    "origine",
    "orizzonte",
    "orma",
    "ormeggio",
    "ornativo",
    "orologio",
    "orrendo",
    "orribile",
    "ortensia",
    "ortica",
    "orzata",
    "orzo",
    "osare",
    "oscurare",
    "osmosi",
    "ospedale",
    "ospite",
    "ossa",
    "ossidare",
    "ostacolo",
    "oste",
    "otite",
    "otre",
    "ottagono",
    "ottimo",
    "ottobre",
    "ovale",
    "ovest",
    "ovino",
    "oviparo",
    "ovocito",
    "ovunque",
    "ovviare",
    "ozio",
    "pacchetto",
    "pace",
    "pacifico",
    "padella",
    "padrone",
    "paese",
    "paga",
    "pagina",
    "palazzina",
    "palesare",
    "pallido",
    "palo",
    "palude",
    "pandoro",
    "pannello",
    "paolo",
    "paonazzo",
    "paprica",
    "parabola",
    "parcella",
    "parere",
    "pargolo",
    "pari",
    "parlato",
    "parola",
    "partire",
    "parvenza",
    "parziale",
    "passivo",
    "pasticca",
    "patacca",
    "patologia",
    "pattume",
    "pavone",
    "peccato",
    "pedalare",
    "pedonale",
    "peggio",
    "peloso",
    "penare",
    "pendice",
    "penisola",
    "pennuto",
    "penombra",
    "pensare",
    "pentola",
    "pepe",
    "pepita",
    "perbene",
    "percorso",
    "perdonato",
    "perforare",
    "pergamena",
    "periodo",
    "permesso",
    "perno",
    "perplesso",
    "persuaso",
    "pertugio",
    "pervaso",
    "pesatore",
    "pesista",
    "peso",
    "pestifero",
    "petalo",
    "pettine",
    "petulante",
    "pezzo",
    "piacere",
    "pianta",
    "piattino",
    "piccino",
    "picozza",
    "piega",
    "pietra",
    "piffero",
    "pigiama",
    "pigolio",
    "pigro",
    "pila",
    "pilifero",
    "pillola",
    "pilota",
    "pimpante",
    "pineta",
    "pinna",
    "pinolo",
    "pioggia",
    "piombo",
    "piramide",
    "piretico",
    "pirite",
    "pirolisi",
    "pitone",
    "pizzico",
    "placebo",
    "planare",
    "plasma",
    "platano",
    "plenario",
    "pochezza",
    "poderoso",
    "podismo",
    "poesia",
    "poggiare",
    "polenta",
    "poligono",
    "pollice",
    "polmonite",
    "polpetta",
    "polso",
    "poltrona",
    "polvere",
    "pomice",
    "pomodoro",
    "ponte",
    "popoloso",
    "porfido",
    "poroso",
    "porpora",
    "porre",
    "portata",
    "posa",
    "positivo",
    "possesso",
    "postulato",
    "potassio",
    "potere",
    "pranzo",
    "prassi",
    "pratica",
    "precluso",
    "predica",
    "prefisso",
    "pregiato",
    "prelievo",
    "premere",
    "prenotare",
    "preparato",
    "presenza",
    "pretesto",
    "prevalso",
    "prima",
    "principe",
    "privato",
    "problema",
    "procura",
    "produrre",
    "profumo",
    "progetto",
    "prolunga",
    "promessa",
    "pronome",
    "proposta",
    "proroga",
    "proteso",
    "prova",
    "prudente",
    "prugna",
    "prurito",
    "psiche",
    "pubblico",
    "pudica",
    "pugilato",
    "pugno",
    "pulce",
    "pulito",
    "pulsante",
    "puntare",
    "pupazzo",
    "pupilla",
    "puro",
    "quadro",
    "qualcosa",
    "quasi",
    "querela",
    "quota",
    "raccolto",
    "raddoppio",
    "radicale",
    "radunato",
    "raffica",
    "ragazzo",
    "ragione",
    "ragno",
    "ramarro",
    "ramingo",
    "ramo",
    "randagio",
    "rantolare",
    "rapato",
    "rapina",
    "rappreso",
    "rasatura",
    "raschiato",
    "rasente",
    "rassegna",
    "rastrello",
    "rata",
    "ravveduto",
    "reale",
    "recepire",
    "recinto",
    "recluta",
    "recondito",
    "recupero",
    "reddito",
    "redimere",
    "regalato",
    "registro",
    "regola",
    "regresso",
    "relazione",
    "remare",
    "remoto",
    "renna",
    "replica",
    "reprimere",
    "reputare",
    "resa",
    "residente",
    "responso",
    "restauro",
    "rete",
    "retina",
    "retorica",
    "rettifica",
    "revocato",
    "riassunto",
    "ribadire",
    "ribelle",
    "ribrezzo",
    "ricarica",
    "ricco",
    "ricevere",
    "riciclato",
    "ricordo",
    "ricreduto",
    "ridicolo",
    "ridurre",
    "rifasare",
    "riflesso",
    "riforma",
    "rifugio",
    "rigare",
    "rigettato",
    "righello",
    "rilassato",
    "rilevato",
    "rimanere",
    "rimbalzo",
    "rimedio",
    "rimorchio",
    "rinascita",
    "rincaro",
    "rinforzo",
    "rinnovo",
    "rinomato",
    "rinsavito",
    "rintocco",
    "rinuncia",
    "rinvenire",
    "riparato",
    "ripetuto",
    "ripieno",
    "riportare",
    "ripresa",
    "ripulire",
    "risata",
    "rischio",
    "riserva",
    "risibile",
    "riso",
    "rispetto",
    "ristoro",
    "risultato",
    "risvolto",
    "ritardo",
    "ritegno",
    "ritmico",
    "ritrovo",
    "riunione",
    "riva",
    "riverso",
    "rivincita",
    "rivolto",
    "rizoma",
    "roba",
    "robotico",
    "robusto",
    "roccia",
    "roco",
    "rodaggio",
    "rodere",
    "roditore",
    "rogito",
    "rollio",
    "romantico",
    "rompere",
    "ronzio",
    "rosolare",
    "rospo",
    "rotante",
    "rotondo",
    "rotula",
    "rovescio",
    "rubizzo",
    "rubrica",
    "ruga",
    "rullino",
    "rumine",
    "rumoroso",
    "ruolo",
    "rupe",
    "russare",
    "rustico",
    "sabato",
    "sabbiare",
    "sabotato",
    "sagoma",
    "salasso",
    "saldatura",
    "salgemma",
    "salivare",
    "salmone",
    "salone",
    "saltare",
    "saluto",
    "salvo",
    "sapere",
    "sapido",
    "saporito",
    "saraceno",
    "sarcasmo",
    "sarto",
    "sassoso",
    "satellite",
    "satira",
    "satollo",
    "saturno",
    "savana",
    "savio",
    "saziato",
    "sbadiglio",
    "sbalzo",
    "sbancato",
    "sbarra",
    "sbattere",
    "sbavare",
    "sbendare",
    "sbirciare",
    "sbloccato",
    "sbocciato",
    "sbrinare",
    "sbruffone",
    "sbuffare",
    "scabroso",
    "scadenza",
    "scala",
    "scambiare",
    "scandalo",
    "scapola",
    "scarso",
    "scatenare",
    "scavato",
    "scelto",
    "scenico",
    "scettro",
    "scheda",
    "schiena",
    "sciarpa",
    "scienza",
    "scindere",
    "scippo",
    "sciroppo",
    "scivolo",
    "sclerare",
    "scodella",
    "scolpito",
    "scomparto",
    "sconforto",
    "scoprire",
    "scorta",
    "scossone",
    "scozzese",
    "scriba",
    "scrollare",
    "scrutinio",
    "scuderia",
    "scultore",
    "scuola",
    "scuro",
    "scusare",
    "sdebitare",
    "sdoganare",
    "seccatura",
    "secondo",
    "sedano",
    "seggiola",
    "segnalato",
    "segregato",
    "seguito",
    "selciato",
    "selettivo",
    "sella",
    "selvaggio",
    "semaforo",
    "sembrare",
    "seme",
    "seminato",
    "sempre",
    "senso",
    "sentire",
    "sepolto",
    "sequenza",
    "serata",
    "serbato",
    "sereno",
    "serio",
    "serpente",
    "serraglio",
    "servire",
    "sestina",
    "setola",
    "settimana",
    "sfacelo",
    "sfaldare",
    "sfamato",
    "sfarzoso",
    "sfaticato",
    "sfera",
    "sfida",
    "sfilato",
    "sfinge",
    "sfocato",
    "sfoderare",
    "sfogo",
    "sfoltire",
    "sforzato",
    "sfratto",
    "sfruttato",
    "sfuggito",
    "sfumare",
    "sfuso",
    "sgabello",
    "sgarbato",
    "sgonfiare",
    "sgorbio",
    "sgrassato",
    "sguardo",
    "sibilo",
    "siccome",
    "sierra",
    "sigla",
    "signore",
    "silenzio",
    "sillaba",
    "simbolo",
    "simpatico",
    "simulato",
    "sinfonia",
    "singolo",
    "sinistro",
    "sino",
    "sintesi",
    "sinusoide",
    "sipario",
    "sisma",
    "sistole",
    "situato",
    "slitta",
    "slogatura",
    "sloveno",
    "smarrito",
    "smemorato",
    "smentito",
    "smeraldo",
    "smilzo",
    "smontare",
    "smottato",
    "smussato",
    "snellire",
    "snervato",
    "snodo",
    "sobbalzo",
    "sobrio",
    "soccorso",
    "sociale",
    "sodale",
    "soffitto",
    "sogno",
    "soldato",
    "solenne",
    "solido",
    "sollazzo",
    "solo",
    "solubile",
    "solvente",
    "somatico",
    "somma",
    "sonda",
    "sonetto",
    "sonnifero",
    "sopire",
    "soppeso",
    "sopra",
    "sorgere",
    "sorpasso",
    "sorriso",
    "sorso",
    "sorteggio",
    "sorvolato",
    "sospiro",
    "sosta",
    "sottile",
    "spada",
    "spalla",
    "spargere",
    "spatola",
    "spavento",
    "spazzola",
    "specie",
    "spedire",
    "spegnere",
    "spelatura",
    "speranza",
    "spessore",
    "spettrale",
    "spezzato",
    "spia",
    "spigoloso",
    "spillato",
    "spinoso",
    "spirale",
    "splendido",
    "sportivo",
    "sposo",
    "spranga",
    "sprecare",
    "spronato",
    "spruzzo",
    "spuntino",
    "squillo",
    "sradicare",
    "srotolato",
    "stabile",
    "stacco",
    "staffa",
    "stagnare",
    "stampato",
    "stantio",
    "starnuto",
    "stasera",
    "statuto",
    "stelo",
    "steppa",
    "sterzo",
    "stiletto",
    "stima",
    "stirpe",
    "stivale",
    "stizzoso",
    "stonato",
    "storico",
    "strappo",
    "stregato",
    "stridulo",
    "strozzare",
    "strutto",
    "stuccare",
    "stufo",
    "stupendo",
    "subentro",
    "succoso",
    "sudore",
    "suggerito",
    "sugo",
    "sultano",
    "suonare",
    "superbo",
    "supporto",
    "surgelato",
    "surrogato",
    "sussurro",
    "sutura",
    "svagare",
    "svedese",
    "sveglio",
    "svelare",
    "svenuto",
    "svezia",
    "sviluppo",
    "svista",
    "svizzera",
    "svolta",
    "svuotare",
    "tabacco",
    "tabulato",
    "tacciare",
    "taciturno",
    "tale",
    "talismano",
    "tampone",
    "tannino",
    "tara",
    "tardivo",
    "targato",
    "tariffa",
    "tarpare",
    "tartaruga",
    "tasto",
    "tattico",
    "taverna",
    "tavolata",
    "tazza",
    "teca",
    "tecnico",
    "telefono",
    "temerario",
    "tempo",
    "temuto",
    "tendone",
    "tenero",
    "tensione",
    "tentacolo",
    "teorema",
    "terme",
    "terrazzo",
    "terzetto",
    "tesi",
    "tesserato",
    "testato",
    "tetro",
    "tettoia",
    "tifare",
    "tigella",
    "timbro",
    "tinto",
    "tipico",
    "tipografo",
    "tiraggio",
    "tiro",
    "titanio",
    "titolo",
    "titubante",
    "tizio",
    "tizzone",
    "toccare",
    "tollerare",
    "tolto",
    "tombola",
    "tomo",
    "tonfo",
    "tonsilla",
    "topazio",
    "topologia",
    "toppa",
    "torba",
    "tornare",
    "torrone",
    "tortora",
    "toscano",
    "tossire",
    "tostatura",
    "totano",
    "trabocco",
    "trachea",
    "trafila",
    "tragedia",
    "tralcio",
    "tramonto",
    "transito",
    "trapano",
    "trarre",
    "trasloco",
    "trattato",
    "trave",
    "treccia",
    "tremolio",
    "trespolo",
    "tributo",
    "tricheco",
    "trifoglio",
    "trillo",
    "trincea",
    "trio",
    "tristezza",
    "triturato",
    "trivella",
    "tromba",
    "trono",
    "troppo",
    "trottola",
    "trovare",
    "truccato",
    "tubatura",
    "tuffato",
    "tulipano",
    "tumulto",
    "tunisia",
    "turbare",
    "turchino",
    "tuta",
    "tutela",
    "ubicato",
    "uccello",
    "uccisore",
    "udire",
    "uditivo",
    "uffa",
    "ufficio",
    "uguale",
    "ulisse",
    "ultimato",
    "umano",
    "umile",
    "umorismo",
    "uncinetto",
    "ungere",
    "ungherese",
    "unicorno",
    "unificato",
    "unisono",
    "unitario",
    "unte",
    "uovo",
    "upupa",
    "uragano",
    "urgenza",
    "urlo",
    "usanza",
    "usato",
    "uscito",
    "usignolo",
    "usuraio",
    "utensile",
    "utilizzo",
    "utopia",
    "vacante",
    "vaccinato",
    "vagabondo",
    "vagliato",
    "valanga",
    "valgo",
    "valico",
    "valletta",
    "valoroso",
    "valutare",
    "valvola",
    "vampata",
    "vangare",
    "vanitoso",
    "vano",
    "vantaggio",
    "vanvera",
    "vapore",
    "varano",
    "varcato",
    "variante",
    "vasca",
    "vedetta",
    "vedova",
    "veduto",
    "vegetale",
    "veicolo",
    "velcro",
    "velina",
    "velluto",
    "veloce",
    "venato",
    "vendemmia",
    "vento",
    "verace",
    "verbale",
    "vergogna",
    "verifica",
    "vero",
    "verruca",
    "verticale",
    "vescica",
    "vessillo",
    "vestale",
    "veterano",
    "vetrina",
    "vetusto",
    "viandante",
    "vibrante",
    "vicenda",
    "vichingo",
    "vicinanza",
    "vidimare",
    "vigilia",
    "vigneto",
    "vigore",
    "vile",
    "villano",
    "vimini",
    "vincitore",
    "viola",
    "vipera",
    "virgola",
    "virologo",
    "virulento",
    "viscoso",
    "visione",
    "vispo",
    "vissuto",
    "visura",
    "vita",
    "vitello",
    "vittima",
    "vivanda",
    "vivido",
    "viziare",
    "voce",
    "voga",
    "volatile",
    "volere",
    "volpe",
    "voragine",
    "vulcano",
    "zampogna",
    "zanna",
    "zappato",
    "zattera",
    "zavorra",
    "zefiro",
    "zelante",
    "zelo",
    "zenzero",
    "zerbino",
    "zibetto",
    "zinco",
    "zircone",
    "zitto",
    "zolla",
    "zotico",
    "zucchero",
    "zufolo",
    "zulu",
    "zuppa"
]
;
},{}],"wordlists/spanish.json":[function(require,module,exports) {
module.exports = [
    "ábaco",
    "abdomen",
    "abeja",
    "abierto",
    "abogado",
    "abono",
    "aborto",
    "abrazo",
    "abrir",
    "abuelo",
    "abuso",
    "acabar",
    "academia",
    "acceso",
    "acción",
    "aceite",
    "acelga",
    "acento",
    "aceptar",
    "ácido",
    "aclarar",
    "acné",
    "acoger",
    "acoso",
    "activo",
    "acto",
    "actriz",
    "actuar",
    "acudir",
    "acuerdo",
    "acusar",
    "adicto",
    "admitir",
    "adoptar",
    "adorno",
    "aduana",
    "adulto",
    "aéreo",
    "afectar",
    "afición",
    "afinar",
    "afirmar",
    "ágil",
    "agitar",
    "agonía",
    "agosto",
    "agotar",
    "agregar",
    "agrio",
    "agua",
    "agudo",
    "águila",
    "aguja",
    "ahogo",
    "ahorro",
    "aire",
    "aislar",
    "ajedrez",
    "ajeno",
    "ajuste",
    "alacrán",
    "alambre",
    "alarma",
    "alba",
    "álbum",
    "alcalde",
    "aldea",
    "alegre",
    "alejar",
    "alerta",
    "aleta",
    "alfiler",
    "alga",
    "algodón",
    "aliado",
    "aliento",
    "alivio",
    "alma",
    "almeja",
    "almíbar",
    "altar",
    "alteza",
    "altivo",
    "alto",
    "altura",
    "alumno",
    "alzar",
    "amable",
    "amante",
    "amapola",
    "amargo",
    "amasar",
    "ámbar",
    "ámbito",
    "ameno",
    "amigo",
    "amistad",
    "amor",
    "amparo",
    "amplio",
    "ancho",
    "anciano",
    "ancla",
    "andar",
    "andén",
    "anemia",
    "ángulo",
    "anillo",
    "ánimo",
    "anís",
    "anotar",
    "antena",
    "antiguo",
    "antojo",
    "anual",
    "anular",
    "anuncio",
    "añadir",
    "añejo",
    "año",
    "apagar",
    "aparato",
    "apetito",
    "apio",
    "aplicar",
    "apodo",
    "aporte",
    "apoyo",
    "aprender",
    "aprobar",
    "apuesta",
    "apuro",
    "arado",
    "araña",
    "arar",
    "árbitro",
    "árbol",
    "arbusto",
    "archivo",
    "arco",
    "arder",
    "ardilla",
    "arduo",
    "área",
    "árido",
    "aries",
    "armonía",
    "arnés",
    "aroma",
    "arpa",
    "arpón",
    "arreglo",
    "arroz",
    "arruga",
    "arte",
    "artista",
    "asa",
    "asado",
    "asalto",
    "ascenso",
    "asegurar",
    "aseo",
    "asesor",
    "asiento",
    "asilo",
    "asistir",
    "asno",
    "asombro",
    "áspero",
    "astilla",
    "astro",
    "astuto",
    "asumir",
    "asunto",
    "atajo",
    "ataque",
    "atar",
    "atento",
    "ateo",
    "ático",
    "atleta",
    "átomo",
    "atraer",
    "atroz",
    "atún",
    "audaz",
    "audio",
    "auge",
    "aula",
    "aumento",
    "ausente",
    "autor",
    "aval",
    "avance",
    "avaro",
    "ave",
    "avellana",
    "avena",
    "avestruz",
    "avión",
    "aviso",
    "ayer",
    "ayuda",
    "ayuno",
    "azafrán",
    "azar",
    "azote",
    "azúcar",
    "azufre",
    "azul",
    "baba",
    "babor",
    "bache",
    "bahía",
    "baile",
    "bajar",
    "balanza",
    "balcón",
    "balde",
    "bambú",
    "banco",
    "banda",
    "baño",
    "barba",
    "barco",
    "barniz",
    "barro",
    "báscula",
    "bastón",
    "basura",
    "batalla",
    "batería",
    "batir",
    "batuta",
    "baúl",
    "bazar",
    "bebé",
    "bebida",
    "bello",
    "besar",
    "beso",
    "bestia",
    "bicho",
    "bien",
    "bingo",
    "blanco",
    "bloque",
    "blusa",
    "boa",
    "bobina",
    "bobo",
    "boca",
    "bocina",
    "boda",
    "bodega",
    "boina",
    "bola",
    "bolero",
    "bolsa",
    "bomba",
    "bondad",
    "bonito",
    "bono",
    "bonsái",
    "borde",
    "borrar",
    "bosque",
    "bote",
    "botín",
    "bóveda",
    "bozal",
    "bravo",
    "brazo",
    "brecha",
    "breve",
    "brillo",
    "brinco",
    "brisa",
    "broca",
    "broma",
    "bronce",
    "brote",
    "bruja",
    "brusco",
    "bruto",
    "buceo",
    "bucle",
    "bueno",
    "buey",
    "bufanda",
    "bufón",
    "búho",
    "buitre",
    "bulto",
    "burbuja",
    "burla",
    "burro",
    "buscar",
    "butaca",
    "buzón",
    "caballo",
    "cabeza",
    "cabina",
    "cabra",
    "cacao",
    "cadáver",
    "cadena",
    "caer",
    "café",
    "caída",
    "caimán",
    "caja",
    "cajón",
    "cal",
    "calamar",
    "calcio",
    "caldo",
    "calidad",
    "calle",
    "calma",
    "calor",
    "calvo",
    "cama",
    "cambio",
    "camello",
    "camino",
    "campo",
    "cáncer",
    "candil",
    "canela",
    "canguro",
    "canica",
    "canto",
    "caña",
    "cañón",
    "caoba",
    "caos",
    "capaz",
    "capitán",
    "capote",
    "captar",
    "capucha",
    "cara",
    "carbón",
    "cárcel",
    "careta",
    "carga",
    "cariño",
    "carne",
    "carpeta",
    "carro",
    "carta",
    "casa",
    "casco",
    "casero",
    "caspa",
    "castor",
    "catorce",
    "catre",
    "caudal",
    "causa",
    "cazo",
    "cebolla",
    "ceder",
    "cedro",
    "celda",
    "célebre",
    "celoso",
    "célula",
    "cemento",
    "ceniza",
    "centro",
    "cerca",
    "cerdo",
    "cereza",
    "cero",
    "cerrar",
    "certeza",
    "césped",
    "cetro",
    "chacal",
    "chaleco",
    "champú",
    "chancla",
    "chapa",
    "charla",
    "chico",
    "chiste",
    "chivo",
    "choque",
    "choza",
    "chuleta",
    "chupar",
    "ciclón",
    "ciego",
    "cielo",
    "cien",
    "cierto",
    "cifra",
    "cigarro",
    "cima",
    "cinco",
    "cine",
    "cinta",
    "ciprés",
    "circo",
    "ciruela",
    "cisne",
    "cita",
    "ciudad",
    "clamor",
    "clan",
    "claro",
    "clase",
    "clave",
    "cliente",
    "clima",
    "clínica",
    "cobre",
    "cocción",
    "cochino",
    "cocina",
    "coco",
    "código",
    "codo",
    "cofre",
    "coger",
    "cohete",
    "cojín",
    "cojo",
    "cola",
    "colcha",
    "colegio",
    "colgar",
    "colina",
    "collar",
    "colmo",
    "columna",
    "combate",
    "comer",
    "comida",
    "cómodo",
    "compra",
    "conde",
    "conejo",
    "conga",
    "conocer",
    "consejo",
    "contar",
    "copa",
    "copia",
    "corazón",
    "corbata",
    "corcho",
    "cordón",
    "corona",
    "correr",
    "coser",
    "cosmos",
    "costa",
    "cráneo",
    "cráter",
    "crear",
    "crecer",
    "creído",
    "crema",
    "cría",
    "crimen",
    "cripta",
    "crisis",
    "cromo",
    "crónica",
    "croqueta",
    "crudo",
    "cruz",
    "cuadro",
    "cuarto",
    "cuatro",
    "cubo",
    "cubrir",
    "cuchara",
    "cuello",
    "cuento",
    "cuerda",
    "cuesta",
    "cueva",
    "cuidar",
    "culebra",
    "culpa",
    "culto",
    "cumbre",
    "cumplir",
    "cuna",
    "cuneta",
    "cuota",
    "cupón",
    "cúpula",
    "curar",
    "curioso",
    "curso",
    "curva",
    "cutis",
    "dama",
    "danza",
    "dar",
    "dardo",
    "dátil",
    "deber",
    "débil",
    "década",
    "decir",
    "dedo",
    "defensa",
    "definir",
    "dejar",
    "delfín",
    "delgado",
    "delito",
    "demora",
    "denso",
    "dental",
    "deporte",
    "derecho",
    "derrota",
    "desayuno",
    "deseo",
    "desfile",
    "desnudo",
    "destino",
    "desvío",
    "detalle",
    "detener",
    "deuda",
    "día",
    "diablo",
    "diadema",
    "diamante",
    "diana",
    "diario",
    "dibujo",
    "dictar",
    "diente",
    "dieta",
    "diez",
    "difícil",
    "digno",
    "dilema",
    "diluir",
    "dinero",
    "directo",
    "dirigir",
    "disco",
    "diseño",
    "disfraz",
    "diva",
    "divino",
    "doble",
    "doce",
    "dolor",
    "domingo",
    "don",
    "donar",
    "dorado",
    "dormir",
    "dorso",
    "dos",
    "dosis",
    "dragón",
    "droga",
    "ducha",
    "duda",
    "duelo",
    "dueño",
    "dulce",
    "dúo",
    "duque",
    "durar",
    "dureza",
    "duro",
    "ébano",
    "ebrio",
    "echar",
    "eco",
    "ecuador",
    "edad",
    "edición",
    "edificio",
    "editor",
    "educar",
    "efecto",
    "eficaz",
    "eje",
    "ejemplo",
    "elefante",
    "elegir",
    "elemento",
    "elevar",
    "elipse",
    "élite",
    "elixir",
    "elogio",
    "eludir",
    "embudo",
    "emitir",
    "emoción",
    "empate",
    "empeño",
    "empleo",
    "empresa",
    "enano",
    "encargo",
    "enchufe",
    "encía",
    "enemigo",
    "enero",
    "enfado",
    "enfermo",
    "engaño",
    "enigma",
    "enlace",
    "enorme",
    "enredo",
    "ensayo",
    "enseñar",
    "entero",
    "entrar",
    "envase",
    "envío",
    "época",
    "equipo",
    "erizo",
    "escala",
    "escena",
    "escolar",
    "escribir",
    "escudo",
    "esencia",
    "esfera",
    "esfuerzo",
    "espada",
    "espejo",
    "espía",
    "esposa",
    "espuma",
    "esquí",
    "estar",
    "este",
    "estilo",
    "estufa",
    "etapa",
    "eterno",
    "ética",
    "etnia",
    "evadir",
    "evaluar",
    "evento",
    "evitar",
    "exacto",
    "examen",
    "exceso",
    "excusa",
    "exento",
    "exigir",
    "exilio",
    "existir",
    "éxito",
    "experto",
    "explicar",
    "exponer",
    "extremo",
    "fábrica",
    "fábula",
    "fachada",
    "fácil",
    "factor",
    "faena",
    "faja",
    "falda",
    "fallo",
    "falso",
    "faltar",
    "fama",
    "familia",
    "famoso",
    "faraón",
    "farmacia",
    "farol",
    "farsa",
    "fase",
    "fatiga",
    "fauna",
    "favor",
    "fax",
    "febrero",
    "fecha",
    "feliz",
    "feo",
    "feria",
    "feroz",
    "fértil",
    "fervor",
    "festín",
    "fiable",
    "fianza",
    "fiar",
    "fibra",
    "ficción",
    "ficha",
    "fideo",
    "fiebre",
    "fiel",
    "fiera",
    "fiesta",
    "figura",
    "fijar",
    "fijo",
    "fila",
    "filete",
    "filial",
    "filtro",
    "fin",
    "finca",
    "fingir",
    "finito",
    "firma",
    "flaco",
    "flauta",
    "flecha",
    "flor",
    "flota",
    "fluir",
    "flujo",
    "flúor",
    "fobia",
    "foca",
    "fogata",
    "fogón",
    "folio",
    "folleto",
    "fondo",
    "forma",
    "forro",
    "fortuna",
    "forzar",
    "fosa",
    "foto",
    "fracaso",
    "frágil",
    "franja",
    "frase",
    "fraude",
    "freír",
    "freno",
    "fresa",
    "frío",
    "frito",
    "fruta",
    "fuego",
    "fuente",
    "fuerza",
    "fuga",
    "fumar",
    "función",
    "funda",
    "furgón",
    "furia",
    "fusil",
    "fútbol",
    "futuro",
    "gacela",
    "gafas",
    "gaita",
    "gajo",
    "gala",
    "galería",
    "gallo",
    "gamba",
    "ganar",
    "gancho",
    "ganga",
    "ganso",
    "garaje",
    "garza",
    "gasolina",
    "gastar",
    "gato",
    "gavilán",
    "gemelo",
    "gemir",
    "gen",
    "género",
    "genio",
    "gente",
    "geranio",
    "gerente",
    "germen",
    "gesto",
    "gigante",
    "gimnasio",
    "girar",
    "giro",
    "glaciar",
    "globo",
    "gloria",
    "gol",
    "golfo",
    "goloso",
    "golpe",
    "goma",
    "gordo",
    "gorila",
    "gorra",
    "gota",
    "goteo",
    "gozar",
    "grada",
    "gráfico",
    "grano",
    "grasa",
    "gratis",
    "grave",
    "grieta",
    "grillo",
    "gripe",
    "gris",
    "grito",
    "grosor",
    "grúa",
    "grueso",
    "grumo",
    "grupo",
    "guante",
    "guapo",
    "guardia",
    "guerra",
    "guía",
    "guiño",
    "guion",
    "guiso",
    "guitarra",
    "gusano",
    "gustar",
    "haber",
    "hábil",
    "hablar",
    "hacer",
    "hacha",
    "hada",
    "hallar",
    "hamaca",
    "harina",
    "haz",
    "hazaña",
    "hebilla",
    "hebra",
    "hecho",
    "helado",
    "helio",
    "hembra",
    "herir",
    "hermano",
    "héroe",
    "hervir",
    "hielo",
    "hierro",
    "hígado",
    "higiene",
    "hijo",
    "himno",
    "historia",
    "hocico",
    "hogar",
    "hoguera",
    "hoja",
    "hombre",
    "hongo",
    "honor",
    "honra",
    "hora",
    "hormiga",
    "horno",
    "hostil",
    "hoyo",
    "hueco",
    "huelga",
    "huerta",
    "hueso",
    "huevo",
    "huida",
    "huir",
    "humano",
    "húmedo",
    "humilde",
    "humo",
    "hundir",
    "huracán",
    "hurto",
    "icono",
    "ideal",
    "idioma",
    "ídolo",
    "iglesia",
    "iglú",
    "igual",
    "ilegal",
    "ilusión",
    "imagen",
    "imán",
    "imitar",
    "impar",
    "imperio",
    "imponer",
    "impulso",
    "incapaz",
    "índice",
    "inerte",
    "infiel",
    "informe",
    "ingenio",
    "inicio",
    "inmenso",
    "inmune",
    "innato",
    "insecto",
    "instante",
    "interés",
    "íntimo",
    "intuir",
    "inútil",
    "invierno",
    "ira",
    "iris",
    "ironía",
    "isla",
    "islote",
    "jabalí",
    "jabón",
    "jamón",
    "jarabe",
    "jardín",
    "jarra",
    "jaula",
    "jazmín",
    "jefe",
    "jeringa",
    "jinete",
    "jornada",
    "joroba",
    "joven",
    "joya",
    "juerga",
    "jueves",
    "juez",
    "jugador",
    "jugo",
    "juguete",
    "juicio",
    "junco",
    "jungla",
    "junio",
    "juntar",
    "júpiter",
    "jurar",
    "justo",
    "juvenil",
    "juzgar",
    "kilo",
    "koala",
    "labio",
    "lacio",
    "lacra",
    "lado",
    "ladrón",
    "lagarto",
    "lágrima",
    "laguna",
    "laico",
    "lamer",
    "lámina",
    "lámpara",
    "lana",
    "lancha",
    "langosta",
    "lanza",
    "lápiz",
    "largo",
    "larva",
    "lástima",
    "lata",
    "látex",
    "latir",
    "laurel",
    "lavar",
    "lazo",
    "leal",
    "lección",
    "leche",
    "lector",
    "leer",
    "legión",
    "legumbre",
    "lejano",
    "lengua",
    "lento",
    "leña",
    "león",
    "leopardo",
    "lesión",
    "letal",
    "letra",
    "leve",
    "leyenda",
    "libertad",
    "libro",
    "licor",
    "líder",
    "lidiar",
    "lienzo",
    "liga",
    "ligero",
    "lima",
    "límite",
    "limón",
    "limpio",
    "lince",
    "lindo",
    "línea",
    "lingote",
    "lino",
    "linterna",
    "líquido",
    "liso",
    "lista",
    "litera",
    "litio",
    "litro",
    "llaga",
    "llama",
    "llanto",
    "llave",
    "llegar",
    "llenar",
    "llevar",
    "llorar",
    "llover",
    "lluvia",
    "lobo",
    "loción",
    "loco",
    "locura",
    "lógica",
    "logro",
    "lombriz",
    "lomo",
    "lonja",
    "lote",
    "lucha",
    "lucir",
    "lugar",
    "lujo",
    "luna",
    "lunes",
    "lupa",
    "lustro",
    "luto",
    "luz",
    "maceta",
    "macho",
    "madera",
    "madre",
    "maduro",
    "maestro",
    "mafia",
    "magia",
    "mago",
    "maíz",
    "maldad",
    "maleta",
    "malla",
    "malo",
    "mamá",
    "mambo",
    "mamut",
    "manco",
    "mando",
    "manejar",
    "manga",
    "maniquí",
    "manjar",
    "mano",
    "manso",
    "manta",
    "mañana",
    "mapa",
    "máquina",
    "mar",
    "marco",
    "marea",
    "marfil",
    "margen",
    "marido",
    "mármol",
    "marrón",
    "martes",
    "marzo",
    "masa",
    "máscara",
    "masivo",
    "matar",
    "materia",
    "matiz",
    "matriz",
    "máximo",
    "mayor",
    "mazorca",
    "mecha",
    "medalla",
    "medio",
    "médula",
    "mejilla",
    "mejor",
    "melena",
    "melón",
    "memoria",
    "menor",
    "mensaje",
    "mente",
    "menú",
    "mercado",
    "merengue",
    "mérito",
    "mes",
    "mesón",
    "meta",
    "meter",
    "método",
    "metro",
    "mezcla",
    "miedo",
    "miel",
    "miembro",
    "miga",
    "mil",
    "milagro",
    "militar",
    "millón",
    "mimo",
    "mina",
    "minero",
    "mínimo",
    "minuto",
    "miope",
    "mirar",
    "misa",
    "miseria",
    "misil",
    "mismo",
    "mitad",
    "mito",
    "mochila",
    "moción",
    "moda",
    "modelo",
    "moho",
    "mojar",
    "molde",
    "moler",
    "molino",
    "momento",
    "momia",
    "monarca",
    "moneda",
    "monja",
    "monto",
    "moño",
    "morada",
    "morder",
    "moreno",
    "morir",
    "morro",
    "morsa",
    "mortal",
    "mosca",
    "mostrar",
    "motivo",
    "mover",
    "móvil",
    "mozo",
    "mucho",
    "mudar",
    "mueble",
    "muela",
    "muerte",
    "muestra",
    "mugre",
    "mujer",
    "mula",
    "muleta",
    "multa",
    "mundo",
    "muñeca",
    "mural",
    "muro",
    "músculo",
    "museo",
    "musgo",
    "música",
    "muslo",
    "nácar",
    "nación",
    "nadar",
    "naipe",
    "naranja",
    "nariz",
    "narrar",
    "nasal",
    "natal",
    "nativo",
    "natural",
    "náusea",
    "naval",
    "nave",
    "navidad",
    "necio",
    "néctar",
    "negar",
    "negocio",
    "negro",
    "neón",
    "nervio",
    "neto",
    "neutro",
    "nevar",
    "nevera",
    "nicho",
    "nido",
    "niebla",
    "nieto",
    "niñez",
    "niño",
    "nítido",
    "nivel",
    "nobleza",
    "noche",
    "nómina",
    "noria",
    "norma",
    "norte",
    "nota",
    "noticia",
    "novato",
    "novela",
    "novio",
    "nube",
    "nuca",
    "núcleo",
    "nudillo",
    "nudo",
    "nuera",
    "nueve",
    "nuez",
    "nulo",
    "número",
    "nutria",
    "oasis",
    "obeso",
    "obispo",
    "objeto",
    "obra",
    "obrero",
    "observar",
    "obtener",
    "obvio",
    "oca",
    "ocaso",
    "océano",
    "ochenta",
    "ocho",
    "ocio",
    "ocre",
    "octavo",
    "octubre",
    "oculto",
    "ocupar",
    "ocurrir",
    "odiar",
    "odio",
    "odisea",
    "oeste",
    "ofensa",
    "oferta",
    "oficio",
    "ofrecer",
    "ogro",
    "oído",
    "oír",
    "ojo",
    "ola",
    "oleada",
    "olfato",
    "olivo",
    "olla",
    "olmo",
    "olor",
    "olvido",
    "ombligo",
    "onda",
    "onza",
    "opaco",
    "opción",
    "ópera",
    "opinar",
    "oponer",
    "optar",
    "óptica",
    "opuesto",
    "oración",
    "orador",
    "oral",
    "órbita",
    "orca",
    "orden",
    "oreja",
    "órgano",
    "orgía",
    "orgullo",
    "oriente",
    "origen",
    "orilla",
    "oro",
    "orquesta",
    "oruga",
    "osadía",
    "oscuro",
    "osezno",
    "oso",
    "ostra",
    "otoño",
    "otro",
    "oveja",
    "óvulo",
    "óxido",
    "oxígeno",
    "oyente",
    "ozono",
    "pacto",
    "padre",
    "paella",
    "página",
    "pago",
    "país",
    "pájaro",
    "palabra",
    "palco",
    "paleta",
    "pálido",
    "palma",
    "paloma",
    "palpar",
    "pan",
    "panal",
    "pánico",
    "pantera",
    "pañuelo",
    "papá",
    "papel",
    "papilla",
    "paquete",
    "parar",
    "parcela",
    "pared",
    "parir",
    "paro",
    "párpado",
    "parque",
    "párrafo",
    "parte",
    "pasar",
    "paseo",
    "pasión",
    "paso",
    "pasta",
    "pata",
    "patio",
    "patria",
    "pausa",
    "pauta",
    "pavo",
    "payaso",
    "peatón",
    "pecado",
    "pecera",
    "pecho",
    "pedal",
    "pedir",
    "pegar",
    "peine",
    "pelar",
    "peldaño",
    "pelea",
    "peligro",
    "pellejo",
    "pelo",
    "peluca",
    "pena",
    "pensar",
    "peñón",
    "peón",
    "peor",
    "pepino",
    "pequeño",
    "pera",
    "percha",
    "perder",
    "pereza",
    "perfil",
    "perico",
    "perla",
    "permiso",
    "perro",
    "persona",
    "pesa",
    "pesca",
    "pésimo",
    "pestaña",
    "pétalo",
    "petróleo",
    "pez",
    "pezuña",
    "picar",
    "pichón",
    "pie",
    "piedra",
    "pierna",
    "pieza",
    "pijama",
    "pilar",
    "piloto",
    "pimienta",
    "pino",
    "pintor",
    "pinza",
    "piña",
    "piojo",
    "pipa",
    "pirata",
    "pisar",
    "piscina",
    "piso",
    "pista",
    "pitón",
    "pizca",
    "placa",
    "plan",
    "plata",
    "playa",
    "plaza",
    "pleito",
    "pleno",
    "plomo",
    "pluma",
    "plural",
    "pobre",
    "poco",
    "poder",
    "podio",
    "poema",
    "poesía",
    "poeta",
    "polen",
    "policía",
    "pollo",
    "polvo",
    "pomada",
    "pomelo",
    "pomo",
    "pompa",
    "poner",
    "porción",
    "portal",
    "posada",
    "poseer",
    "posible",
    "poste",
    "potencia",
    "potro",
    "pozo",
    "prado",
    "precoz",
    "pregunta",
    "premio",
    "prensa",
    "preso",
    "previo",
    "primo",
    "príncipe",
    "prisión",
    "privar",
    "proa",
    "probar",
    "proceso",
    "producto",
    "proeza",
    "profesor",
    "programa",
    "prole",
    "promesa",
    "pronto",
    "propio",
    "próximo",
    "prueba",
    "público",
    "puchero",
    "pudor",
    "pueblo",
    "puerta",
    "puesto",
    "pulga",
    "pulir",
    "pulmón",
    "pulpo",
    "pulso",
    "puma",
    "punto",
    "puñal",
    "puño",
    "pupa",
    "pupila",
    "puré",
    "quedar",
    "queja",
    "quemar",
    "querer",
    "queso",
    "quieto",
    "química",
    "quince",
    "quitar",
    "rábano",
    "rabia",
    "rabo",
    "ración",
    "radical",
    "raíz",
    "rama",
    "rampa",
    "rancho",
    "rango",
    "rapaz",
    "rápido",
    "rapto",
    "rasgo",
    "raspa",
    "rato",
    "rayo",
    "raza",
    "razón",
    "reacción",
    "realidad",
    "rebaño",
    "rebote",
    "recaer",
    "receta",
    "rechazo",
    "recoger",
    "recreo",
    "recto",
    "recurso",
    "red",
    "redondo",
    "reducir",
    "reflejo",
    "reforma",
    "refrán",
    "refugio",
    "regalo",
    "regir",
    "regla",
    "regreso",
    "rehén",
    "reino",
    "reír",
    "reja",
    "relato",
    "relevo",
    "relieve",
    "relleno",
    "reloj",
    "remar",
    "remedio",
    "remo",
    "rencor",
    "rendir",
    "renta",
    "reparto",
    "repetir",
    "reposo",
    "reptil",
    "res",
    "rescate",
    "resina",
    "respeto",
    "resto",
    "resumen",
    "retiro",
    "retorno",
    "retrato",
    "reunir",
    "revés",
    "revista",
    "rey",
    "rezar",
    "rico",
    "riego",
    "rienda",
    "riesgo",
    "rifa",
    "rígido",
    "rigor",
    "rincón",
    "riñón",
    "río",
    "riqueza",
    "risa",
    "ritmo",
    "rito",
    "rizo",
    "roble",
    "roce",
    "rociar",
    "rodar",
    "rodeo",
    "rodilla",
    "roer",
    "rojizo",
    "rojo",
    "romero",
    "romper",
    "ron",
    "ronco",
    "ronda",
    "ropa",
    "ropero",
    "rosa",
    "rosca",
    "rostro",
    "rotar",
    "rubí",
    "rubor",
    "rudo",
    "rueda",
    "rugir",
    "ruido",
    "ruina",
    "ruleta",
    "rulo",
    "rumbo",
    "rumor",
    "ruptura",
    "ruta",
    "rutina",
    "sábado",
    "saber",
    "sabio",
    "sable",
    "sacar",
    "sagaz",
    "sagrado",
    "sala",
    "saldo",
    "salero",
    "salir",
    "salmón",
    "salón",
    "salsa",
    "salto",
    "salud",
    "salvar",
    "samba",
    "sanción",
    "sandía",
    "sanear",
    "sangre",
    "sanidad",
    "sano",
    "santo",
    "sapo",
    "saque",
    "sardina",
    "sartén",
    "sastre",
    "satán",
    "sauna",
    "saxofón",
    "sección",
    "seco",
    "secreto",
    "secta",
    "sed",
    "seguir",
    "seis",
    "sello",
    "selva",
    "semana",
    "semilla",
    "senda",
    "sensor",
    "señal",
    "señor",
    "separar",
    "sepia",
    "sequía",
    "ser",
    "serie",
    "sermón",
    "servir",
    "sesenta",
    "sesión",
    "seta",
    "setenta",
    "severo",
    "sexo",
    "sexto",
    "sidra",
    "siesta",
    "siete",
    "siglo",
    "signo",
    "sílaba",
    "silbar",
    "silencio",
    "silla",
    "símbolo",
    "simio",
    "sirena",
    "sistema",
    "sitio",
    "situar",
    "sobre",
    "socio",
    "sodio",
    "sol",
    "solapa",
    "soldado",
    "soledad",
    "sólido",
    "soltar",
    "solución",
    "sombra",
    "sondeo",
    "sonido",
    "sonoro",
    "sonrisa",
    "sopa",
    "soplar",
    "soporte",
    "sordo",
    "sorpresa",
    "sorteo",
    "sostén",
    "sótano",
    "suave",
    "subir",
    "suceso",
    "sudor",
    "suegra",
    "suelo",
    "sueño",
    "suerte",
    "sufrir",
    "sujeto",
    "sultán",
    "sumar",
    "superar",
    "suplir",
    "suponer",
    "supremo",
    "sur",
    "surco",
    "sureño",
    "surgir",
    "susto",
    "sutil",
    "tabaco",
    "tabique",
    "tabla",
    "tabú",
    "taco",
    "tacto",
    "tajo",
    "talar",
    "talco",
    "talento",
    "talla",
    "talón",
    "tamaño",
    "tambor",
    "tango",
    "tanque",
    "tapa",
    "tapete",
    "tapia",
    "tapón",
    "taquilla",
    "tarde",
    "tarea",
    "tarifa",
    "tarjeta",
    "tarot",
    "tarro",
    "tarta",
    "tatuaje",
    "tauro",
    "taza",
    "tazón",
    "teatro",
    "techo",
    "tecla",
    "técnica",
    "tejado",
    "tejer",
    "tejido",
    "tela",
    "teléfono",
    "tema",
    "temor",
    "templo",
    "tenaz",
    "tender",
    "tener",
    "tenis",
    "tenso",
    "teoría",
    "terapia",
    "terco",
    "término",
    "ternura",
    "terror",
    "tesis",
    "tesoro",
    "testigo",
    "tetera",
    "texto",
    "tez",
    "tibio",
    "tiburón",
    "tiempo",
    "tienda",
    "tierra",
    "tieso",
    "tigre",
    "tijera",
    "tilde",
    "timbre",
    "tímido",
    "timo",
    "tinta",
    "tío",
    "típico",
    "tipo",
    "tira",
    "tirón",
    "titán",
    "títere",
    "título",
    "tiza",
    "toalla",
    "tobillo",
    "tocar",
    "tocino",
    "todo",
    "toga",
    "toldo",
    "tomar",
    "tono",
    "tonto",
    "topar",
    "tope",
    "toque",
    "tórax",
    "torero",
    "tormenta",
    "torneo",
    "toro",
    "torpedo",
    "torre",
    "torso",
    "tortuga",
    "tos",
    "tosco",
    "toser",
    "tóxico",
    "trabajo",
    "tractor",
    "traer",
    "tráfico",
    "trago",
    "traje",
    "tramo",
    "trance",
    "trato",
    "trauma",
    "trazar",
    "trébol",
    "tregua",
    "treinta",
    "tren",
    "trepar",
    "tres",
    "tribu",
    "trigo",
    "tripa",
    "triste",
    "triunfo",
    "trofeo",
    "trompa",
    "tronco",
    "tropa",
    "trote",
    "trozo",
    "truco",
    "trueno",
    "trufa",
    "tubería",
    "tubo",
    "tuerto",
    "tumba",
    "tumor",
    "túnel",
    "túnica",
    "turbina",
    "turismo",
    "turno",
    "tutor",
    "ubicar",
    "úlcera",
    "umbral",
    "unidad",
    "unir",
    "universo",
    "uno",
    "untar",
    "uña",
    "urbano",
    "urbe",
    "urgente",
    "urna",
    "usar",
    "usuario",
    "útil",
    "utopía",
    "uva",
    "vaca",
    "vacío",
    "vacuna",
    "vagar",
    "vago",
    "vaina",
    "vajilla",
    "vale",
    "válido",
    "valle",
    "valor",
    "válvula",
    "vampiro",
    "vara",
    "variar",
    "varón",
    "vaso",
    "vecino",
    "vector",
    "vehículo",
    "veinte",
    "vejez",
    "vela",
    "velero",
    "veloz",
    "vena",
    "vencer",
    "venda",
    "veneno",
    "vengar",
    "venir",
    "venta",
    "venus",
    "ver",
    "verano",
    "verbo",
    "verde",
    "vereda",
    "verja",
    "verso",
    "verter",
    "vía",
    "viaje",
    "vibrar",
    "vicio",
    "víctima",
    "vida",
    "vídeo",
    "vidrio",
    "viejo",
    "viernes",
    "vigor",
    "vil",
    "villa",
    "vinagre",
    "vino",
    "viñedo",
    "violín",
    "viral",
    "virgo",
    "virtud",
    "visor",
    "víspera",
    "vista",
    "vitamina",
    "viudo",
    "vivaz",
    "vivero",
    "vivir",
    "vivo",
    "volcán",
    "volumen",
    "volver",
    "voraz",
    "votar",
    "voto",
    "voz",
    "vuelo",
    "vulgar",
    "yacer",
    "yate",
    "yegua",
    "yema",
    "yerno",
    "yeso",
    "yodo",
    "yoga",
    "yogur",
    "zafiro",
    "zanja",
    "zapato",
    "zarza",
    "zona",
    "zorro",
    "zumo",
    "zurdo"
]
;
},{}],"wordlists/japanese.json":[function(require,module,exports) {
module.exports = [
    "あいこくしん",
    "あいさつ",
    "あいだ",
    "あおぞら",
    "あかちゃん",
    "あきる",
    "あけがた",
    "あける",
    "あこがれる",
    "あさい",
    "あさひ",
    "あしあと",
    "あじわう",
    "あずかる",
    "あずき",
    "あそぶ",
    "あたえる",
    "あたためる",
    "あたりまえ",
    "あたる",
    "あつい",
    "あつかう",
    "あっしゅく",
    "あつまり",
    "あつめる",
    "あてな",
    "あてはまる",
    "あひる",
    "あぶら",
    "あぶる",
    "あふれる",
    "あまい",
    "あまど",
    "あまやかす",
    "あまり",
    "あみもの",
    "あめりか",
    "あやまる",
    "あゆむ",
    "あらいぐま",
    "あらし",
    "あらすじ",
    "あらためる",
    "あらゆる",
    "あらわす",
    "ありがとう",
    "あわせる",
    "あわてる",
    "あんい",
    "あんがい",
    "あんこ",
    "あんぜん",
    "あんてい",
    "あんない",
    "あんまり",
    "いいだす",
    "いおん",
    "いがい",
    "いがく",
    "いきおい",
    "いきなり",
    "いきもの",
    "いきる",
    "いくじ",
    "いくぶん",
    "いけばな",
    "いけん",
    "いこう",
    "いこく",
    "いこつ",
    "いさましい",
    "いさん",
    "いしき",
    "いじゅう",
    "いじょう",
    "いじわる",
    "いずみ",
    "いずれ",
    "いせい",
    "いせえび",
    "いせかい",
    "いせき",
    "いぜん",
    "いそうろう",
    "いそがしい",
    "いだい",
    "いだく",
    "いたずら",
    "いたみ",
    "いたりあ",
    "いちおう",
    "いちじ",
    "いちど",
    "いちば",
    "いちぶ",
    "いちりゅう",
    "いつか",
    "いっしゅん",
    "いっせい",
    "いっそう",
    "いったん",
    "いっち",
    "いってい",
    "いっぽう",
    "いてざ",
    "いてん",
    "いどう",
    "いとこ",
    "いない",
    "いなか",
    "いねむり",
    "いのち",
    "いのる",
    "いはつ",
    "いばる",
    "いはん",
    "いびき",
    "いひん",
    "いふく",
    "いへん",
    "いほう",
    "いみん",
    "いもうと",
    "いもたれ",
    "いもり",
    "いやがる",
    "いやす",
    "いよかん",
    "いよく",
    "いらい",
    "いらすと",
    "いりぐち",
    "いりょう",
    "いれい",
    "いれもの",
    "いれる",
    "いろえんぴつ",
    "いわい",
    "いわう",
    "いわかん",
    "いわば",
    "いわゆる",
    "いんげんまめ",
    "いんさつ",
    "いんしょう",
    "いんよう",
    "うえき",
    "うえる",
    "うおざ",
    "うがい",
    "うかぶ",
    "うかべる",
    "うきわ",
    "うくらいな",
    "うくれれ",
    "うけたまわる",
    "うけつけ",
    "うけとる",
    "うけもつ",
    "うける",
    "うごかす",
    "うごく",
    "うこん",
    "うさぎ",
    "うしなう",
    "うしろがみ",
    "うすい",
    "うすぎ",
    "うすぐらい",
    "うすめる",
    "うせつ",
    "うちあわせ",
    "うちがわ",
    "うちき",
    "うちゅう",
    "うっかり",
    "うつくしい",
    "うったえる",
    "うつる",
    "うどん",
    "うなぎ",
    "うなじ",
    "うなずく",
    "うなる",
    "うねる",
    "うのう",
    "うぶげ",
    "うぶごえ",
    "うまれる",
    "うめる",
    "うもう",
    "うやまう",
    "うよく",
    "うらがえす",
    "うらぐち",
    "うらない",
    "うりあげ",
    "うりきれ",
    "うるさい",
    "うれしい",
    "うれゆき",
    "うれる",
    "うろこ",
    "うわき",
    "うわさ",
    "うんこう",
    "うんちん",
    "うんてん",
    "うんどう",
    "えいえん",
    "えいが",
    "えいきょう",
    "えいご",
    "えいせい",
    "えいぶん",
    "えいよう",
    "えいわ",
    "えおり",
    "えがお",
    "えがく",
    "えきたい",
    "えくせる",
    "えしゃく",
    "えすて",
    "えつらん",
    "えのぐ",
    "えほうまき",
    "えほん",
    "えまき",
    "えもじ",
    "えもの",
    "えらい",
    "えらぶ",
    "えりあ",
    "えんえん",
    "えんかい",
    "えんぎ",
    "えんげき",
    "えんしゅう",
    "えんぜつ",
    "えんそく",
    "えんちょう",
    "えんとつ",
    "おいかける",
    "おいこす",
    "おいしい",
    "おいつく",
    "おうえん",
    "おうさま",
    "おうじ",
    "おうせつ",
    "おうたい",
    "おうふく",
    "おうべい",
    "おうよう",
    "おえる",
    "おおい",
    "おおう",
    "おおどおり",
    "おおや",
    "おおよそ",
    "おかえり",
    "おかず",
    "おがむ",
    "おかわり",
    "おぎなう",
    "おきる",
    "おくさま",
    "おくじょう",
    "おくりがな",
    "おくる",
    "おくれる",
    "おこす",
    "おこなう",
    "おこる",
    "おさえる",
    "おさない",
    "おさめる",
    "おしいれ",
    "おしえる",
    "おじぎ",
    "おじさん",
    "おしゃれ",
    "おそらく",
    "おそわる",
    "おたがい",
    "おたく",
    "おだやか",
    "おちつく",
    "おっと",
    "おつり",
    "おでかけ",
    "おとしもの",
    "おとなしい",
    "おどり",
    "おどろかす",
    "おばさん",
    "おまいり",
    "おめでとう",
    "おもいで",
    "おもう",
    "おもたい",
    "おもちゃ",
    "おやつ",
    "おやゆび",
    "およぼす",
    "おらんだ",
    "おろす",
    "おんがく",
    "おんけい",
    "おんしゃ",
    "おんせん",
    "おんだん",
    "おんちゅう",
    "おんどけい",
    "かあつ",
    "かいが",
    "がいき",
    "がいけん",
    "がいこう",
    "かいさつ",
    "かいしゃ",
    "かいすいよく",
    "かいぜん",
    "かいぞうど",
    "かいつう",
    "かいてん",
    "かいとう",
    "かいふく",
    "がいへき",
    "かいほう",
    "かいよう",
    "がいらい",
    "かいわ",
    "かえる",
    "かおり",
    "かかえる",
    "かがく",
    "かがし",
    "かがみ",
    "かくご",
    "かくとく",
    "かざる",
    "がぞう",
    "かたい",
    "かたち",
    "がちょう",
    "がっきゅう",
    "がっこう",
    "がっさん",
    "がっしょう",
    "かなざわし",
    "かのう",
    "がはく",
    "かぶか",
    "かほう",
    "かほご",
    "かまう",
    "かまぼこ",
    "かめれおん",
    "かゆい",
    "かようび",
    "からい",
    "かるい",
    "かろう",
    "かわく",
    "かわら",
    "がんか",
    "かんけい",
    "かんこう",
    "かんしゃ",
    "かんそう",
    "かんたん",
    "かんち",
    "がんばる",
    "きあい",
    "きあつ",
    "きいろ",
    "ぎいん",
    "きうい",
    "きうん",
    "きえる",
    "きおう",
    "きおく",
    "きおち",
    "きおん",
    "きかい",
    "きかく",
    "きかんしゃ",
    "ききて",
    "きくばり",
    "きくらげ",
    "きけんせい",
    "きこう",
    "きこえる",
    "きこく",
    "きさい",
    "きさく",
    "きさま",
    "きさらぎ",
    "ぎじかがく",
    "ぎしき",
    "ぎじたいけん",
    "ぎじにってい",
    "ぎじゅつしゃ",
    "きすう",
    "きせい",
    "きせき",
    "きせつ",
    "きそう",
    "きぞく",
    "きぞん",
    "きたえる",
    "きちょう",
    "きつえん",
    "ぎっちり",
    "きつつき",
    "きつね",
    "きてい",
    "きどう",
    "きどく",
    "きない",
    "きなが",
    "きなこ",
    "きぬごし",
    "きねん",
    "きのう",
    "きのした",
    "きはく",
    "きびしい",
    "きひん",
    "きふく",
    "きぶん",
    "きぼう",
    "きほん",
    "きまる",
    "きみつ",
    "きむずかしい",
    "きめる",
    "きもだめし",
    "きもち",
    "きもの",
    "きゃく",
    "きやく",
    "ぎゅうにく",
    "きよう",
    "きょうりゅう",
    "きらい",
    "きらく",
    "きりん",
    "きれい",
    "きれつ",
    "きろく",
    "ぎろん",
    "きわめる",
    "ぎんいろ",
    "きんかくじ",
    "きんじょ",
    "きんようび",
    "ぐあい",
    "くいず",
    "くうかん",
    "くうき",
    "くうぐん",
    "くうこう",
    "ぐうせい",
    "くうそう",
    "ぐうたら",
    "くうふく",
    "くうぼ",
    "くかん",
    "くきょう",
    "くげん",
    "ぐこう",
    "くさい",
    "くさき",
    "くさばな",
    "くさる",
    "くしゃみ",
    "くしょう",
    "くすのき",
    "くすりゆび",
    "くせげ",
    "くせん",
    "ぐたいてき",
    "くださる",
    "くたびれる",
    "くちこみ",
    "くちさき",
    "くつした",
    "ぐっすり",
    "くつろぐ",
    "くとうてん",
    "くどく",
    "くなん",
    "くねくね",
    "くのう",
    "くふう",
    "くみあわせ",
    "くみたてる",
    "くめる",
    "くやくしょ",
    "くらす",
    "くらべる",
    "くるま",
    "くれる",
    "くろう",
    "くわしい",
    "ぐんかん",
    "ぐんしょく",
    "ぐんたい",
    "ぐんて",
    "けあな",
    "けいかく",
    "けいけん",
    "けいこ",
    "けいさつ",
    "げいじゅつ",
    "けいたい",
    "げいのうじん",
    "けいれき",
    "けいろ",
    "けおとす",
    "けおりもの",
    "げきか",
    "げきげん",
    "げきだん",
    "げきちん",
    "げきとつ",
    "げきは",
    "げきやく",
    "げこう",
    "げこくじょう",
    "げざい",
    "けさき",
    "げざん",
    "けしき",
    "けしごむ",
    "けしょう",
    "げすと",
    "けたば",
    "けちゃっぷ",
    "けちらす",
    "けつあつ",
    "けつい",
    "けつえき",
    "けっこん",
    "けつじょ",
    "けっせき",
    "けってい",
    "けつまつ",
    "げつようび",
    "げつれい",
    "けつろん",
    "げどく",
    "けとばす",
    "けとる",
    "けなげ",
    "けなす",
    "けなみ",
    "けぬき",
    "げねつ",
    "けねん",
    "けはい",
    "げひん",
    "けぶかい",
    "げぼく",
    "けまり",
    "けみかる",
    "けむし",
    "けむり",
    "けもの",
    "けらい",
    "けろけろ",
    "けわしい",
    "けんい",
    "けんえつ",
    "けんお",
    "けんか",
    "げんき",
    "けんげん",
    "けんこう",
    "けんさく",
    "けんしゅう",
    "けんすう",
    "げんそう",
    "けんちく",
    "けんてい",
    "けんとう",
    "けんない",
    "けんにん",
    "げんぶつ",
    "けんま",
    "けんみん",
    "けんめい",
    "けんらん",
    "けんり",
    "こあくま",
    "こいぬ",
    "こいびと",
    "ごうい",
    "こうえん",
    "こうおん",
    "こうかん",
    "ごうきゅう",
    "ごうけい",
    "こうこう",
    "こうさい",
    "こうじ",
    "こうすい",
    "ごうせい",
    "こうそく",
    "こうたい",
    "こうちゃ",
    "こうつう",
    "こうてい",
    "こうどう",
    "こうない",
    "こうはい",
    "ごうほう",
    "ごうまん",
    "こうもく",
    "こうりつ",
    "こえる",
    "こおり",
    "ごかい",
    "ごがつ",
    "ごかん",
    "こくご",
    "こくさい",
    "こくとう",
    "こくない",
    "こくはく",
    "こぐま",
    "こけい",
    "こける",
    "ここのか",
    "こころ",
    "こさめ",
    "こしつ",
    "こすう",
    "こせい",
    "こせき",
    "こぜん",
    "こそだて",
    "こたい",
    "こたえる",
    "こたつ",
    "こちょう",
    "こっか",
    "こつこつ",
    "こつばん",
    "こつぶ",
    "こてい",
    "こてん",
    "ことがら",
    "ことし",
    "ことば",
    "ことり",
    "こなごな",
    "こねこね",
    "このまま",
    "このみ",
    "このよ",
    "ごはん",
    "こひつじ",
    "こふう",
    "こふん",
    "こぼれる",
    "ごまあぶら",
    "こまかい",
    "ごますり",
    "こまつな",
    "こまる",
    "こむぎこ",
    "こもじ",
    "こもち",
    "こもの",
    "こもん",
    "こやく",
    "こやま",
    "こゆう",
    "こゆび",
    "こよい",
    "こよう",
    "こりる",
    "これくしょん",
    "ころっけ",
    "こわもて",
    "こわれる",
    "こんいん",
    "こんかい",
    "こんき",
    "こんしゅう",
    "こんすい",
    "こんだて",
    "こんとん",
    "こんなん",
    "こんびに",
    "こんぽん",
    "こんまけ",
    "こんや",
    "こんれい",
    "こんわく",
    "ざいえき",
    "さいかい",
    "さいきん",
    "ざいげん",
    "ざいこ",
    "さいしょ",
    "さいせい",
    "ざいたく",
    "ざいちゅう",
    "さいてき",
    "ざいりょう",
    "さうな",
    "さかいし",
    "さがす",
    "さかな",
    "さかみち",
    "さがる",
    "さぎょう",
    "さくし",
    "さくひん",
    "さくら",
    "さこく",
    "さこつ",
    "さずかる",
    "ざせき",
    "さたん",
    "さつえい",
    "ざつおん",
    "ざっか",
    "ざつがく",
    "さっきょく",
    "ざっし",
    "さつじん",
    "ざっそう",
    "さつたば",
    "さつまいも",
    "さてい",
    "さといも",
    "さとう",
    "さとおや",
    "さとし",
    "さとる",
    "さのう",
    "さばく",
    "さびしい",
    "さべつ",
    "さほう",
    "さほど",
    "さます",
    "さみしい",
    "さみだれ",
    "さむけ",
    "さめる",
    "さやえんどう",
    "さゆう",
    "さよう",
    "さよく",
    "さらだ",
    "ざるそば",
    "さわやか",
    "さわる",
    "さんいん",
    "さんか",
    "さんきゃく",
    "さんこう",
    "さんさい",
    "ざんしょ",
    "さんすう",
    "さんせい",
    "さんそ",
    "さんち",
    "さんま",
    "さんみ",
    "さんらん",
    "しあい",
    "しあげ",
    "しあさって",
    "しあわせ",
    "しいく",
    "しいん",
    "しうち",
    "しえい",
    "しおけ",
    "しかい",
    "しかく",
    "じかん",
    "しごと",
    "しすう",
    "じだい",
    "したうけ",
    "したぎ",
    "したて",
    "したみ",
    "しちょう",
    "しちりん",
    "しっかり",
    "しつじ",
    "しつもん",
    "してい",
    "してき",
    "してつ",
    "じてん",
    "じどう",
    "しなぎれ",
    "しなもの",
    "しなん",
    "しねま",
    "しねん",
    "しのぐ",
    "しのぶ",
    "しはい",
    "しばかり",
    "しはつ",
    "しはらい",
    "しはん",
    "しひょう",
    "しふく",
    "じぶん",
    "しへい",
    "しほう",
    "しほん",
    "しまう",
    "しまる",
    "しみん",
    "しむける",
    "じむしょ",
    "しめい",
    "しめる",
    "しもん",
    "しゃいん",
    "しゃうん",
    "しゃおん",
    "じゃがいも",
    "しやくしょ",
    "しゃくほう",
    "しゃけん",
    "しゃこ",
    "しゃざい",
    "しゃしん",
    "しゃせん",
    "しゃそう",
    "しゃたい",
    "しゃちょう",
    "しゃっきん",
    "じゃま",
    "しゃりん",
    "しゃれい",
    "じゆう",
    "じゅうしょ",
    "しゅくはく",
    "じゅしん",
    "しゅっせき",
    "しゅみ",
    "しゅらば",
    "じゅんばん",
    "しょうかい",
    "しょくたく",
    "しょっけん",
    "しょどう",
    "しょもつ",
    "しらせる",
    "しらべる",
    "しんか",
    "しんこう",
    "じんじゃ",
    "しんせいじ",
    "しんちく",
    "しんりん",
    "すあげ",
    "すあし",
    "すあな",
    "ずあん",
    "すいえい",
    "すいか",
    "すいとう",
    "ずいぶん",
    "すいようび",
    "すうがく",
    "すうじつ",
    "すうせん",
    "すおどり",
    "すきま",
    "すくう",
    "すくない",
    "すける",
    "すごい",
    "すこし",
    "ずさん",
    "すずしい",
    "すすむ",
    "すすめる",
    "すっかり",
    "ずっしり",
    "ずっと",
    "すてき",
    "すてる",
    "すねる",
    "すのこ",
    "すはだ",
    "すばらしい",
    "ずひょう",
    "ずぶぬれ",
    "すぶり",
    "すふれ",
    "すべて",
    "すべる",
    "ずほう",
    "すぼん",
    "すまい",
    "すめし",
    "すもう",
    "すやき",
    "すらすら",
    "するめ",
    "すれちがう",
    "すろっと",
    "すわる",
    "すんぜん",
    "すんぽう",
    "せあぶら",
    "せいかつ",
    "せいげん",
    "せいじ",
    "せいよう",
    "せおう",
    "せかいかん",
    "せきにん",
    "せきむ",
    "せきゆ",
    "せきらんうん",
    "せけん",
    "せこう",
    "せすじ",
    "せたい",
    "せたけ",
    "せっかく",
    "せっきゃく",
    "ぜっく",
    "せっけん",
    "せっこつ",
    "せっさたくま",
    "せつぞく",
    "せつだん",
    "せつでん",
    "せっぱん",
    "せつび",
    "せつぶん",
    "せつめい",
    "せつりつ",
    "せなか",
    "せのび",
    "せはば",
    "せびろ",
    "せぼね",
    "せまい",
    "せまる",
    "せめる",
    "せもたれ",
    "せりふ",
    "ぜんあく",
    "せんい",
    "せんえい",
    "せんか",
    "せんきょ",
    "せんく",
    "せんげん",
    "ぜんご",
    "せんさい",
    "せんしゅ",
    "せんすい",
    "せんせい",
    "せんぞ",
    "せんたく",
    "せんちょう",
    "せんてい",
    "せんとう",
    "せんぬき",
    "せんねん",
    "せんぱい",
    "ぜんぶ",
    "ぜんぽう",
    "せんむ",
    "せんめんじょ",
    "せんもん",
    "せんやく",
    "せんゆう",
    "せんよう",
    "ぜんら",
    "ぜんりゃく",
    "せんれい",
    "せんろ",
    "そあく",
    "そいとげる",
    "そいね",
    "そうがんきょう",
    "そうき",
    "そうご",
    "そうしん",
    "そうだん",
    "そうなん",
    "そうび",
    "そうめん",
    "そうり",
    "そえもの",
    "そえん",
    "そがい",
    "そげき",
    "そこう",
    "そこそこ",
    "そざい",
    "そしな",
    "そせい",
    "そせん",
    "そそぐ",
    "そだてる",
    "そつう",
    "そつえん",
    "そっかん",
    "そつぎょう",
    "そっけつ",
    "そっこう",
    "そっせん",
    "そっと",
    "そとがわ",
    "そとづら",
    "そなえる",
    "そなた",
    "そふぼ",
    "そぼく",
    "そぼろ",
    "そまつ",
    "そまる",
    "そむく",
    "そむりえ",
    "そめる",
    "そもそも",
    "そよかぜ",
    "そらまめ",
    "そろう",
    "そんかい",
    "そんけい",
    "そんざい",
    "そんしつ",
    "そんぞく",
    "そんちょう",
    "ぞんび",
    "ぞんぶん",
    "そんみん",
    "たあい",
    "たいいん",
    "たいうん",
    "たいえき",
    "たいおう",
    "だいがく",
    "たいき",
    "たいぐう",
    "たいけん",
    "たいこ",
    "たいざい",
    "だいじょうぶ",
    "だいすき",
    "たいせつ",
    "たいそう",
    "だいたい",
    "たいちょう",
    "たいてい",
    "だいどころ",
    "たいない",
    "たいねつ",
    "たいのう",
    "たいはん",
    "だいひょう",
    "たいふう",
    "たいへん",
    "たいほ",
    "たいまつばな",
    "たいみんぐ",
    "たいむ",
    "たいめん",
    "たいやき",
    "たいよう",
    "たいら",
    "たいりょく",
    "たいる",
    "たいわん",
    "たうえ",
    "たえる",
    "たおす",
    "たおる",
    "たおれる",
    "たかい",
    "たかね",
    "たきび",
    "たくさん",
    "たこく",
    "たこやき",
    "たさい",
    "たしざん",
    "だじゃれ",
    "たすける",
    "たずさわる",
    "たそがれ",
    "たたかう",
    "たたく",
    "ただしい",
    "たたみ",
    "たちばな",
    "だっかい",
    "だっきゃく",
    "だっこ",
    "だっしゅつ",
    "だったい",
    "たてる",
    "たとえる",
    "たなばた",
    "たにん",
    "たぬき",
    "たのしみ",
    "たはつ",
    "たぶん",
    "たべる",
    "たぼう",
    "たまご",
    "たまる",
    "だむる",
    "ためいき",
    "ためす",
    "ためる",
    "たもつ",
    "たやすい",
    "たよる",
    "たらす",
    "たりきほんがん",
    "たりょう",
    "たりる",
    "たると",
    "たれる",
    "たれんと",
    "たろっと",
    "たわむれる",
    "だんあつ",
    "たんい",
    "たんおん",
    "たんか",
    "たんき",
    "たんけん",
    "たんご",
    "たんさん",
    "たんじょうび",
    "だんせい",
    "たんそく",
    "たんたい",
    "だんち",
    "たんてい",
    "たんとう",
    "だんな",
    "たんにん",
    "だんねつ",
    "たんのう",
    "たんぴん",
    "だんぼう",
    "たんまつ",
    "たんめい",
    "だんれつ",
    "だんろ",
    "だんわ",
    "ちあい",
    "ちあん",
    "ちいき",
    "ちいさい",
    "ちえん",
    "ちかい",
    "ちから",
    "ちきゅう",
    "ちきん",
    "ちけいず",
    "ちけん",
    "ちこく",
    "ちさい",
    "ちしき",
    "ちしりょう",
    "ちせい",
    "ちそう",
    "ちたい",
    "ちたん",
    "ちちおや",
    "ちつじょ",
    "ちてき",
    "ちてん",
    "ちぬき",
    "ちぬり",
    "ちのう",
    "ちひょう",
    "ちへいせん",
    "ちほう",
    "ちまた",
    "ちみつ",
    "ちみどろ",
    "ちめいど",
    "ちゃんこなべ",
    "ちゅうい",
    "ちゆりょく",
    "ちょうし",
    "ちょさくけん",
    "ちらし",
    "ちらみ",
    "ちりがみ",
    "ちりょう",
    "ちるど",
    "ちわわ",
    "ちんたい",
    "ちんもく",
    "ついか",
    "ついたち",
    "つうか",
    "つうじょう",
    "つうはん",
    "つうわ",
    "つかう",
    "つかれる",
    "つくね",
    "つくる",
    "つけね",
    "つける",
    "つごう",
    "つたえる",
    "つづく",
    "つつじ",
    "つつむ",
    "つとめる",
    "つながる",
    "つなみ",
    "つねづね",
    "つのる",
    "つぶす",
    "つまらない",
    "つまる",
    "つみき",
    "つめたい",
    "つもり",
    "つもる",
    "つよい",
    "つるぼ",
    "つるみく",
    "つわもの",
    "つわり",
    "てあし",
    "てあて",
    "てあみ",
    "ていおん",
    "ていか",
    "ていき",
    "ていけい",
    "ていこく",
    "ていさつ",
    "ていし",
    "ていせい",
    "ていたい",
    "ていど",
    "ていねい",
    "ていひょう",
    "ていへん",
    "ていぼう",
    "てうち",
    "ておくれ",
    "てきとう",
    "てくび",
    "でこぼこ",
    "てさぎょう",
    "てさげ",
    "てすり",
    "てそう",
    "てちがい",
    "てちょう",
    "てつがく",
    "てつづき",
    "でっぱ",
    "てつぼう",
    "てつや",
    "でぬかえ",
    "てぬき",
    "てぬぐい",
    "てのひら",
    "てはい",
    "てぶくろ",
    "てふだ",
    "てほどき",
    "てほん",
    "てまえ",
    "てまきずし",
    "てみじか",
    "てみやげ",
    "てらす",
    "てれび",
    "てわけ",
    "てわたし",
    "でんあつ",
    "てんいん",
    "てんかい",
    "てんき",
    "てんぐ",
    "てんけん",
    "てんごく",
    "てんさい",
    "てんし",
    "てんすう",
    "でんち",
    "てんてき",
    "てんとう",
    "てんない",
    "てんぷら",
    "てんぼうだい",
    "てんめつ",
    "てんらんかい",
    "でんりょく",
    "でんわ",
    "どあい",
    "といれ",
    "どうかん",
    "とうきゅう",
    "どうぐ",
    "とうし",
    "とうむぎ",
    "とおい",
    "とおか",
    "とおく",
    "とおす",
    "とおる",
    "とかい",
    "とかす",
    "ときおり",
    "ときどき",
    "とくい",
    "とくしゅう",
    "とくてん",
    "とくに",
    "とくべつ",
    "とけい",
    "とける",
    "とこや",
    "とさか",
    "としょかん",
    "とそう",
    "とたん",
    "とちゅう",
    "とっきゅう",
    "とっくん",
    "とつぜん",
    "とつにゅう",
    "とどける",
    "ととのえる",
    "とない",
    "となえる",
    "となり",
    "とのさま",
    "とばす",
    "どぶがわ",
    "とほう",
    "とまる",
    "とめる",
    "ともだち",
    "ともる",
    "どようび",
    "とらえる",
    "とんかつ",
    "どんぶり",
    "ないかく",
    "ないこう",
    "ないしょ",
    "ないす",
    "ないせん",
    "ないそう",
    "なおす",
    "ながい",
    "なくす",
    "なげる",
    "なこうど",
    "なさけ",
    "なたでここ",
    "なっとう",
    "なつやすみ",
    "ななおし",
    "なにごと",
    "なにもの",
    "なにわ",
    "なのか",
    "なふだ",
    "なまいき",
    "なまえ",
    "なまみ",
    "なみだ",
    "なめらか",
    "なめる",
    "なやむ",
    "ならう",
    "ならび",
    "ならぶ",
    "なれる",
    "なわとび",
    "なわばり",
    "にあう",
    "にいがた",
    "にうけ",
    "におい",
    "にかい",
    "にがて",
    "にきび",
    "にくしみ",
    "にくまん",
    "にげる",
    "にさんかたんそ",
    "にしき",
    "にせもの",
    "にちじょう",
    "にちようび",
    "にっか",
    "にっき",
    "にっけい",
    "にっこう",
    "にっさん",
    "にっしょく",
    "にっすう",
    "にっせき",
    "にってい",
    "になう",
    "にほん",
    "にまめ",
    "にもつ",
    "にやり",
    "にゅういん",
    "にりんしゃ",
    "にわとり",
    "にんい",
    "にんか",
    "にんき",
    "にんげん",
    "にんしき",
    "にんずう",
    "にんそう",
    "にんたい",
    "にんち",
    "にんてい",
    "にんにく",
    "にんぷ",
    "にんまり",
    "にんむ",
    "にんめい",
    "にんよう",
    "ぬいくぎ",
    "ぬかす",
    "ぬぐいとる",
    "ぬぐう",
    "ぬくもり",
    "ぬすむ",
    "ぬまえび",
    "ぬめり",
    "ぬらす",
    "ぬんちゃく",
    "ねあげ",
    "ねいき",
    "ねいる",
    "ねいろ",
    "ねぐせ",
    "ねくたい",
    "ねくら",
    "ねこぜ",
    "ねこむ",
    "ねさげ",
    "ねすごす",
    "ねそべる",
    "ねだん",
    "ねつい",
    "ねっしん",
    "ねつぞう",
    "ねったいぎょ",
    "ねぶそく",
    "ねふだ",
    "ねぼう",
    "ねほりはほり",
    "ねまき",
    "ねまわし",
    "ねみみ",
    "ねむい",
    "ねむたい",
    "ねもと",
    "ねらう",
    "ねわざ",
    "ねんいり",
    "ねんおし",
    "ねんかん",
    "ねんきん",
    "ねんぐ",
    "ねんざ",
    "ねんし",
    "ねんちゃく",
    "ねんど",
    "ねんぴ",
    "ねんぶつ",
    "ねんまつ",
    "ねんりょう",
    "ねんれい",
    "のいず",
    "のおづま",
    "のがす",
    "のきなみ",
    "のこぎり",
    "のこす",
    "のこる",
    "のせる",
    "のぞく",
    "のぞむ",
    "のたまう",
    "のちほど",
    "のっく",
    "のばす",
    "のはら",
    "のべる",
    "のぼる",
    "のみもの",
    "のやま",
    "のらいぬ",
    "のらねこ",
    "のりもの",
    "のりゆき",
    "のれん",
    "のんき",
    "ばあい",
    "はあく",
    "ばあさん",
    "ばいか",
    "ばいく",
    "はいけん",
    "はいご",
    "はいしん",
    "はいすい",
    "はいせん",
    "はいそう",
    "はいち",
    "ばいばい",
    "はいれつ",
    "はえる",
    "はおる",
    "はかい",
    "ばかり",
    "はかる",
    "はくしゅ",
    "はけん",
    "はこぶ",
    "はさみ",
    "はさん",
    "はしご",
    "ばしょ",
    "はしる",
    "はせる",
    "ぱそこん",
    "はそん",
    "はたん",
    "はちみつ",
    "はつおん",
    "はっかく",
    "はづき",
    "はっきり",
    "はっくつ",
    "はっけん",
    "はっこう",
    "はっさん",
    "はっしん",
    "はったつ",
    "はっちゅう",
    "はってん",
    "はっぴょう",
    "はっぽう",
    "はなす",
    "はなび",
    "はにかむ",
    "はぶらし",
    "はみがき",
    "はむかう",
    "はめつ",
    "はやい",
    "はやし",
    "はらう",
    "はろうぃん",
    "はわい",
    "はんい",
    "はんえい",
    "はんおん",
    "はんかく",
    "はんきょう",
    "ばんぐみ",
    "はんこ",
    "はんしゃ",
    "はんすう",
    "はんだん",
    "ぱんち",
    "ぱんつ",
    "はんてい",
    "はんとし",
    "はんのう",
    "はんぱ",
    "はんぶん",
    "はんぺん",
    "はんぼうき",
    "はんめい",
    "はんらん",
    "はんろん",
    "ひいき",
    "ひうん",
    "ひえる",
    "ひかく",
    "ひかり",
    "ひかる",
    "ひかん",
    "ひくい",
    "ひけつ",
    "ひこうき",
    "ひこく",
    "ひさい",
    "ひさしぶり",
    "ひさん",
    "びじゅつかん",
    "ひしょ",
    "ひそか",
    "ひそむ",
    "ひたむき",
    "ひだり",
    "ひたる",
    "ひつぎ",
    "ひっこし",
    "ひっし",
    "ひつじゅひん",
    "ひっす",
    "ひつぜん",
    "ぴったり",
    "ぴっちり",
    "ひつよう",
    "ひてい",
    "ひとごみ",
    "ひなまつり",
    "ひなん",
    "ひねる",
    "ひはん",
    "ひびく",
    "ひひょう",
    "ひほう",
    "ひまわり",
    "ひまん",
    "ひみつ",
    "ひめい",
    "ひめじし",
    "ひやけ",
    "ひやす",
    "ひよう",
    "びょうき",
    "ひらがな",
    "ひらく",
    "ひりつ",
    "ひりょう",
    "ひるま",
    "ひるやすみ",
    "ひれい",
    "ひろい",
    "ひろう",
    "ひろき",
    "ひろゆき",
    "ひんかく",
    "ひんけつ",
    "ひんこん",
    "ひんしゅ",
    "ひんそう",
    "ぴんち",
    "ひんぱん",
    "びんぼう",
    "ふあん",
    "ふいうち",
    "ふうけい",
    "ふうせん",
    "ぷうたろう",
    "ふうとう",
    "ふうふ",
    "ふえる",
    "ふおん",
    "ふかい",
    "ふきん",
    "ふくざつ",
    "ふくぶくろ",
    "ふこう",
    "ふさい",
    "ふしぎ",
    "ふじみ",
    "ふすま",
    "ふせい",
    "ふせぐ",
    "ふそく",
    "ぶたにく",
    "ふたん",
    "ふちょう",
    "ふつう",
    "ふつか",
    "ふっかつ",
    "ふっき",
    "ふっこく",
    "ぶどう",
    "ふとる",
    "ふとん",
    "ふのう",
    "ふはい",
    "ふひょう",
    "ふへん",
    "ふまん",
    "ふみん",
    "ふめつ",
    "ふめん",
    "ふよう",
    "ふりこ",
    "ふりる",
    "ふるい",
    "ふんいき",
    "ぶんがく",
    "ぶんぐ",
    "ふんしつ",
    "ぶんせき",
    "ふんそう",
    "ぶんぽう",
    "へいあん",
    "へいおん",
    "へいがい",
    "へいき",
    "へいげん",
    "へいこう",
    "へいさ",
    "へいしゃ",
    "へいせつ",
    "へいそ",
    "へいたく",
    "へいてん",
    "へいねつ",
    "へいわ",
    "へきが",
    "へこむ",
    "べにいろ",
    "べにしょうが",
    "へらす",
    "へんかん",
    "べんきょう",
    "べんごし",
    "へんさい",
    "へんたい",
    "べんり",
    "ほあん",
    "ほいく",
    "ぼうぎょ",
    "ほうこく",
    "ほうそう",
    "ほうほう",
    "ほうもん",
    "ほうりつ",
    "ほえる",
    "ほおん",
    "ほかん",
    "ほきょう",
    "ぼきん",
    "ほくろ",
    "ほけつ",
    "ほけん",
    "ほこう",
    "ほこる",
    "ほしい",
    "ほしつ",
    "ほしゅ",
    "ほしょう",
    "ほせい",
    "ほそい",
    "ほそく",
    "ほたて",
    "ほたる",
    "ぽちぶくろ",
    "ほっきょく",
    "ほっさ",
    "ほったん",
    "ほとんど",
    "ほめる",
    "ほんい",
    "ほんき",
    "ほんけ",
    "ほんしつ",
    "ほんやく",
    "まいにち",
    "まかい",
    "まかせる",
    "まがる",
    "まける",
    "まこと",
    "まさつ",
    "まじめ",
    "ますく",
    "まぜる",
    "まつり",
    "まとめ",
    "まなぶ",
    "まぬけ",
    "まねく",
    "まほう",
    "まもる",
    "まゆげ",
    "まよう",
    "まろやか",
    "まわす",
    "まわり",
    "まわる",
    "まんが",
    "まんきつ",
    "まんぞく",
    "まんなか",
    "みいら",
    "みうち",
    "みえる",
    "みがく",
    "みかた",
    "みかん",
    "みけん",
    "みこん",
    "みじかい",
    "みすい",
    "みすえる",
    "みせる",
    "みっか",
    "みつかる",
    "みつける",
    "みてい",
    "みとめる",
    "みなと",
    "みなみかさい",
    "みねらる",
    "みのう",
    "みのがす",
    "みほん",
    "みもと",
    "みやげ",
    "みらい",
    "みりょく",
    "みわく",
    "みんか",
    "みんぞく",
    "むいか",
    "むえき",
    "むえん",
    "むかい",
    "むかう",
    "むかえ",
    "むかし",
    "むぎちゃ",
    "むける",
    "むげん",
    "むさぼる",
    "むしあつい",
    "むしば",
    "むじゅん",
    "むしろ",
    "むすう",
    "むすこ",
    "むすぶ",
    "むすめ",
    "むせる",
    "むせん",
    "むちゅう",
    "むなしい",
    "むのう",
    "むやみ",
    "むよう",
    "むらさき",
    "むりょう",
    "むろん",
    "めいあん",
    "めいうん",
    "めいえん",
    "めいかく",
    "めいきょく",
    "めいさい",
    "めいし",
    "めいそう",
    "めいぶつ",
    "めいれい",
    "めいわく",
    "めぐまれる",
    "めざす",
    "めした",
    "めずらしい",
    "めだつ",
    "めまい",
    "めやす",
    "めんきょ",
    "めんせき",
    "めんどう",
    "もうしあげる",
    "もうどうけん",
    "もえる",
    "もくし",
    "もくてき",
    "もくようび",
    "もちろん",
    "もどる",
    "もらう",
    "もんく",
    "もんだい",
    "やおや",
    "やける",
    "やさい",
    "やさしい",
    "やすい",
    "やすたろう",
    "やすみ",
    "やせる",
    "やそう",
    "やたい",
    "やちん",
    "やっと",
    "やっぱり",
    "やぶる",
    "やめる",
    "ややこしい",
    "やよい",
    "やわらかい",
    "ゆうき",
    "ゆうびんきょく",
    "ゆうべ",
    "ゆうめい",
    "ゆけつ",
    "ゆしゅつ",
    "ゆせん",
    "ゆそう",
    "ゆたか",
    "ゆちゃく",
    "ゆでる",
    "ゆにゅう",
    "ゆびわ",
    "ゆらい",
    "ゆれる",
    "ようい",
    "ようか",
    "ようきゅう",
    "ようじ",
    "ようす",
    "ようちえん",
    "よかぜ",
    "よかん",
    "よきん",
    "よくせい",
    "よくぼう",
    "よけい",
    "よごれる",
    "よさん",
    "よしゅう",
    "よそう",
    "よそく",
    "よっか",
    "よてい",
    "よどがわく",
    "よねつ",
    "よやく",
    "よゆう",
    "よろこぶ",
    "よろしい",
    "らいう",
    "らくがき",
    "らくご",
    "らくさつ",
    "らくだ",
    "らしんばん",
    "らせん",
    "らぞく",
    "らたい",
    "らっか",
    "られつ",
    "りえき",
    "りかい",
    "りきさく",
    "りきせつ",
    "りくぐん",
    "りくつ",
    "りけん",
    "りこう",
    "りせい",
    "りそう",
    "りそく",
    "りてん",
    "りねん",
    "りゆう",
    "りゅうがく",
    "りよう",
    "りょうり",
    "りょかん",
    "りょくちゃ",
    "りょこう",
    "りりく",
    "りれき",
    "りろん",
    "りんご",
    "るいけい",
    "るいさい",
    "るいじ",
    "るいせき",
    "るすばん",
    "るりがわら",
    "れいかん",
    "れいぎ",
    "れいせい",
    "れいぞうこ",
    "れいとう",
    "れいぼう",
    "れきし",
    "れきだい",
    "れんあい",
    "れんけい",
    "れんこん",
    "れんさい",
    "れんしゅう",
    "れんぞく",
    "れんらく",
    "ろうか",
    "ろうご",
    "ろうじん",
    "ろうそく",
    "ろくが",
    "ろこつ",
    "ろじうら",
    "ろしゅつ",
    "ろせん",
    "ろてん",
    "ろめん",
    "ろれつ",
    "ろんぎ",
    "ろんぱ",
    "ろんぶん",
    "ろんり",
    "わかす",
    "わかめ",
    "わかやま",
    "わかれる",
    "わしつ",
    "わじまし",
    "わすれもの",
    "わらう",
    "われる"
]
;
},{}],"wordlists/english.json":[function(require,module,exports) {
module.exports = [
    "abandon",
    "ability",
    "able",
    "about",
    "above",
    "absent",
    "absorb",
    "abstract",
    "absurd",
    "abuse",
    "access",
    "accident",
    "account",
    "accuse",
    "achieve",
    "acid",
    "acoustic",
    "acquire",
    "across",
    "act",
    "action",
    "actor",
    "actress",
    "actual",
    "adapt",
    "add",
    "addict",
    "address",
    "adjust",
    "admit",
    "adult",
    "advance",
    "advice",
    "aerobic",
    "affair",
    "afford",
    "afraid",
    "again",
    "age",
    "agent",
    "agree",
    "ahead",
    "aim",
    "air",
    "airport",
    "aisle",
    "alarm",
    "album",
    "alcohol",
    "alert",
    "alien",
    "all",
    "alley",
    "allow",
    "almost",
    "alone",
    "alpha",
    "already",
    "also",
    "alter",
    "always",
    "amateur",
    "amazing",
    "among",
    "amount",
    "amused",
    "analyst",
    "anchor",
    "ancient",
    "anger",
    "angle",
    "angry",
    "animal",
    "ankle",
    "announce",
    "annual",
    "another",
    "answer",
    "antenna",
    "antique",
    "anxiety",
    "any",
    "apart",
    "apology",
    "appear",
    "apple",
    "approve",
    "april",
    "arch",
    "arctic",
    "area",
    "arena",
    "argue",
    "arm",
    "armed",
    "armor",
    "army",
    "around",
    "arrange",
    "arrest",
    "arrive",
    "arrow",
    "art",
    "artefact",
    "artist",
    "artwork",
    "ask",
    "aspect",
    "assault",
    "asset",
    "assist",
    "assume",
    "asthma",
    "athlete",
    "atom",
    "attack",
    "attend",
    "attitude",
    "attract",
    "auction",
    "audit",
    "august",
    "aunt",
    "author",
    "auto",
    "autumn",
    "average",
    "avocado",
    "avoid",
    "awake",
    "aware",
    "away",
    "awesome",
    "awful",
    "awkward",
    "axis",
    "baby",
    "bachelor",
    "bacon",
    "badge",
    "bag",
    "balance",
    "balcony",
    "ball",
    "bamboo",
    "banana",
    "banner",
    "bar",
    "barely",
    "bargain",
    "barrel",
    "base",
    "basic",
    "basket",
    "battle",
    "beach",
    "bean",
    "beauty",
    "because",
    "become",
    "beef",
    "before",
    "begin",
    "behave",
    "behind",
    "believe",
    "below",
    "belt",
    "bench",
    "benefit",
    "best",
    "betray",
    "better",
    "between",
    "beyond",
    "bicycle",
    "bid",
    "bike",
    "bind",
    "biology",
    "bird",
    "birth",
    "bitter",
    "black",
    "blade",
    "blame",
    "blanket",
    "blast",
    "bleak",
    "bless",
    "blind",
    "blood",
    "blossom",
    "blouse",
    "blue",
    "blur",
    "blush",
    "board",
    "boat",
    "body",
    "boil",
    "bomb",
    "bone",
    "bonus",
    "book",
    "boost",
    "border",
    "boring",
    "borrow",
    "boss",
    "bottom",
    "bounce",
    "box",
    "boy",
    "bracket",
    "brain",
    "brand",
    "brass",
    "brave",
    "bread",
    "breeze",
    "brick",
    "bridge",
    "brief",
    "bright",
    "bring",
    "brisk",
    "broccoli",
    "broken",
    "bronze",
    "broom",
    "brother",
    "brown",
    "brush",
    "bubble",
    "buddy",
    "budget",
    "buffalo",
    "build",
    "bulb",
    "bulk",
    "bullet",
    "bundle",
    "bunker",
    "burden",
    "burger",
    "burst",
    "bus",
    "business",
    "busy",
    "butter",
    "buyer",
    "buzz",
    "cabbage",
    "cabin",
    "cable",
    "cactus",
    "cage",
    "cake",
    "call",
    "calm",
    "camera",
    "camp",
    "can",
    "canal",
    "cancel",
    "candy",
    "cannon",
    "canoe",
    "canvas",
    "canyon",
    "capable",
    "capital",
    "captain",
    "car",
    "carbon",
    "card",
    "cargo",
    "carpet",
    "carry",
    "cart",
    "case",
    "cash",
    "casino",
    "castle",
    "casual",
    "cat",
    "catalog",
    "catch",
    "category",
    "cattle",
    "caught",
    "cause",
    "caution",
    "cave",
    "ceiling",
    "celery",
    "cement",
    "census",
    "century",
    "cereal",
    "certain",
    "chair",
    "chalk",
    "champion",
    "change",
    "chaos",
    "chapter",
    "charge",
    "chase",
    "chat",
    "cheap",
    "check",
    "cheese",
    "chef",
    "cherry",
    "chest",
    "chicken",
    "chief",
    "child",
    "chimney",
    "choice",
    "choose",
    "chronic",
    "chuckle",
    "chunk",
    "churn",
    "cigar",
    "cinnamon",
    "circle",
    "citizen",
    "city",
    "civil",
    "claim",
    "clap",
    "clarify",
    "claw",
    "clay",
    "clean",
    "clerk",
    "clever",
    "click",
    "client",
    "cliff",
    "climb",
    "clinic",
    "clip",
    "clock",
    "clog",
    "close",
    "cloth",
    "cloud",
    "clown",
    "club",
    "clump",
    "cluster",
    "clutch",
    "coach",
    "coast",
    "coconut",
    "code",
    "coffee",
    "coil",
    "coin",
    "collect",
    "color",
    "column",
    "combine",
    "come",
    "comfort",
    "comic",
    "common",
    "company",
    "concert",
    "conduct",
    "confirm",
    "congress",
    "connect",
    "consider",
    "control",
    "convince",
    "cook",
    "cool",
    "copper",
    "copy",
    "coral",
    "core",
    "corn",
    "correct",
    "cost",
    "cotton",
    "couch",
    "country",
    "couple",
    "course",
    "cousin",
    "cover",
    "coyote",
    "crack",
    "cradle",
    "craft",
    "cram",
    "crane",
    "crash",
    "crater",
    "crawl",
    "crazy",
    "cream",
    "credit",
    "creek",
    "crew",
    "cricket",
    "crime",
    "crisp",
    "critic",
    "crop",
    "cross",
    "crouch",
    "crowd",
    "crucial",
    "cruel",
    "cruise",
    "crumble",
    "crunch",
    "crush",
    "cry",
    "crystal",
    "cube",
    "culture",
    "cup",
    "cupboard",
    "curious",
    "current",
    "curtain",
    "curve",
    "cushion",
    "custom",
    "cute",
    "cycle",
    "dad",
    "damage",
    "damp",
    "dance",
    "danger",
    "daring",
    "dash",
    "daughter",
    "dawn",
    "day",
    "deal",
    "debate",
    "debris",
    "decade",
    "december",
    "decide",
    "decline",
    "decorate",
    "decrease",
    "deer",
    "defense",
    "define",
    "defy",
    "degree",
    "delay",
    "deliver",
    "demand",
    "demise",
    "denial",
    "dentist",
    "deny",
    "depart",
    "depend",
    "deposit",
    "depth",
    "deputy",
    "derive",
    "describe",
    "desert",
    "design",
    "desk",
    "despair",
    "destroy",
    "detail",
    "detect",
    "develop",
    "device",
    "devote",
    "diagram",
    "dial",
    "diamond",
    "diary",
    "dice",
    "diesel",
    "diet",
    "differ",
    "digital",
    "dignity",
    "dilemma",
    "dinner",
    "dinosaur",
    "direct",
    "dirt",
    "disagree",
    "discover",
    "disease",
    "dish",
    "dismiss",
    "disorder",
    "display",
    "distance",
    "divert",
    "divide",
    "divorce",
    "dizzy",
    "doctor",
    "document",
    "dog",
    "doll",
    "dolphin",
    "domain",
    "donate",
    "donkey",
    "donor",
    "door",
    "dose",
    "double",
    "dove",
    "draft",
    "dragon",
    "drama",
    "drastic",
    "draw",
    "dream",
    "dress",
    "drift",
    "drill",
    "drink",
    "drip",
    "drive",
    "drop",
    "drum",
    "dry",
    "duck",
    "dumb",
    "dune",
    "during",
    "dust",
    "dutch",
    "duty",
    "dwarf",
    "dynamic",
    "eager",
    "eagle",
    "early",
    "earn",
    "earth",
    "easily",
    "east",
    "easy",
    "echo",
    "ecology",
    "economy",
    "edge",
    "edit",
    "educate",
    "effort",
    "egg",
    "eight",
    "either",
    "elbow",
    "elder",
    "electric",
    "elegant",
    "element",
    "elephant",
    "elevator",
    "elite",
    "else",
    "embark",
    "embody",
    "embrace",
    "emerge",
    "emotion",
    "employ",
    "empower",
    "empty",
    "enable",
    "enact",
    "end",
    "endless",
    "endorse",
    "enemy",
    "energy",
    "enforce",
    "engage",
    "engine",
    "enhance",
    "enjoy",
    "enlist",
    "enough",
    "enrich",
    "enroll",
    "ensure",
    "enter",
    "entire",
    "entry",
    "envelope",
    "episode",
    "equal",
    "equip",
    "era",
    "erase",
    "erode",
    "erosion",
    "error",
    "erupt",
    "escape",
    "essay",
    "essence",
    "estate",
    "eternal",
    "ethics",
    "evidence",
    "evil",
    "evoke",
    "evolve",
    "exact",
    "example",
    "excess",
    "exchange",
    "excite",
    "exclude",
    "excuse",
    "execute",
    "exercise",
    "exhaust",
    "exhibit",
    "exile",
    "exist",
    "exit",
    "exotic",
    "expand",
    "expect",
    "expire",
    "explain",
    "expose",
    "express",
    "extend",
    "extra",
    "eye",
    "eyebrow",
    "fabric",
    "face",
    "faculty",
    "fade",
    "faint",
    "faith",
    "fall",
    "false",
    "fame",
    "family",
    "famous",
    "fan",
    "fancy",
    "fantasy",
    "farm",
    "fashion",
    "fat",
    "fatal",
    "father",
    "fatigue",
    "fault",
    "favorite",
    "feature",
    "february",
    "federal",
    "fee",
    "feed",
    "feel",
    "female",
    "fence",
    "festival",
    "fetch",
    "fever",
    "few",
    "fiber",
    "fiction",
    "field",
    "figure",
    "file",
    "film",
    "filter",
    "final",
    "find",
    "fine",
    "finger",
    "finish",
    "fire",
    "firm",
    "first",
    "fiscal",
    "fish",
    "fit",
    "fitness",
    "fix",
    "flag",
    "flame",
    "flash",
    "flat",
    "flavor",
    "flee",
    "flight",
    "flip",
    "float",
    "flock",
    "floor",
    "flower",
    "fluid",
    "flush",
    "fly",
    "foam",
    "focus",
    "fog",
    "foil",
    "fold",
    "follow",
    "food",
    "foot",
    "force",
    "forest",
    "forget",
    "fork",
    "fortune",
    "forum",
    "forward",
    "fossil",
    "foster",
    "found",
    "fox",
    "fragile",
    "frame",
    "frequent",
    "fresh",
    "friend",
    "fringe",
    "frog",
    "front",
    "frost",
    "frown",
    "frozen",
    "fruit",
    "fuel",
    "fun",
    "funny",
    "furnace",
    "fury",
    "future",
    "gadget",
    "gain",
    "galaxy",
    "gallery",
    "game",
    "gap",
    "garage",
    "garbage",
    "garden",
    "garlic",
    "garment",
    "gas",
    "gasp",
    "gate",
    "gather",
    "gauge",
    "gaze",
    "general",
    "genius",
    "genre",
    "gentle",
    "genuine",
    "gesture",
    "ghost",
    "giant",
    "gift",
    "giggle",
    "ginger",
    "giraffe",
    "girl",
    "give",
    "glad",
    "glance",
    "glare",
    "glass",
    "glide",
    "glimpse",
    "globe",
    "gloom",
    "glory",
    "glove",
    "glow",
    "glue",
    "goat",
    "goddess",
    "gold",
    "good",
    "goose",
    "gorilla",
    "gospel",
    "gossip",
    "govern",
    "gown",
    "grab",
    "grace",
    "grain",
    "grant",
    "grape",
    "grass",
    "gravity",
    "great",
    "green",
    "grid",
    "grief",
    "grit",
    "grocery",
    "group",
    "grow",
    "grunt",
    "guard",
    "guess",
    "guide",
    "guilt",
    "guitar",
    "gun",
    "gym",
    "habit",
    "hair",
    "half",
    "hammer",
    "hamster",
    "hand",
    "happy",
    "harbor",
    "hard",
    "harsh",
    "harvest",
    "hat",
    "have",
    "hawk",
    "hazard",
    "head",
    "health",
    "heart",
    "heavy",
    "hedgehog",
    "height",
    "hello",
    "helmet",
    "help",
    "hen",
    "hero",
    "hidden",
    "high",
    "hill",
    "hint",
    "hip",
    "hire",
    "history",
    "hobby",
    "hockey",
    "hold",
    "hole",
    "holiday",
    "hollow",
    "home",
    "honey",
    "hood",
    "hope",
    "horn",
    "horror",
    "horse",
    "hospital",
    "host",
    "hotel",
    "hour",
    "hover",
    "hub",
    "huge",
    "human",
    "humble",
    "humor",
    "hundred",
    "hungry",
    "hunt",
    "hurdle",
    "hurry",
    "hurt",
    "husband",
    "hybrid",
    "ice",
    "icon",
    "idea",
    "identify",
    "idle",
    "ignore",
    "ill",
    "illegal",
    "illness",
    "image",
    "imitate",
    "immense",
    "immune",
    "impact",
    "impose",
    "improve",
    "impulse",
    "inch",
    "include",
    "income",
    "increase",
    "index",
    "indicate",
    "indoor",
    "industry",
    "infant",
    "inflict",
    "inform",
    "inhale",
    "inherit",
    "initial",
    "inject",
    "injury",
    "inmate",
    "inner",
    "innocent",
    "input",
    "inquiry",
    "insane",
    "insect",
    "inside",
    "inspire",
    "install",
    "intact",
    "interest",
    "into",
    "invest",
    "invite",
    "involve",
    "iron",
    "island",
    "isolate",
    "issue",
    "item",
    "ivory",
    "jacket",
    "jaguar",
    "jar",
    "jazz",
    "jealous",
    "jeans",
    "jelly",
    "jewel",
    "job",
    "join",
    "joke",
    "journey",
    "joy",
    "judge",
    "juice",
    "jump",
    "jungle",
    "junior",
    "junk",
    "just",
    "kangaroo",
    "keen",
    "keep",
    "ketchup",
    "key",
    "kick",
    "kid",
    "kidney",
    "kind",
    "kingdom",
    "kiss",
    "kit",
    "kitchen",
    "kite",
    "kitten",
    "kiwi",
    "knee",
    "knife",
    "knock",
    "know",
    "lab",
    "label",
    "labor",
    "ladder",
    "lady",
    "lake",
    "lamp",
    "language",
    "laptop",
    "large",
    "later",
    "latin",
    "laugh",
    "laundry",
    "lava",
    "law",
    "lawn",
    "lawsuit",
    "layer",
    "lazy",
    "leader",
    "leaf",
    "learn",
    "leave",
    "lecture",
    "left",
    "leg",
    "legal",
    "legend",
    "leisure",
    "lemon",
    "lend",
    "length",
    "lens",
    "leopard",
    "lesson",
    "letter",
    "level",
    "liar",
    "liberty",
    "library",
    "license",
    "life",
    "lift",
    "light",
    "like",
    "limb",
    "limit",
    "link",
    "lion",
    "liquid",
    "list",
    "little",
    "live",
    "lizard",
    "load",
    "loan",
    "lobster",
    "local",
    "lock",
    "logic",
    "lonely",
    "long",
    "loop",
    "lottery",
    "loud",
    "lounge",
    "love",
    "loyal",
    "lucky",
    "luggage",
    "lumber",
    "lunar",
    "lunch",
    "luxury",
    "lyrics",
    "machine",
    "mad",
    "magic",
    "magnet",
    "maid",
    "mail",
    "main",
    "major",
    "make",
    "mammal",
    "man",
    "manage",
    "mandate",
    "mango",
    "mansion",
    "manual",
    "maple",
    "marble",
    "march",
    "margin",
    "marine",
    "market",
    "marriage",
    "mask",
    "mass",
    "master",
    "match",
    "material",
    "math",
    "matrix",
    "matter",
    "maximum",
    "maze",
    "meadow",
    "mean",
    "measure",
    "meat",
    "mechanic",
    "medal",
    "media",
    "melody",
    "melt",
    "member",
    "memory",
    "mention",
    "menu",
    "mercy",
    "merge",
    "merit",
    "merry",
    "mesh",
    "message",
    "metal",
    "method",
    "middle",
    "midnight",
    "milk",
    "million",
    "mimic",
    "mind",
    "minimum",
    "minor",
    "minute",
    "miracle",
    "mirror",
    "misery",
    "miss",
    "mistake",
    "mix",
    "mixed",
    "mixture",
    "mobile",
    "model",
    "modify",
    "mom",
    "moment",
    "monitor",
    "monkey",
    "monster",
    "month",
    "moon",
    "moral",
    "more",
    "morning",
    "mosquito",
    "mother",
    "motion",
    "motor",
    "mountain",
    "mouse",
    "move",
    "movie",
    "much",
    "muffin",
    "mule",
    "multiply",
    "muscle",
    "museum",
    "mushroom",
    "music",
    "must",
    "mutual",
    "myself",
    "mystery",
    "myth",
    "naive",
    "name",
    "napkin",
    "narrow",
    "nasty",
    "nation",
    "nature",
    "near",
    "neck",
    "need",
    "negative",
    "neglect",
    "neither",
    "nephew",
    "nerve",
    "nest",
    "net",
    "network",
    "neutral",
    "never",
    "news",
    "next",
    "nice",
    "night",
    "noble",
    "noise",
    "nominee",
    "noodle",
    "normal",
    "north",
    "nose",
    "notable",
    "note",
    "nothing",
    "notice",
    "novel",
    "now",
    "nuclear",
    "number",
    "nurse",
    "nut",
    "oak",
    "obey",
    "object",
    "oblige",
    "obscure",
    "observe",
    "obtain",
    "obvious",
    "occur",
    "ocean",
    "october",
    "odor",
    "off",
    "offer",
    "office",
    "often",
    "oil",
    "okay",
    "old",
    "olive",
    "olympic",
    "omit",
    "once",
    "one",
    "onion",
    "online",
    "only",
    "open",
    "opera",
    "opinion",
    "oppose",
    "option",
    "orange",
    "orbit",
    "orchard",
    "order",
    "ordinary",
    "organ",
    "orient",
    "original",
    "orphan",
    "ostrich",
    "other",
    "outdoor",
    "outer",
    "output",
    "outside",
    "oval",
    "oven",
    "over",
    "own",
    "owner",
    "oxygen",
    "oyster",
    "ozone",
    "pact",
    "paddle",
    "page",
    "pair",
    "palace",
    "palm",
    "panda",
    "panel",
    "panic",
    "panther",
    "paper",
    "parade",
    "parent",
    "park",
    "parrot",
    "party",
    "pass",
    "patch",
    "path",
    "patient",
    "patrol",
    "pattern",
    "pause",
    "pave",
    "payment",
    "peace",
    "peanut",
    "pear",
    "peasant",
    "pelican",
    "pen",
    "penalty",
    "pencil",
    "people",
    "pepper",
    "perfect",
    "permit",
    "person",
    "pet",
    "phone",
    "photo",
    "phrase",
    "physical",
    "piano",
    "picnic",
    "picture",
    "piece",
    "pig",
    "pigeon",
    "pill",
    "pilot",
    "pink",
    "pioneer",
    "pipe",
    "pistol",
    "pitch",
    "pizza",
    "place",
    "planet",
    "plastic",
    "plate",
    "play",
    "please",
    "pledge",
    "pluck",
    "plug",
    "plunge",
    "poem",
    "poet",
    "point",
    "polar",
    "pole",
    "police",
    "pond",
    "pony",
    "pool",
    "popular",
    "portion",
    "position",
    "possible",
    "post",
    "potato",
    "pottery",
    "poverty",
    "powder",
    "power",
    "practice",
    "praise",
    "predict",
    "prefer",
    "prepare",
    "present",
    "pretty",
    "prevent",
    "price",
    "pride",
    "primary",
    "print",
    "priority",
    "prison",
    "private",
    "prize",
    "problem",
    "process",
    "produce",
    "profit",
    "program",
    "project",
    "promote",
    "proof",
    "property",
    "prosper",
    "protect",
    "proud",
    "provide",
    "public",
    "pudding",
    "pull",
    "pulp",
    "pulse",
    "pumpkin",
    "punch",
    "pupil",
    "puppy",
    "purchase",
    "purity",
    "purpose",
    "purse",
    "push",
    "put",
    "puzzle",
    "pyramid",
    "quality",
    "quantum",
    "quarter",
    "question",
    "quick",
    "quit",
    "quiz",
    "quote",
    "rabbit",
    "raccoon",
    "race",
    "rack",
    "radar",
    "radio",
    "rail",
    "rain",
    "raise",
    "rally",
    "ramp",
    "ranch",
    "random",
    "range",
    "rapid",
    "rare",
    "rate",
    "rather",
    "raven",
    "raw",
    "razor",
    "ready",
    "real",
    "reason",
    "rebel",
    "rebuild",
    "recall",
    "receive",
    "recipe",
    "record",
    "recycle",
    "reduce",
    "reflect",
    "reform",
    "refuse",
    "region",
    "regret",
    "regular",
    "reject",
    "relax",
    "release",
    "relief",
    "rely",
    "remain",
    "remember",
    "remind",
    "remove",
    "render",
    "renew",
    "rent",
    "reopen",
    "repair",
    "repeat",
    "replace",
    "report",
    "require",
    "rescue",
    "resemble",
    "resist",
    "resource",
    "response",
    "result",
    "retire",
    "retreat",
    "return",
    "reunion",
    "reveal",
    "review",
    "reward",
    "rhythm",
    "rib",
    "ribbon",
    "rice",
    "rich",
    "ride",
    "ridge",
    "rifle",
    "right",
    "rigid",
    "ring",
    "riot",
    "ripple",
    "risk",
    "ritual",
    "rival",
    "river",
    "road",
    "roast",
    "robot",
    "robust",
    "rocket",
    "romance",
    "roof",
    "rookie",
    "room",
    "rose",
    "rotate",
    "rough",
    "round",
    "route",
    "royal",
    "rubber",
    "rude",
    "rug",
    "rule",
    "run",
    "runway",
    "rural",
    "sad",
    "saddle",
    "sadness",
    "safe",
    "sail",
    "salad",
    "salmon",
    "salon",
    "salt",
    "salute",
    "same",
    "sample",
    "sand",
    "satisfy",
    "satoshi",
    "sauce",
    "sausage",
    "save",
    "say",
    "scale",
    "scan",
    "scare",
    "scatter",
    "scene",
    "scheme",
    "school",
    "science",
    "scissors",
    "scorpion",
    "scout",
    "scrap",
    "screen",
    "script",
    "scrub",
    "sea",
    "search",
    "season",
    "seat",
    "second",
    "secret",
    "section",
    "security",
    "seed",
    "seek",
    "segment",
    "select",
    "sell",
    "seminar",
    "senior",
    "sense",
    "sentence",
    "series",
    "service",
    "session",
    "settle",
    "setup",
    "seven",
    "shadow",
    "shaft",
    "shallow",
    "share",
    "shed",
    "shell",
    "sheriff",
    "shield",
    "shift",
    "shine",
    "ship",
    "shiver",
    "shock",
    "shoe",
    "shoot",
    "shop",
    "short",
    "shoulder",
    "shove",
    "shrimp",
    "shrug",
    "shuffle",
    "shy",
    "sibling",
    "sick",
    "side",
    "siege",
    "sight",
    "sign",
    "silent",
    "silk",
    "silly",
    "silver",
    "similar",
    "simple",
    "since",
    "sing",
    "siren",
    "sister",
    "situate",
    "six",
    "size",
    "skate",
    "sketch",
    "ski",
    "skill",
    "skin",
    "skirt",
    "skull",
    "slab",
    "slam",
    "sleep",
    "slender",
    "slice",
    "slide",
    "slight",
    "slim",
    "slogan",
    "slot",
    "slow",
    "slush",
    "small",
    "smart",
    "smile",
    "smoke",
    "smooth",
    "snack",
    "snake",
    "snap",
    "sniff",
    "snow",
    "soap",
    "soccer",
    "social",
    "sock",
    "soda",
    "soft",
    "solar",
    "soldier",
    "solid",
    "solution",
    "solve",
    "someone",
    "song",
    "soon",
    "sorry",
    "sort",
    "soul",
    "sound",
    "soup",
    "source",
    "south",
    "space",
    "spare",
    "spatial",
    "spawn",
    "speak",
    "special",
    "speed",
    "spell",
    "spend",
    "sphere",
    "spice",
    "spider",
    "spike",
    "spin",
    "spirit",
    "split",
    "spoil",
    "sponsor",
    "spoon",
    "sport",
    "spot",
    "spray",
    "spread",
    "spring",
    "spy",
    "square",
    "squeeze",
    "squirrel",
    "stable",
    "stadium",
    "staff",
    "stage",
    "stairs",
    "stamp",
    "stand",
    "start",
    "state",
    "stay",
    "steak",
    "steel",
    "stem",
    "step",
    "stereo",
    "stick",
    "still",
    "sting",
    "stock",
    "stomach",
    "stone",
    "stool",
    "story",
    "stove",
    "strategy",
    "street",
    "strike",
    "strong",
    "struggle",
    "student",
    "stuff",
    "stumble",
    "style",
    "subject",
    "submit",
    "subway",
    "success",
    "such",
    "sudden",
    "suffer",
    "sugar",
    "suggest",
    "suit",
    "summer",
    "sun",
    "sunny",
    "sunset",
    "super",
    "supply",
    "supreme",
    "sure",
    "surface",
    "surge",
    "surprise",
    "surround",
    "survey",
    "suspect",
    "sustain",
    "swallow",
    "swamp",
    "swap",
    "swarm",
    "swear",
    "sweet",
    "swift",
    "swim",
    "swing",
    "switch",
    "sword",
    "symbol",
    "symptom",
    "syrup",
    "system",
    "table",
    "tackle",
    "tag",
    "tail",
    "talent",
    "talk",
    "tank",
    "tape",
    "target",
    "task",
    "taste",
    "tattoo",
    "taxi",
    "teach",
    "team",
    "tell",
    "ten",
    "tenant",
    "tennis",
    "tent",
    "term",
    "test",
    "text",
    "thank",
    "that",
    "theme",
    "then",
    "theory",
    "there",
    "they",
    "thing",
    "this",
    "thought",
    "three",
    "thrive",
    "throw",
    "thumb",
    "thunder",
    "ticket",
    "tide",
    "tiger",
    "tilt",
    "timber",
    "time",
    "tiny",
    "tip",
    "tired",
    "tissue",
    "title",
    "toast",
    "tobacco",
    "today",
    "toddler",
    "toe",
    "together",
    "toilet",
    "token",
    "tomato",
    "tomorrow",
    "tone",
    "tongue",
    "tonight",
    "tool",
    "tooth",
    "top",
    "topic",
    "topple",
    "torch",
    "tornado",
    "tortoise",
    "toss",
    "total",
    "tourist",
    "toward",
    "tower",
    "town",
    "toy",
    "track",
    "trade",
    "traffic",
    "tragic",
    "train",
    "transfer",
    "trap",
    "trash",
    "travel",
    "tray",
    "treat",
    "tree",
    "trend",
    "trial",
    "tribe",
    "trick",
    "trigger",
    "trim",
    "trip",
    "trophy",
    "trouble",
    "truck",
    "true",
    "truly",
    "trumpet",
    "trust",
    "truth",
    "try",
    "tube",
    "tuition",
    "tumble",
    "tuna",
    "tunnel",
    "turkey",
    "turn",
    "turtle",
    "twelve",
    "twenty",
    "twice",
    "twin",
    "twist",
    "two",
    "type",
    "typical",
    "ugly",
    "umbrella",
    "unable",
    "unaware",
    "uncle",
    "uncover",
    "under",
    "undo",
    "unfair",
    "unfold",
    "unhappy",
    "uniform",
    "unique",
    "unit",
    "universe",
    "unknown",
    "unlock",
    "until",
    "unusual",
    "unveil",
    "update",
    "upgrade",
    "uphold",
    "upon",
    "upper",
    "upset",
    "urban",
    "urge",
    "usage",
    "use",
    "used",
    "useful",
    "useless",
    "usual",
    "utility",
    "vacant",
    "vacuum",
    "vague",
    "valid",
    "valley",
    "valve",
    "van",
    "vanish",
    "vapor",
    "various",
    "vast",
    "vault",
    "vehicle",
    "velvet",
    "vendor",
    "venture",
    "venue",
    "verb",
    "verify",
    "version",
    "very",
    "vessel",
    "veteran",
    "viable",
    "vibrant",
    "vicious",
    "victory",
    "video",
    "view",
    "village",
    "vintage",
    "violin",
    "virtual",
    "virus",
    "visa",
    "visit",
    "visual",
    "vital",
    "vivid",
    "vocal",
    "voice",
    "void",
    "volcano",
    "volume",
    "vote",
    "voyage",
    "wage",
    "wagon",
    "wait",
    "walk",
    "wall",
    "walnut",
    "want",
    "warfare",
    "warm",
    "warrior",
    "wash",
    "wasp",
    "waste",
    "water",
    "wave",
    "way",
    "wealth",
    "weapon",
    "wear",
    "weasel",
    "weather",
    "web",
    "wedding",
    "weekend",
    "weird",
    "welcome",
    "west",
    "wet",
    "whale",
    "what",
    "wheat",
    "wheel",
    "when",
    "where",
    "whip",
    "whisper",
    "wide",
    "width",
    "wife",
    "wild",
    "will",
    "win",
    "window",
    "wine",
    "wing",
    "wink",
    "winner",
    "winter",
    "wire",
    "wisdom",
    "wise",
    "wish",
    "witness",
    "wolf",
    "woman",
    "wonder",
    "wood",
    "wool",
    "word",
    "work",
    "world",
    "worry",
    "worth",
    "wrap",
    "wreck",
    "wrestle",
    "wrist",
    "write",
    "wrong",
    "yard",
    "year",
    "yellow",
    "you",
    "young",
    "youth",
    "zebra",
    "zero",
    "zone",
    "zoo"
]
;
},{}],"_wordlists.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// browserify by default only pulls in files that are hard coded in requires
// In order of last to first in this file, the default wordlist will be chosen
// based on what is present. (Bundles may remove wordlists they don't need)
const wordlists = {};
exports.wordlists = wordlists;
let _default;
exports._default = _default;
try {
    exports._default = _default = require('./wordlists/chinese_simplified.json');
    wordlists.chinese_simplified = _default;
}
catch (err) { }
try {
    exports._default = _default = require('./wordlists/chinese_traditional.json');
    wordlists.chinese_traditional = _default;
}
catch (err) { }
try {
    exports._default = _default = require('./wordlists/korean.json');
    wordlists.korean = _default;
}
catch (err) { }
try {
    exports._default = _default = require('./wordlists/french.json');
    wordlists.french = _default;
}
catch (err) { }
try {
    exports._default = _default = require('./wordlists/italian.json');
    wordlists.italian = _default;
}
catch (err) { }
try {
    exports._default = _default = require('./wordlists/spanish.json');
    wordlists.spanish = _default;
}
catch (err) { }
try {
    exports._default = _default = require('./wordlists/japanese.json');
    wordlists.japanese = _default;
    wordlists.JA = _default;
}
catch (err) { }
try {
    exports._default = _default = require('./wordlists/english.json');
    wordlists.english = _default;
    wordlists.EN = _default;
}
catch (err) { }

},{"./wordlists/chinese_simplified.json":"wordlists/chinese_simplified.json","./wordlists/chinese_traditional.json":"wordlists/chinese_traditional.json","./wordlists/korean.json":"wordlists/korean.json","./wordlists/french.json":"wordlists/french.json","./wordlists/italian.json":"wordlists/italian.json","./wordlists/spanish.json":"wordlists/spanish.json","./wordlists/japanese.json":"wordlists/japanese.json","./wordlists/english.json":"wordlists/english.json"}],"index.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createHash = require("create-hash");
const pbkdf2_1 = require("pbkdf2");
const randomBytes = require("randombytes");
const _wordlists_1 = require("./_wordlists");
let DEFAULT_WORDLIST = _wordlists_1._default;
const INVALID_MNEMONIC = 'Invalid mnemonic';
const INVALID_ENTROPY = 'Invalid entropy';
const INVALID_CHECKSUM = 'Invalid mnemonic checksum';
const WORDLIST_REQUIRED = 'A wordlist is required but a default could not be found.\n' +
    'Please explicitly pass a 2048 word array explicitly.';
function lpad(str, padString, length) {
    while (str.length < length)
        str = padString + str;
    return str;
}
function binaryToByte(bin) {
    return parseInt(bin, 2);
}
function bytesToBinary(bytes) {
    return bytes.map(x => lpad(x.toString(2), '0', 8)).join('');
}
function deriveChecksumBits(entropyBuffer) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = createHash('sha256')
        .update(entropyBuffer)
        .digest();
    return bytesToBinary([...hash]).slice(0, CS);
}
function salt(password) {
    return 'mnemonic' + (password || '');
}
function mnemonicToSeedSync(mnemonic, password) {
    const mnemonicBuffer = Buffer.from((mnemonic || '').normalize('NFKD'), 'utf8');
    const saltBuffer = Buffer.from(salt((password || '').normalize('NFKD')), 'utf8');
    return pbkdf2_1.pbkdf2Sync(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512');
}
exports.mnemonicToSeedSync = mnemonicToSeedSync;
function mnemonicToSeed(mnemonic, password) {
    return new Promise((resolve, reject) => {
        try {
            const mnemonicBuffer = Buffer.from((mnemonic || '').normalize('NFKD'), 'utf8');
            const saltBuffer = Buffer.from(salt((password || '').normalize('NFKD')), 'utf8');
            pbkdf2_1.pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512', (err, data) => {
                if (err)
                    return reject(err);
                else
                    return resolve(data);
            });
        }
        catch (error) {
            return reject(error);
        }
    });
}
exports.mnemonicToSeed = mnemonicToSeed;
function mnemonicToEntropy(mnemonic, wordlist) {
    wordlist = wordlist || DEFAULT_WORDLIST;
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }
    const words = (mnemonic || '').normalize('NFKD').split(' ');
    if (words.length % 3 !== 0)
        throw new Error(INVALID_MNEMONIC);
    // convert word indices to 11 bit binary strings
    const bits = words
        .map(word => {
        const index = wordlist.indexOf(word);
        if (index === -1)
            throw new Error(INVALID_MNEMONIC);
        return lpad(index.toString(2), '0', 11);
    })
        .join('');
    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    const checksumBits = bits.slice(dividerIndex);
    // calculate the checksum and compare
    const entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte);
    if (entropyBytes.length < 16)
        throw new Error(INVALID_ENTROPY);
    if (entropyBytes.length > 32)
        throw new Error(INVALID_ENTROPY);
    if (entropyBytes.length % 4 !== 0)
        throw new Error(INVALID_ENTROPY);
    const entropy = Buffer.from(entropyBytes);
    const newChecksum = deriveChecksumBits(entropy);
    if (newChecksum !== checksumBits)
        throw new Error(INVALID_CHECKSUM);
    return entropy.toString('hex');
}
exports.mnemonicToEntropy = mnemonicToEntropy;
function entropyToMnemonic(entropy, wordlist) {
    if (!Buffer.isBuffer(entropy))
        entropy = Buffer.from(entropy, 'hex');
    wordlist = wordlist || DEFAULT_WORDLIST;
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }
    // 128 <= ENT <= 256
    if (entropy.length < 16)
        throw new TypeError(INVALID_ENTROPY);
    if (entropy.length > 32)
        throw new TypeError(INVALID_ENTROPY);
    if (entropy.length % 4 !== 0)
        throw new TypeError(INVALID_ENTROPY);
    const entropyBits = bytesToBinary([...entropy]);
    const checksumBits = deriveChecksumBits(entropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g);
    const words = chunks.map(binary => {
        const index = binaryToByte(binary);
        return wordlist[index];
    });
    return wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093' // Japanese wordlist
        ? words.join('\u3000')
        : words.join(' ');
}
exports.entropyToMnemonic = entropyToMnemonic;
function generateMnemonic(strength, rng, wordlist) {
    strength = strength || 128;
    if (strength % 32 !== 0)
        throw new TypeError(INVALID_ENTROPY);
    rng = rng || randomBytes;
    return entropyToMnemonic(rng(strength / 8), wordlist);
}
exports.generateMnemonic = generateMnemonic;
function validateMnemonic(mnemonic, wordlist) {
    try {
        mnemonicToEntropy(mnemonic, wordlist);
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.validateMnemonic = validateMnemonic;
function setDefaultWordlist(language) {
    const result = _wordlists_1.wordlists[language];
    if (result)
        DEFAULT_WORDLIST = result;
    else
        throw new Error('Could not find wordlist for language "' + language + '"');
}
exports.setDefaultWordlist = setDefaultWordlist;
function getDefaultWordlist() {
    if (!DEFAULT_WORDLIST)
        throw new Error('No Default Wordlist set');
    return Object.keys(_wordlists_1.wordlists).filter(lang => {
        if (lang === 'JA' || lang === 'EN')
            return false;
        return _wordlists_1.wordlists[lang].every((word, index) => word === DEFAULT_WORDLIST[index]);
    })[0];
}
exports.getDefaultWordlist = getDefaultWordlist;
var _wordlists_2 = require("./_wordlists");
exports.wordlists = _wordlists_2.wordlists;

},{"create-hash":"../../create-hash/browser.js","pbkdf2":"../../pbkdf2/browser.js","randombytes":"../../randombytes/browser.js","./_wordlists":"_wordlists.js","buffer":"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/node_modules/buffer/index.js"}],"../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "37735" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../emsdk/node/8.9.1_64bit/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], "bip39")
//# sourceMappingURL=/index.js.map
