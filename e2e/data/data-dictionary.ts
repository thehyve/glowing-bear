import { Example } from './templates';

/*
 * test data must be added to this dictionary for the director class to find them.
 */
function initDataDictionary() {
  let dataDictionary: { [key: string]: any } = Object.create(null);

  [
    new Example('dataID', {
      'title': 'some tile'
    })
  ].forEach(function (data) {     // create a map out of the list of data objects
    dataDictionary[data.dataID] = data;
  });

  return dataDictionary;
}

export = initDataDictionary;
