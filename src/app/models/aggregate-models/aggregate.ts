/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AggregateType} from './aggregate-type';

export class Aggregate {
  private _type: AggregateType;

  get type(): AggregateType {
    return this._type;
  }

  set type(value: AggregateType) {
    this._type = value;
  }
}
