Query.prototype.toArray = function() {
  var iterator = this.iterator();
  var item;
  var result = [];
  while ( !( item = iterator.next() ).done ) {
    result.push( item.value );
  }
  return result;
};
