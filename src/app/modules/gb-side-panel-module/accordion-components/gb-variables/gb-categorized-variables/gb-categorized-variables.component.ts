/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Component} from '@angular/core';
import {TreeNodeService} from '../../../../../services/tree-node.service';
import {TreeNode} from 'primeng/api';
import {VariableService} from '../../../../../services/variable.service';
import {NavbarService} from '../../../../../services/navbar.service';
import {GbTreeNode} from '../../../../../models/tree-node-models/gb-tree-node';

@Component({
  selector: 'gb-categorized-variables',
  templateUrl: './gb-categorized-variables.component.html',
  styleUrls: ['./gb-categorized-variables.component.css']
})
export class GbCategorizedVariablesComponent {

  highlightClass = 'gb-highlight-treenode';

  constructor(private treeNodeService: TreeNodeService,
              private variableService: VariableService,
              private navbarService: NavbarService) {
  }

  onDragStart(e, variableNode) {
    this.treeNodeService.selectedTreeNode = variableNode;
  }

  onCheck(checked, variableNode) {
    // TODO convert selectedVariablesTree to set
    const index = this.variableService.selectedVariablesTree.indexOf(variableNode, 0);
    if (checked) {
      if (index === -1) {
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

  isHighlighted(node: GbTreeNode) {
    return node.styleClass !== undefined && node.styleClass.includes(this.highlightClass);
  }

  get categorizedVariablesTree(): TreeNode[] {
    return this.variableService.categorizedVariablesTree;
  }

  highlightedVariablesFirst(tree: GbTreeNode[]): GbTreeNode[] {
    return tree.sort((n1, n2) => {
      let n1Highlighted = this.isHighlighted(n1);
      let n2Highlighted = this.isHighlighted(n2);
      if (n1Highlighted > n2Highlighted) {
        return -1;
      }
      if (n1Highlighted < n2Highlighted) {
        return 1;
      }
      if (n1.name > n2.name) {
        return 1;
      }
      if (n1.name < n1.name) {
        return -1;
      }
      return 0;
    });
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
