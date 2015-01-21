VC Storage
==========
[![npm version](https://badge.fury.io/js/vc-storage.png)](http://badge.fury.io/js/vc-storage)

[![Build Status](https://travis-ci.org/jrmitty/vc-storage.svg)](https://travis-ci.org/jrmitty/vc-storage)


## What is this
Super simple file-based data store, all data is version controlled, GUID identified, flexible and scalable


## Installation

`npm install vc-storage`


## Usage

1. Load library to project

`vcstorage = require('vc-storage');`

2. Init data storing folder

```javascript
  vsstore.init({
    dataFolder: './datastore'
  });
```

3. Store or load data as wish

```javascript
vsstore.getKeys().then(function(result){
    console.info('keys:', result);   // Array
});

vsstore.store({
    foo: 'bar'
}).then(function(result) {
    console.info('resolved', result);   // '3c1c273a-09ea-4788-719d-b8fe8953eae6'
});

vsstore.read('3c1c273a-09ea-4788-719d-b8fe8953eae6').then(function(result){
    console.info('resolved:', result);   // {foo: 'bar'}
});
```


## Methods

 - `getKeys()` - giving back all existing keys in storage folder as an array
 - `store(data [, id])` - storing object in the default folder, giving back it's GUID if success. If the ID is given and exists the version will bump to the next
 - `read(id [, history])` - loading the data of given ID. In default the latest version getting only, if the second parameter is `true`, the whole history will output too


## Further Todos

- Feature extension: rollback, dump/restore, mget/mset (multiple)


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
