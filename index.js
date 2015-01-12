"use strict";

var vsStore = module.exports,
	promise = require('node-promise'),
	fs = require('fs-extra'),
	moment = require('moment'),
	getGuid = function getGuid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	dataFolder = '';

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
	dataFolder = setup.dataFolder;
	return true;
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
	if (dataFolder === '') {
		deferred.reject();
	}
	fs.readdir(dataFolder, function(err, files) {
		if (err) {
			deferred.reject();
		}
		deferred.resolve(files);
	});
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
		guid = (key !== undefined) ? key : getGuid(),
		contentData = data,
		filePath = dataFolder + '/' + guid,
		newContent = {
			_version: 0,
			_modified: null,
			_history: {},
			content: {}
		};
	if (data === undefined) {
		deferred.reject();
	}
	if (dataFolder === '') {
		deferred.reject();
	}
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
			if (err) {
				deferred.reject();
			}
			deferred.resolve({
				_key: guid
			});
		});
	});
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
	if (key === undefined) {
		deferred.reject();
	}
	if (dataFolder === '') {
		deferred.reject();
	}
	fs.readJson(dataFolder + '/' + key, function(err, data) {
		if (err) {
			deferred.reject();
		}
		result = (history === true) ? data : data.content;
		deferred.resolve(result);
	});
	return deferred;
};


/* var vsstore = require('./vsstore.js'); */