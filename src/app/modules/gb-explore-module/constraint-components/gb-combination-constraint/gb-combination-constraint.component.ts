/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { GbConstraintComponent } from '../gb-constraint/gb-constraint.component';
import { CombinationConstraint } from '../../../../models/constraint-models/combination-constraint';
import { Constraint } from '../../../../models/constraint-models/constraint';
import { AutoComplete } from 'primeng';
import { CombinationState } from '../../../../models/constraint-models/combination-state';
import { TreeNode } from '../../../../models/tree-models/tree-node';
import { UIHelper } from '../../../../utilities/ui-helper';
import {MessageHelper} from '../../../../utilities/message-helper';
import { Cohort } from 'src/app/models/cohort-models/cohort';
import { Cohort as ConstraintCohort } from 'src/app/models/constraint-models/cohort';
import { CohortConstraint } from 'src/app/models/constraint-models/cohort-constraint';

@Component({
  selector: 'gb-combination-constraint',
  templateUrl: './gb-combination-constraint.component.html',
  styleUrls: ['./gb-combination-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbCombinationConstraintComponent extends GbConstraintComponent implements OnInit {
  CombinationState = CombinationState;

  @ViewChild('autoComplete', { static: true }) autoComplete: AutoComplete;

  searchResults: Constraint[];
  selectedConstraint: Constraint;

  ngOnInit() {
  }

  get isAnd(): boolean {
    return (<CombinationConstraint>this.constraint).isAnd();
  }

  get children(): Constraint[] {
    return (<CombinationConstraint>this.constraint).children;
  }

  /**
   * Removes the childConstraint from the CombinationConstraint corresponding to this component.
   * @param childConstraint
   */
  onConstraintRemoved(childConstraint: Constraint) {
    (<CombinationConstraint>this.constraint).removeChildConstraint(childConstraint);
    this.update();
  }

  onSearch(event) {
    this.searchResults = this.constraintService.searchAllConstraints(event.query);
  }

  onDropdown(event) {
    this.searchResults = this.constraintService.searchAllConstraints('');
    UIHelper.removePrimeNgLoaderIcon(this.element, 200);
  }

  onSelect(selectedConstraint) {
    if (selectedConstraint != null) {

      // Create a copy of the selected constraint
      let newConstraint: Constraint = new selectedConstraint.constructor();
      Object.assign(newConstraint, this.selectedConstraint);

      if (newConstraint.className === 'CombinationConstraint') {
        // we don't want to copy a CombinationConstraint's children
        (<CombinationConstraint>newConstraint).children = [];
      }

      this.addChildConstraint(newConstraint);
    }
  }

  onDrop(event) {
    event.stopPropagation();
    let selectedNode: TreeNode = this.treeNodeService.selectedTreeNode;
    let selectedCohort: Cohort = this.cohortService.selectedCohort;

    if (selectedCohort) {
      const constraintCohort = new ConstraintCohort();
      constraintCohort.name = this.cohortService.selectedCohort.name;

      const cohortConstraint = new CohortConstraint();
      cohortConstraint.cohort = constraintCohort;
      cohortConstraint.textRepresentation = cohortConstraint.cohort.name;
      this.droppedConstraint = cohortConstraint;
    } else {
      this.droppedConstraint =
        this.constraintService.generateConstraintFromTreeNode(selectedNode, selectedNode ? selectedNode.dropMode : null);
    }

    this.treeNodeService.selectedTreeNode = null;
    this.cohortService.selectedCohort = null;

    this.addChildConstraint(this.droppedConstraint);
  }

  private addChildConstraint(constraint: Constraint) {
    let combinationConstraint: CombinationConstraint = <CombinationConstraint>this.constraint;
    try {
      // do not allow single concept at root of combination constraint
      if (combinationConstraint.isRoot) {
        let subCombinationConstraint = new CombinationConstraint()
        subCombinationConstraint.combinationState = CombinationState.Or;
        subCombinationConstraint.addChild(constraint)
        combinationConstraint.addChild(subCombinationConstraint)
      } else {
        combinationConstraint.addChild(constraint);
      }
    } catch (error) {
      MessageHelper.alert('error', error.message)
    }

    // force combination state to or for second-level combination constraint
    let parentConstraint = this.constraint.parentConstraint as CombinationConstraint;
    if (parentConstraint && parentConstraint.isRoot) {
      combinationConstraint.combinationState = CombinationState.Or;
    }

    this.autoComplete.selectItem(null);
    this.droppedConstraint = null;
    this.update();
  }

  get combinationState() {
    return (<CombinationConstraint>this.constraint).combinationState;
  }

  get childContainerClass(): string {
    return (<CombinationConstraint>this.constraint).isRoot ?
      '' : 'gb-combination-constraint-child-container';
  }

  addChildCombinationConstraint() {
    try {
      (<CombinationConstraint>this.constraint).addChild(new CombinationConstraint());
    } catch (error) {
      MessageHelper.alert('warn', error.message)
    }
  }

  allowGroupChildren(): boolean {
    if (!(this.constraint instanceof CombinationConstraint)) {
      return false;
    }

    return this.constraint.isRoot;
  }
}
