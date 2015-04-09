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
