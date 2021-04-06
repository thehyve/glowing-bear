/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 CHUV
 * Copyright 2021 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class Constraint {

  // The textual representation of this constraint
  protected _textRepresentation: string;
  // The parent constraint
  protected _parentConstraint: Constraint;
  // i2b2 timing policiy
  protected _panelTimingSameInstance?: boolean;


  constructor() {
    this.textRepresentation = '';
    this.parentConstraint = null;
    this._panelTimingSameInstance = null;
  }

  get textRepresentation(): string {
    return this._textRepresentation;
  }

  set textRepresentation(value: string) {
    this._textRepresentation = value;
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
  clone(): Constraint {
    let ret = new Constraint()
    ret.textRepresentation = this.textRepresentation
    ret.panelTimingSameInstance = this.panelTimingSameInstance

    ret.parentConstraint = (this._parentConstraint) ? this._parentConstraint : null
    return ret
  }
  set panelTimingSameInstance(val: boolean) {
    this._panelTimingSameInstance = val
  }

  get panelTimingSameInstance(): boolean {
    return this._panelTimingSameInstance
  }

  /**
   *  inputValueValidity check that all values needed values are defined for concept with textual or numerical constraint.
   *  Parent class Constraint does not have such field and is by default valid.
   */

  get inputValueValidity(): boolean {
    return true
  }
}
