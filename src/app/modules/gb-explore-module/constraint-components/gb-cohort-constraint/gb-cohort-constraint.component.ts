/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {Cohort} from '../../../../models/constraint-models/cohort';
import {CohortConstraint} from '../../../../models/constraint-models/cohort-constraint';
import {MessageHelper} from '../../../../utilities/message-helper';
import {TreeNode} from '../../../../models/tree-models/tree-node';

@Component({
  selector: 'gb-cohort-constraint',
  templateUrl: './gb-cohort-constraint.component.html',
  styleUrls: ['./gb-cohort-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbCohortConstraintComponent extends GbConstraintComponent implements OnInit {
  ngOnInit() {
  }

  /*
   * -------------------- getters and setters --------------------
   */
  get selectedCohort(): Cohort {
    return (<CohortConstraint>this.constraint).cohort;
  }

  set selectedCohort(value: Cohort) {
    (<CohortConstraint>this.constraint).cohort = value;
    this.update();
  }

  onDrop(event: DragEvent) {
    event.stopPropagation();

    let selectedNode: TreeNode = this.treeNodeService.selectedTreeNode;
    this.droppedConstraint =
      this.constraintService.generateConstraintFromTreeNode(selectedNode, selectedNode ? selectedNode.dropMode : null);

    if (this.droppedConstraint && this.droppedConstraint.className === 'CohortConstraint') {
      (<CohortConstraint>this.constraint).cohort = (<CohortConstraint>this.droppedConstraint).cohort;
      this.update();
    } else {
      const summary = `Dropped a ${this.droppedConstraint.className}, incompatible with CohortConstraint.`;
      MessageHelper.alert('error', summary);
    }
    this.treeNodeService.selectedTreeNode = null;
    this.droppedConstraint = null;
  }
}
