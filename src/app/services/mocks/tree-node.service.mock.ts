/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TreeNode} from 'primeng/primeng';
import {Concept} from '../../models/constraint-models/concept';
import {Subject} from 'rxjs';
import {CountItem} from '../../models/aggregate-models/count-item';
import {Constraint} from '../../models/constraint-models/constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';

export class TreeNodeServiceMock {
  private _treeNodes: TreeNode[] = [];
  private _treeNodesCopy: TreeNode[] = [];
  public treeNodeCallsSent = 0; // the number of tree-node calls sent
  public treeNodeCallsReceived = 0; // the number of tree-node calls received
  public treeNodesUpdated: Subject<boolean> = new Subject<boolean>();
  private _validTreeNodeTypes: string[] = [];
  private _showObservationCounts: boolean;
  private processedConceptCodes: string[] = [];
  private _constraint: Constraint = new CombinationConstraint();

  public selectedTreeNode: TreeNode = null;

  constructor() {
    this._validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL',
      'DATE',
      'STUDY',
      'TEXT',
      'HIGH_DIMENSIONAL',
      'UNKNOWN'
    ];
  }

  public load() {
  }

  public loadTreeNodes() {
  }

  isVariableNode(n: TreeNode): boolean {
    return true;
  }

  public flattenTreeNodes(nodes: TreeNode[], flattened: TreeNode[]) {
  }

  public copyTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return [];
  }

  public isTreeNodeLeaf(node: TreeNode): boolean {
    return node['visualAttributes'] ? node['visualAttributes'].includes('LEAF') : false;
  }

  public formatNodeWithCounts(node: TreeNode, countItem: CountItem) {
  }

  public copyTreeNodeUpward(node: TreeNode): TreeNode {
    return node;
  }

  public depthOfTreeNode(node: TreeNode): number {
    return node['fullName'] ? node['fullName'].split('\\').length - 2 : null;
  }

  get validTreeNodeTypes(): string[] {
    return this._validTreeNodeTypes;
  }

  set validTreeNodeTypes(value: string[]) {
    this._validTreeNodeTypes = value;
  }

  get isTreeNodesLoadingCompleted(): boolean {
    return true;
  }

  public getConceptFromTreeNode(treeNode: TreeNode): Concept {
    return new Concept();
  }

  public generateConstraintFromTreeNode(selectedNode: TreeNode): Constraint {
    return this._constraint;
  }

  get treeNodesCopy(): TreeNode[] {
    return this._treeNodesCopy;
  }

  set treeNodesCopy(value: TreeNode[]) {
    this._treeNodesCopy = value;
  }

  get treeNodes(): TreeNode[] {
    return this._treeNodes;
  }

  set treeNodes(value: TreeNode[]) {
    this._treeNodes = value;
  }

  get showObservationCounts(): boolean {
    return this._showObservationCounts;
  }

  set showObservationCounts(value: boolean) {
    this._showObservationCounts = value;
  }
}
