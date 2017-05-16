import {Component, OnInit} from '@angular/core';
import {TreeNode} from "primeng/components/common/api";
import {ResourceService} from "../../../shared/services/resource.service";

@Component({
  selector: 'tree-nodes',
  templateUrl: './tree-nodes.component.html',
  styleUrls: ['./tree-nodes.component.css']
})
export class TreeNodesComponent implements OnInit {

  treeNodes: TreeNode[];

  constructor(private resourceService: ResourceService) {

    this.resourceService.getTreeNodes()
      .subscribe(
        (treeNodes: object[]) => {
          this.treeNodes = treeNodes;
          this.augmentTreeNodes(this.treeNodes);
        },
        err => console.error(err)
      );
  }

  ngOnInit() {
  }

  /**
   * Augment tree nodes with tree-ui specifications
   * @param nodes
   */
  augmentTreeNodes(nodes: Object[]) {
    for(let node of nodes) {
      node['label'] = node['name'];
      if(node['children']) {
        node['expandedIcon'] = 'fa-folder-open';
        node['collapsedIcon'] = 'fa-folder';
        this.augmentTreeNodes(node['children']);
      }
      else {
        node['icon'] = 'fa-leaf';
      }
    }
  }

}
