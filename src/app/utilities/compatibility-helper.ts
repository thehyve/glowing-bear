import {UAParser} from 'ua-parser-js';

export class CompatibilityHelper {

  static isMSIE(): boolean {
    return UAParser(window.navigator.userAgent).browser.name === 'IE';
  }

}
