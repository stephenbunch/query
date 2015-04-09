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
