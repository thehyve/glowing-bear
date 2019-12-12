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
import {GbTreeNode} from '../../models/tree-node-models/gb-tree-node';

export class TreeNodeServiceMock {
  private _treeNodes: TreeNode[] = [];
  private _treeNodesCopy: TreeNode[] = [];
  public treeNodeCallsSent = 0; // the number of tree-node calls sent
  public treeNodeCallsReceived = 0; // the number of tree-node calls received
  public treeNodesUpdated: Subject<boolean> = new Subject<boolean>();
  private _showObservationCounts: boolean;
  private processedConceptCodes: string[] = [];
  private _constraint: Constraint = new CombinationConstraint();

  public selectedTreeNode: TreeNode = null;

  constructor() {
  }

  public load() {
  }

  public loadTreeNodes() {
  }

  public formatNodeWithCounts(node: TreeNode, countItem: CountItem) {
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

  public getAllVariablesFromTreeNode(node: GbTreeNode, variables: GbTreeNode[]) {

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
