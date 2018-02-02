'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, closeServer, runServer} = require('../server');

const expect = chai.expect;

const recipesRouter= require('../recipesRouter');

describe('recipesRouter', function () {

  before(function () {
    return runServer();
  });

  after(function(){
    return closeServer();
  });

  // GET METHOD NORMAL CASE
  it('returns all recipes', function (){
    return chai.request(app)
      .get('/recipes')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');

        expect(res.body.length).to.be.at.least(1);

        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  // POST METHOD NORMAL CASE
  it('requires a `name` and `ingredients`', function (){
    const newItem = {name: 'pizza', ingredients: 'sauce, dough, pepperoni, cheese' };
    return chai.request(app)
      .post('/recipes')
      .send(newItem)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');

        expect(res.body.id).to.not.equal(null);

        expect(res.body).to.include.keys('name', 'ingredients');
        expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

  // POST METHOD EDGE CASE

  // DELETE METHOD NORMAL CASE
  it('permanently deletes an item', function (){
    return chai.request(app)
      .get('/recipes')
      .then(function (res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });

  // UPDATE METHOD NORMAL CASE
  it('modifies the values `name` and `ingredients`', function() {
    const updateData = {
      name: 'pizza',
      ingredients: 'too much sauce'
    };

    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.deep.equal(updateData);
      });
  });

});
