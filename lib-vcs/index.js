"use strict";

var vsStore = module.exports,
	promise = require('node-promise'),
	fs = require('fs-extra'),
	moment = require('moment'),
	/**
	 * [_getGuid description]
	 * @private
	 * @return {[type]} [description]
	 */
	_getGuid = function _getGuid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	initParams = {
		dataFolder: ''
	};

/**
 * Initialize and set up data folder and other mandatory parameters
 * @param  Object
 * @return Bool
 * @example
 * ```javascript
 *
 * vsstore.init({
 *   dataFolder: './datastore'
 * });
 * ```
 */
vsStore.init = function(setup) {
	if (setup === undefined) {
		return false;
	}
	initParams.dataFolder = setup.dataFolder;
	return true;
};

/**
 * Show the defined init parameters
 * @return Object
 * @example
 * ```javascript
 *
 * vsstore.getInitParams();
 * ```
 */
vsStore.getInitParams = function() {
	return initParams;
};

/**
 * Give all existing keys
 * @return Array List of guid keys
 * @example
 * ```javascript
 *
 * vsstore.getKeys().then(function(result){
 *     console.info('keys:', result);
 * });
 * ```
 */
vsStore.getKeys = function() {
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
 * Storing data with guid key. If the key is provided, it will change and version will bump
 * @param  Object  data
 * @param  GUID  key
 * @return GUID
 * @example
 * ```javascript
 *
 * vsstore.store({
 *     foo: 'bar'
 * }).then(function(data) {
 *     console.info('resolved', data);
 * });
 * ```
 */
vsStore.store = function(data, key) {
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
				newContent._history[data._modified] = {
					_version: data._version,
					_modified: data._modified,
					content: data.content
				};
			}
			newContent._version += 1;
			newContent._modified = moment().format();
			newContent.content = contentData;
			newContent.content._key = guid;
			fs.outputFile(filePath, JSON.stringify(newContent), function(err) {
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
 * @param  GUID key
 * @param  Bool history
 * @return Object
 * @example
 * ```javascript
 *
 * vsstore.read('3c1c273a-09ea-4788-719d-b8fe8953eae6').then(function(data){
 *     console.info('resolved:', data);
 * });
 * ```
 */
vsStore.read = function(key, history) {
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
					data: result
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
 * [del description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
vsStore.del = function(key) {
	var deferred = new promise.Promise();

	if (key === undefined || key === '') {
		deferred.resolve({
			success: false,
			message: new Error('"key" is not defined')
		});
	} else {
		fs.remove(initParams.dataFolder + '/' + key, function(err) {
			deferred.resolve({
				success: true
			});
		});
	}

	return deferred;
};

/**
 * [exists description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
vsStore.exists = function(key) {
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
 * [mset description]
 * @param  {[type]} array [description]
 * @return {[type]}       [description]
 */
vsStore.mset = function(array) { // Only for creation yet
	var deferred = new promise.Promise(),
		setMList = function setMList(list) {
			var i = 0,
				deferred = new promise.Promise(),
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
 * Get multiple object on the same time
 * @param  array [description]
 * @return Object
 */
vsStore.mget = function(array) { // Currently only without history
	var deferred = new promise.Promise(),
		setGList = function setGList(list) {
			var i = 0,
				deferred = new promise.Promise(),
				gList = [];
			list.forEach(function(item) {
				gList.push(vsStore.read(item));
			});
			deferred.resolve(gList);
			return deferred;
		};

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


vsStore.rollback = function(key, version) {
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
							vsStore.store(history[prop].content, key).then(function(stored) {
								if (stored.success === true) {
									deferred.resolve({
										success: true,
										data: history[prop].content
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


/* var vsstore = require('./vsstore.js'); */



/* TODO

- dump - restore

*/