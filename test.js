var fs = require('fs-extra'),
	assert = require('assert'),
	expect = require('expect.js');

describe('Version Controlled storage interface', function() {

	var vsStore = require("./"),
		testKey = '',
		dump = null;

	it('Call init function and set up data folder', function() {
		expect(vsStore.init({
			dataFolder: './temp-test'
		})).to.be(true);
	});

	it('Call init function without parameter should fail', function() {
		assert.equal(vsStore.init(), false);
	});

	it('Get init setup to test if set up successfully', function() {
		var data = vsStore.getInitParams();
		assert.equal(data.dataFolder, './temp-test');
	});

	it('Store test data', function(done) {
		vsStore.store({
			foo: new Date()
		}).then(function(result) {
			assert.equal(result.success, true);
			testKey = result.data;
			done();
		});
	});

	it('Store/Update data with pregiven key', function(done) {
		vsStore.store({
			foo: new Date()
		}, testKey).then(function(result) {
			assert.equal(result.data, testKey);
			done();
		});
	});

	it('Store/Update data without actually sent data should fail', function(done) {
		vsStore.store().then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Get all existing keys', function(done) {
		vsStore.getKeys().then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Read perviously set data', function(done) {
		vsStore.read(testKey).then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Read perviously set data with full history', function(done) {
		vsStore.read(testKey, true).then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Read data without key should fail', function(done) {
		vsStore.read().then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Read data with wrong key should fail', function(done) {
		vsStore.read('aaaa-aaaa-aaaa').then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Check key existance when valid key was given', function(done) {
		vsStore.exists(testKey).then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Check key existance on invalid key should fail', function(done) {
		vsStore.exists('aaaa-aaaa-aaaa').then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Check key existance without actually sent key should fail', function(done) {
		vsStore.exists().then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Delete data by key', function(done) {
		vsStore.store('test', 'test').then(function() {
			vsStore.del('test').then(function(result) {
				assert.equal(result.success, true);
				done();
			});
		});
	});

	it('Delete data without key should fail', function(done) {
		vsStore.del().then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Store multiple data at same time', function(done) {
		vsStore.mset([{
			foo: new Date()
		}, {
			baz: new Date()
		}, {
			xo: new Date()
		}]).then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Store multiple data without sent array should fail', function(done) {
		vsStore.mset().then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Read multiple data at same time', function(done) {
		vsStore.mget([testKey]).then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Read multiple data without sent array should fail', function(done) {
		vsStore.mget().then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Trying to rollback data to an invalid version should fail', function(done) {
		vsStore.rollback(testKey, 99999999999).then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Trying to rollback data without key or version should fail', function(done) {
		vsStore.rollback().then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Rollback data to the first version', function(done) {
		vsStore.rollback(testKey, 1).then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Rollback data to the same version', function(done) {
		vsStore.rollback(testKey, 3).then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Can create dump from all data', function(done) {
		vsStore.dump().then(function(result) {
			assert.equal(result.success, true);
			dump = result.data;
			done();
		});
	});

	it('Can restore dump overwriting all data', function(done) {
		vsStore.restore(dump, './temp-test').then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Can restore dump after wiped out old the folder', function(done) {
		vsStore.restore(dump, './temp-test', true).then(function(result) {
			assert.equal(result.success, true);
			done();
		});
	});

	it('Trying restore without data or folder should fail', function(done) {
		vsStore.restore().then(function(result) {
			assert.equal(result.success, false);
			done();
		});
	});

	it('Get existing keys without data folder should fail', function(done) {
		vsStore.init({
			dataFolder: ''
		});
		vsStore.getKeys().then(function(data) {
			assert.equal(data.success, false);
			done();
		});
	});


});