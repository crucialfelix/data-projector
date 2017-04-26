var api = require('../api');
var R = require('ramda');
const path = require('path');

const iris = path.join(__dirname, 'iris.csv');
const sepalLength = 'sepal length';

function linToLin(inMin, inMax, outMin, outMax, value) {
  if (value <= inMin) {
    return outMin;
  }
  if (value >= inMax) {
    return outMax;
  }
  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}

/**
 * linear mapping function suitable for use in mapParams
 * @param  {[type]} stats     [description]
 * @param  {[type]} fieldName [description]
 * @param  {[type]} outMin    [description]
 * @param  {[type]} outMax    [description]
 * @param  {[type]} value     [description]
 * @return {[type]}           [description]
 */
function linear(stats, fieldName, outMin, outMax, value) {
  return linToLin(
    stats.fields[fieldName].minval,
    stats.fields[fieldName].maxval,
    outMin,
    outMax,
    value
  );
}

/** --------------------  **/

describe('readParseDataset', function() {
  it('should load dataset from fixture', function() {
    let p = api.readParseDataset(iris);
    expect(p).toBeDefined();
    expect(p.constructor).toBe(Promise);
    return p.then(dataset => {
      expect(dataset.path).toBe(iris);

      // move to internal method testing
      let fields = [
        'sepal length',
        'sepal width',
        'petal length',
        'petal width',
        'species'
      ];
      expect(dataset.fields).toBeDefined();
      expect(dataset.fields).toEqual(fields);

      expect(dataset.data).toBeDefined();

      expect(dataset.data.length).toBe(150);
      let first = dataset.data[0];
      expect(first[sepalLength]).toBeDefined();
    });
  });
});

describe('loadDataset', function() {
  it('should load dataset from fixture, calc stats and cast types', function() {
    let p = api.loadDataset(iris);
    expect(p).toBeDefined();
    return p.then(dataset => {
      expect(dataset.path).toBe(iris);

      // move to internal method testing
      let fields = [
        'sepal length',
        'sepal width',
        'petal length',
        'petal width',
        'species'
      ];
      expect(dataset.fields).toBeDefined();
      expect(dataset.fields).toEqual(fields);

      expect(dataset.data).toBeDefined();

      expect(dataset.data.length).toBe(150);
      let first = dataset.data[0];
      expect(first[sepalLength]).toBeDefined();

      expect(typeof first[sepalLength]).toBe('number');
    });
  });
});

/**
 * Compare a and b using predicate,
 * unless a is NaN in which case return always False
 *
 * ```js
 * let cmp = cmpUnlessNaN(Math.min)
 * cmp(4, 3) => 3
 * cmp('duck', 3) => 3
 * ```
 *
 * @type {Function}
 */

const functions = {};

const statsParams = {
  fields: {
    sum: R.sum,
    mean: R.mean
  }
};

describe('calculateStats', function() {
  it('should calculate minval/maxval for sepalLength', function() {
    return api.readParseDataset(iris).then(dataset => {
      const { stats } = api.calculateStats(functions, statsParams, dataset);
      expect(stats).toBeDefined();
      // undefined
      // minval maxval should still be there
      expect(stats.fields[sepalLength].sum).toBeCloseTo(876.5000000000002);
      expect(stats.fields[sepalLength].mean).toBeCloseTo(5.843333333333335);
    });
  });

  it('should calc default stats', function() {
    return api.readParseDataset(iris).then(dataset => {
      const { stats } = api.calculateStats(functions, {}, dataset);
      expect(stats).toBeDefined();
      // undefined
      // minval maxval should still be there
      expect(stats.fields[sepalLength].minval).toBeCloseTo(4.3);
      expect(stats.fields[sepalLength].maxval).toBeCloseTo(7.9);
      expect(stats.fields[sepalLength].type).toEqual({
        null: false,
        type: 'number'
      });
    });
  });

  it('should merge requested stats with default stats', () => {
    return api.readParseDataset(iris).then(dataset => {
      const { stats } = api.calculateStats(functions, statsParams, dataset);
      expect(stats).toBeDefined();
      // undefined
      // minval maxval should still be there
      expect(stats.fields[sepalLength].minval).toBeDefined();
      expect(stats.fields[sepalLength].minval).toBeCloseTo(4.3);
      expect(stats.fields[sepalLength].maxval).toBeCloseTo(7.9);
      expect(stats.fields[sepalLength].type).toEqual({
        null: false,
        type: 'number'
      });
    });
  });
});

const mapParams = [
  {
    input: sepalLength,
    output: 'pan',
    fn: (stats, fieldName, v) => v * 2
  },
  {
    input: sepalLength,
    output: 'freq',
    fn: linear,
    args: [0, 1000]
  },
  // if no fn then pass through
  {
    input: sepalLength,
    output: sepalLength
  }
];

describe('mapDataset', function() {
  it('should map sepal length to pan and double each value', function() {
    return api.loadDataset(iris).then(dataset => {
      let t = api.mapDataset(functions, mapParams, dataset);
      expect(t.data).toBeDefined();
      let first = dataset.data[0];
      let firstT = t.data[0];
      expect(firstT).toBeTruthy();

      expect(firstT['pan']).toBeCloseTo(first[sepalLength] * 2);

      // second mapping
      let stats = dataset.stats.fields[sepalLength];
      let mapped = linToLin(
        stats.minval,
        stats.maxval,
        0,
        1000,
        first[sepalLength]
      );
      expect(firstT['freq']).toBeCloseTo(mapped);

      // pass through
      expect(firstT[sepalLength]).toEqual(first[sepalLength]);
    });
  });

  // test with looked up function
});

describe('makeMapFunction', () => {
  it('should make func with no extra args', () => {
    let mapParam = {
      fn: (stats, fieldName, value) => value + 1
    };

    let f = api.makeMapFunction({}, {}, mapParam);
    let v = f(1);
    expect(v).toEqual(2);
  });

  it('should make func with 2 extra args', () => {
    let mapParam = {
      fn: (stats, fieldName, arg1, arg2, value) => value + arg1 + arg2,
      args: [2, 3]
    };

    let f = api.makeMapFunction({}, {}, mapParam);
    let v = f(1);
    expect(v).toEqual(1 + 2 + 3);
  });

  it('should make func with lookup', () => {
    let fns = {
      op: (stats, fieldName, arg1, arg2, value) => value + arg1 + arg2
    };
    let mapParam = {
      fn: 'op',
      args: [2, 3]
    };

    let f = api.makeMapFunction(fns, {}, mapParam);
    let v = f(1);
    expect(v).toEqual(1 + 2 + 3);
  });
});

describe('getColumn', function() {
  it('should pick sepal length', function() {
    return api.readParseDataset(iris).then(dataset => {
      let col = api.getColumn(dataset, sepalLength);
      expect(col.length).toBe(150);
    });
  });
});

describe('getCell', function() {
  it('should get first row first cell', function() {
    return api.readParseDataset(iris).then(dataset => {
      let cel = api.getCell(dataset, sepalLength, 0);
      expect(cel).toBe('5.1');
    });
  });
});

describe('project', () => {
  it('should return a loaded and mapped dataset', () => {
    return api
      .project(functions, iris, statsParams, mapParams)
      .then(dataset => {
        let cel = api.getCell(dataset, sepalLength, 0);
        expect(cel).toBe(5.1);

        let first = dataset.data[0];
        expect(first['pan']).toBeCloseTo(first[sepalLength] * 2);
      });
  });
});
