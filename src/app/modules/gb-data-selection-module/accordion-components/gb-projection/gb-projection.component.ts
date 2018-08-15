/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {TreeNode} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {QueryService} from '../../../../services/query.service';
import {Step} from '../../../../models/query-models/step';
import {MessageHelper} from '../../../../utilities/message-helper';

@Component({
  selector: 'gb-projection',
  templateUrl: './gb-projection.component.html',
  styleUrls: ['./gb-projection.component.css']
})
export class GbProjectionComponent implements OnInit {

  isUploadListenerNotAdded: boolean;

  constructor(private treeNodeService: TreeNodeService,
              public queryService: QueryService) {
    this.isUploadListenerNotAdded = true;
  }

  ngOnInit() {
  }

  get projectionTreeData(): TreeNode[] {
    return this.treeNodeService.projectionTreeData;
  }

  get selectedProjectionTreeData(): TreeNode[] {
    return this.treeNodeService.selectedProjectionTreeData;
  }

  set selectedProjectionTreeData(value: TreeNode[]) {
    this.treeNodeService.selectedProjectionTreeData = value;
  }

  updateCounts() {
    this.queryService.step = Step.II;
    if (this.queryService.instantCountsUpdate_2) {
      this.queryService.update_2();
    } else {
      this.queryService.counts_2.subjectCount = -1;
      this.queryService.counts_2.observationCount = -1;
      this.queryService.isDirty_2 = true;
    }
  }

  importCriteria() {
    let uploadElm = document.getElementById('step2CriteriaFileUpload');
    if (this.isUploadListenerNotAdded) {
      uploadElm
        .addEventListener('change', this.criteriaFileUpload.bind(this), false);
      this.isUploadListenerNotAdded = false;
    }
    // reset the input path so that it will take the same file again
    uploadElm['value'] = '';
    uploadElm.click();
  }

  criteriaFileUpload(event) {
    let reader = new FileReader();
    let file = event.target.files[0];
    reader.onload = (function (e) {
      let data = e.target['result'];
      let query = this.parseFile(file, data);
      this.queryService.restoreQuery(query);
    }).bind(this);
    reader.readAsText(file);
  }

  private parseFile(file: File, data: any) {
    let observationQuery = {};
    // file.type is empty for some browsers and Windows OS
    if (file.type === 'application/json' || file.name.split('.').pop() === 'json') {
      let _json = JSON.parse(data);
      if (_json['names']) {
        let pathArray = [];
        this.treeNodeService.convertItemsToPaths(this.treeNodeService.treeNodes, _json['names'], pathArray);
        observationQuery = {
          data: pathArray
        };
      } else if (_json['paths']) {
        observationQuery = {
          data: _json['paths']
        };
      } else if (_json['observationsQuery']) {
        observationQuery = _json['observationsQuery'];
      } else {
        MessageHelper.alert('error', 'Invalid file content for STEP 2.');
        return;
      }
      return {
        'name': file.name.substr(0, file.name.indexOf('.')),
        'observationsQuery': observationQuery
      };
    } else {
      MessageHelper.alert('error', 'Invalid file format for STEP 2.');
      return;
    }
  }

  checkAll(value: boolean) {
    if (value) {
      this.treeNodeService
        .checkAllProjectionTreeDataIterative(this.treeNodeService.projectionTreeData);
    } else {
      this.treeNodeService
        .selectedProjectionTreeData = [];
    }
    this.updateCounts();
  }

  onCheckChange(val) {
    this.checkAll(val);
  }

  expandAll(value: boolean) {
    this.treeNodeService
      .expandProjectionTreeDataIterative(this.treeNodeService.projectionTreeData, value);
  }

  get isTreeNodeLoadingCompleted(): boolean {
    return this.treeNodeService.isTreeNodeLoadingCompleted;
  }
}
