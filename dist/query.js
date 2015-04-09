( function() {

'use strict';

var isBrowser = !( typeof module !== 'undefined' && module.exports );
var pathy = isBrowser ? window.pathy : require( 'pathy' );
var _;

if ( isBrowser ) {
  _ = window._;
} else {
  try {
    _ = require( 'lodash' );
    _ = require( 'underscore' );
  } catch ( err ) { }
}

var exports = ( function() {

var exports = function( source ) {
  return new Query( source );
};

function AsyncQuery( iterator ) {
  this.iterator = iterator;
}

exports.stream = function( stream ) {
  return new AsyncQuery( asyncIterationFromStream( stream ) );
};

function asyncIterationFromStream( stream ) {
  return function() {
    var task;
    var buffer = [];
    var ended = false;
    stream.on( 'data', function( chunk ) {
      if ( task ) {
        task.resolve({ done: false, value: chunk });
        task = null;
      } else {
        buffer.push( chunk );
      }
    });
    stream.on( 'end', function() {
      ended = true;
      if ( task && buffer.length === 0 ) {
        task.resolve({ done: true });
        task = null;
      }
    });
    return {
      nextAsync: function() {
        if ( !task ) {
          if ( buffer.length > 0 ) {
            return Task.from({ done: false, value: buffer.shift() });
          } else if ( ended ) {
            return Task.from({ done: true });
          } else {
            task = new Task();
          }
        }
        return task.promise;
      }
    };
  };
}

function Query( source ) {
  if ( source ) {
    if ( isFunction( source ) ) {
      this.iterator = source;
    } else if ( isArrayLike( source ) ) {
      this.iterator = iterationFromArray( source );
    } else {
      this.iterator = iterationFromObject( source );
    }
  } else {
    this.iterator = null;
  }
}

Query.prototype.fork = function( iteratorFunc ) {
  var self = this;
  return new Query( function() {
    return iteratorFunc( self.iterator );
  });
};

exports.array = function( array ) {
  return new Query( iterationFromArray( array ) );
};

exports.object = function( object ) {
  return new Query( iterationFromObject( object ) );
};

function iterationFromArray( array ) {
  return function() {
    var items = array.slice();
    var i = -1;
    var length = items.length;
    return {
      next: function() {
        i += 1;
        return {
          done: i >= length,
          value: items[ i ]
        };
      }
    };
  };
}

function iterationFromObject( object ) {
  return function() {
    var keys = Object.keys( object );
    var i = -1, length = keys.length;
    return {
      next: function() {
        i += 1;
        return {
          done: i >= length,
          value: i < length && {
            key: keys[ i ],
            value: object[ keys[ i ] ]
          } || null
        };
      }
    };
  };
}

Query.prototype.where = function( filter ) {
  filter = exports.filterThunk( filter );
  return this.fork( function( iteratorFunc ) {
    var iterator = iteratorFunc();
    var index = -1;
    return {
      next: function() {
        while ( true ) {
          var item = iterator.next();
          if ( item.done ) {
            return item;
          } else {
            index += 1;
            if ( filter( item.value, index ) ) {
              return item;
            }
          }
        }
      }
    };
  });
};

Query.prototype.whereAsync =
AsyncQuery.prototype.whereAsync = function( filter ) {
  var filterAsync = exports.asyncThunk( exports.filterThunk( filter ) );
  return this.asyncFork( function( iteratorFunc ) {
    var iterator = iteratorFunc();
    var index = -1;
    var next;
    var nextAsync = function() {
      if ( !next ) {
        next = iterator.nextAsync().then( function( item ) {
          if ( item.done ) {
            return item;
          } else {
            index += 1;
            return filterAsync( item.value, index ).then( function( result ) {
              next = null;
              if ( result ) {
                return item;
              } else {
                return nextAsync();
              }
            });
          }
        });
      }
      return next;
    };
    return {
      nextAsync: nextAsync
    };
  });
};

exports.ArrayOps = {
  $all: function( query ) {
    var filter = filterFromQuery( query );
    return function( items ) {
      var i = 0, length = items.length;
      for ( ; i < length; i++ ) {
        if ( !filter( items[ i ] ) ) {
          return false;
        }
      }
      return true;
    };
  },

  $elemMatch: function( query ) {
    var filter = filterFromQuery( query );
    return function( items ) {
      var i = 0, length = items.length;
      for ( ; i < length; i++ ) {
        if ( filter( items[ i ] ) ) {
          return true;
        }
      }
      return false;
    };
  },

  $size: function( length ) {
    return function( items ) {
      return items.length === length;
    };
  }
};

exports.ComparisonOps = {
  $eq: function( item, value ) {
    return item === value;
  },

  $gt: function( item, value ) {
    return item > value;
  },

  $gte: function( item, value ) {
    return item >= value;
  },

  $lt: function( item, value ) {
    return item < value;
  },

  $lte: function( item, value ) {
    return item <= value;
  },

  $ne: function( item, value ) {
    return item !== value;
  },

  $in: function( item, value ) {
    return value.indexOf( item ) > -1;
  },

  $nin: function( item, value ) {
    return value.indexOf( item ) === -1;
  }
};

exports.ElementOps = {
  $exists: function( path ) {
    return function( item ) {
      return path.exists( item );
    };
  }
};

exports.LogicalOps = {
  $or: function( queries ) {
    var filters = queries.map( filterFromQuery );
    return function( item ) {
      var i = 0, length = filters.length;
      for ( ; i < length; i++ ) {
        if ( filters[ i ]( item ) ) {
          return true;
        }
      }
      return false;
    };
  },

  $and: function( queries ) {
    var filters = queries.map( filterFromQuery );
    return function( item ) {
      var i = 0, length = filters.length;
      for ( ; i < length; i++ ) {
        if ( !filters[ i ]( item ) ) {
          return false;
        }
      }
      return true;
    };
  },

  $not: function( query ) {
    var filter = filterFromQuery( query );
    return function( item ) {
      return !filter( item );
    };
  },

  $nor: function( queries ) {
    var filters = queries.map( filterFromQuery );
    return function( item ) {
      var i = 0, length = filters.length;
      for ( ; i < length; i++ ) {
        if ( filters[ i ]( item ) ) {
          return false;
        }
      }
      return true;
    };
  }
};

Query.prototype.toArray = function() {
  var iterator = this.iterator();
  var item;
  var result = [];
  while ( !( item = iterator.next() ).done ) {
    result.push( item.value );
  }
  return result;
};

exports.asyncThunk = function( fn ) {
  return function() {
    try {
      var result = fn.apply( undefined, arguments );
      if ( result && result.then ) {
        return result;
      } else {
        return Task.from( result );
      }
    } catch( err ) {
      return Task.reject( err );
    }
  };
};

exports.filterThunk = function( filter ) {
  if ( isFunction( filter ) ) {
    return filter;
  } else {
    return filterFromQuery( filter );
  }
};

function filterFromQuery( query ) {
  var i, length, ops, op;
  ops = Object.keys( exports.LogicalOps );
  for ( i = 0, length = ops.length; i < length; i++ ) {
    op = ops[ i ];
    if ( query[ op ] !== undefined ) {
      return exports.LogicalOps[ op ]( query[ op ] );
    }
  }

  var comparisonOpKeys = Object.keys( exports.ComparisonOps );
  var elementOpKeys = Object.keys( exports.ElementOps );
  var arrayOpKeys = Object.keys( exports.ArrayOps );

  var filters = [];
  Object.keys( query ).forEach( function( field ) {
    var path = pathy( field );
    var value = query[ field ];
    if ( typeOf( value ) === 'object' ) {
      Object.keys( value ).forEach( function( op ) {
        if ( comparisonOpKeys.indexOf( op ) > -1 ) {
          filters.push( comparisonOpThunk( op, path, value[ op ] ) );
        } else if ( elementOpKeys.indexOf( op ) > -1 ) {
          filters.push( exports.ElementOps[ op ]( path ) );
        } else if ( arrayOps.indexOf( op ) > -1 ) {
          filters.push( arrayOpThunk( op, path, value[ op ] ) );
        } else {
          throw new Error( 'Operator "' + op + '" is not supported.' );
        }
      });
    } else {
      filters.push( comparisonOpThunk( '$eq', path, value ) );
    }
  });

  var filtersLength = filters.length;
  return function( item ) {
    for ( var i = 0; i < filtersLength; i++ ) {
      if ( !filters[ i ]( item ) ) {
        return false;
      }
    }
    return true;
  };
}

function comparisonOpThunk( op, path, value ) {
  var compare = exports.ComparisonOps[ op ];
  return function( item ) {
    return compare( path.get( item ), value );
  };
}

function arrayOpThunk( op, path, query ) {
  var filter = exports.ArrayOps[ op ]( query );
  return function( item ) {
    return filter( path.get( item ) );
  };
}

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

return exports;
} () );

if ( isBrowser ) {
  if ( typeof define === 'function' && define.amd ) {
    define( function() {
      return exports;
    });
  }
  window.query = exports;
} else {
  module.exports = exports;
}

} () );

//# sourceMappingURL=query.js.map