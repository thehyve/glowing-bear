/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class PedigreeRelationTypeResponse {
  private _label: string;
  private _description: string;
  private _biological: boolean;
  private _symmetrical: boolean;

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get biological(): boolean {
    return this._biological;
  }

  set biological(value: boolean) {
    this._biological = value;
  }

  get symmetrical(): boolean {
    return this._symmetrical;
  }

  set symmetrical(value: boolean) {
    this._symmetrical = value;
  }
}
