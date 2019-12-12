/**
 * Copyright 2019 The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {GbTreeNode} from '../models/tree-node-models/gb-tree-node';
import {VisualAttribute} from '../models/tree-node-models/visual-attribute';

export class TreeNodeHelper {

  public static VALID_TREE_NODE_TYPES = [
    'NUMERIC',
    'CATEGORICAL',
    'CATEGORICAL_OPTION',
    'DATE',
    'STUDY',
    'TEXT',
    'HIGH_DIMENSIONAL',
    'UNKNOWN'
  ];

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

  /**
   * Create a deep copy of a forest
   * @param nodes
   */
  public static copyTreeNodes(nodes: GbTreeNode[]): GbTreeNode[] {
    let nodesCopy = [];
    for (let node of nodes) {
      let parent = node.parent;
      let children = node.children;
      node.parent = null;
      node.children = null;
      let nodeCopy = JSON.parse(JSON.stringify(node));
      if (children) {
        nodeCopy.children = this.copyTreeNodes(children);
      }
      nodesCopy.push(nodeCopy);
      node.parent = parent;
      node.children = children;
    }
    return nodesCopy;
  }

  /**
   * Copy the given treenode upward, i.e. excluding its children
   * @param {TreeNode} node
   * @returns {TreeNode}
   */
  public static copyTreeNodeUpward(node: GbTreeNode): GbTreeNode {
    let nodeCopy: GbTreeNode = {};
    let parentCopy = null;
    for (let key in node) {
      if (key === 'parent') {
        parentCopy = this.copyTreeNodeUpward(node[key]);
      } else if (key !== 'children') {
        nodeCopy[key] = JSON.parse(JSON.stringify(node[key]));
      }
    }
    if (parentCopy) {
      nodeCopy.parent = parentCopy;
    }
    return nodeCopy;
  }

  /**
   * Returns the depth of a tree node based on the full name (path)
   * if it exists, null if the node is null.
   * @param node
   */
  public static depthOfTreeNode(node: GbTreeNode): number {
    return node.fullName ? node.fullName.split('\\').length - 2 : null;
  }

  /**
   * Check if a tree node is a concept node
   * @param {TreeNode} node
   * @returns {boolean}
   */
  public static isVariableNode(node: GbTreeNode): boolean {
    const type = node.type;
    return (type === 'NUMERIC' ||
      type === 'CATEGORICAL' ||
      type === 'CATEGORICAL_OPTION' ||
      type === 'DATE' ||
      type === 'HIGH_DIMENSIONAL' ||
      type === 'TEXT')
  }

  public static flattenTreeNodes(nodes: GbTreeNode[], flattened: GbTreeNode[]) {
    for (let node of nodes) {
      flattened.push(node);
      if (node.children) {
        this.flattenTreeNodes(node.children, flattened);
      }
    }
  }

  public static getAllVariablesFromTreeNode(node: GbTreeNode, variables: GbTreeNode[]) {
    if (node.children) {
      for (let child of node.children) {
        this.getAllVariablesFromTreeNode(child, variables);
      }
    } else if (this.isVariableNode(node)) {
      variables.push(node);
    }
  }

  /**
   * Check if a tree node is a study node
   * @param {TreeNode} node
   * @returns {boolean}
   */
  public static isTreeNodeStudy(node: GbTreeNode): boolean {
    return node.type ? node.type === 'STUDY' : false;
  }

  public static isTreeNodeLeaf(node: GbTreeNode): boolean {
    return node.visualAttributes ? node.visualAttributes.includes(VisualAttribute.LEAF) : false;
  }

}
