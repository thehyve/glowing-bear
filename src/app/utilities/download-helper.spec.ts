/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
