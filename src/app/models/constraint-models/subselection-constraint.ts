/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';

export class SubselectionConstraint extends Constraint {
  private _dimension: string;
  private _child: Constraint;

  constructor(dimension: string, child: Constraint) {
    super();
    this.dimension = dimension;
    this.child = child;
  }

  get dimension(): string {
    return this._dimension;
  }

  set dimension(value: string) {
    this._dimension = value;
  }

  get child(): Constraint {
    return this._child;
  }

  set child(value: Constraint) {
    this._child = value;
  }

  get className(): string {
    return 'SubselectionConstraint';
  }
}
