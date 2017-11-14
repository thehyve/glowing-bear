import {Component, OnInit} from '@angular/core';
import {TreeNode} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {ConstraintService} from '../../../../services/constraint.service';

@Component({
  selector: 'gb-projection',
  templateUrl: './gb-projection.component.html',
  styleUrls: ['./gb-projection.component.css']
})
export class GbProjectionComponent implements OnInit {

  constructor(public treeNodeService: TreeNodeService,
              public constraintService: ConstraintService) {
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
    this.constraintService.updateCounts_2();
  }
}
