/**
 * Copyright 2017 - 2018  The Hyve B.V.
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

export class ConstraintServiceMock {

  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  _constraint: Constraint = new CombinationConstraint();
  validPedigreeTypes = [];
  concepts: Concept[] = [];
  conceptConstraints: Constraint[] = [];
  allConstraints: Constraint[] = [];
  private _variables: Concept[] = [];
  variablesUpdated: Subject<Concept[]> = new Subject<Concept[]>();
  selectedVariablesUpdated: Subject<Concept[]> = new Subject<Concept[]>();

  constructor() {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
  }

  init() {
  }

  public depthOfConstraint(constraint: Constraint): number {
    return 1;
  }

  public generateInclusionConstraint(): Constraint {
    return this._constraint;
  }

  public generateExclusionConstraint(): Constraint {
    return this._constraint;
  }

  public hasExclusionConstraint(): Boolean {
    return false;
  }

  get combination(): Constraint {
    return this._constraint;
  }

  public generateConstraintFromTreeNode(selectedNode: TreeNode): Constraint {
    return this._constraint;
  }

  public searchAllConstraints(query: string): Constraint[] {
    return [];
  }

  public identifyDraggedElement(): Concept {
    return new Concept();
  }

  checkAllVariables(b: boolean) {
    this.variables.forEach((variable: Concept) => {
      variable.selected = b;
    });
  }

  get variables(): Concept[] {
    return this._variables;
  }

  set variables(value: Concept[]) {
    this._variables = value;
  }
}
