const api = require('./src/api');
const curry = require('ramda/src/curry');
const map = require('ramda/src/map');

module.exports = map(curry, api);
