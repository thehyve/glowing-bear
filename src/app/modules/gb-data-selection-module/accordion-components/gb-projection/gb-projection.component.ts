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
  selected=[];
  constructor(public treeNodeService: TreeNodeService,
              public constraintService: ConstraintService) {
  }

  ngOnInit() {
  }

  get treeTableData(): TreeNode[] {
    return this.treeNodeService.treeTableData;
  }

  get selectedTreeTableData(): TreeNode[] {
    return this.treeNodeService.selectedTreeTableData;
  }

  set selectedTreeTableData(value: TreeNode[]) {
    this.treeNodeService.selectedTreeTableData = value;
  }

  updateCounts(event) {
    this.constraintService.updateCounts_2();
  }
}
