import {Component, OnInit} from '@angular/core';
import {QueryService} from '../../../../services/query.service';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNode} from 'primeng/api';

@Component({
  selector: 'gb-summary',
  templateUrl: './gb-summary.component.html',
  styleUrls: ['./gb-summary.component.css']
})
export class GbSummaryComponent implements OnInit {

  constructor(private queryService: QueryService,
              private treeNodeService: TreeNodeService) {
  }

  ngOnInit() {
  }

  get subjectCount(): number {
    return this.queryService.subjectCount_2;
  }

  get observationCount(): number {
    return this.queryService.observationCount_2;
  }

  get finalTreeNodes(): TreeNode[] {
    return this.treeNodeService.finalTreeNodes;
  }

  get showObservationCounts(): boolean {
    return this.queryService.showObservationCounts;
  }

}
