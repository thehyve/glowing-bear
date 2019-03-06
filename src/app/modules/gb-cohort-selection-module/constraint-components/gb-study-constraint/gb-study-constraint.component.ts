/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import {Study} from '../../../../models/constraint-models/study';
import {StudyConstraint} from '../../../../models/constraint-models/study-constraint';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {AutoComplete} from 'primeng/components/autocomplete/autocomplete';
import {UIHelper} from '../../../../utilities/ui-helper';
import {TreeNode} from 'primeng/api';

@Component({
  selector: 'gb-study-constraint',
  templateUrl: './gb-study-constraint.component.html',
  styleUrls: ['./gb-study-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbStudyConstraintComponent extends GbConstraintComponent implements OnInit {

  @ViewChild('autoComplete') autoComplete: AutoComplete;

  searchResults: Study[];

  ngOnInit() {
  }

  get selectedStudies(): Study[] {
    return (<StudyConstraint>this.constraint).studies;
  }

  set selectedStudies(value: Study[]) {
    (<StudyConstraint>this.constraint).studies = value;
  }

  onSearch(event) {
    let studies = this.studyService.studies;
    let query = event.query.toLowerCase();
    if (query) {
      this.searchResults = studies.filter((study: Study) => study.id.toLowerCase().includes(query));
    } else {
      this.searchResults = studies;
    }
  }

  onDropdown(event) {
    this.searchResults = this.studyService.studies.slice(0);
    UIHelper.removePrimeNgLoaderIcon(this.element, 200);
  }

  onDrop(event: DragEvent) {
    event.stopPropagation();
    let selectedNode: TreeNode = this.treeNodeService.selectedTreeNode;
    this.droppedConstraint =
      this.constraintService.generateConstraintFromTreeNode(selectedNode);
    this.treeNodeService.selectedTreeNode = null;
    if (this.droppedConstraint) {
      let study = (<StudyConstraint>this.droppedConstraint).studies[0];
      let studies = (<StudyConstraint>this.constraint).studies;
      studies = studies.filter(item => item.id === study.id);
      if (studies.length === 0) {
        (<StudyConstraint>this.constraint).studies.push(study);
        this.update();
      }
    }
  }

}
