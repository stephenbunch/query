exports.ComparisonOps = {
  $eq: function( item, value ) {
    return item === value;
  },

  $gt: function( item, value ) {
    return item > value;
  },

  $gte: function( item, value ) {
    return item >= value;
  },

  $lt: function( item, value ) {
    return item < value;
  },

  $lte: function( item, value ) {
    return item <= value;
  },

  $ne: function( item, value ) {
    return item !== value;
  },

  $in: function( item, value ) {
    return value.indexOf( item ) > -1;
  },

  $nin: function( item, value ) {
    return value.indexOf( item ) === -1;
  }
};
