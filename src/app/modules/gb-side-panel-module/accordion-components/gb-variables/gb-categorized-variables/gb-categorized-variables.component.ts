/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Component} from '@angular/core';
import {TreeNodeService} from "../../../../../services/tree-node.service";
import {TreeNode} from "primeng/api";
import {VariableService} from "../../../../../services/variable.service";
import {NavbarService} from "../../../../../services/navbar.service";
import {GbTreeNode} from "../../../../../models/tree-node-models/gb-tree-node";

@Component({
  selector: 'gb-categorized-variables',
  templateUrl: './gb-categorized-variables.component.html',
  styleUrls: ['./gb-categorized-variables.component.css']
})
export class GbCategorizedVariablesComponent {


  constructor(private treeNodeService: TreeNodeService,
              private variableService: VariableService,
              private navbarService: NavbarService) {
  }

  onDragStart(e, variableNode) {
    this.treeNodeService.selectedTreeNode = variableNode;
  }

  onCheck(checked, variableNode) {
    //TODO convert selectedVariablesTree to set
    const index = this.variableService.selectedVariablesTree.indexOf(variableNode, 0);
    if (checked) {
      if (index == -1) {
        this.variableService.selectedVariablesTree.push(variableNode);
      }
    } else {
      if (index > -1) {
        this.variableService.selectedVariablesTree.splice(index, 1);
      }
    }
  }

  isSelected(variableNode: GbTreeNode) {
    return this.variableService.selectedVariablesTree.indexOf(variableNode, 0) > -1;
  }

  get categorizedVariablesTree(): TreeNode[] {
    return this.variableService.categorizedVariablesTree;
  }

  set categorizedVariablesTree(value: TreeNode[]) {
    this.variableService.categorizedVariablesTree = value;
  }

  get selectedVariablesTreeData(): TreeNode[] {
    return this.variableService.selectedVariablesTree;
  }

  set selectedVariablesTreeData(value: TreeNode[]) {
    this.variableService.selectedVariablesTree = value;
  }

  get isExport(): boolean {
    return this.navbarService.isExport;
  }

  get variablesDragDropScope(): string {
    return this.variableService.variablesDragDropScope;
  }

}
