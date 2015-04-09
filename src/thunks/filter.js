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
