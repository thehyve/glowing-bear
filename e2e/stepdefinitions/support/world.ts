import { Director } from '../../protractor-stories/director';

let { defineSupportCode } = require('cucumber');
import initPages = require ('../../pages/page-dictionary');
import initPersonaDictionary = require('../../personas/persona-dictionary');
import initDataDictionary = require('../../data/data-dictionary');

/*
 *
 * The world class is recreated at the start of a cucumber scenario.
 * It is given as the 'this' context to steps and hooks
 * Here it is used to create the director class at the start of a scenario so it can be accessed with this.director in every step
 */
class World {
  public director;
  public scenarioData; // used to store data for a future step

  constructor() {
    this.director = new Director(__dirname + '/..', initPages(), initPersonaDictionary(), initDataDictionary);
  }
}

function initWorld() {
  return new World();
}

defineSupportCode(function ({ setWorldConstructor }) {
  setWorldConstructor(initWorld);
});
