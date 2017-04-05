# data-projector

Load and transform datasets

## API


<dl>
<dt><a href="#loadDataset">loadDataset(cwd, path)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Load a dataset from path</p>
</dd>
<dt><a href="#loadTransformDataset">loadTransformDataset(cwd, params)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Load a dataset and transform it using the <code>path</code> and <code>transform</code> specification
in params.</p>
</dd>
<dt><a href="#transformDataset">transformDataset(dataset, transformParams)</a> ⇒ <code>Object</code></dt>
<dd><p>Transform a dataset using <code>transform</code> specification in params.</p>
</dd>
<dt><a href="#calculateStats">calculateStats(dataset, statsParams)</a> ⇒ <code>Object</code></dt>
<dd><p>Calculate statistics (minval, maxval, avg etc.) for a dataset using a stats specification.</p>
</dd>
<dt><a href="#mapDataset">mapDataset(dataset, mapParams)</a> ⇒ <code>Object</code></dt>
<dd><p>Map values in a dataset to produce a new dataset.</p>
</dd>
<dt><a href="#getRow">getRow(dataset, fields)</a> ⇒ <code>Object</code></dt>
<dd><p>Get a single row as an Object.</p>
<p>As this function is curried you can bake in dataset and fields:</p>
<pre><code class="language-javascript">getter = getRow(dataset, null);  // returns a function with first two args satisfied
getter(12);  // get row 12
</code></pre>
</dd>
<dt><a href="#getCell">getCell(dataset, field, index)</a> ⇒ <code>mixed</code></dt>
<dd><p>Get a single data value (row, column)</p>
<p>As this function is curried you can bake in dataset and field:</p>
<pre><code class="language-javascript"> getter = getCell(dataset, &#39;sepalLength&#39;);
 getter(12);  // get value at row 12, field &#39;sepalLength&#39;
</code></pre>
</dd>
<dt><a href="#getColumn">getColumn(dataset, field)</a> ⇒ <code>Array.&lt;mixed&gt;</code></dt>
<dd><p>Get all values for a field (aka column)</p>
<p>As this function is curried you can bake in dataset:</p>
<pre><code class="language-javascript"> getter = getColumn(dataset);
 getter(&#39;sepalLength&#39;);  // get the array of values for the sepalLength field
</code></pre>
</dd>
<dt><a href="#linMap">linMap(dataset, minval, maxval, field)</a> ⇒ <code>Array.&lt;mixed&gt;</code></dt>
<dd><p>Map a dataset value from it&#39;s own extent to the specified linear minval/maxval domain</p>
<p>Create a mapping function by supplying all arguments except the last one:</p>
<pre><code class="language-javascript">f = linMap(dataset, 0, 100, &#39;sepalLength&#39;);
val = f(12);  // Map sepalLength in row 12 to the linear range 0..100
</code></pre>
</dd>
</dl>

<a name="loadDataset"></a>

## loadDataset(cwd, path) ⇒ <code>Promise.&lt;Object&gt;</code>
Load a dataset from path

**Kind**: global function
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise for a dataset

| Param | Type | Description |
| --- | --- | --- |
| cwd | <code>string</code> | Current working directory to resolve relative paths |
| path | <code>string</code> | Absolute or relative path to file |

<a name="loadTransformDataset"></a>

## loadTransformDataset(cwd, params) ⇒ <code>Promise.&lt;Object&gt;</code>
Load a dataset and transform it using the `path` and `transform` specification
in params.

**Kind**: global function
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise for a loaded and transformed dataset

| Param | Type | Description |
| --- | --- | --- |
| cwd | <code>string</code> | Current working directory to resolve relative paths |
| params | <code>Object</code> | transform |

<a name="transformDataset"></a>

## transformDataset(dataset, transformParams) ⇒ <code>Object</code>
Transform a dataset using `transform` specification in params.

**Kind**: global function
**Returns**: <code>Object</code> - dataset

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> | As returned by `loadDataset` or from a previous                          transformation. |
| transformParams | <code>Object</code> | The `transform` object from params |

<a name="calculateStats"></a>

## calculateStats(dataset, statsParams) ⇒ <code>Object</code>
Calculate statistics (minval, maxval, avg etc.) for a dataset using a stats specification.

**Kind**: global function
**Returns**: <code>Object</code> - stats

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> | As returned by loadDataset or from a previous transformation. |
| statsParams | <code>Object</code> | The `transform` object from params |

<a name="mapDataset"></a>

## mapDataset(dataset, mapParams) ⇒ <code>Object</code>
Map values in a dataset to produce a new dataset.

**Kind**: global function
**Returns**: <code>Object</code> - dataset - Transformed dataset. May contain less or more fields.

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> | As returned by loadDataset or from a previous transformation. |
| mapParams | <code>Object</code> | The `map` object from params |

<a name="getRow"></a>

## getRow(dataset, fields) ⇒ <code>Object</code>
Get a single row as an Object.

As this function is curried you can bake in dataset and fields:

```js
getter = getRow(dataset, null);  // returns a function with first two args satisfied
getter(12);  // get row 12
```

**Kind**: global function
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

**Kind**: global function
**Returns**: <code>mixed</code> - - The value for this cell.

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> |  |
| field | <code>string</code> | key of the field to select |
| index | <code>number</code> | integer index of row |

<a name="getColumn"></a>

## getColumn(dataset, field) ⇒ <code>Array.&lt;mixed&gt;</code>
Get all values for a field (aka column)

As this function is curried you can bake in dataset:

```js
 getter = getColumn(dataset);
 getter('sepalLength');  // get the array of values for the sepalLength field
```

**Kind**: global function
**Returns**: <code>Array.&lt;mixed&gt;</code> - - Array of values for this field

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> |  |
| field | <code>string</code> | key of the field to select |

<a name="linMap"></a>

## linMap(dataset, minval, maxval, field) ⇒ <code>Array.&lt;mixed&gt;</code>
Map a dataset value from it's own extent to the specified linear minval/maxval domain

Create a mapping function by supplying all arguments except the last one:

```js
f = linMap(dataset, 0, 100, 'sepalLength');
val = f(12);  // Map sepalLength in row 12 to the linear range 0..100
```

**Kind**: global function
**Returns**: <code>Array.&lt;mixed&gt;</code> - - Array of values for this field

| Param | Type | Description |
| --- | --- | --- |
| dataset | <code>Object</code> |  |
| minval | <code>number</code> | Lower bound of output range |
| maxval | <code>number</code> | Upper bound of output range |
| field | <code>string</code> | key of the field to select |
