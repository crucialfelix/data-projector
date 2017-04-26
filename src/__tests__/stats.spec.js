var stats = require('../stats');
var api = require('../api');

describe('guessType', function() {
  it('should detect number, non-null', function() {
    let t = stats.guessType(['1', '0.2', '1']);
    expect(t.type).toBe('number');
    expect(t.null).toBe(false);
  });

  it('should detect number, null', function() {
    let t = stats.guessType(['', '0.2', '1']);
    expect(t.type).toBe('number');
    expect(t.null).toBe(true);
  });

  it('should detect string with enums', function() {
    let t = stats.guessType([
      'one',
      'two',
      'one',
      'two',
      'one',
      'two',
      'one',
      'two'
    ]);
    expect(t.type).toBe('enum');
    expect(t.enum).toBeDefined();
    expect(t.enum.size).toBe(2);
  });

  it('should detect string, not an enum', function() {
    let t = stats.guessType([
      'one',
      'two',
      'three',
      'four',
      'five',
      'size',
      'seven',
      'eight'
    ]);
    expect(t.type).toBe('string');
    expect(t.enum).not.toBeDefined();
  });
});

describe('castTypes', function() {
  it('should cast numbers', function() {
    // complicated to construct this
    let t = stats.guessType(['1', '0.2', '1']);
    expect(t.type).toBe('number');
    expect(t.null).toBe(false);
  });
});

// castTypes
