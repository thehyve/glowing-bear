/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {FractalisEtlState} from './fractalis-etl-state';
import {FractalisDataType} from './fractalis-data-type';

export class FractalisData {
  data_type: FractalisDataType;
  etl_message: string;
  etl_state: FractalisEtlState;
  label: string;
  task_id: string;
}
