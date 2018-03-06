import {Component, OnInit} from '@angular/core';
import {TreeNode} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {QueryService} from '../../../../services/query.service';
import {Step} from '../../../../models/step';

@Component({
  selector: 'gb-projection',
  templateUrl: './gb-projection.component.html',
  styleUrls: ['./gb-projection.component.css']
})
export class GbProjectionComponent implements OnInit {

  private isUploadListenerNotAdded: boolean;

  constructor(private treeNodeService: TreeNodeService,
              private queryService: QueryService) {
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
      this.queryService.updateCounts_2();
    } else {
      this.queryService.isDirty_2 = true;
    }
  }

  importCriteria() {
    let uploadElm = document.getElementById('step2CriteriaFileUpload');
    if (this.isUploadListenerNotAdded) {
      uploadElm
        .addEventListener('change', this.criteriaFileUpload.bind(this), false);
      this.isUploadListenerNotAdded = false;
      // reset the input path so that it will take the same file again
      document.getElementById('step2CriteriaFileUpload')['value'] = '';
    }
    uploadElm.click();
  }

  criteriaFileUpload(event){
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
    let query = null;
    if (file.type === 'application/json') {
      let _json = JSON.parse(data);
      let pathArray = null;
      if (_json['names']) {
        pathArray = [];
        this.treeNodeService.convertItemsToPaths(this.treeNodeService.treeNodes, _json['names'], pathArray);
      } else if (_json['paths']) {
        pathArray = _json['paths'];
      } else if (_json.constructor === Array) {
        pathArray = _json;
      } else {
        const msg = 'Invalid file content for STEP 2.';
        this.queryService.alert(msg, '', 'error');
        return;
      }
      if (pathArray) {
        query = {
          'name': file.name.substr(0, file.name.indexOf('.')),
          'observationsQuery': {
            data: pathArray
          }
        };
        return query;
      }
    } else {
      const msg = 'Invalid file format for STEP 2.';
      this.queryService.alert(msg, '', 'error');
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

  expandAll(value: boolean) {
    this.treeNodeService
      .expandProjectionTreeDataIterative(this.treeNodeService.projectionTreeData, value);
  }
}
