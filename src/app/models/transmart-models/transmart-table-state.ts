/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TransmartSort} from './transmart-sort';

export class TransmartTableState {
  public rowDimensions: string[] = [];
  public columnDimensions: string[] = [];
  public rowSort: TransmartSort[] = [];
  public columnSort: TransmartSort[] = [];

  constructor(rowDimensions: string[], columnDimensions: string[]) {
    this.rowDimensions = rowDimensions;
    this.rowSort = [];
    this.columnDimensions = columnDimensions;
    this.columnSort = [];
  }

}
