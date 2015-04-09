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
