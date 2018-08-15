/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class TrialVisit {
  private _id: string;
  private _relTimeLabel: string;
  private _relTimeunit: string;
  private _relTime: number;
  private _label: string;

  constructor(id?: string) {
    this.id = id ? id : '';
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get relTimeLabel(): string {
    return this._relTimeLabel;
  }

  set relTimeLabel(value: string) {
    this._relTimeLabel = value;
    this.label = this.relTimeLabel + '(' + this.id + ')';
  }

  get relTimeunit(): string {
    return this._relTimeunit;
  }

  set relTimeunit(value: string) {
    this._relTimeunit = value;
  }

  get relTime(): number {
    return this._relTime;
  }

  set relTime(value: number) {
    this._relTime = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }
}
