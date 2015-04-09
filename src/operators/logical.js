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
