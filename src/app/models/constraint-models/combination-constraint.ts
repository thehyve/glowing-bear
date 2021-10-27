/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Constraint } from './constraint';
import { CombinationState } from './combination-state';

export class CombinationConstraint extends Constraint {

  private _children: Constraint[];
  private _combinationState: CombinationState;
  private _isRoot: boolean;


  constructor() {
    super();
    this._children = [];
    this.combinationState = CombinationState.And;
    this.isRoot = false;
    this.textRepresentation = 'Group';
  }

  get className(): string {
    return 'CombinationConstraint';
  }

  addChild(constraint: Constraint) {

    if (!(<CombinationConstraint>constraint).isRoot) {
      // to enforce polymorphism, otherwise child set method is not called
      constraint.parentConstraint = this;
    }
    this.children.push(constraint);
    this.updateTextRepresentation();
    return;
  }

  updateChild(index: number, constraint: Constraint) {
    if (!(<CombinationConstraint>constraint).isRoot) {
      constraint.parentConstraint = this;
    }
    this.children[index] = constraint
    this.updateTextRepresentation();
    return;
  }

  clone(): CombinationConstraint {
    let res = new CombinationConstraint;
    res.textRepresentation = this.textRepresentation;
    res.parentConstraint = (this.parentConstraint) ? this.parentConstraint : null;
    res.isRoot = this.isRoot;
    res.excluded=this.excluded
    res.combinationState = this.combinationState;
    res.panelTimingSameInstance = this.panelTimingSameInstance;
    res.children = this._children.map(constr => constr.clone());
    return res;
  }

  isAnd() {
    return this.combinationState === CombinationState.And;
  }

  /**
   *  the input value validity of a combination constraint is true if all children constraints have valid values.
   *  If one or multiple children are not valid, only the first non-empty message string is returned
   */
  inputValueValidity(): string {

    for (const child of this.children) {
      let validity = child.inputValueValidity()
      if (validity !== '') {
        return validity
      }
    }
    return ''
  }


  get children(): Constraint[] {
    return this._children;
  }

  set children(value: Constraint[]) {
    this._children = value;
    this.updateTextRepresentation();
  }

  get combinationState(): CombinationState {
    return this._combinationState;
  }

  set combinationState(value: CombinationState) {
    this._combinationState = value;
    this.updateTextRepresentation();
  }

  switchCombinationState() {
    this.combinationState = (this.combinationState === CombinationState.And) ?
      CombinationState.Or : CombinationState.And;
    this.updateTextRepresentation();
  }

  removeChildConstraint(child: Constraint) {
    let index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    this.updateTextRepresentation();
  }

  get isRoot(): boolean {
    return this._isRoot;
  }

  set isRoot(value: boolean) {
    this._isRoot = value;
  }


  private updateTextRepresentation() {
    if (this.children.length > 0) {
      this.textRepresentation = (this.excluded ? 'not (':'(') + this.children.map(({ textRepresentation }) => textRepresentation)
        .join(this.combinationState === CombinationState.And ? ' and ' : ' or ') + ')'
    } else {
      this.textRepresentation = 'Group';
    }
  }
}
