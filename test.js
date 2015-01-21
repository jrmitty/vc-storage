var fs = require('fs-extra'),
	assert = require('assert'),
	expect = require('expect.js');

describe('Version Controlled storage interface', function() {

	describe('Behavioral tests', function() {

		var vsStore = require("./"),
			testKey = '';

		it('Calling init function and set data folder', function() {
			expect(vsStore.init({
				dataFolder: './temp'
			})).to.be(true);
		});

		it('Calling without parameter should fail', function() {
			assert.equal(vsStore.init(), false);
		});

		it('Get data which was set up previously', function() {
			var data = vsStore.getInitParams();
			assert.equal(data.dataFolder, './temp');
		});

		it('Storing test data', function(done) {
			vsStore.store({
				foo: 'bar'
			}).then(function(data) {
				assert.notEqual(data._key, undefined);
				testKey = data._key;
				done();
			});
		});

		it('Storing test data with pregiven key', function(done) {
			vsStore.store({
				foo: 'bar'
			}, 'testkey').then(function(data) {
				assert.equal(data._key, 'testkey');
				done();
			});
		});

		it('Update data with known key', function(done) {
			vsStore.store({
				foo: 'bar'
			}, testKey).then(function(data) {
				assert.equal(data._key, testKey);
				done();
			});
		});

		it('Get existing keys', function(done) {
			vsStore.getKeys().then(function(data) {
				assert.notEqual(data, undefined);
				done();
			});
		});

		it('Read perviously set data', function(done) {
			vsStore.read(testKey).then(function(data) {
				assert.deepEqual(data, {
					foo: 'bar',
					_key: testKey
				});
				done();
			});
		});

		it('Read perviously set data with full history', function(done) {
			vsStore.read(testKey).then(function(data) {
				assert.deepEqual(data, {
					foo: 'bar',
					_key: testKey
				});
				done();
			});
		});

		it('Check if the key is exists', function(done) {
			vsStore.exists(testKey).then(function(data) {
				assert.equal(data, true);
				done();
			});
		});

		it('Check data with non-existing key', function(done) {
			vsStore.exists('aaaa-aaaa-aaaa').then(function(data) {
				assert.equal(data, false);
				done();
			});
		});

		it('Delete data key', function(done) {
			vsStore.del(testKey).then(function(data) {
				assert.equal(data, true);
				done();
			});
		});

		it('Delete non-existing key', function(done) {
			vsStore.del('aaaa-aaaa-aaaa').then(function(data) {
				assert.equal(data, true);
				done();
			});
		});

	});

	describe('Error tests', function() {

		var vsStore = require("./");

		beforeEach(function() {
			vsStore.init({
				dataFolder: ''
			});
		});

		it('Test if data folder is not set up', function() {
			var data = vsStore.getInitParams();
			assert.equal(data.dataFolder, '');
		});

		it('Get existing keys - without data folder', function(done) {
			vsStore.getKeys().then(function(data) {
				expect(data).to.be.an(Error);
				done();
			});
		});

		it('Get existing keys - from wrong folder', function(done) {
			vsStore.init({
				dataFolder: './aaaa'
			});
			vsStore.getKeys().then(function(data) {
				expect(data).to.be.an(Error);
				done();
			});
		});

	});


});