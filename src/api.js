/**
 * Load a dataset from path
 *
 * @param {string} cwd - Current working directory to resolve relative paths
 * @param {string} path - Absolute or relative path to file
 * @returns {Promise<Object>} Promise for a dataset
 */
function loadDataset(cwd, path) {}

/**
 * Load a dataset and transform it using the `path` and `transform` specification
 * in params.
 *
 * @param {string} cwd - Current working directory to resolve relative paths
 * @param {Object} params - transform
 * @returns {Promise<Object>} Promise for a loaded and transformed dataset
 */
function loadTransformDataset(cwd, params) {}

/**
 * Transform a dataset using `transform` specification in params.
 *
 * @param {Object} dataset - As returned by `loadDataset` or from a previous
 *                          transformation.
 * @param {Object} transformParams - The `transform` object from params
 * @returns {Object} dataset
 */
function transformDataset(dataset, transformParams) {}

/**
 * Calculate statistics (minval, maxval, avg etc.) for a dataset using a stats specification.
 *
 * @param {Object} dataset - As returned by loadDataset or from a previous transformation.
 * @param {Object} statsParams - The `transform` object from params
 * @returns {Object} stats
 */
function calculateStats(dataset, statsParams) {}

/**
 * Map values in a dataset to produce a new dataset.
 *
 * @param {Object} dataset - As returned by loadDataset or from a previous transformation.
 * @param {Object} mapParams - The `map` object from params
 * @returns {Object} dataset - Transformed dataset. May contain less or more fields.
 */
function mapDataset(dataset, mapParams) {}

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
function getRow(dataset, fields, index) {}

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
 * @param {string} field - key of the field to select
 * @param {number} index - integer index of row
 * @returns {mixed} - The value for this cell.
 */
function getCell(dataset, field, index) {}

/**
 * Get all values for a field (aka column)
 *
 * As this function is curried you can bake in dataset:
 *
 * ```js
 *  getter = getColumn(dataset);
 *  getter('sepalLength');  // get the array of values for the sepalLength field
 * ```
 *
 * @param {Object} dataset
 * @param {string} field - key of the field to select
 * @returns {Array<mixed>} - Array of values for this field
 */
function getColumn(dataset, field) {}

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
  * @param {number} minval - Lower bound of output range
  * @param {number} maxval - Upper bound of output range
  * @param {string} field - key of the field to select
  * @returns {Array<mixed>} - Array of values for this field
  */
function linMap(dataset, minval, maxval, field, index) {}

module.exports = {
  loadDataset,
  loadTransformDataset,
  transformDataset,
  calculateStats,
  mapDataset,
  getRow,
  getCell,
  getColumn,
  linMap,
};
