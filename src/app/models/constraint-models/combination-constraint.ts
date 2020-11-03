/**
 * Copyright 2017 - 2018  The Hyve B.V.2
 *
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Constraint } from './constraint';
import { CombinationState } from './combination-state';
import { SensitiveType } from './sensitive-type';
import { ErrorHelper } from 'app/utilities/error-helper';

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
    this.sensitiveType = SensitiveType.Undetermined
  }

  get className(): string {
    return 'CombinationConstraint';
  }

  addChild(constraint: Constraint){

    if (this.sensitiveType === SensitiveType.Undetermined ||
      this.sensitiveType === constraint.sensitiveType) {
      if (!(<CombinationConstraint>constraint).isRoot) {
        // to enforce polymorphism, otherwise child set method is not called
        constraint.parentConstraint = this;
      }
      this.children.push(constraint);
      if (this.combinationState === CombinationState.Or) {
        this.sensitiveType = constraint.sensitiveType
      }
      this.updateTextRepresentation()
      return 
    } else {
      throw ErrorHelper.handleNewError('You cannot combine sensitive and non-sensitive concept with OR operator')
    }

  }

  clone(): CombinationConstraint {
    let res = new CombinationConstraint
    res.textRepresentation = this.textRepresentation
    res.parentConstraint = (this.parentConstraint) ? this.parentConstraint : null
    res.isRoot = this.isRoot
    res.combinationState = this.combinationState
    res.children = this._children.map(constr => constr.clone())
    return res
  }

  isAnd() {
    return this.combinationState === CombinationState.And;
  }

  get children(): Constraint[] {
    return this._children;
  }

  set children(value: Constraint[]) {
    this._children = value;
    this.updateTextRepresentation()
  }

  get combinationState(): CombinationState {
    return this._combinationState;
  }

  set combinationState(value: CombinationState) {
    this._combinationState = value;
    this.updateTextRepresentation()
  }

  switchCombinationState() {
    this.combinationState = (this.combinationState === CombinationState.And) ?
      CombinationState.Or : CombinationState.And;
    this.updateTextRepresentation()
  }

  removeChildConstraint(child: Constraint) {
    let index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  get isRoot(): boolean {
    return this._isRoot;
  }

  set isRoot(value: boolean) {
    this._isRoot = value;
  }

  private updateTextRepresentation(){
    if (this.children.length >=0) {
      this.textRepresentation= "("+this.children.map(({textRepresentation})=>textRepresentation)
        .join(this.combinationState === CombinationState.And ? ' and ':' or ')+")"
    }else{
      this.textRepresentation=""
    }
  }
}
