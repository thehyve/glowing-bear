/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class CountItem {
  private _subjectCount: number;
  private _observationCount: number;

  constructor(subjectCount: number, observationCount: number) {
    this.subjectCount = subjectCount;
    this.observationCount = observationCount;
  }

  get subjectCount(): number {
    return this._subjectCount;
  }

  set subjectCount(value: number) {
    this._subjectCount = value;
  }

  get observationCount(): number {
    return this._observationCount;
  }

  set observationCount(value: number) {
    this._observationCount = value;
  }
}
