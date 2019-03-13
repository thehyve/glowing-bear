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
import {ConceptConstraint} from './concept-constraint';

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

  clone(): CombinationConstraint {
    const clone = new CombinationConstraint(
      this.children.map(child => child.clone()),
      this.combinationState,
      this.dimension
    );
    clone.negated = this.negated;
    return clone;
  }

  get restrictiveDimensions(): string[] {
    let result = [];
    let constraintsWithDimRestrictions = this.children.filter(constraint =>
      constraint.className === 'ConceptConstraint'
      && (<ConceptConstraint>constraint).concept
      && (<ConceptConstraint>constraint).concept.subjectDimensions.length > 0
    );
    if (constraintsWithDimRestrictions.length > 0) {
      result = (<ConceptConstraint>constraintsWithDimRestrictions[0]).concept.subjectDimensions;
      constraintsWithDimRestrictions.forEach(constraint =>
        result = result.filter(x => (<ConceptConstraint>constraint).concept.subjectDimensions.includes(x))
      );
    }
    return result;
  }
}
