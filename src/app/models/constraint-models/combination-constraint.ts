/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';
import {CombinationState} from './combination-state';
import {PedigreeConstraint} from './pedigree-constraint';
import {TrueConstraint} from './true-constraint';

export class CombinationConstraint extends Constraint {

  static readonly TOP_LEVEL_DIMENSION: string = 'patient';

  private _children: Constraint[];
  private _combinationState: CombinationState;
  private _isRoot: boolean;
  private _dimension: string;

  constructor(children?: Constraint[],
              state?: CombinationState,
              dimension?: string) {
    super();
    this.children = [];
    this.isRoot = false;
    this.textRepresentation = 'Group';
    if (children) {
      children.forEach((child: Constraint) => {
        this.addChild(child);
      });
    }
    this.combinationState = state ? state : CombinationState.And;
    this.dimension = dimension ? dimension : CombinationConstraint.TOP_LEVEL_DIMENSION;
  }

  get className(): string {
    return 'CombinationConstraint';
  }

  addChild(constraint: Constraint) {
    if (!(<CombinationConstraint>constraint).isRoot) {
      // to enforce polymorphism, otherwise child set method is not called
      if (constraint.className === 'PedigreeConstraint') {
        (<PedigreeConstraint>constraint).parentConstraint = this;
      } else {
        constraint.parentConstraint = this;
      }
    }
    this.children.push(constraint);
  }

  isAnd() {
    return this.combinationState === CombinationState.And;
  }

  get children(): Constraint[] {
    return this._children;
  }

  set children(value: Constraint[]) {
    this._children = value;
  }

  get combinationState(): CombinationState {
    return this._combinationState;
  }

  set combinationState(value: CombinationState) {
    this._combinationState = value;
  }

  switchCombinationState() {
    this.combinationState = (this.combinationState === CombinationState.And) ?
      CombinationState.Or : CombinationState.And;
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

  get dimension(): string {
    return this._dimension;
  }

  set dimension(value: string) {
    this._dimension = value;
  }

  get isDimensionSubselectionRequired(): boolean {
    return this.parentConstraint && this.parentConstraint.className === 'CombinationConstraint'
      && this.dimension !== (<CombinationConstraint>this.parentConstraint).dimension
      || this.isRoot;
  }

  get isCombinationLevelRedundant(): boolean {
    return this.children.length === 1
      && !this.children[0].negated
      && this.children[0].className === 'CombinationConstraint'
      && this.dimension === (<CombinationConstraint>this.children[0]).dimension;
  }

  optimize(): Constraint {
    if (this.children.length > 0) {
      if (this.isCombinationLevelRedundant) {
        return (<CombinationConstraint>this.children[0]).optimize();
      } else {
        return this;
      }
    } else {
      return new TrueConstraint();
    }
  }
}
