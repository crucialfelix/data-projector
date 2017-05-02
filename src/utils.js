const fs = require('fs');
const { isAbsolute, join } = require('path');
const { csvParse } = require('d3-dsv');
const R = require('ramda');

/**
 * Call a function with one argument,
 * returning a Promise that catches any errors.
 *
 * Called with just a function, it returns a function that will
 * call the function wrapped in a Promise.
 *
 * Call that to invoke the function and get the Promise.
 *
 * @type {Function}
 */
const applyPromise = R.curry((fn, arg) => {
  return new Promise(resolve => resolve(fn.apply(this, [arg])));
});

/**
 * Take a Function or a String to lookup in the functions registry
 * and return the Function.
 *
 * @param  {Object} functions
 * @param  {String|Function} f
 * @return {Function}
 */
function asFunction(functions, f) {
  if (R.is(Function, f)) {
    return f;
  }
  if (R.is(String)) {
    return functions[f];
  }
  throw new TypeError(`Unrecognized function: ${f}`);
}

/**
 * Resolve [path, cwd] to an absolute path,
 * returning a Promise.
 *
 * Rejects if path is invalid
 *
 * @type {Function}
 */
const asAbsolutePath = applyPromise(([cwd, path]) => {
  return isAbsolute(path) ? path : join(cwd || process.cwd(), path);
});

// const readFile = promisify(R.curry(fs.readFile, R._, 'utf8'));

/**
 * readFile returning a Promise for the contents
 *
 * @param  {string} path
 * @return {Promise<string>}
 */
function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Translate d3's quirky format into object: data and fields
 *
 * @param  {Array<Object>} rows   Each row object has a .columns property
 * @return {Object}        {fields: Array<String>, data: Array<Object>}
 */
function reshapeData(rows) {
  return {
    fields: rows.columns,
    data: rows
  };
}

const parseCSV = R.pipeP(applyPromise(csvParse), reshapeData);

function upperCaseFirst(str) {
  return R.concat(R.toUpper(R.head(str)), R.tail(str));
}

function camelCase(words) {
  let first = R.toLower(R.head(words));
  return R.concat(first, R.tail(words).map(upperCaseFirst));
}

// const log = R.tap(console.log);

const slugify = R.pipe(
  // alpha-numeric
  R.replace(/[^a-zA-Z0-9]/, ' '),
  R.split(' '),
  camelCase
);

// infer field types
// assemble enum for string fields
// convert field to number using stats

module.exports = {
  applyPromise,
  asAbsolutePath,
  asFunction,
  parseCSV,
  readFile,
  slugify
};
