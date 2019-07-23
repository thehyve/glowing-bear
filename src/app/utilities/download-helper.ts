/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as sanitize from 'sanitize-filename';
import {saveAs} from 'file-saver';

export class DownloadHelper {

  public static downloadJSON(dataObject: object, fileName: string) {
    if (dataObject === null) {
      throw new Error('No data to download.');
    }
    if (fileName === null) {
      throw new Error('Missing file name.');
    }
    fileName = sanitize(fileName.trim());
    if (fileName.length === 0) {
      throw new Error('Empty file name.');
    }
    const blob = new Blob([JSON.stringify(dataObject)], {type: 'text/json'});
    saveAs(blob, `${fileName}.json`, true);
  }

}
