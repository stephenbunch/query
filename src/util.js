/**
 * Determines whether an object can be iterated over like an array.
 * https://github.com/jquery/jquery/blob/a5037cb9e3851b171b49f6d717fb40e59aa344c2/src/core.js#L501
 *
 * @private
 * @param {*} value
 * @returns {Boolean}
 */
function isArrayLike( value ) {
  if ( !value ) {
    return false;
  }
  var length = value.length;
  var type = typeOf( value );
  if ( type === 'function' || type === 'window' ) {
    return false;
  }
  if ( value.nodeType === 1 && length ) {
    return true;
  }
  return (
    type === 'array' ||
    length === 0 ||
    typeof length === 'number' && length > 0 && ( length - 1 ) in value
  );
}

/**
 * Gets the internal JavaScript [[Class]] of an object.
 * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray
 *
 * @private
 * @param {*} value
 * @returns {String}
 */
function typeOf( value ) {
  return Object.prototype.toString.call( value )
    .match( /^\[object\s(.*)\]$/ )[1].toLowerCase();
}

/**
 * The base implementation of `_.isFunction` without support for environments
 * with incorrect `typeof` results.
 * https://github.com/lodash/lodash/blob/master/lodash.js#L359
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 */
function isFunction( value ) {
  if ( typeof _ !== 'undefined' && _.isFunction ) {
    return _.isFunction( value );
  } else {
    // Avoid a Chakra JIT bug in compatibility modes of IE 11.
    // See https://github.com/jashkenas/underscore/issues/1621 for more details.
    return typeof value == 'function' || false;
  }
}

function isWindow( value ) {
  return !!value && value === value.window;
}
