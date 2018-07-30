/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class Study {
  private _id: string;
  private _dimensions: string[];
  private _public: boolean;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get dimensions(): string[] {
    return this._dimensions;
  }

  set dimensions(value: string[]) {
    this._dimensions = value;
  }

  get public(): boolean {
    return this._public;
  }

  set public(value: boolean) {
    this._public = value;
  }

}
