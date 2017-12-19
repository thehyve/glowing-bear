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

  constructor(private treeNodeService: TreeNodeService,
              private queryService: QueryService) {
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
    this.queryService.dirty_2 = true;
    if (this.queryService.instantCountUpdate_2) {
      this.queryService.updateCounts_2();
    }
    this.treeNodeService.updateSelectionCount();
  }

  isLoading() {
      return this.queryService.isLoadingTreeCounts_2;
  }

  checkAll(value: boolean) {
    if (value) {
      this.selectedProjectionTreeData.length = 0;
      this.treeNodeService
        .checkProjectionTreeDataIterative(this.treeNodeService.projectionTreeData);
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

  get hasSelectionCount(): boolean {
    return this.treeNodeService.selectionCount !== undefined;
  }

}
