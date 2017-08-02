import { $, browser } from 'protractor';
import { Interactable, Page } from '../protractor-stories/director';

/*
 * Must follow the Page interface
 * pages hold all stateless information on a page.
 */
class MainPage implements Page {
  public name: string;
  public url: string;
  public elements: { [name: string]: Interactable };

  public at() {
    let that = this;
    return browser.getCurrentUrl().then(function (currentUrl) {
      return (browser.baseUrl + that.url) === currentUrl;
    });
  }

  constructor() {
    this.name = 'main';
    this.url = '#/';
    this.elements = {};
  }
}

export = MainPage;
