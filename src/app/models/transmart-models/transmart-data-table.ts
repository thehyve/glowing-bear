/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TransmartDimension} from './transmart-dimension';
import {TransmartRow} from 'app/models/transmart-models/transmart-row';
import {TransmartSort} from './transmart-sort';
import {TransmartColumnHeaders} from './transmart-column-headers';

export class TransmartDataTable {
  rows: Array<TransmartRow>;
  columnHeaders: Array<TransmartColumnHeaders>;
  rowDimensions: Array<TransmartDimension>;
  columnDimensions: Array<TransmartDimension>;
  sort: Array<TransmartSort>;
  offset: number;
  rowCount: number;
}
