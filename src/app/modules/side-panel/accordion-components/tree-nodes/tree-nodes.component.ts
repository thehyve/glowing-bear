import {Component, OnInit, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {TreeNode} from "primeng/components/common/api";
import {ResourceService} from "../../../shared/services/resource.service";
import {ConstraintService} from "../../../shared/services/constraint.service";
import {OverlayPanel} from "primeng/components/overlaypanel/overlaypanel";
import {trigger, transition, animate, style} from "@angular/animations";

type LoadingState = "loading" | "complete";

@Component({
  selector: 'tree-nodes',
  templateUrl: './tree-nodes.component.html',
  styleUrls: ['./tree-nodes.component.css'],
  animations: [
    trigger('notifyState', [
      transition( 'loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 0.5)'
        }),
        animate('1000ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class TreeNodesComponent implements OnInit, AfterViewInit {

  @ViewChild('treeNodeMetadataPanel') treeNodeMetadataPanel: OverlayPanel;

  treeNodes: TreeNode[];
  observer: MutationObserver;
  expansionStatus: any;
  metadataContent: any = [];

  loadingTreeNodes:LoadingState = "complete";

  constructor(private resourceService: ResourceService,
              private constraintService: ConstraintService,
              private element: ElementRef) {

    this.loadingTreeNodes = "loading";
    this.resourceService.getTreeNodes()
      .subscribe(
        (treeNodes: object[]) => {
          this.treeNodes = treeNodes;
          this.augmentTreeNodes(this.treeNodes);
          this.loadingTreeNodes = "complete";

          console.log('tree nodes: ', treeNodes);
        },
        err => console.error(err)
      );

    this.expansionStatus = {
      expanded: false,
      treeNodeElm: null,
      treeNode: null
    };
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(this.update.bind(this));
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
      let patientCount = node['patientCount'];
      let observationCount = node['observationCount'];
      let countStr = ' ';
      if(patientCount) {
        countStr += '(' + patientCount;
      }
      if(observationCount) {
        countStr += ' | ' + observationCount;
      }
      if(countStr !== ' ') countStr += ')';

      node['label'] = node['name'] + countStr;

      if(node['metadata']) {
        node['label'] = node['label'] + ' ⚆';
      }

      if (node['children']) {
        node['expandedIcon'] = 'fa-folder-open';
        node['collapsedIcon'] = 'fa-folder';
        this.augmentTreeNodes(node['children']);
      }
      else {
        if(node['type'] === 'NUMERIC') {
          node['icon'] = 'icon-123';
        }
        else if(node['type'] === 'HIGH_DIMENSIONAL') {
          node['icon'] = 'fa-file-text';
        }
        else if(node['type'] === 'CATEGORICAL_OPTION') {
          node['icon'] = 'icon-abc';
        }
        else {
          node['icon'] = 'fa-folder-o';
        }
      }
    }
  }

  /**
   * Update the contextmenu popup (right click) content
   * by the given metadata object from a treenode
   * @param metadata
   */
  updateMetadataContent(metadata) {
    this.metadataContent = [];
    for(let key in metadata) {
      this.metadataContent.push({
        key: key,
        val: metadata[key]
      });
    }
  }

  /**
   * Add event listeners to the newly appended tree nodes
   * @param treeNodeElements
   * @param treeNodes
   */
  updateEventListeners(treeNodeElements, treeNodes) {
    let index = 0;
    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodes[index];
      let dataObjectType = dataObject['type'];
      let metadata = dataObject['metadata'];
      let treeNodeElm = elm.querySelector('li.ui-treenode');

      let handleDragstart = (function (event) {
        event.stopPropagation();
        this.constraintService.selectedTreeNode = dataObject;
      }).bind(this);

      let handleContextmenu = (function (event) {
        event.stopPropagation();
        event.preventDefault();
        this.updateMetadataContent(metadata);
        this.treeNodeMetadataPanel.toggle(event);
      }).bind(this);

      //if the data object type belongs to the listed types
      if (this.constraintService.validTreeNodeTypes.includes(dataObjectType)) {
        treeNodeElm.addEventListener('dragstart', handleDragstart);
      }
      //if metadata exitss
      if(metadata) {
        treeNodeElm.addEventListener('contextmenu', handleContextmenu);
      }

      let uiTreeNodeChildrenElm = elm.querySelector('.ui-treenode-children');
      if (uiTreeNodeChildrenElm) {
        this.updateEventListeners(uiTreeNodeChildrenElm.children, dataObject.children);
      }
      index++;
    }
  }

  update() {
    if(this.expansionStatus['expanded']) {
      let treeNodeElm = this.expansionStatus['treeNodeElm'];
      let treeNode = this.expansionStatus['treeNode'];
      let newChildren = treeNodeElm.querySelector('ul.ui-treenode-children').children;
      this.updateEventListeners(newChildren, treeNode.children);

      this.expansionStatus['expanded'] = false;
      this.expansionStatus['treeNodeElm'] = null;
      this.expansionStatus['treeNode'] = null;
    }
  }

  expandNode(event) {
    if(event.node) {
      this.expansionStatus['expanded'] = true;
      this.expansionStatus['treeNodeElm'] = event.originalEvent.target.parentElement.parentElement;
      this.expansionStatus['treeNode'] = event.node;
    }
  }

}
