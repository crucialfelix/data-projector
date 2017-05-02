const _ = require('ramda');
const parseDate = require('fecha').parse;
const { asFunction } = require('./utils');
// global stats functions
const numRows = dataset => dataset.data.length;
const numCols = dataset => dataset.fields.length;

// fields stats functions
// reduce array to the min/max val ignoring any NaN
const minval = _.reduce(
  (acc, value) => (isNaN(Number(value)) ? acc : Math.min(acc, value)),
  Infinity
);
const maxval = _.reduce(
  (acc, value) => (isNaN(Number(value)) ? acc : Math.max(acc, value)),
  -Infinity
);
/**
 * Guess type by examining values in field
 * @type {Function}
 */
const _guessType = _.reduce((acc, value) => {
  if (!value) {
    return _.merge(acc, { null: true });
  }

  if (!isNaN(Number(value))) {
    // is type already number ?
    if (acc.type === 'number') {
      return acc;
    }
    if (!acc.type) {
      return _.merge(acc, { type: 'number' });
    }
    return _.merge(acc, { mixed: true });
  }

  // date ?
  // if already set to date then just make sure it parses the currently set one
  if (acc.dateFormat) {
    let check = parseDate(value, acc.dateFormat);
    if (!check) {
      // mixed date format
      console.log(
        `Mixed date format detected ${value} is not ${acc.dateFormat}`
      );
    }
    return acc;
  }

  // const _parseDate = _.curry(parseDate)(value);
  const dateFormat = _.find(fmt => parseDate(value, fmt), dateFormats);
  if (dateFormat) {
    return _.merge(acc, { type: 'date', dateFormat });
  }

  // string
  return _.merge(acc, { type: 'string', enum: acc.enum.add(value) });
});

const dateFormats = [
  'ddd MMM DD YYYY HH:mm:ss',
  'dddd, MMMM D, YYYY',
  'YYYY-MM-DD',
  'M/D/YY',
  'MMM D, YYYY',
  'MMMM D, YYYY'
];

const guessType = xs => {
  let typeMeta = _guessType({ type: null, null: false, enum: new Set() }, xs);
  // if string and enum < 25% then enum
  //  else no enum just string
  if (typeMeta.type === 'string') {
    return typeMeta.enum.size > xs.length * 0.25
      ? _.dissoc('enum', typeMeta) // not an enum
      : _.assoc('type', 'enum', typeMeta); // type is enum
  }

  return _.dissoc('enum', typeMeta);
};

const defaultGlobalParams = {
  numRows,
  numCols
};

const defaultFieldsStats = {
  minval,
  maxval,
  type: guessType
};

function globalStats(functions, dataset, params = defaultGlobalParams) {
  // {name: func. ...} call each func with dataset.data
  return _.map(params, fn => fn(dataset.data));
}

/**
 * For each column (field) produce stats using each of the supplied {name: func, ... }
 *
 *  fields: {
 *    minval: minval,
 *    maxval: maxval
 *  }
 *
 * @param  {[type]} dataset     [description]
 * @param  {Array}  [params=[]] [description]
 * @return {[type]}             [description]
 */
function fieldsStats(functions, dataset, params = {}) {
  const _params = _.merge(defaultFieldsStats, params);
  const stats = {};
  for (let fieldName of dataset.fields) {
    stats[fieldName] = fieldStats(functions, dataset, _params, fieldName);
  }
  return stats;
}

function fieldStats(functions, dataset, params, fieldName) {
  const columnValues = _.pluck(fieldName, dataset.data);
  // assert that it takes exactly 1 arg
  return _.map(fn => {
    const f = asFunction(functions, fn);
    if (f.length !== 1) {
      throw new Error(
        `Field stats function should take only 1 argument. length:${f.length}`
      );
    }
    return f(columnValues);
  }, params);
}

/**
 * Call a function with each pair of column values.
 * Use with correlation, rSquared functions
 *
 * @param  {[type]} dataset     [description]
 * @param  {Object} [params={}] {statName: function, ...}
 * @return {Object}             ```js
 *                              {
 *                                field1: {
 *                                  statName: {
 *                                    field1: result,
 *                                    field2: result2
 *                                    // ...
 *                                  }
 *                                }
 *                                // ...
 *                               }
 *                               ```
 */
function pairwiseStats(functions, dataset, params = {}) {
  const fields = dataset.fields.map(field => ({
    name: field,
    values: _.pick(field, dataset.data)
  }));
  const stats = {};

  const compareWithPair = _.curry((fn, values, otherField) => {
    return fn(values, otherField.values);
  });

  // map each field into stats
  fields.forEach(({ name, values }) => {
    stats[name] = _.map(
      // map each function in params
      // to an object of pairwise comparisons
      // get fn from functions
      fn => _.map(compareWithPair(asFunction(functions, fn), values), fields),
      params
    );
  });
}

module.exports = {
  fieldsStats,
  globalStats,
  pairwiseStats,
  guessType
};
