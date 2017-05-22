import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {TreeNode} from "primeng/components/common/api";
import {ResourceService} from "../../../shared/services/resource.service";
import {ConstraintService} from "../../../shared/services/constraint.service";

@Component({
  selector: 'tree-nodes',
  templateUrl: './tree-nodes.component.html',
  styleUrls: ['./tree-nodes.component.css']
})
export class TreeNodesComponent implements OnInit, AfterViewInit {

  treeNodes: TreeNode[];
  observer: MutationObserver;

  constructor(private resourceService: ResourceService,
              private constraintService: ConstraintService,
              private element: ElementRef) {

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

  ngAfterViewInit() {
    this.observer = new MutationObserver(this.updateEventHandlers.bind(this));
    var config = {
      attributes: false,
      subtree: true,
      childList: true,
      characterData: false
    };

    this.observer.observe(this.element.nativeElement, config);
  }


  /**
   * Augment tree nodes with tree-ui specifications
   * @param nodes
   */
  augmentTreeNodes(nodes: Object[]) {
    for (let node of nodes) {
      node['label'] = node['name'];
      if (node['children']) {
        node['expandedIcon'] = 'fa-folder-open';
        node['collapsedIcon'] = 'fa-folder';
        this.augmentTreeNodes(node['children']);
      }
      else {
        node['icon'] = 'fa-leaf';
      }
    }
  }

  updateEventHandlersRecursively(ptreeNodes, dataTreeNodes) {
    for (let ptreeNode of ptreeNodes) {
      let index: number = ptreeNode.getAttribute('ng-reflect-index');
      let dataObject: TreeNode = dataTreeNodes[index];
      let dataObjectType = dataObject['type'];
      if (this.constraintService.validTreeNodeTypes.includes(dataObjectType)) {
        ptreeNode.querySelector('li.ui-treenode')
          .addEventListener('dragstart', (function (event) {
            event.stopPropagation();
            this.constraintService.selectedTreeNode = dataObject;
          }).bind(this));
      }
      let uiTreeNodeChildrenElm = ptreeNode.querySelector('.ui-treenode-children');
      if (uiTreeNodeChildrenElm) {
        this.updateEventHandlersRecursively(uiTreeNodeChildrenElm.children, dataObject.children);
      }
    }
  }

  updateEventHandlers() {
    let ptree = this.element.nativeElement.querySelector('p-tree');
    let rootPtreeNodes = ptree.querySelector('.ui-tree-container').children;
    this.updateEventHandlersRecursively(rootPtreeNodes, this.treeNodes);
  }


}
