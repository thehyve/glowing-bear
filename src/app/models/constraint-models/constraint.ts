/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ConstraintMark} from './constraint-mark';

export class Constraint {

  static readonly BASIC_DIMENSION: string = 'patient';

  // The textual representation of this constraint
  protected _textRepresentation: string;
  // The enum indicating the purpose of the constraint: is it for querying subjects? Or observations?
  protected _mark: ConstraintMark;
  // The parent constraint
  protected _parentConstraint: Constraint;
  // The negation flag indicating whether to add a logical negation to the constraints
  protected _negated: boolean;
  // The dimension for which observations will be selected
  private _dimension: string;

  constructor() {
    this.textRepresentation = '';
    this.mark = ConstraintMark.OBSERVATION;
    this.parentConstraint = null;
    this.negated = false;
    this.dimension = Constraint.BASIC_DIMENSION;
  }

  get negated(): boolean {
    return this._negated;
  }

  set negated(value: boolean) {
    this._negated = value;
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

  get dimension(): string {
    return this._dimension;
  }

  set dimension(value: string) {
    this._dimension = value;
  }
}
