import { Page } from '../protractor-stories/director';
import MainPage = require('./main.page');

/*
 * pages must be added to this dictionary for the director class to find them.
 */

function initPages() {
  let PageDictionary: { [key: string]: Page } = Object.create(null);

  PageDictionary['main'] = new MainPage;

  return PageDictionary;
}

export = initPages;
