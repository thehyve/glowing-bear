import {DownloadHelper} from './download-helper';

let testObject = {
  testData: {
    elements: [
      'a',
      1234567890,
      {
        field: 'value'
      }
    ],
    version: '1.0'
  }
};

describe('DownloadHelper.downloadJSON', () => {

  it('triggers download of a JSON file', () => {
    DownloadHelper.downloadJSON(testObject, 'test_file');
  });

  it('fails on empty data', () => {
    expect(() =>
      DownloadHelper.downloadJSON(null, 'test_file')
    ).toThrow();
  });

  it('fails on missing name', () => {
    expect(() =>
      DownloadHelper.downloadJSON(testObject, null)
    ).toThrow();
  });

  it('fails on empty name', () => {
    expect(() =>
      DownloadHelper.downloadJSON(testObject, '  ')
    ).toThrow();
  });

  it('fails on only special characters', () => {
    expect(() =>
      DownloadHelper.downloadJSON(testObject, '../*?')
    ).toThrow();
  });

  it('filters out special characters', () => {
    DownloadHelper.downloadJSON(testObject, '../test_file');
  });

});
