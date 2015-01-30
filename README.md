VC Storage
==========
[![npm version](https://badge.fury.io/js/vc-storage.png)](http://badge.fury.io/js/vc-storage)

[![Build Status](https://travis-ci.org/jrmitty/vc-storage.svg)](https://travis-ci.org/jrmitty/vc-storage)

## What is this
Super simple file-based data store, all data is version controlled, GUID identified, flexible and scalable

## Installation

`npm install vc-storage`

## Usage

1. Load library to project `vsStore = require('vc-storage');`
2. Init data storing folder ` vsStore.init({ dataFolder: './datastore' });`
3. You're done.

## Methods

### Initialize set up and store parameters during runtime
- @param	{Object}	data	Any common storage parameters, currently the data folder is mandatory for proper working.
- @return	{Boolean}	True if the process was successful

```javascript
vsStore.init({
    dataFolder: './datastore'
});
```

### Show the pre-defined init parameters - currently only the data folder
- @return	{Object}	Object with pre-defined parameters

```javascript
vsStore.getInitParams();
```

### Read all existing keys
- @return	{Promise}	Array with all keys

```javascript
vsStore.getKeys().then(function(result){
    console.info('keys:', result);
});
```

### Storing data with guid key.
If the key is provided, it will change and version will bump with one
- @param	{Object}	data	Any kind of standard javascript object which can be stringified and need to be placed into the data file
- @param	{String}	key	Standard key for the data object
- @return	{Promise}	Object with stored key

```javascript
vsStore.store({
    foo: 'bar'
}).then(function(data) {
    console.info('resolved', data);
});
```

### Read data by it's GUID.
If `history` is `true`, the whole object going to send
- @param	{String}	key	Standard key for the data object
- @param	{Boolean}	history	If true the whole object will read, not just the current version
- @return	{Promise}	Object with read data

```javascript
vsStore.read('aaa-bbb-ccc-ddd', true).then(function(data){
    console.info('resolved:', data);
});
```

### Delete a data object. This process is undoable
- @param	{String}	key	Standard key for the data object
- @return	{Promise}	Boolean

```javascript
vsStore.del('aaa-bbb-ccc-ddd');
```

### Show if the requested data object is exist or not
- @param	{String}	key	Standard key for the data object
- @return	{Promise}	Boolean

```javascript
vsStore.exists('aaa-bbb-ccc-ddd');
```

### Set multiple object at the same time.
Currently not supporting overwrites, just creation
- @param	{Array}	data	Array of data, each will placed into a new object
- @return	{Promise}	Array with stored keys

```javascript
vsStore.mset(array);
```

### Get multiple object at the same time
- @param	{Array}	data	Array of keys
- @param	{Boolean}	history	If true the whole object will read, not just the current version
- @return	{Promise}	Array with read data

```javascript
vsStore.mget(array, true);
```

### Roll back a data file into a given version
The rollback process also will generate a new version and not change the meta data, only the content
- @param	{String}	key	Standard key for the data object
- @param	{Int}	version	Previous number of version (should be exists)
- @return	{Promise}	Object, with the requested version of data

```javascript
vsStore.rollback('aaa-bbb-ccc-ddd', 2);
```


### Create a dump object from the whole data folder
- @return	{Promise}	Array

```javascript
vsStore.dump();
```

### Restore a previously dumped data folder
- @param	{Array}	data	Each contained object should be a key/value pair, where the key will be the name of the data file
- @param	{String}	folder	The folder where the restore will happen
- @param	{Boolean}	clear	If true, the found folder will wipe out before restoring
- @return	{Promise}	Success:true

```javascript
vsStore.restore(array, './datafolder', true);
```


## LICENSE
The MIT License (MIT)

Copyright (c) 2015 Nicholas Urban

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
