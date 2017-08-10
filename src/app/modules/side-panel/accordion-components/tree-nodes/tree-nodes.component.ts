import {Component, OnInit, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import {TreeNode} from 'primeng/components/common/api';
import {ConstraintService} from '../../../shared/services/constraint.service';
import {OverlayPanel} from 'primeng/components/overlaypanel/overlaypanel';
import {trigger, transition, animate, style} from '@angular/animations';
import {DropMode} from '../../../shared/models/drop-mode';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';

@Component({
  selector: 'app-tree-nodes',
  templateUrl: './tree-nodes.component.html',
  styleUrls: ['./tree-nodes.component.css'],
  animations: [
    trigger('notifyState', [
      transition('loading => complete', [
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

  // the tree nodes to be rendered in the tree, a subset of allTreeNodes
  treeNodes: TreeNode[];
  // the observer that monitors the DOM element change on the tree
  observer: MutationObserver;
  // a utility variable storing temporary information on the node that is being expanded
  expansionStatus: any;
  // the variable holding the current metadata overlay content being shown
  metadataContent: any = [];
  // the search term in the text input box to filter the tree
  searchTerm: string;

  constructor(private constraintService: ConstraintService,
              public dimensionRegistryService: DimensionRegistryService,
              private element: ElementRef) {
    this.expansionStatus = {
      expanded: false,
      treeNodeElm: null,
      treeNode: null
    };
    this.treeNodes = dimensionRegistryService.treeNodes;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(this.update.bind(this));
    const config = {
      attributes: false,
      subtree: true,
      childList: true,
      characterData: false
    };

    this.observer.observe(this.element.nativeElement, config);
  }

  /**
   * Update the contextmenu popup (right click) content
   * by the given metadata object from a treenode
   * @param metadata
   */
  updateMetadataContent(metadata) {
    this.metadataContent = [];
    for (let key in metadata) {
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
        dataObject['dropMode'] = DropMode.TreeNode;
        this.constraintService.selectedNode = dataObject;
      }).bind(this);

      let handleContextmenu = (function (event) {
        event.stopPropagation();
        event.preventDefault();
        this.updateMetadataContent(metadata);
        this.treeNodeMetadataPanel.toggle(event);
        let div = this.treeNodeMetadataPanel.el.nativeElement.children[0];
        div.style.left = event.clientX + 'px';
        div.style.top = (event.layerY + 75) + 'px';
      }).bind(this);

      // if the data object type belongs to the listed types
      if (this.constraintService.validTreeNodeTypes.includes(dataObjectType)) {
        treeNodeElm.addEventListener('dragstart', handleDragstart);
      }
      // if metadata exits
      if (metadata) {
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
    if (this.expansionStatus['expanded']) {
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
    if (event.node) {
      this.expansionStatus['expanded'] = true;
      this.expansionStatus['treeNodeElm'] = event.originalEvent.target.parentElement.parentElement;
      this.expansionStatus['treeNode'] = event.node;
    }
  }

  /**
   * Recursively filter the tree nodes and return the copied tree nodes that match
   * @param treeNodes
   * @param field
   * @param filterWord
   * @returns {Array}
   */
  filterTreeNodes(treeNodes, field, filterWord) {
    let result = {
      hasMatching: false,
      matchingTreeNodes: [] // matchingTreeNodes is a subset of treeNodes
    };
    for (let node of treeNodes) {
      let nodeCopy = Object.assign({}, node);
      nodeCopy['expanded'] = true;
      let fieldString = node[field].toLowerCase();
      if (fieldString.includes(filterWord)) {
        result.hasMatching = true;
        result.matchingTreeNodes.push(nodeCopy);
      }
      if (node['children'] && node['children'].length > 0) {
        let subResult = this.filterTreeNodes(node['children'], field, filterWord);
        if (subResult.hasMatching) {
          nodeCopy['children'] = subResult.matchingTreeNodes;
          result.hasMatching = true;
          if (result.matchingTreeNodes.indexOf(nodeCopy) === -1) {
            result.matchingTreeNodes.push(nodeCopy);
          }
        }
      }
    }
    return result;
  }

  /**
   * User typing in the input box of the filter search box triggers this function
   * @param event
   */
  onFiltering(event) {
    if (this.searchTerm === '') {
      this.treeNodes = this.dimensionRegistryService.treeNodes;
    } else {
      let filterWord = this.searchTerm.toLowerCase();
      this.treeNodes = this.filterTreeNodes(this.dimensionRegistryService.treeNodes, 'label', filterWord).matchingTreeNodes;
      console.log('found tree nodes: ', this.treeNodes);
    }
  }

}
