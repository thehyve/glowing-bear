import {Component, OnInit} from '@angular/core';
import {TreeNode} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {QueryService} from '../../../../services/query.service';

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

  updateCounts(event) {
    this.queryService.updateCounts_2();
  }

  checkAll(value: boolean) {
    if (value) {
      this.treeNodeService.checkProjectionTreeDataIterative(this.treeNodeService.projectionTreeData);
    } else {
      this.treeNodeService.selectedProjectionTreeData = [];
    }
    this.queryService.updateCounts_2();
  }

  expandAll(value: boolean) {
    this.treeNodeService.expandProjectionTreeDataIterative(this.treeNodeService.projectionTreeData, value);
  }
}
