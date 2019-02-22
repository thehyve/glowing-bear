/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class Dimension {
  private _name: string;
  private _sortIndex: number;

  constructor(label: string) {
    this.name = label;
  }

  get sortIndex(): number {
    return this._sortIndex;
  }

  set sortIndex(value: number) {
    this._sortIndex = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }
}
