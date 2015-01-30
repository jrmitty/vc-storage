"use strict";

var vsStore = module.exports,
	promise = require('node-promise'),
	fs = require('fs-extra'),
	moment = require('moment'),
	_s4 = function _s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	},
	_getGuid = function _getGuid() {
		return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + _s4() + _s4();
	},
	initParams = {
		dataFolder: ''
	};

/**
 * Initialize set up and store parameters during runtime
 * @param	{Object}	data	Any common storage parameters, currently the data folder is mandatory for proper working.
 * @return	Boolean	True if the process was successful
 * @example
 * ```javascript
 *
 * vsStore.init({
 *   dataFolder: './datastore'
 * });
 * ```
 */
vsStore.init = function init(setup) {
	if (setup === undefined) {
		return false;
	}
	initParams.dataFolder = setup.dataFolder;
	return true;
};

/**
 * Show the pre-defined init parameters - currently only the data folder
 * @return	Object	Object with pre-defined parameters
 * @example
 * ```javascript
 *
 * vsStore.getInitParams();
 * ```
 */
vsStore.getInitParams = function getInitParams() {
	return initParams;
};

/**
 * Read all existing keys
 * @return	{Promise}	Array with all keys
 * @example
 * ```javascript
 *
 * vsStore.getKeys().then(function(result){
 *     console.info('keys:', result);
 * });
 * ```
 */
vsStore.getKeys = function getKeys() {
	var deferred = new promise.Promise();
	if (initParams.dataFolder === '') {
		deferred.resolve({
			success: false,
			message: 'Data storing folder is not set'
		});
	} else {
		fs.readdir(initParams.dataFolder, function(err, keys) {
			deferred.resolve({
				success: true,
				data: keys
			});
		});
	}
	return deferred;
};

/**
 * Storing data with guid key. If the key is provided, it will change and version will bump with one
 * @param	{Object}	data	Any kind of standard javascript object which can be stringified and need to be placed into the data file
 * @param	{String}	key	Standard key for the data object
 * @return	{Promise}	Object with stored key
 * @example
 * ```javascript
 *
 * vsStore.store({
 *     foo: 'bar'
 * }).then(function(data) {
 *     console.info('resolved', data);
 * });
 * ```
 */
vsStore.store = function store(data, key) {
	var deferred = new promise.Promise(),
		guid = (key !== undefined) ? key : _getGuid(),
		contentData = data,
		filePath = initParams.dataFolder + '/' + guid,
		newContent = {
			_version: 0,
			_modified: null,
			_history: {},
			content: {}
		};

	if (data === undefined || data === '') {
		deferred.resolve({
			success: false,
			message: new Error('"data" is not defined')
		});
	} else {
		fs.readJson(filePath, function(err, data) {
			if (!err) {
				newContent = data;
				newContent._history[data._modified + '_' + _s4()] = {
					_version: data._version,
					_modified: data._modified,
					content: data.content
				};
			}
			newContent._version += 1;
			newContent._modified = moment().format();
			newContent.content = contentData;
			newContent.content._key = guid;
			fs.outputFile(filePath, JSON.stringify(newContent), function() {
				deferred.resolve({
					success: true,
					data: guid
				});
			});
		});
	}

	return deferred;
};

/**
 * Read data by it's GUID. If `history` is `true`, the whole object going to send
 * @param	{String}	key	Standard key for the data object
 * @param	{Boolean}	history	If true the whole object will read, not just the current version
 * @return	{Promise}	Object with read data
 * @example
 * ```javascript
 *
 * vsStore.read('aaa-bbb-ccc-ddd', true).then(function(data){
 *     console.info('resolved:', data);
 * });
 * ```
 */
vsStore.read = function read(key, history) {
	var deferred = new promise.Promise(),
		result = null;

	if (key === undefined || key === '') {
		deferred.resolve({
			success: false,
			message: new Error('"key" is not defined')
		});
	} else {
		fs.readJson(initParams.dataFolder + '/' + key, function(err, data) {
			try {
				result = (history === true) ? data : data.content;
				deferred.resolve({
					success: true,
					data: result,
					key: key
				});
			} catch (err) {
				deferred.resolve({
					success: false,
					message: err
				});
			}
		});
	}

	return deferred;
};

/**
 * Delete a data object. This process is undoable
 * @param	{String}	key	Standard key for the data object
 * @return	{Promise}	Boolean
 * @example
 * ```javascript
 *
 * vsStore.del('aaa-bbb-ccc-ddd');
 * ```
 */
vsStore.del = function del(key) {
	var deferred = new promise.Promise();

	if (key === undefined || key === '') {
		deferred.resolve({
			success: false,
			message: new Error('"key" is not defined')
		});
	} else {
		fs.remove(initParams.dataFolder + '/' + key, function() {
			deferred.resolve({
				success: true
			});
		});
	}

	return deferred;
};

/**
 * Show if the requested data object is exist or not
 * @param	{String}	key	Standard key for the data object
 * @return	{Promise}	Boolean
 * @example
 * ```javascript
 *
 * vsStore.exists('aaa-bbb-ccc-ddd');
 * ```
 */
vsStore.exists = function exists(key) {
	var deferred = new promise.Promise();

	if (key === undefined || key === '') {
		deferred.resolve({
			success: false,
			message: new Error('"key" is not defined')
		});
	} else {
		fs.exists(initParams.dataFolder + '/' + key, function(exists) {
			if (!exists) {
				deferred.resolve({
					success: false
				});
			} else {
				deferred.resolve({
					success: true
				});
			}
		});
	}

	return deferred;
};

/**
 * Set multiple object at the same time. Currently not supporting overwrites, just creation
 * @param	{Array}	data	Array of data, each will placed into a new object
 * @return	{Promise}	Array with stored keys
 * @example
 * ```javascript
 *
 * vsStore.mset(array);
 * ```
 */
vsStore.mset = function mset(array) {
	var deferred = new promise.Promise(),
		setMList = function setMList(list) {
			var deferred = new promise.Promise(),
				mList = [];
			list.forEach(function(item) {
				mList.push(vsStore.store(item));
			});
			deferred.resolve(mList);
			return deferred;
		};

	try {
		setMList(array).then(function(mList) {
			promise.all(mList).then(function(keys) {
				deferred.resolve({
					success: true,
					data: keys
				});
			});
		});
	} catch (err) {
		deferred.resolve({
			success: false,
			message: err
		});
	}

	return deferred;
};

/**
 * Get multiple object at the same time
 * @param	{Array}	data	Array of keys
 * @param	{Boolean}	history	If true the whole object will read, not just the current version
 * @return	{Promise}	Array with read data
 * @example
 * ```javascript
 *
 * vsStore.mget(array, true);
 * ```
 */
vsStore.mget = function mget(array, history) {
	var deferred = new promise.Promise(),
		setGList = function setGList(list) {
			var deferred = new promise.Promise(),
				gList = [];
			list.forEach(function(item) {
				gList.push(vsStore.read(item, history));
			});
			deferred.resolve(gList);
			return deferred;
		};

	history = (history === true) ? true : undefined;

	try {
		setGList(array).then(function(gList) {
			promise.all(gList).then(function(dataItems) {
				deferred.resolve({
					success: true,
					data: dataItems
				});
			});
		});
	} catch (err) {
		deferred.resolve({
			success: false,
			message: err
		});
	}

	return deferred;
};

/**
 * Roll back a data file into a given version. The rollback process also will generate a new version and not change the meta data, only the content
 * @param	{String}	key	Standard key for the data object
 * @param	{Int}	version	Previous number of version (should be exists)
 * @return	{Promise}	Object, with the requested version of data
 * @example
 * ```javascript
 *
 * vsStore.rollback('aaa-bbb-ccc-ddd', 2);
 * ```
 */
vsStore.rollback = function rollback(key, version) {
	var deferred = new promise.Promise();

	if (key === undefined || key === '' || version === undefined || version === '') {
		deferred.resolve({
			success: false,
			message: new Error('"key" and "version" also need to be defined')
		});
	} else {
		vsStore.read(key, true).then(function(dataFile) {
			if (dataFile.data._version < version) {
				deferred.resolve({
					success: false,
					message: new Error('There is no such a version number')
				});
			} else if (dataFile.data._version == version) {
				deferred.resolve({
					success: false,
					message: new Error('The selected version is the current one')
				});
			} else {
				var history = dataFile.data._history;
				for (var prop in history) {
					if (history.hasOwnProperty(prop)) {
						if (history[prop]._version === version) {
							var copy = history[prop].content;
							vsStore.store(copy, key).then(function(stored) {
								if (stored.success === true) {
									deferred.resolve({
										success: true,
										data: copy
									});
								}
							});
						}
					}
				}
			}
		});
	}

	return deferred;
};

/**
 * Create a dump object from the whole data folder
 * @return	{Promise}	Array
 * @example
 * ```javascript
 *
 * vsStore.dump();
 * ```
 */
vsStore.dump = function dump() {
	var dumplist = [],
		deferred = new promise.Promise();
	vsStore.getKeys()
		.then(function(response) {
			vsStore.mget(response.data, true, true)
				.then(function(response) {
					var data = response.data;
					data.forEach(function(item) {
						dumplist.push({
							key: item.key,
							value: item.data
						});
					});
					deferred.resolve({
						success: true,
						data: dumplist
					});
				});
		});

	return deferred;
};

/**
 * Restore a previously dumped data folder
 * @param	{Array}	data	Each contained object should be a key/value pair, where the key will be the name of the data file
 * @param	{String}	folder	The folder where the restore will happen
 * @param	{Boolean}	clear	If true, the found folder will wipe out before restoring
 * @return	{Promise}	Success:true
 * @example
 * ```javascript
 *
 * vsStore.restore(array, './datafolder', true);
 * ```
 */
vsStore.restore = function restore(dumpfile, folder, clear) {
	var deferred = new promise.Promise();

	if (dumpfile === undefined || dumpfile === '' && folder === undefined || folder === '') {
		deferred.resolve({
			success: false,
			message: new Error('"dumpfile" or "folder" is not defined')
		});
	} else {
		if (clear === true) {
			fs.removeSync(folder);
		}
		fs.ensureDir(folder, function() {
			for (var prop in dumpfile) {
				if (dumpfile.hasOwnProperty(prop)) {
					fs.outputJsonSync(folder + '/' + dumpfile[prop].key, dumpfile[prop].value);
				}
			}
			deferred.resolve({
				success: true
			});
		});
	}

	return deferred;
};