# data-projector

Load CSV datasets and map / transform the data for use.

- Load CSV datasets
- Guess types and cast data fields to types
- Calculate stats: global, fields and pairwise (field by field correlations etc)
- Map datasets to other datasets using transform functions

This is designed to take a specification object (JSON) and load a dataset and optionally map values to requested ranges.

The JSON specification objects can be saved in your application for use in presets.

Status: ALPHA

Currently all transformation functions are to be supplied when you

## API

<a name="project"></a>

## project(functions, path, statsParams, mapParams) ⇒ <code>Object</code>
Load a dataset from disk, calculate statistics and apply transformations


**Returns**: <code>Object</code> - Dataset

| Param | Type | Description |
| --- | --- | --- |
| functions | <code>Object</code> | Named function registery |
| path | <code>String</code> |  |
| statsParams | <code>Object</code> |  |
| mapParams | <code>Array.&lt;Object&gt;</code> |  |

<a name="readParseDataset"></a>

## readParseDataset(path) ⇒ <code>Promise.&lt;Object&gt;</code>
Load and parse a dataset from path.
Stats are not yet calculated so types are unknown
and all fields are strings.


**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise for a dataset

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | Absolute path to file |

<a name="loadDataset"></a>

## loadDataset(path, functions, statsParams) ⇒ <code>Promise.&lt;Object&gt;</code>
Load and parse a dataset and calculate stats and coerce types of field values.


**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise for a dataset

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | Absolute path to file |
| functions | <code>Object</code> | Named function registery |
| statsParams | <code>Object</code> | The `stats` object from params |

<a name="createDataset"></a>

## createDataset(data, fields, path) ⇒ <code>Object</code>
Create a dataset object from an array of objects


**Returns**: <code>Object</code> - dataset - {data, fields, path}

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | [{field: value, field2: value}, ...] |
| fields | <code>Array.&lt;String&gt;</code> | Field names |
| path | <code>String</code> |  |

<a name="_calculateStats"></a>

## _calculateStats(functions, statsParams, dataset) ⇒ <code>Object</code>
Calculate statistics (minval, maxval, avg etc.) for a dataset using a stats specification.


**Returns**: <code>Object</code> - stats

| Param | Type | Description |
| --- | --- | --- |
| functions | <code>Object</code> | Named function registery |
| statsParams | <code>Object</code> | The `stats` object from params |
| dataset | <code>Object</code> | As returned by loadDataset or from a previous transformation. |

<a name="calculateStats"></a>

## calculateStats(functions, statsParams, dataset) ⇒ <code>Object</code>
Calculate statistics and return a new dataset objects with .stats set


**Returns**: <code>Object</code> - dataset

| Param | Type | Description |
| --- | --- | --- |
| functions | <code>Object</code> | Named function registery |
| statsParams | <code>Object</code> |  |
| dataset | <code>Object</code> |  |

<a name="castTypes"></a>

## castTypes(dataset) ⇒ <code>Object</code>
Having guessed types with calculateStats, cast all fields to the guessed types.

- This converts '1.1' to 1.1
- Enums of strings to their integer indices
- Date strings to Date objects
- String fields with high cardinality remain strings


**Returns**: <code>Object</code> - Dataset object with values cast to guessed types

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> | Dataset object |

<a name="mapDataset"></a>

## mapDataset(functions, mapParams, dataset)
mapDataset

Map input fields to output fields using mapping functions as specified in
mapParams

```js
{
   input: 'inFieldName',
   output: 'outFieldName'
   fn: 'linear',  // named function in functions registry
   args: [0, 1]   // parameters for linear mapping function
}
```

fn may be a String key to a function in the functions registery
or a function(stats, fieldName, [...args], value)



| Param | Type | Description |
| --- | --- | --- |
| functions | <code>Object</code> | Named function registery |
| mapParams | <code>Array.&lt;Object&gt;</code> |  |
| dataset | <code>Object</code> |  |

<a name="makeMapFunction"></a>

## makeMapFunction(functions, stats, mapParam) ⇒ <code>function</code>
makeMapFunction from mapParam

mapParam:
 .fn
 .args

Where fn is a Function or a String key to lookup Function in `functions`

Function should accept: (stats, fieldName, ...args, value)

Args are optional array of params to configure your mapping function.
eg. [minval, maxval]

This curries the function and calls it with:
(stats, fieldName, ...args) and returns that mapping function which accepts just value
and returns the mapped value.


**Returns**: <code>function</code> - any => any

| Param | Type | Description |
| --- | --- | --- |
| functions | <code>Object</code> | Named function registery |
| stats | <code>Object</code> |  |
| mapParam | <code>Object</code> |  |

<a name="getRow"></a>

## getRow(dataset, fields) ⇒ <code>Object</code>
Get a single row as an Object.

As this function is curried you can bake in dataset and fields:

```js
getter = getRow(dataset, null);  // returns a function with first two args satisfied
getter(12);  // get row 12
```


**Returns**: <code>Object</code> - - The object for this row.

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> |  |
| fields | <code>Array.&lt;string&gt;</code> \| <code>null</code> | Optionally select just the fields you need.                                    null selects all fields. |

<a name="getCell"></a>

## getCell(dataset, field, index) ⇒ <code>mixed</code>
Get a single data value (row, column)

As this function is curried you can bake in dataset and field:

```js
 getter = getCell(dataset, 'sepalLength');
 getter(12);  // get value at row 12, field 'sepalLength'
```


**Returns**: <code>mixed</code> - - The value for this cell.

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> |  |
| field | <code>String</code> | key of the field to select |
| index | <code>Number</code> | integer index of row |

<a name="getColumn"></a>

## getColumn(dataset, field) ⇒ <code>Array.&lt;mixed&gt;</code>
Get all values for a column

As this function is curried you can bake in dataset:

```js
 getter = getColumn(dataset);
 getter('sepalLength');  // get the array of values for the sepalLength field
```


**Returns**: <code>Array.&lt;mixed&gt;</code> - - Array of values for this field

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> |  |
| field | <code>String</code> | key of the field to select |
