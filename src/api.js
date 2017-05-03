const _ = require('ramda');
const { readFile, parseCSV, asFunction } = require('./utils');
const { fieldsStats, globalStats, pairwiseStats } = require('./stats');

/**
 * Load a dataset from disk, calculate statistics and apply transformations
 *
 * @param  {Object} functions - Named function registery
 * @param  {String} path
 * @param  {Object} statsParams
 * @param  {Array<Object>} mapParams
 * @returns {Object}            Dataset
 */
function project(functions, path, statsParams, mapParams) {
  return loadDataset(path, functions, statsParams).then(dataset => {
    return mapDataset(functions, mapParams, dataset);
  });
  // return _.composeP(
  //   applyPromise(mapDataset(functions, mapParams)),
  //   loadDataset(_path, functions, statsParams)
  // )(path);
}

/**
 * Load and parse a dataset from path.
 * Stats are not yet calculated so types are unknown
 * and all fields are strings.
 *
 * @param {String} path - Absolute path to file
 * @returns {Promise<Object>} Promise for a dataset
 */
function readParseDataset(path) {
  return _.composeP(
    dataset =>
      Promise.resolve(createDataset(dataset.data, dataset.fields, path)),
    parseCSV,
    readFile
  )(path);
}

/**
 * Load and parse a dataset and calculate stats and coerce types of field values.
 *
 * @param {String} path - Absolute path to file
 * @param {Object} functions - Named function registery
 * @param {Object} statsParams - The `stats` object from params
 * @returns {Promise<Object>} Promise for a dataset
 */
function loadDataset(path, functions, statsParams) {
  return readParseDataset(path)
    .then(dataset => calculateStats(functions, statsParams, dataset))
    .then(dataset => castTypes(dataset));
}

/**
 * Create a dataset object from an array of objects
 *
 * @param {Object} data - [{field: value, field2: value}, ...]
 * @param {Array<String>} fields - Field names
 * @param {String} path
 * @returns {Object} dataset - {data, fields, path}
 */
function createDataset(data, fields, path) {
  // If you rename field then you need to rename it in the data
  // If there is more than one empty field then the data must already be
  // broken.
  let rows = data;
  let fieldNames = fields.map((name, i) => {
    if (!_.isEmpty(name)) {
      return name;
    }
    let ii = String(i);
    rows = rows.map(row => {
      row[ii] = row[name];
      delete row[name];
      return row;
    });
    return ii;
  });

  return {
    data: rows,
    fields: fieldNames,
    path
  };
}

/**
 * Calculate statistics (minval, maxval, avg etc.) for a dataset using a stats specification.
 *
 * @param {Object} functions - Named function registery
 * @param {Object} statsParams - The `stats` object from params
 * @param {Object} dataset - As returned by loadDataset or from a previous transformation.
 * @returns {Object} stats
 */
function _calculateStats(functions, statsParams, dataset) {
  let params = statsParams || {};
  return {
    global: globalStats(functions, dataset, params.global),
    fields: fieldsStats(functions, dataset, params.fields),
    pairwise: pairwiseStats(functions, dataset, params.pairwise)
  };
}

/**
 * Calculate statistics and return a new dataset objects with .stats set
 *
 * @param {Object} functions - Named function registery
 * @param {Object} statsParams
 * @param {Object} dataset
 * @returns {Object} dataset
 */
function calculateStats(functions, statsParams, dataset) {
  return _.assoc(
    'stats',
    _calculateStats(functions, statsParams, dataset),
    dataset
  );
}

/**
 * Having guessed types with calculateStats, cast all fields to the guessed types.
 *
 * - This converts '1.1' to 1.1
 * - Enums of strings to their integer indices
 * - Date strings to Date objects
 * - String fields with high cardinality remain strings
 *
 * @param  {Object} dataset Dataset object
 * @return {Object}         Dataset object with values cast to guessed types
 */
function castTypes(dataset) {
  const castField = (key, value) => {
    const type = dataset.stats.fields[key].type;
    if (!type) {
      throw new Error(
        `No 'type' found in stats for '${key}':\n${JSON.stringify(dataset.stats, null, 2)}`
      );
    }
    switch (type.type) {
      case 'number':
        return Number(value); // possibly null
      case 'string':
        return value;
      case 'enum':
        // type.enum.values() indexOf item
        return value;
      default:
        return value;
    }
  };
  const castRow = row => {
    return _.mapObjIndexed((value, key) => {
      return castField(key, value);
    }, row);
  };
  return _.merge(dataset, { data: dataset.data.map(castRow) });
}

/**
 * Load a dataset and transform it using the `path` and `transform` specification
 * in params.
 *
 * This is for radically transforming a dataset. eg. to do PCA or other
 * dimensionality reduction or to make reduced rows for summaries.
 *
 * @param {String} cwd - Current working directory to resolve relative paths
 * @param {Object} params - transform
 * @returns {Promise<Object>} Promise for a loaded and transformed dataset
 */
// function loadTransformDataset(cwd, params) {
//   return loadDataset(cwd, params.path).then(dataset =>
//     transformDataset(dataset, params.transform)
//   );
// }

/**
 * Transform a dataset using `transform` specification in params.
 *
 * @param {Object} dataset - As returned by `loadDataset` or from a previous
 *                          transformation.
 * @param {Object} transformParams - The `transform` object from params
 * @returns {Object} dataset
 */
// function transformDataset(functions, transformParams, dataset) {
//   //
// }

/**
 * mapDataset
 *
 * Map input fields to output fields using mapping functions as specified in
 * mapParams
 *
 * ```js
 * {
 *    input: 'inFieldName',
 *    output: 'outFieldName'
 *    fn: 'linear',  // named function in functions registry
 *    args: [0, 1]   // parameters for linear mapping function
 * }
 * ```
 *
 * fn may be a String key to a function in the functions registery
 * or a function(stats, fieldName, [...args], value)
 *
 * @param {Object} functions - Named function registery
 * @param {Array<Object>} mapParams
 * @param {Object} dataset
 */
function mapDataset(functions, mapParams, dataset) {
  if (!mapParams || !mapParams.length) {
    return dataset;
  }

  const fields = new Set();
  const mappers = _.map(mapParam => {
    fields.add(mapParam.output);
    return {
      fn: makeMapFunction(functions, dataset.stats, mapParam),
      input: mapParam.input,
      output: mapParam.output
    };
  }, mapParams);

  const mapRow = row => {
    const obj = {};
    _.map(m => {
      obj[m.output] = m.fn(row[m.input]);
    }, mappers);
    return obj;
  };
  const data = dataset.data.map(mapRow);

  return createDataset(data, Array.from(fields), dataset.path);
}

/**
 * makeMapFunction from mapParam
 *
 * mapParam:
 *  .fn
 *  .args
 *
 * Where fn is a Function or a String key to lookup Function in `functions`
 *
 * Function should accept: (stats, fieldName, ...args, value)
 *
 * Args are optional array of params to configure your mapping function.
 * eg. [minval, maxval]
 *
 * This curries the function and calls it with:
 * (stats, fieldName, ...args) and returns that mapping function which accepts just value
 * and returns the mapped value.
 *
 * @param {Object} functions - Named function registery
 * @param  {Object} stats
 * @param  {Object} mapParam
 * @return {Function}          any => any
 */
function makeMapFunction(functions, stats, mapParam) {
  let fn = mapParam.fn
    ? asFunction(functions, mapParam.fn)
    : identityMapFunction;
  // (stats, fieldName, [...args], value)
  let args = mapParam.args || [];
  let numArgs = 3 + args.length;
  if (fn.length !== numArgs) {
    throw new Error(
      `Mapping function ${mapParam.input} : ${fn} should have ${numArgs} args: stats, fieldName, [...args], value`
    );
  }
  return _.curry(fn)(stats, mapParam.input, ...args);
}

const identityMapFunction = (stats, input, value) => value;

/**
 * Transform a dataset to produce a new dataset with possibly different dimensionality.
 *
 *
 * @param {Object} dataset - As returned by loadDataset or from a previous transformation.
 * @param {Object} transform - The `transform` object from params
 * @returns {Object} dataset - Transformed dataset. May contain less or more fields.
 */
// function transformDataset(dataset, mapParams) {}

/**
 * Get a single row as an Object.
 *
 * As this function is curried you can bake in dataset and fields:
 *
 * ```js
 * getter = getRow(dataset, null);  // returns a function with first two args satisfied
 * getter(12);  // get row 12
 * ```
 *
 * @param {Object} dataset
 * @param {Array<string>|null} fields - Optionally select just the fields you need.
 *                                    null selects all fields.
 * @returns {Object} - The object for this row.
 */
function getRow(dataset, index) {
  return dataset.data[index];
}

/**
 * Get a single data value (row, column)
 *
 * As this function is curried you can bake in dataset and field:
 *
 * ```js
 *  getter = getCell(dataset, 'sepalLength');
 *  getter(12);  // get value at row 12, field 'sepalLength'
 * ```
 *
 * @param {Object} dataset
 * @param {String} field - key of the field to select
 * @param {Number} index - integer index of row
 * @returns {mixed} - The value for this cell.
 */
function getCell(dataset, field, index) {
  return dataset.data[index][field];
}

/**
 * Get all values for a column
 *
 * As this function is curried you can bake in dataset:
 *
 * ```js
 *  getter = getColumn(dataset);
 *  getter('sepalLength');  // get the array of values for the sepalLength field
 * ```
 *
 * @param {Object} dataset
 * @param {String} field - key of the field to select
 * @returns {Array<mixed>} - Array of values for this field
 */
function getColumn(dataset, field) {
  return _.map(_.prop(field), dataset.data);
}

/**
  * Map a dataset value from it's own extent to the specified linear minval/maxval domain
  *
  * Create a mapping function by supplying all arguments except the last one:
  *
  * ```js
  * f = linMap(dataset, 0, 100, 'sepalLength');
  * val = f(12);  // Map sepalLength in row 12 to the linear range 0..100
  * ```
  *
  * @param {Object} dataset
  * @param {Number} minval - Lower bound of output range
  * @param {Number} maxval - Upper bound of output range
  * @param {String} field - key of the field to select
  * @returns {Array<mixed>} - Array of values for this field
  */
// function linMap(dataset, minval, maxval, field, index) {}

module.exports = {
  project,
  loadDataset,
  readParseDataset,
  // loadTransformDataset,
  // transformDataset,
  mapDataset,
  makeMapFunction,
  calculateStats,
  castTypes,
  getRow,
  getCell,
  getColumn,
  createDataset
  // linMap
};
