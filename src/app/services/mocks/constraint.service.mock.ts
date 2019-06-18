/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {Constraint} from '../../models/constraint-models/constraint';
import {TreeNode} from 'primeng/api';
import {Concept} from '../../models/constraint-models/concept';
import {Subject} from 'rxjs';
import {Cohort} from '../../models/cohort-models/cohort';
import {Dimension} from '../../models/constraint-models/dimension';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';

export class ConstraintServiceMock {

  private _rootConstraint: CombinationConstraint;
  private _allConstraints: Constraint[] = [];
  private _studyConstraints: Constraint[] = [];
  private _validPedigreeTypes: object[] = [];
  private _concepts: Concept[] = [];
  private _conceptConstraints: Constraint[] = [];
  private _maxNumSearchResults = 100;
  private _constraint: Constraint = new CombinationConstraint();
  private _allSubjectDimensionsUpdated: Subject<Cohort[]> = new Subject<Cohort[]>();
  private _allSubjectDimensions: Dimension[] = [];
  private _dimensionSelectionDisabled = false;
  constructor() {
    this._rootConstraint = new CombinationConstraint();
  }

  init() {
  }

  get combination(): Constraint {
    return this._constraint;
  }

  public searchAllConstraints(query: string): Constraint[] {
    return [];
  }

  public cohortSelectionConstraint(): Constraint {
    return this._constraint;
  }

  public variableConstraint(variables: Concept[]): Constraint {
    return new TrueConstraint();
  }

  get allConstraints(): Constraint[] {
    return this._allConstraints;
  }

  set allConstraints(value: Constraint[]) {
    this._allConstraints = value;
  }

  get studyConstraints(): Constraint[] {
    return this._studyConstraints;
  }

  set studyConstraints(value: Constraint[]) {
    this._studyConstraints = value;
  }

  get validPedigreeTypes(): object[] {
    return this._validPedigreeTypes;
  }

  set validPedigreeTypes(value: object[]) {
    this._validPedigreeTypes = value;
  }

  get conceptConstraints(): Constraint[] {
    return this._conceptConstraints;
  }

  set conceptConstraints(value: Constraint[]) {
    this._conceptConstraints = value;
  }

  get concepts(): Concept[] {
    return this._concepts;
  }

  set concepts(value: Concept[]) {
    this._concepts = value;
  }

  get maxNumSearchResults(): number {
    return this._maxNumSearchResults;
  }

  set maxNumSearchResults(value: number) {
    this._maxNumSearchResults = value;
  }

  get allSubjectDimensionsUpdated(): Subject<Cohort[]> {
    return this._allSubjectDimensionsUpdated;
  }

  set allSubjectDimensionsUpdated(value: Subject<Cohort[]>) {
    this._allSubjectDimensionsUpdated = value;
  }

  get allSubjectDimensions(): Dimension[] {
    return this._allSubjectDimensions;
  }

  set allSubjectDimensions(value: Dimension[]) {
    this._allSubjectDimensions = value;
  }

  get dimensionSelectionDisabled(): boolean {
    return this._dimensionSelectionDisabled;
  }

  set dimensionSelectionDisabled(value: boolean) {
    this._dimensionSelectionDisabled = value;
  }


}
