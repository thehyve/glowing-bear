/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit, ElementRef, AfterViewInit, ViewChild, AfterViewChecked} from '@angular/core';
import {TreeNode} from 'primeng/components/common/api';
import {OverlayPanel} from 'primeng/components/overlaypanel/overlaypanel';
import {trigger, transition, animate, style} from '@angular/animations';
import {TreeNodeService} from '../../../../services/tree-node.service';

@Component({
  selector: 'gb-tree-nodes',
  templateUrl: './gb-tree-nodes.component.html',
  styleUrls: ['./gb-tree-nodes.component.css'],
  animations: [
    trigger('notifyState', [
      transition('loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 0.5)'
        }),
        animate('500ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class GbTreeNodesComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @ViewChild('treeNodeMetadataPanel') treeNodeMetadataPanel: OverlayPanel;

  // the observer that monitors the DOM element change on the tree
  observer: MutationObserver;
  // a utility variable storing temporary information on the node that is being expanded
  expansionStatus: any;
  // the variable holding the current metadata overlay content being shown
  metadataContent: any = [];
  // the search term in the text input box to filter the tree
  searchTerm = '';
  // the delay before triggering updating methods
  // as the PrimeNg tree nodes reconstruct DOM nodes and css styles when data changes,
  // and this will take a while
  delay: number;
  // indicate if the initUpdate is finished
  initUpdated: boolean;
  // max number of expanded nodes in search
  maxNumExpandedNodes = 30;
  numExpandedNodes = 0;
  // current number of hits in search
  hits = 0;

  constructor(public treeNodeService: TreeNodeService,
              private element: ElementRef) {
    this.expansionStatus = {
      expanded: false,
      treeNodeElm: null,
      treeNode: null
    };
    this.delay = 500;
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

  ngAfterViewChecked() {
    this.initUpdate();
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
      let treeNodeElmLabel = elm.querySelector('li.ui-treenode .ui-treenode-label');
      let handleDragstart = (function (event) {
        event.stopPropagation();
        this.treeNodeService.selectedTreeNode = dataObject;
      }).bind(this);

      let showInfo = (function (event: MouseEvent) {
        this.updateMetadataContent(metadata);
        this.treeNodeMetadataPanel.show(event);
      }).bind(this);

      let showInfo1 = ((event: MouseEvent) => {
        this.updateMetadataContent(metadata);
        this.treeNodeMetadataPanel.show(event);
      }).bind(this);

      let hideInfo = (function (event: MouseEvent) {
        this.updateMetadataContent(metadata);
        this.treeNodeMetadataPanel.hide(event);
      }).bind(this);

      // if the data object type belongs to the listed types
      if (this.treeNodeService.validTreeNodeTypes.includes(dataObjectType)) {
        treeNodeElm.addEventListener('dragstart', handleDragstart);
      }
      // if metadata exits
      if (metadata) {
        treeNodeElmLabel.addEventListener('mouseenter', showInfo);
        treeNodeElmLabel.addEventListener('mouseleave', hideInfo);
      }

      let uiTreeNodeChildrenElm = elm.querySelector('.ui-treenode-children');
      if (uiTreeNodeChildrenElm) {
        this.updateEventListeners(uiTreeNodeChildrenElm.children, dataObject.children);
      }
      index++;
    }
  }

  initUpdate() {
    if (!this.initUpdated) {
      let treeContainer = this.element.nativeElement.querySelector('.ui-tree-container');
      if (treeContainer) {
        let treeNodeElements = treeContainer.children;
        if (treeNodeElements && treeNodeElements.length > 0) {
          this.updateEventListeners(treeNodeElements, this.treeNodeService.treeNodes);
          this.initUpdated = true;
        }
      }
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
    this.removeFalsePrimeNgClasses(this.delay);
  }

  /**
   * Event handler when the user expands one of the tree nodes,
   * once a tree node is expanded,
   * it triggers the MutationObserver to do a further update.
   * @param event
   */
  expandNode(event) {
    if (event.node) {
      this.expansionStatus['expanded'] = true;
      this.expansionStatus['treeNodeElm'] = event.originalEvent.target.parentElement.parentElement;
      this.expansionStatus['treeNode'] = event.node;
    }
  }

  /**
   * Recursively filter the original tree nodes in the dimension registry,
   * assign highlight css classes to tree nodes
   * @param {TreeNode[]} treeNodes
   * @param {string} field
   * @param filterWord
   * @returns {{hasMatching: boolean}}
   */
  filterWithHighlightTreeNodes(treeNodes: TreeNode[], field: string, filterWord: string) {
    let result = {
      hasMatching: false
    };
    // if the tree nodes are defined
    if (treeNodes) {
      // if there is a filter word
      if (filterWord.length > 0) {
        treeNodes.forEach((node: TreeNode) => {
          let expanded = false;
          node['styleClass'] = undefined;
          let fieldString = node[field].toLowerCase();
          if (fieldString.includes(filterWord)) { // if there is a hit
            this.hits++;
            result.hasMatching = true;
            if (node['children'] && node['children'].length > 0) {
              node['styleClass'] = 'gb-highlight-treenode gb-is-not-leaf';
            } else {
              node['styleClass'] = 'gb-highlight-treenode';
            }
          } else { // if there is no hit
            node['styleClass'] = undefined;
          }
          if (node['children'] && node['children'].length > 0) {
            let subResult =
              this.filterWithHighlightTreeNodes(node['children'], field, filterWord);
            if (subResult.hasMatching) {
              result.hasMatching = true;
              if (this.numExpandedNodes < this.maxNumExpandedNodes) {
                expanded = true;
                this.numExpandedNodes++;
              }
            }
          }
          /*
           * for some funny reason, typescript considers false and true as their own types
           * thus directly assigning node['expanded'] with true or false values results in conflict
           */
          node['expanded'] = expanded;
        });

      } else { // if the filter word is empty
        for (let node of treeNodes) {
          node['expanded'] = false;
          if (node['children'] && node['children'].length > 0) {
            node['styleClass'] = 'is-not-leaf';
            this.filterWithHighlightTreeNodes(node['children'], field, filterWord);
          } else {
            node['styleClass'] = undefined;
          }
        }
      }
    }
    return result;
  }

  /**
   * PrimeNg tree is behaving strangely when dynamically adding custom class to tree nodes:
   * sometimes a tree node with children is marked with the 'ui-treenode-leaf' class.
   * Furthermore, sometimes a loader element is unnecessarily attached (.ui-autocomplete-loader)
   * This function is to remove any false ui-treenode-leaf classes and
   * the loader element with ui-autocomplete-loader class.
   * Also add some delay to wait for the tree construction, typically 1 to 2 seconds.
   */
  removeFalsePrimeNgClasses(delay: number) {
    window.setTimeout((function () {
      let leaves = this.element.nativeElement.querySelectorAll('.ui-treenode-leaf');
      if (leaves) {
        for (let supposedLeaf of leaves) {
          if (supposedLeaf.classList.contains('is-not-leaf')) {
            supposedLeaf.classList.remove('ui-treenode-leaf');
          }
        }
      }
      let loaderIcon = this.element.nativeElement.querySelector('.ui-autocomplete-loader');
      if (loaderIcon) {
        loaderIcon.remove();
      }
    }).bind(this), delay);
  }

  /**
   * User typing in the input box of the filter search box triggers this handler
   * @param event
   */
  onFiltering(event) {
    let filterWord = this.searchTerm.trim().toLowerCase();
    if (filterWord.length > 1) {
      this.hits = 0;
      this.numExpandedNodes = 0;
      this.filterWithHighlightTreeNodes(this.treeNodeService.treeNodes, 'label', filterWord);
      this.treeNodeService.treeNodes.forEach((topNode: TreeNode) => {
        topNode.expanded = true;
      });
      this.removeFalsePrimeNgClasses(this.delay);

      window.setTimeout((function () {
        let treeNodeElements = this.element.nativeElement.querySelector('.ui-tree-container').children;
        let treeNodes = this.treeNodeService.treeNodes;
        this.updateEventListeners(treeNodeElements, treeNodes);
      }).bind(this), this.delay);
    }
  }

  /**
   * Clear filtering words
   */
  clearFilter() {
    this.filterWithHighlightTreeNodes(this.treeNodeService.treeNodes, 'label', '');
    this.removeFalsePrimeNgClasses(this.delay);
    const input = this.element.nativeElement.querySelector('.ui-inputtext');
    input.value = '';
    this.hits = 0;
  }

  get isLoading(): boolean {
    return !this.treeNodeService.isTreeNodesLoadingCompleted;
  }

}
