/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TreeNodeHelper} from './tree-node-helper';
import {GbTreeNode} from '../models/tree-node-models/gb-tree-node';
import {VisualAttribute} from '../models/tree-node-models/visual-attribute';

describe('TreeNodeHelper', () => {

  it('should verify if a tree node is concept node', () => {
    let node: GbTreeNode = {};
    node.type = 'NUMERIC';
    let isConcept = TreeNodeHelper.isVariableNode(node);
    expect(isConcept).toBe(true);
    node.type = 'CATEGORICAL';
    isConcept = TreeNodeHelper.isVariableNode(node);
    expect(isConcept).toBe(true);
    node.type = 'DATE';
    isConcept = TreeNodeHelper.isVariableNode(node);
    expect(isConcept).toBe(true);
    node.type = 'TEXT';
    isConcept = TreeNodeHelper.isVariableNode(node);
    expect(isConcept).toBe(true);
    node.type = 'HIGH_DIMENSIONAL';
    isConcept = TreeNodeHelper.isVariableNode(node);
    expect(isConcept).toBe(true);
    node.type = undefined;
    isConcept = TreeNodeHelper.isVariableNode(node);
    expect(isConcept).toBe(false);
  });

  it('should verify if a tree node is study node', () => {
    let node: GbTreeNode = {};
    node.type = 'STUDY';
    let isStudy = TreeNodeHelper.isTreeNodeStudy(node);
    expect(isStudy).toBe(true);
    node.type = undefined;
    isStudy = TreeNodeHelper.isTreeNodeStudy(node);
    expect(isStudy).toBe(false);
  });

  it('should verify if a tree node is leaf node', () => {
    let node: GbTreeNode = {};
    node.visualAttributes = ['bar', 'foo', 'LEAF'] as VisualAttribute[];
    let is = TreeNodeHelper.isTreeNodeLeaf(node);
    expect(is).toBe(true);
  });

  it('should copy tree nodes', () => {
    let node: GbTreeNode = {};
    let node_1: GbTreeNode = {};
    let node_1_1: GbTreeNode = {};
    node_1_1.parent = node_1;
    node_1_1.type = 'node_1_1_type';
    node_1.children = [node_1_1];
    node_1.type = 'node_1_type';
    node_1.parent = node;
    node.children = [node_1];
    let result = TreeNodeHelper.copyTreeNodes([node]);
    expect(result[0].children[0].type).toEqual('node_1_type');
    expect(result[0].children[0].children[0].type).toEqual('node_1_1_type');
  });

  it('should copy tree nodes upwards', () => {
    let node: GbTreeNode = {};
    let node_1: GbTreeNode = {};
    let node_1_1: GbTreeNode = {};
    node_1_1.parent = node_1;
    node_1_1.type = 'node_1_1_type';
    node_1.children = [node_1_1];
    node_1.type = 'node_1_type';
    node_1.parent = node;
    node.children = [node_1];
    node.type = 'node_type';
    let result = TreeNodeHelper.copyTreeNodeUpward(node_1);
    expect(result.type).toEqual('node_1_type');
    expect(result.children).not.toBeDefined();
    expect(result.parent.type).toBe('node_type');
  });

  it('should flatten tree nodes', () => {
    let node1: GbTreeNode = {};
    let node1_1: GbTreeNode = {};
    let node1_1_1: GbTreeNode = {};
    node1_1.children = [node1_1_1];
    node1.children = [node1_1];
    let node2: GbTreeNode = {};
    let flattened = [];
    TreeNodeHelper.flattenTreeNodes([node1, node2], flattened);
    expect(flattened.length).toBe(4);
  });

  it('should compute depth of tree node', () => {
    let node: GbTreeNode = {};
    node.fullName = 'a\\b\\c\\d\\e\\';
    const depth = TreeNodeHelper.depthOfTreeNode(node);
    expect(depth).toBe(4);
  });

  it('should check if a tree node is variable node', () => {
    let node: GbTreeNode = {};
    node.type = 'NUMERIC';
    expect(TreeNodeHelper.isVariableNode(node)).toBe(true);
    node.type = 'CATEGORICAL';
    expect(TreeNodeHelper.isVariableNode(node)).toBe(true);
    node.type = 'CATEGORICAL_OPTION';
    expect(TreeNodeHelper.isVariableNode(node)).toBe(true);
    node.type = 'DATE';
    expect(TreeNodeHelper.isVariableNode(node)).toBe(true);
    node.type = 'foobar';
    expect(TreeNodeHelper.isVariableNode(node)).toBe(false);
    node.type = 'HIGH_DIMENSIONAL';
    expect(TreeNodeHelper.isVariableNode(node)).toBe(true);
    node.type = 'TEXT';
    expect(TreeNodeHelper.isVariableNode(node)).toBe(true);
  });

});
