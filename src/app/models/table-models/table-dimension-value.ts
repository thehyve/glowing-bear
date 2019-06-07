/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class TableDimensionValue {
  private _name: string;
  private _metadata: Map<string, string>;

  constructor(name: string, metadata?: Map<string, string>) {
    if (metadata != null && metadata.size) {
      this.name = name + ' ⓘ';
      this.metadata = metadata;
    } else {
      this.name = name;
      this.metadata = new Map()
    }
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get metadata():  Map<string, string> {
    return this._metadata;
  }

  set metadata(map: Map<string, string>) {
    this._metadata = map;
  }
}
