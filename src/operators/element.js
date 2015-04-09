exports.ElementOps = {
  $exists: function( path ) {
    return function( item ) {
      return path.exists( item );
    };
  }
};
