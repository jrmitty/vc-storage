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
			}).then(function(result) {
				assert.notEqual(result.data, undefined);
				testKey = result.data;
				done();
			});
		});

		it('Storing test data with pregiven key', function(done) {
			vsStore.store({
				foo: 'bar'
			}, 'testkey').then(function(result) {
				assert.equal(result.data, 'testkey');
				done();
			});
		});

		it('Update data with known key', function(done) {
			vsStore.store({
				foo: 'bar'
			}, testKey).then(function(result) {
				assert.equal(result.data, testKey);
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
				assert.equal(data.success, true);
				done();
			});
		});

		it('Read perviously set data with full history', function(done) {
			vsStore.read(testKey).then(function(data) {
				assert.equal(data.success, true);
				done();
			});
		});

		it('Check if the key is exists', function(done) {
			vsStore.exists(testKey).then(function(data) {
				assert.equal(data.success, true);
				done();
			});
		});

		it('Check data with non-existing key', function(done) {
			vsStore.exists('aaaa-aaaa-aaaa').then(function(data) {
				assert.equal(data.success, false);
				done();
			});
		});

		it('Delete data key', function(done) {
			vsStore.del(testKey).then(function(data) {
				assert.equal(data.success, true);
				done();
			});
		});

		it('Delete non-existing key', function(done) {
			vsStore.del('aaaa-aaaa-aaaa').then(function(data) {
				assert.equal(data.success, true);
				done();
			});
		});

		it('Create multiple values', function(done) {
			vsStore.mset([{
				foo: 'bar'
			}, {
				baz: 'zzz'
			}, {
				xo: 'abc'
			}]).then(function(response) {
				assert.equal(response.success, true);
				done();
			});
		});

		it('Read multiple values', function(done) {
			vsStore.mget(['testkey']).then(function(response) {
				assert.equal(response.success, true);
				done();
			});
		});

		it('Rollback test item to first version', function(done) {
			vsStore.rollback('testkey', 1).then(function(response) {
				assert.equal(response.success, true);
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

		it('Storing without data', function(done) {
			vsStore.store().then(function(data) {
				assert.equal(data.success, false);
				done();
			});
		});

		it('Trying read without key', function(done) {
			vsStore.read().then(function(data) {
				assert.equal(data.success, false);
				done();
			});
		});

		it('Trying read not existing data', function(done) {
			vsStore.read('ooo-eee').then(function(data) {
				assert.equal(data.success, false);
				done();
			});
		});

		it('Get existing keys - without data folder', function(done) {
			vsStore.getKeys().then(function(data) {
				assert.equal(data.success, false);
				done();
			});
		});

		it('Check data existance - without key', function(done) {
			vsStore.exists().then(function(data) {
				assert.equal(data.success, false);
				done();
			});
		});

		it('Remove data - without key', function(done) {
			vsStore.del().then(function(data) {
				assert.equal(data.success, false);
				done();
			});
		});

		it('Create multiple values - no data array added', function(done) {
			vsStore.mset().then(function(response) {
				assert.equal(response.success, false);
				done();
			});
		});

		it('Read multiple values without key', function(done) {
			vsStore.mget().then(function(response) {
				assert.equal(response.success, false);
				done();
			});
		});

		it('Rollback without key', function(done) {
			vsStore.rollback('', 1).then(function(response) {
				assert.equal(response.success, false);
				done();
			});
		});

		//it('Rollback to future version', function(done) {
		//	vsStore.rollback('testkey', 99999999999).then(function(response) {
		//		assert.equal(response.success, false);
		//		done();
		//	});
		//});

	});


});