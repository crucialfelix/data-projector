const utils = require('../utils');
// var R = require('ramda');

describe('readFile', function() {
  it('', function() {});
});

describe('applyPromise', function() {
  it('should resolve with no error', function() {
    const f = x => x + 1;
    return utils.applyPromise(f, 1).then(two => {
      expect(two).toEqual(2);
    });
  });

  it('should reject with an error', function() {
    const f = x => {
      throw new Error(`oops: ${x}`);
    };
    return utils.applyPromise(f, 1).catch(error => {
      expect(typeof error).toBe('object');
      expect(error.constructor).toBe(Error);
    });
  });
});
