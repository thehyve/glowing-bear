/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TreeNode} from 'primeng/primeng';
import {CountItem} from '../../models/aggregate-models/count-item';
import {Concept} from '../../models/constraint-models/concept';
import {Subject} from 'rxjs';

export class TreeNodeServiceMock {
  // the variable that holds the entire tree structure, used by the tree on the left
  public treeNodes: TreeNode[] = [];
  // the copy of the tree nodes that is used for constructing the tree in the 2nd step (projection)
  public treeNodesCopy: TreeNode[] = [];
  // the entire tree table data that holds the patients' observations in the 2nd step (projection)
  private _projectionTreeData: TreeNode[] = [];
  // the selected tree table data that holds the patients' observations in the 2nd step (projection)
  private _selectedProjectionTreeData: TreeNode[] = [];
  // the final tree nodes resulted from data selection
  private _finalTreeNodes: TreeNode[] = [];

  public selectedTreeNode;
  public treeNodeCallsSent = 0; // the number of tree-node calls sent
  public treeNodeCallsReceived = 0; // the number of tree-node calls received
  public treeNodesUpdated: Subject<boolean> = new Subject<boolean>();

  public conceptCountMap: Map<string, CountItem>;
  public studyCountMap: Map<string, CountItem>;
  public studyConceptCountMap: Map<string, Map<string, CountItem>>;

  private _validTreeNodeTypes: string[] = [];

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
    // construct the maps
    let map1 = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    map1.set('concept1', item1);
    let map2 = new Map<string, CountItem>();
    let item2 = new CountItem(30, 110);
    let item3 = new CountItem(70, 90);
    map2.set('concept2', item2);
    map2.set('concept3', item3);
    this.studyConceptCountMap = new Map<string, Map<string, CountItem>>();
    this.studyConceptCountMap.set('study1', map1);
    this.studyConceptCountMap.set('study2', map2);

    this.studyCountMap = new Map<string, CountItem>();
    this.studyCountMap.set('study1', new CountItem(10, 20));
    this.studyCountMap.set('study2', new CountItem(100, 200));

    this.conceptCountMap = new Map<string, CountItem>();
    this.conceptCountMap.set('concept1', new CountItem(10, 20));
    this.conceptCountMap.set('concept2', new CountItem(30, 110));
    this.conceptCountMap.set('concept3', new CountItem(70, 90));
  }

  public load() {
  }

  public loadTreeNodes() {
  }

  getFullProjectionTreeDataChecklist(existingChecklist?: string[]): string[] {
    return [];
  }

  get projectionTreeData(): TreeNode[] {
    return this._projectionTreeData;
  }

  set projectionTreeData(value: TreeNode[]) {
    this._projectionTreeData = value;
  }

  get selectedVariablesTreeData(): TreeNode[] {
    return this._selectedProjectionTreeData;
  }

  set selectedVariablesTreeData(value: TreeNode[]) {
    this._selectedProjectionTreeData = value;
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

  public updateVariablesTreeData(conceptCountMap: object, checklist: Array<string>) {
  }

  public updateFinalTreeNodes() {
  }

  get finalTreeNodes(): TreeNode[] {
    return this._finalTreeNodes;
  }

  set finalTreeNodes(value: TreeNode[]) {
    this._finalTreeNodes = value;
  }

  public checkAllVariablesTreeDataIterative(nodes: TreeNode[]) {

  }

  public selectVariablesTreeNodesByNames(names: string[]) {
  }

  public selectVariablesTreeNodesByPaths(paths: string[]) {
  }

  public getConceptFromTreeNode(treeNode: TreeNode): Concept {
    return new Concept();
  }

}
