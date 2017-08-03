import { Promise } from 'es6-promise';
import { ElementArrayFinder } from 'protractor';

export function doInOrder<T>(parameterArray: Array<T>, method: (T) => Promise<any>): Promise<any> {
  if (parameterArray.length > 0) {
    return method(parameterArray.pop()).then(() => {
      return doInOrder(parameterArray, method);
    });
  }
}

export function promiseTrue(checkResult: boolean, message: string): Promise<any> {
  return new Promise(function (resolve, reject) {
    if (checkResult) {
      resolve();
    } else {
      reject('promiseTrue failure: ' + message);
    }
  });
}

export function checkTextElement(element, expectedText): Promise<any> {
  return element.getText().then(function (text) {
    return promiseTrue(text === expectedText, text + ' is not equal to ' + expectedText);
  });
}

export function checkInputElement(element, expectedText): Promise<any> {
  return element.getAttribute('value').then(function (text) {
    return promiseTrue(text === expectedText, text + ' is not equal to ' + expectedText);
  });
}

export function checkCheckBox(element, expected) {
  return element.isSelected().then(function (value) {
    return promiseTrue(value === expected, value + ' is not equal to ' + expected);
  });
}

export function copyData(data) {
  return JSON.parse(JSON.stringify(data));
}

export function countIs(elementArray: ElementArrayFinder, expectedCount: number): Promise<any> {
  return elementArray.count().then((count) => {
    return promiseTrue(count === expectedCount, 'expected: ' + expectedCount + ' elements but found: ' + count);
  });
}
