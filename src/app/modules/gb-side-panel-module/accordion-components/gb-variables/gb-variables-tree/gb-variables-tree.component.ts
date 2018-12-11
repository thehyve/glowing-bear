/**
 * Copyright 2017 - 2018  The Hyve B.V.
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
import {DataTableService} from '../../../../../services/data-table.service';

@Component({
  selector: 'gb-variables-tree',
  templateUrl: './gb-variables-tree.component.html',
  styleUrls: ['./gb-variables-tree.component.css']
})
export class GbVariablesTreeComponent implements OnInit, AfterViewInit {

  // the observer that monitors the DOM element change on the tree
  observer: MutationObserver;

  constructor(private navbarService: NavbarService,
              private constraintService: ConstraintService,
              private treeNodeService: TreeNodeService,
              private dataTableService: DataTableService,
              public element: ElementRef) {
  }

  ngOnInit() {
    this.checkAll(true);
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
    let treeNodeContainer = this.element.nativeElement.querySelector('.ui-tree-container');
    if (treeNodeContainer) {
      let treeNodeElements = treeNodeContainer.children;
      this.updateEventListeners(treeNodeElements, this.variablesTreeData);
    }
  }

  updateEventListeners(treeNodeElements: any[], treeNodes: TreeNode[]) {
    let index = 0;
    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodes[index];
      let dataObjectType = dataObject['type'];
      let treeNodeElm = elm.querySelector('li.ui-treenode');

      let handleDragstart = (function (event) {
        event.stopPropagation();
        this.treeNodeService.selectedTreeNode = dataObject;
      }).bind(this);
      // if the data object type belongs to the listed types
      if (this.treeNodeService.validTreeNodeTypes.includes(dataObjectType)
        && !treeNodeElm.hasAttribute('hasEventListener')) {
        treeNodeElm.setAttribute('hasEventListener', true);
        treeNodeElm.addEventListener('dragstart', handleDragstart);
      }
      let uiTreeNodeChildrenElm = elm.querySelector('.ui-treenode-children');
      if (uiTreeNodeChildrenElm) {
        this.updateEventListeners(uiTreeNodeChildrenElm.children, dataObject.children);
      }
      index++;
    }
  }

  checkVariables() {
    this.dataTableService.isDirty = true;
  }

  checkAll(b: boolean) {
    this.selectedVariablesTreeData = [];
    if (b) {
      this.treeNodeService.checkAllVariablesTreeDataIterative(this.variablesTreeData);
    }
    this.checkVariables();
  }

  get variablesTreeData(): TreeNode[] {
    return this.treeNodeService.variablesTreeData;
  }

  get selectedVariablesTreeData(): TreeNode[] {
    return this.treeNodeService.selectedVariablesTreeData;
  }

  set selectedVariablesTreeData(value: TreeNode[]) {
    this.treeNodeService.selectedVariablesTreeData = value;
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
    return this.constraintService.variablesDragDropScope;
  }

  get checkAllText(): string {
    let numSelected = this.numberOfSelected;
    return numSelected === 1 ?
      `${numSelected} variable selected` : `${numSelected} variables selected`;
  }

  get allChecked(): boolean {
    return this.numberOfSelected === this.constraintService.variables.length;
  }

  get numberOfSelected(): number {
    return this.selectedVariablesTreeData.filter(node =>
      this.constraintService.isVariableNode(node.type)).length;
  }

}
