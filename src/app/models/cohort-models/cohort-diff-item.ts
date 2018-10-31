/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CohortDiffType} from './cohort-diff-type';

export class CohortDiffItem {
  private _id: number;
  private _diffType: CohortDiffType;
  private _objectId: number;


  get diffType(): CohortDiffType {
    return this._diffType;
  }

  set diffType(value: CohortDiffType) {
    this._diffType = value;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get objectId(): number {
    return this._objectId;
  }

  set objectId(value: number) {
    this._objectId = value;
  }
}
