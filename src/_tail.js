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
