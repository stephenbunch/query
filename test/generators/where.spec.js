describe( '.where( filter )', function() {
  it( 'should only return items where filter returns true', function() {
    var nums = query([ 1, 2, 3, 4, 5]).where( function( num ) {
      return num % 2 === 0;
    }).toArray();
    expect( nums ).to.eql([ 2, 4 ]);
  });
});
