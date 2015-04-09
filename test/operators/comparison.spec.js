describe( 'comparison operators', function() {
  describe( '$eq', function() {
    it( 'should return true where both operands are equal', function() {
      var x = 2;
      var y = '2';
      var z = 2;
      var docs = [];
      docs.push({ foo: x });
      docs.push({ foo: y });
      docs.push({ foo: z });
      var result = query( docs ).where({ foo: { $eq: y } }).toArray();
      expect( result.length ).to.equal( 1 );
      expect( result[0].foo ).to.equal( y );
    });
  });
});
