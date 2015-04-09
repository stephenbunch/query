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
