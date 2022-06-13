/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {TreeNode} from 'primeng/api';
import {ConstraintService} from '../../../../../services/constraint.service';
import {NavbarService} from '../../../../../services/navbar.service';
import {TreeNodeService} from '../../../../../services/tree-node.service';
import {VariableService} from '../../../../../services/variable.service';
import {TreeNodeHelper} from '../../../../../utilities/tree-node-helper';

@Component({
  selector: 'gb-variables-tree',
  templateUrl: './gb-variables-tree.component.html',
  styleUrls: ['./gb-variables-tree.component.css']
})
export class GbVariablesTreeComponent implements OnInit, AfterViewInit {

  // the observer that monitors the DOM element change on the tree
  observer: MutationObserver;

  constructor(private navbarService: NavbarService,
              private variableService: VariableService,
              private constraintService: ConstraintService,
              private treeNodeService: TreeNodeService,
              public element: ElementRef) {
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

  update() {
    let treeNodeContainer: Element = this.element.nativeElement.querySelector('.ui-tree-container');
    if (treeNodeContainer) {
      let treeNodeElements = Array.from(treeNodeContainer.children);
      this.updateEventListeners(treeNodeElements, this.variablesTreeData);
    }
  }

  updateEventListeners(treeNodeElements: Element[], treeNodes: TreeNode[]) {
    let index = 0;

    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodes[index];
      let dataObjectType = dataObject['type'];
      let treeNodeElm = elm.querySelector('li.ui-treenode');

      let handleDragstart = (function(event) {
        event.stopPropagation();
        this.treeNodeService.selectedTreeNode = dataObject;
      }).bind(this);
      // if the data object type belongs to the listed types
      if (TreeNodeHelper.VALID_TREE_NODE_TYPES.includes(dataObjectType)
        && !treeNodeElm.hasAttribute('hasEventListener')) {
        treeNodeElm.setAttribute('hasEventListener', 'true');
        treeNodeElm.addEventListener('dragstart', handleDragstart);
      }
      let uiTreeNodeChildrenElm = elm.querySelector('.ui-treenode-children');
      if (uiTreeNodeChildrenElm) {
        this.updateEventListeners(Array.from(uiTreeNodeChildrenElm.children), dataObject.children);
      }
      index++;
    }
  }

  nodeSelect(event) {
    this.variableService.updateVariableSelection(event.node, true);
  }

  nodeUnselect(event) {
    this.variableService.updateVariableSelection(event.node, false);
  }

  get variablesTreeData(): TreeNode[] {
    return this.variableService.variablesTree;
  }

  get selectedVariablesTreeData(): TreeNode[] {
    return this.variableService.selectedVariablesTree;
  }

  set selectedVariablesTreeData(value: TreeNode[]) {
    this.variableService.selectedVariablesTree = value;
  }

  get isTreeNodeLoadingCompleted(): boolean {
    return this.treeNodeService.isTreeNodesLoadingCompleted;
  }

  get treeNodeSelectionMode(): string {
    return this.isExport ? 'checkbox' : null;
  }

  get isExport(): boolean {
    return this.navbarService.isExport;
  }

  get variablesDragDropScope(): string {
    return this.variableService.variablesDragDropScope;
  }

}
