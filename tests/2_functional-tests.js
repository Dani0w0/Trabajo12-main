'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);
const assert = chai.assert;

suite('Functional Tests', function() {
  
  // Test 1: Ver una acción sin likes
  test('Ver una acción sin likes', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });
  
  // Test 2: Ver una acción con likes
  test('Ver una acción con likes', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'likes');
        assert.isAbove(res.body.stockData.likes, 0);
        done();
      });
  });
  
  // Test 3: Comparar dos acciones
  test('Comparar dos acciones', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&stock=MSFT')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        done();
      });
  });
  
  // Test 4: Comparar dos acciones con likes
  test('Comparar dos acciones con likes', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true&stock=MSFT&like=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
  });
  
});
