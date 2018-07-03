/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Concept} from '../models/constraint-models/concept';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {TreeNode} from 'primeng/primeng';
import {ResourceService} from './resource.service';
import {ConstraintService} from './constraint.service';
import {NavbarService} from './navbar.service';
import {ConceptType} from '../models/constraint-models/concept-type';
import {ErrorHelper} from '../utilities/error-helper';
import {MessageHelper} from '../utilities/message-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {TrueConstraint} from '../models/constraint-models/true-constraint';

type LoadingState = 'loading' | 'complete';

@Injectable()
export class TreeNodeService {

  /*
   * This service maintains three copies of tree nodes:
   * 1. treeNodes - the entire ontology tree representing the data structure of the backend
   * 2. projectionTreeData - the partial ontology tree representing the tree nodes
   *    corresponding to subject group defined in step 1,
   *    and this partial tree is used for variable selection in step 2
   * 3. finalTreeNodes - the partial ontology tree corresponding to the final tree nodes
   *    that the user has selected in all the steps of data selection
   */
  // the variable that holds the entire tree structure, used by the tree on the left side bar
  private _treeNodes: TreeNode[] = [];
  // the copy of the tree nodes that is used for constructing the tree in the 2nd step (projection)
  private _treeNodesCopy: TreeNode[] = [];
  // the tree data that is rendered in the 2nd step (projection)
  private _projectionTreeData: TreeNode[] = [];
  // the selected tree data in the 2nd step (projection)
  private _selectedProjectionTreeData: TreeNode[] = [];
  // the final tree nodes resulted from data selection
  private _finalTreeNodes: TreeNode[] = [];
  // the selected tree node in the side-panel by dragging
  private _selectedTreeNode: TreeNode = null;
  /**
   * The map that holds the conceptCode -> count item relations
   *  e.g.
   * "EHR:DEM:AGE": {
   *  "observationCount": 3,
   *   "subjectCount": 3
   *  },
   * "EHR:VSIGN:HR": {
   *  "observationCount": 9,
   *  "subjectCount": 3
   * }
   */
  private _conceptCountMap: Map<string, CountItem>;
  /**
   * The map that holds the studyId -> count item relations
   * e.g.
   * "MIX_HD": {
   *   "observationCount": 12,
   *   "subjectCount": 3
   * }
   */
  private _studyCountMap: Map<string, CountItem>;
  /**
   * The map that holds the studyId -> conceptCode -> count item relations
   * e.g.
   * "SHARED_CONCEPTS_STUDY_A": {
   *    "DEMO:POB": {
   *        "observationCount": 2,
   *        "subjectCount": 2
   *    },
   *    "VSIGN:HR": {
   *        "observationCount": 3,
   *        "subjectCount": 3
   *    }
   * }
   */
  private _studyConceptCountMap: Map<string, Map<string, CountItem>>;
  // the subset of _studyConceptCountMap that holds the selected maps
  // based on the constraint in step 1
  private _selectedStudyConceptCountMap: Map<string, Map<string, CountItem>>;

  public conceptCountMapCompleted = false;
  public studyCountMapCompleted = false;
  public studyConceptCountMapCompleted = false;

  public treeNodeCallsSent = 0; // the number of tree-node calls sent
  public treeNodeCallsReceived = 0; // the number of tree-node calls received

  // the status indicating the when the tree is being loaded or finished loading
  public loadingTreeNodes: LoadingState = 'complete';
  private _validTreeNodeTypes: string[] = [];


  constructor(private resourceService: ResourceService, private navbarService: NavbarService) {
    this.validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL',
      'DATE',
      'STUDY',
      'TEXT',
      'HIGH_DIMENSIONAL',
      'UNKNOWN'
    ];
    this.initCountMaps();
  }

  initCountMaps() {
    const constraint = new TrueConstraint();

    this.resourceService.getCountsPerConcept(constraint)
      .subscribe((map: Map<string, CountItem>) => {
        this.conceptCountMap = map;
        this.conceptCountMapCompleted = true;
      });
    this.resourceService.getCountsPerStudy(constraint)
      .subscribe((map: Map<string, CountItem>) => {
        this.studyCountMap = map;
        this.studyCountMapCompleted = true;
      });
    this.resourceService.getCountsPerStudyAndConcept(constraint)
      .subscribe((map: Map<string, Map<string, CountItem>>) => {
        this.studyConceptCountMap = map;
        this.studyConceptCountMapCompleted = true;
      });
  }

  get countMapsCompleted(): boolean {
    return this.conceptCountMapCompleted &&
      this.studyCountMapCompleted &&
      this.studyConceptCountMapCompleted;
  }

  /**
   * Load the tree nodes for rendering the tree on the left side panel;
   * construct concept constraints based on the tree nodes
   */
  public loadTreeNodes(constraintService: ConstraintService) {
    if (this.countMapsCompleted) {
      this.loadingTreeNodes = 'loading';
      constraintService.conceptLabels = [];
      // Retrieve all tree nodes and extract the concepts iteratively
      this.resourceService.getTreeNodes('\\', 2, false, true)
        .subscribe(
          (treeNodes: object[]) => {
            this.loadingTreeNodes = 'complete';
            // reset concepts and concept constraints
            constraintService.concepts = [];
            constraintService.conceptConstraints = [];
            this.processTreeNodes(treeNodes, constraintService);
            treeNodes.forEach((function (node) {
              this.treeNodes.push(node); // to ensure the treeNodes pointer remains unchanged
              this.loadTreeNext(node, constraintService);
            }).bind(this));
          },
          err => {
            ErrorHelper.handleError(err);
          }
        );
    } else {
      window.setTimeout((function () {
        this.loadTreeNodes(constraintService);
      }).bind(this), 200);
    }
  }

  /**
   * Iteratively load the descendants of the given tree node
   * @param parentNode
   */
  loadTreeNext(parentNode: TreeNode, constraintService: ConstraintService) {
    this.treeNodeCallsSent++;
    let depth = 20;
    this.resourceService.getTreeNodes(parentNode['fullName'], depth, false, true)
      .subscribe(
        (treeNodes: object[]) => {
          this.treeNodeCallsReceived++;
          const refNode = treeNodes && treeNodes.length > 0 ? treeNodes[0] : undefined;
          const children = refNode ? refNode['children'] : undefined;
          if (children) {
            parentNode['children'] = children;
          }
          this.processTreeNode(parentNode, constraintService);
          this.processTreeNodes(children, constraintService);
          let descendants = [];
          this.getTreeNodeDescendantsWithDepth(refNode, depth, descendants);
          if (descendants.length > 0) {
            for (let descendant of descendants) {
              this.loadTreeNext(descendant, constraintService);
            }
          }
        },
        err => {
          ErrorHelper.handleError(err)
        }
      );
  }

  /**
   * Extracts concepts (and later possibly other dimensions) from the
   *  provided TreeNode array and their children.
   *  And augment tree nodes with PrimeNG tree-ui specifications
   * @param treeNodes
   */
  processTreeNodes(treeNodes: object[], constraintService: ConstraintService) {
    if (!treeNodes) {
      return;
    }
    for (let node of treeNodes) {
      this.processTreeNode(node, constraintService);
      if (node['children']) {
        this.processTreeNodes(node['children'], constraintService);
      }
    }
  }

  /**
   * Add PrimeNG visual properties for tree nodes
   * Add counts to node labels
   * Add concept constraints to constraint service
   * @param {Object} node
   * @param {ConstraintService} constraintService
   */
  processTreeNode(node: Object, constraintService: ConstraintService) {
    let tail = node['metadata'] ? ' ⓘ' : ' ';
    node['label'] = node['name'] + tail;
    // Extract concept
    if (node['visualAttributes'].includes('LEAF')) {
      let concept = this.getConceptFromTreeNode(node);
      if (constraintService.conceptLabels.indexOf(concept.label) === -1) {
        constraintService.concepts.push(concept);
        constraintService.conceptLabels.push(concept.label);
        let constraint = new ConceptConstraint();
        constraint.concept = concept;
        constraintService.conceptConstraints.push(constraint);
        constraintService.allConstraints.push(constraint);
      }
      // node constraint
      if (node['constraint']) {
        node['constraint']['fullName'] = node['fullName'];
        node['constraint']['name'] = node['name'];
        node['constraint']['conceptPath'] = node['conceptPath'];
        node['constraint']['conceptCode'] = node['conceptCode'];
        node['constraint']['valueType'] = node['type'];
      }
      // node icon
      if (node['type'] === 'NUMERIC') {
        node['icon'] = 'icon-123';
      } else if (node['type'] === 'HIGH_DIMENSIONAL') {
        node['icon'] = 'icon-hd';
      } else if (node['type'] === 'CATEGORICAL') {
        node['icon'] = 'icon-abc';
      } else if (node['type'] === 'DATE') {
        node['icon'] = 'fa-calendar';
      } else if (node['type'] === 'TEXT') {
        node['icon'] = 'fa-newspaper-o';
      } else {
        node['icon'] = 'fa-folder-o';
      }
      // node count
      if (node['studyId']) {
        const count = this.studyConceptCountMap.get(node['studyId']).get(node['conceptCode']).subjectCount;
        tail = '(' + count + ')';
      } else {
        const count = this.conceptCountMap.get(node['conceptCode']).subjectCount;
        tail = '(' + count + ')';
      }
      node['label'] += tail;
    } else {
      if (node['type'] === 'UNKNOWN') {
        node['expandedIcon'] = 'fa-folder-open';
        node['collapsedIcon'] = 'fa-folder';
      } else if (node['type'] === 'STUDY') {
        node['expandedIcon'] = 'icon-folder-study-open';
        node['collapsedIcon'] = 'icon-folder-study';
        tail = '(' + this.studyCountMap.get(node['studyId']).subjectCount + ')';
        node['label'] += tail;
      }
      node['icon'] = '';
    }
  }

  /**
   * Parse a tree node and create the corresponding concept
   * @param {TreeNode} treeNode
   * @returns {Concept}
   */
  public getConceptFromTreeNode(treeNode: TreeNode): Concept {
    if (treeNode['name'] &&
      treeNode['fullName'] &&
      treeNode['conceptPath'] &&
      treeNode['conceptCode'] &&
      treeNode['type']) {
      let concept = new Concept();
      const tail = '\\' + treeNode['name'] + '\\';
      const fullName = treeNode['fullName'];
      let head = fullName.substring(0, fullName.length - tail.length);
      concept.label = treeNode['name'] + ' (' + head + ')';
      concept.path = treeNode['conceptPath'];
      concept.type = <ConceptType> treeNode['type'];
      concept.code = treeNode['conceptCode'];
      concept.fullName = treeNode['fullName'];
      concept.name = treeNode['name'];
      return concept;
    } else {
      const summary = 'Cannot construct concept from the given tree node, because the tree node\'s format is incorrect ';
      MessageHelper.alert('error', summary);
      return null;
    }
  }

  /**
   * Get the descendants of a tree node up to a predefined depth
   * @param {TreeNode} treeNode
   * @param {number} depth
   * @param {TreeNode[]} descendants
   */
  public getTreeNodeDescendantsWithDepth(treeNode: TreeNode,
                                         depth: number,
                                         descendants: TreeNode[]) {
    if (treeNode) {
      if (depth === 2) {
        if (treeNode['children']) {
          for (let child of treeNode['children']) {
            descendants.push(child);
          }
        }
      } else if (depth > 2) {
        if (treeNode['children']) {
          for (let child of treeNode['children']) {
            let newDepth = depth - 1;
            this.getTreeNodeDescendantsWithDepth(child, newDepth, descendants);
          }
        }
      }
    }
  }

  /**
   * Get the descendants of a tree node if a descendant has a type
   * that is not excluded
   * @param {TreeNode} treeNode
   * @param {string[]} excludedTypes
   * @param {TreeNode[]} descendants
   */
  public getTreeNodeDescendantsWithExcludedTypes(treeNode: TreeNode,
                                                 excludedTypes: string[],
                                                 descendants: TreeNode[]) {
    if (treeNode) {
      // If the tree node has children
      if (treeNode['children']) {
        for (let child of treeNode['children']) {
          if (child['children']) {
            this.getTreeNodeDescendantsWithExcludedTypes(child, excludedTypes, descendants);
          } else if (excludedTypes.indexOf(child['type']) === -1) {
            descendants.push(child);
          }
        }
      }
    }
  }

  /**
   * Update the tree table data for rendering the tree table in step 2, projection
   * based on a given set of concept codes as filtering criteria.
   * @param {Object} conceptCountMap
   */
  public updateProjectionTreeData(checklist: Array<string>) {
    // If the tree nodes copy is empty, create it by duplicating the tree nodes
    if (this.treeNodesCopy.length === 0) {
      this.treeNodesCopy = this.copyTreeNodes(this.treeNodes);
    }
    this.projectionTreeData =
      this.updateProjectionTreeDataIterative(this.treeNodesCopy);
    this.selectedProjectionTreeData = [];
    this.checkProjectionTreeDataIterative(this.projectionTreeData, checklist);
  }

  public updateFinalTreeNodes() {
    this.finalTreeNodes = this.copySelectedTreeNodes(this.projectionTreeData);
  }

  copyTreeNodes(nodes: TreeNode[]): TreeNode[] {
    let nodesCopy = [];
    for (let node of nodes) {
      let parent = node['parent'];
      let children = node['children'];
      node['parent'] = null;
      node['children'] = null;
      let nodeCopy = JSON.parse(JSON.stringify(node));
      if (children) {
        let childrenCopy = this.copyTreeNodes(children);
        nodeCopy['children'] = childrenCopy;
      }
      nodesCopy.push(nodeCopy);
      node['parent'] = parent;
      node['children'] = children;
    }
    return nodesCopy;
  }

  copySelectedTreeNodes(nodes: TreeNode[]): TreeNode[] {
    let nodesCopy = [];
    for (let node of nodes) {
      // if the node has been partially selected
      let selected = node.partialSelected;
      // if the node has been selected
      selected = selected ? true : this.selectedProjectionTreeData.includes(node);
      if (selected) {
        let parent = node['parent'];
        let children = node['children'];
        node['parent'] = null;
        node['children'] = null;
        let nodeCopy = JSON.parse(JSON.stringify(node));
        if (children) {
          let childrenCopy = this.copySelectedTreeNodes(children);
          nodeCopy['children'] = childrenCopy;
        }
        nodesCopy.push(nodeCopy);
        node['parent'] = parent;
        node['children'] = children;
      }
    }
    return nodesCopy;
  }

  /**
   * Copy the given treenode upward, i.e. excluding its children
   * @param {TreeNode} node
   * @returns {TreeNode}
   */
  copyTreeNodeUpward(node: TreeNode): TreeNode {
    let nodeCopy = {};
    let parentCopy = null;
    for (let key in node) {
      if (key === 'parent') {
        parentCopy = this.copyTreeNodeUpward(node[key]);
      } else if (key !== 'children') {
        nodeCopy[key] = JSON.parse(JSON.stringify(node[key]));
      }
    }
    if (parentCopy) {
      nodeCopy['parent'] = parentCopy;
    }
    return nodeCopy;
  }

  updateProjectionTreeDataIterative(nodes: TreeNode[]) {
    let nodesWithCodes = [];
    for (let node of nodes) {
      if (this.isTreeNodeLeaf(node)) {
        let conceptMap = this.selectedStudyConceptCountMap.get(node['studyId']);
        if (conceptMap && conceptMap.size > 0) {
          let nodeCopy = node;
          nodeCopy['expanded'] = false;
          let item: CountItem = this.selectedStudyConceptCountMap.get(node['studyId']).get(node['conceptCode']);
          nodeCopy['label'] = nodeCopy['name'] + ` (sub: ${item.subjectCount}, obs: ${item.observationCount})`;
          nodesWithCodes.push(nodeCopy);
        }
      } else if (node['children']) {
        let newNodeChildren =
          this.updateProjectionTreeDataIterative(node['children']);
        if (newNodeChildren.length > 0) {
          let nodeCopy = this.copyTreeNodeUpward(node);
          nodeCopy['expanded'] = this.depthOfTreeNode(nodeCopy) <= 2;
          nodeCopy['children'] = newNodeChildren;
          nodesWithCodes.push(nodeCopy);
        }
      }
    }
    return nodesWithCodes;
  }

  checkProjectionTreeDataIterative(nodes: TreeNode[], checklist?: Array<string>) {
    for (let node of nodes) {
      if (checklist && checklist.includes(node['fullName'])) {
        this.selectedProjectionTreeData.push(node);
      }
      if (node['children']) {
        this.checkProjectionTreeDataIterative(node['children'], checklist);
      }
    }
  }

  public checkAllProjectionTreeDataIterative(nodes: TreeNode[]) {
    for (let node of nodes) {
      this.selectedProjectionTreeData.push(node);
      if (node['children']) {
        this.checkAllProjectionTreeDataIterative(node['children']);
      }
    }
  }

  private depthOfTreeNode(node: TreeNode): number {
    return node['fullName'] ? node['fullName'].split('\\').length - 2 : null;
  }

  /**
   * Givena tree node path, find the parent tree node paths
   * @param {string} path - taking the form of '\a\tree\node\path\'
   * @returns {string[]}
   */
  public getParentTreeNodePaths(path: string): string[] {
    let paths: string[] = [];
    const parts = path.split('\\');
    if (parts.length - 2 > 1) {
      let parentPath = '\\';
      for (let i = 1; i < parts.length - 2; i++) {
        parentPath += parts[i] + '\\';
        paths.push(parentPath);
      }
    }
    return paths;
  }

  public expandProjectionTreeDataIterative(nodes: TreeNode[], value: boolean) {
    for (let node of nodes) {
      node['expanded'] = value;
      if (node['children']) {
        if (value) { // If it is expansion, expand it gradually.
          window.setTimeout((function () {
            this.expandProjectionTreeDataIterative(node['children'], value);
          }).bind(this), 100);
        } else { // If it is collapse, collapse it immediately
          this.expandProjectionTreeDataIterative(node['children'], value);
        }
      }
    }
  }

  /**
   * Given a list of tree nodes, find and return
   * the node(s) that are on the topmost of the hierarchies of their respective branches
   * e.g.
   * given these nodes:
   * [ A\B\C,
   *   A\B
   *   A\D\E,
   *   A\D\E\F,
   *   A\E ]
   * --------------------------
   * return:
   * [ A\B,
   *   A\D\E,
   *   A\E ]
   * @param {TreeNode[]} treeNodes
   * @returns {TreeNode[]}
   */
  public getTopTreeNodes(treeNodes: TreeNode[]): TreeNode[] {
    let candidates = [];
    let result = [];
    for (let node of treeNodes) {
      const path = node['fullName'];
      let isPathUsed = false;
      for (let candidate of candidates) {
        if (path.indexOf(candidate) > -1) {
          // if the candidate is part of the path
          isPathUsed = true;
          break;
        } else if (candidate.indexOf(path) > -1) {
          // if the path is part of the candidate
          // remove the candidate, replace it with the path
          const index = candidates.indexOf(candidate);
          candidates.splice(index, 1);
          candidates.push(path);
          result.splice(index, 1);
          result.push(node);
          isPathUsed = true;
          break;
        }
      }
      if (!isPathUsed) {
        candidates.push(path);
        result.push(node);
      }
    }
    return result;
  }

  /**
   * Find the tree nodes that have the fullNames (i.e. tree paths) in the given paths
   * @param {TreeNode[]} nodes
   * @param {string[]} paths
   * @param {TreeNode[]} foundNodes
   */
  public findTreeNodesByPaths(nodes: TreeNode[], paths: string[], foundNodes: TreeNode[]) {
    for (let node of nodes) {
      if (paths.includes(node['fullName'])) {
        foundNodes.push(node);
      }
      if (node['children']) {
        this.findTreeNodesByPaths(node['children'], paths, foundNodes);
      }
    }
  }

  /**
   * Find the ancestors of a tree node
   * @param node
   * @returns {Array}
   */
  public findTreeNodeAncestors(node) {
    let fullName = node['fullName'];
    let partsTemp = fullName.split('\\');
    let parts = [];
    for (let part of partsTemp) {
      if (part !== '') {
        parts.push(part);
      }
    }
    let endingIndices = [];
    for (let i = 0; i < parts.length - 1; i++) {
      endingIndices.push(i);
    }
    let paths = [];
    for (let index of endingIndices) {
      let path = '\\';
      for (let i = 0; i <= index; i++) {
        path += parts[i] + '\\';
      }
      paths.push(path);
    }
    let foundNodes = [];
    this.findTreeNodesByPaths(this.treeNodes, paths, foundNodes);
    return foundNodes;
  }

  /**
   * Check if a tree node is a concept node
   * @param {TreeNode} node
   * @returns {boolean}
   */
  public isTreeNodeConcept(node: TreeNode): boolean {
    const type = node['type'];
    return type === 'NUMERIC' ||
      type === 'CATEGORICAL' ||
      type === 'DATE' ||
      type === 'TEXT' ||
      type === 'HIGH_DIMENSIONAL';
  }

  /**
   * Check if a tree node is a study node
   * @param {TreeNode} node
   * @returns {boolean}
   */
  public isTreeNodeStudy(node: TreeNode): boolean {
    return node['type'] === 'STUDY';
  }

  public isTreeNodeLeaf(node: TreeNode): boolean {
    return node['visualAttributes'].includes('LEAF');
  }

  /**
   * Check if the tree_nodes calls are finished
   * @returns {boolean}
   */
  public isTreeNodeLoadingComplete(): boolean {
    return this.treeNodeCallsSent === this.treeNodeCallsReceived;
  }

  /**
   * Convert item names to treenode paths
   * @param {TreeNode[]} nodes
   * @param {string[]} items
   * @param {string[]} paths
   */
  public convertItemsToPaths(nodes: TreeNode[], items: string[], paths: string[]) {
    nodes.forEach((node: TreeNode) => {
      if (node) {
        const itemName = (node['metadata'] || {})['item_name'];
        if (items.indexOf(itemName) > -1) {
          paths.push(node['fullName']);
        }
        if (node['children']) {
          this.convertItemsToPaths(node['children'], items, paths);
        }
      }
    });
  }

  get treeNodes(): TreeNode[] {
    return this._treeNodes;
  }

  set treeNodes(value: TreeNode[]) {
    this._treeNodes = value;
  }

  get finalTreeNodes(): TreeNode[] {
    return this._finalTreeNodes;
  }

  set finalTreeNodes(value: TreeNode[]) {
    this._finalTreeNodes = value;
  }

  get treeNodesCopy(): TreeNode[] {
    return this._treeNodesCopy;
  }

  set treeNodesCopy(value: TreeNode[]) {
    this._treeNodesCopy = value;
  }

  get projectionTreeData(): TreeNode[] {
    return this._projectionTreeData;
  }

  set projectionTreeData(value: TreeNode[]) {
    this._projectionTreeData = value;
  }

  get selectedProjectionTreeData(): TreeNode[] {
    return this._selectedProjectionTreeData;
  }

  set selectedProjectionTreeData(value: TreeNode[]) {
    this._selectedProjectionTreeData = value;
  }

  get validTreeNodeTypes(): string[] {
    return this._validTreeNodeTypes;
  }

  set validTreeNodeTypes(value: string[]) {
    this._validTreeNodeTypes = value;
  }

  get selectedTreeNode(): TreeNode {
    return this._selectedTreeNode;
  }

  set selectedTreeNode(value: TreeNode) {
    this._selectedTreeNode = value;
  }

  get conceptCountMap(): Map<string, CountItem> {
    return this._conceptCountMap;
  }

  set conceptCountMap(value: Map<string, CountItem>) {
    this._conceptCountMap = value;
  }

  get studyCountMap(): Map<string, CountItem> {
    return this._studyCountMap;
  }

  set studyCountMap(value: Map<string, CountItem>) {
    this._studyCountMap = value;
  }

  get studyConceptCountMap(): Map<string, Map<string, CountItem>> {
    return this._studyConceptCountMap;
  }

  set studyConceptCountMap(value: Map<string, Map<string, CountItem>>) {
    this._studyConceptCountMap = value;
  }

  get selectedStudyConceptCountMap(): Map<string, Map<string, CountItem>> {
    return this._selectedStudyConceptCountMap;
  }

  set selectedStudyConceptCountMap(value: Map<string, Map<string, CountItem>>) {
    this._selectedStudyConceptCountMap = value;
  }
}
