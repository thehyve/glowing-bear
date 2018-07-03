/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Aggregate} from './aggregate';
import {AggregateType} from './aggregate-type';

export class CategoricalAggregate extends Aggregate {
  private _valueCounts: Map<string, number>;

  constructor() {
    super();
    this.valueCounts = new Map<string, number>();
    this.type = AggregateType.CATEGORICAL;
  }
  get values(): Array<string> {
    return Array.from(this.valueCounts.keys());
  }

  get valueCounts(): Map<string, number> {
    return this._valueCounts;
  }

  set valueCounts(value: Map<string, number>) {
    this._valueCounts = value;
  }
}
