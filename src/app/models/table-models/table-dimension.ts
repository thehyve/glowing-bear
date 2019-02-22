/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TableDimensionValue} from './table-dimension-value';

export class TableDimension {
  private _name: string;
  // the names of the categorical values that this dimension contains
  private _values: TableDimensionValue[];

  constructor(name: string) {
    this.name = name;
    this.values = [];
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get values(): TableDimensionValue[] {
    return this._values;
  }

  set values(value: TableDimensionValue[]) {
    this._values = value;
  }
}
