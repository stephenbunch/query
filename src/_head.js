( function() {

'use strict';

var isBrowser = !( typeof module !== 'undefined' && module.exports );
var pathy = isBrowser ? window.pathy : require( 'pathy' );
var _;

if ( isBrowser ) {
  _ = window._;
} else {
  try {
    _ = require( 'lodash' );
    _ = require( 'underscore' );
  } catch ( err ) { }
}

var exports = ( function() {

var exports = function( source ) {
  return new Query( source );
};
