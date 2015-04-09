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
