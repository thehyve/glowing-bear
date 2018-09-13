/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ConstraintMark} from './constraint-mark';

export class Constraint {

  // The textual representation of this constraint
  protected _textRepresentation: string;
  // The enum indicating the purpose of the constraint: is it for querying subjects? Or observations?
  protected _mark: ConstraintMark;
  // The parent constraint
  protected _parentConstraint: Constraint;

  constructor() {
    this.textRepresentation = '';
    this.mark = ConstraintMark.OBSERVATION;
    this.parentConstraint = null;
  }

  get textRepresentation(): string {
    return this._textRepresentation;
  }

  set textRepresentation(value: string) {
    this._textRepresentation = value;
  }

  get mark(): ConstraintMark {
    return this._mark;
  }

  set mark(value: ConstraintMark) {
    this._mark = value;
  }

  get parentConstraint(): Constraint {
    return this._parentConstraint;
  }

  set parentConstraint(value: Constraint) {
    this._parentConstraint = value;
  }

  get className(): string {
    return 'Constraint';
  }
}
