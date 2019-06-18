/**
 * Copyright 2019 The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {GbTreeNode} from '../models/tree-node-models/gb-tree-node';

export class TreeNodeHelper {

  /**
   * For a tree node, this function selects its parent nodes recursively.
   *
   * It should be used, when selecting a tree node programmatically.
   * Reason: the PrimeNg library does not handle selecting of a parent node,
   * when the selection of the node is not triggered by a mouse click event.
   *
   * @param parent a parent node of a selected node
   * @param selectedNodes array of currently selected nodes
   */
  public static updateParentNodesSelectionRecursively(parent: GbTreeNode, selectedNodes: GbTreeNode[]) {
    if (parent === undefined) {
      return;
    }
    parent.partialSelected = false;
    if (parent.children.every((child: GbTreeNode) => selectedNodes.includes(child))) {
      this.addNodeToSelectedNodes(parent, selectedNodes);
    } else {
      this.removeNodeFromSelectedNodes(parent, selectedNodes);
      if (parent.children.some((child: GbTreeNode) =>
        (selectedNodes.includes(child) || child.partialSelected === true))) {
        parent.partialSelected = true;
      }
    }
    this.updateParentNodesSelectionRecursively(parent.parent, selectedNodes);
  }

  /**
   * For a tree node, this function updates all of its children by setting the node as their parent.
   *
   * This is required for the tree nodes checkboxes update.
   * @param node
   */
  public static updateParentForAllChildren(node: GbTreeNode) {
    node.children.forEach((child) => {
      if (child) {
        child.parent = node
      }
    });
  }

  /**
   * Helper function for deselecting a tree node.
   *
   * @param node deselected node
   * @param selectedNodes current tree nodes selection
   */
  public static  removeNodeFromSelectedNodes(node: GbTreeNode, selectedNodes: GbTreeNode[]) {
    const index = selectedNodes.indexOf(node, 0);
    if (index > -1) {
      selectedNodes.splice(index, 1);
    }
  }

  /**
   * Helper function for selecting a tree node.
   *
   * @param node selected node
   * @param selectedNodes current tree nodes selection
   */
  public static  addNodeToSelectedNodes(node: GbTreeNode, selectedNodes: GbTreeNode[]) {
    selectedNodes.push(node);
  }

}
