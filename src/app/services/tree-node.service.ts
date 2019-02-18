/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector} from '@angular/core';
import {Concept} from '../models/constraint-models/concept';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {TreeNode} from 'primeng/primeng';
import {ResourceService} from './resource.service';
import {ConstraintService} from './constraint.service';
import {ConceptType} from '../models/constraint-models/concept-type';
import {ErrorHelper} from '../utilities/error-helper';
import {MessageHelper} from '../utilities/message-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {HttpErrorResponse} from '@angular/common/http';
import {AppConfig} from '../config/app.config';
import {FormatHelper} from '../utilities/format-helper';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TreeNodeService {

  // the variable that holds the entire tree structure, used by the tree on the left side bar
  private _treeNodes: TreeNode[] = [];
  // the copy of the tree nodes that is used for constructing the tree in the variables panel
  private _treeNodesCopy: TreeNode[] = [];

  public treeNodeCallsSent = 0; // the number of tree-node calls sent
  public treeNodeCallsReceived = 0; // the number of tree-node calls received
  public treeNodesUpdated: Subject<boolean> = new Subject<boolean>();

  // the status indicating the when the tree is being loaded or finished loading
  private _validTreeNodeTypes: string[] = [];

  // Flag indicating if the observation counts are calculated and shown
  private _showObservationCounts: boolean;

  // This field holds the processed concept codes during tree loading, not used anywhere else
  private processedConceptCodes: string[] = [];

  public selectedTreeNode: TreeNode = null;

  constructor(private appConfig: AppConfig,
              private resourceService: ResourceService,
              private injector: Injector) {
    this.showObservationCounts = this.appConfig.getConfig('show-observation-counts');
    this.validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL',
      'CATEGORICAL_OPTION',
      'DATE',
      'STUDY',
      'TEXT',
      'HIGH_DIMENSIONAL',
      'UNKNOWN'
    ];
  }

  // this method must be called after the count maps are retrieved,
  // see constraint.service
  public load() {
    this.loadTreeNodes()
      .then(() => {
        this.updateTreeNodeCounts();
      })
      .catch(err => {
        console.error(err);
      })
  }

  /**
   * Load the tree nodes for rendering the tree on the left side panel;
   * construct concept constraints based on the tree nodes
   */
  loadTreeNodes(): Promise<any> {
    return new Promise((resolve, reject) => {
      let constraintService: ConstraintService = this.injector.get(ConstraintService);
      // Retrieve all tree nodes and extract the concepts iteratively
      this.resourceService.getTreeNodes('\\', 2, false, true)
        .subscribe(
          (treeNodes: object[]) => {
            // reset concepts and concept constraints
            constraintService.concepts = [];
            constraintService.conceptConstraints = [];
            this.processTreeNodes(treeNodes, constraintService);
            let promises = [];
            treeNodes.forEach((function (node) {
              this.treeNodes.push(node); // to ensure the treeNodes pointer remains unchanged
              let promise = this.loadTreeNext(node, constraintService);
              promises.push(promise);
            }).bind(this));
            Promise.all(promises)
              .then(() => resolve(true))
              .catch(err => reject(err));
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject(err.message);
          }
        );
    });
  }

  /**
   * Iteratively load the descendants of the given tree node
   * @param parentNode
   */
  loadTreeNext(parentNode: TreeNode, constraintService: ConstraintService): Promise<any> {
    return new Promise((resolve, reject) => {
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
              let promises = [];
              for (let descendant of descendants) {
                let promise = this.loadTreeNext(descendant, constraintService);
                promises.push(promise);
              }
              Promise.all(promises)
                .then(() => resolve(true))
                .catch(err => reject(err));
            } else {
              resolve(true);
            }
            this.treeNodesUpdated.next(this.isTreeNodesLoadingCompleted);
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject(err.message)
          }
        );
    });
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
    let nodeCountItem: CountItem = undefined;
    // Extract concept
    if (node['visualAttributes'].includes('LEAF')) {
      let concept = this.getConceptFromTreeNode(node);
      let code = concept.code;
      if (typeof code === 'string' && this.processedConceptCodes.indexOf(code) === -1) {
        constraintService.concepts.push(concept);
        this.processedConceptCodes.push(code);
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
        node['icon'] = 'fa fa-calendar-o';
      } else if (node['type'] === 'TEXT') {
        node['icon'] = 'fa fa-newspaper-o';
      } else {
        node['icon'] = 'fa fa-file';
      }
      // node count
      if (node['studyId']) {
        let cmap = constraintService.studyConceptCountMap.get(node['studyId']);
        if (cmap) {
          nodeCountItem = cmap.get(node['conceptCode']);
        }
      } else {
        nodeCountItem = constraintService.conceptCountMap.get(node['conceptCode']);
      }
    } else {
      if (node['type'] === 'UNKNOWN') {
        node['expandedIcon'] = 'fa fa-folder-open';
        node['collapsedIcon'] = 'fa fa-folder';
      } else if (node['type'] === 'STUDY') {
        node['expandedIcon'] = 'icon-folder-study-open';
        node['collapsedIcon'] = 'icon-folder-study';
        nodeCountItem = constraintService.studyCountMap.get(node['studyId']);
      }
      node['icon'] = '';
    }
    node['subjectCount'] = nodeCountItem ? FormatHelper.formatCountNumber(nodeCountItem.subjectCount) : undefined;
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
      concept.type = <ConceptType>treeNode['type'];
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

  public formatNodeWithCounts(node: TreeNode, countItem: CountItem) {
    let countsText = `sub: ${FormatHelper.formatCountNumber(countItem.subjectCount)}`;
    if (this.showObservationCounts) {
      countsText += `, obs: ${FormatHelper.formatCountNumber(countItem.observationCount)}`;
    }
    node['label'] = `${node['name']} (${countsText})`;
  }

  public flattenTreeNodes(nodes: TreeNode[], flattened: TreeNode[]) {
    for (let node of nodes) {
      flattened.push(node);
      if (node['children']) {
        this.flattenTreeNodes(node['children'], flattened);
      }
    }
  }

  public copyTreeNodes(nodes: TreeNode[]): TreeNode[] {
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

  /**
   * Copy the given treenode upward, i.e. excluding its children
   * @param {TreeNode} node
   * @returns {TreeNode}
   */
  public copyTreeNodeUpward(node: TreeNode): TreeNode {
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

  public depthOfTreeNode(node: TreeNode): number {
    return node['fullName'] ? node['fullName'].split('\\').length - 2 : null;
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
    return node['type'] ? node['type'] === 'STUDY' : false;
  }

  public isTreeNodeLeaf(node: TreeNode): boolean {
    return node['visualAttributes'] ? node['visualAttributes'].includes('LEAF') : false;
  }

  public isVariableNode(node: TreeNode): boolean {
    const treeNodeType = node['type'];
    return (treeNodeType === 'NUMERIC' ||
      treeNodeType === 'CATEGORICAL' ||
      treeNodeType === 'CATEGORICAL_OPTION' ||
      treeNodeType === 'DATE' ||
      treeNodeType === 'HIGH_DIMENSIONAL' ||
      treeNodeType === 'TEXT')
  }

  /**
   * Check if the tree_nodes calls are finished,
   * excluding the case where sent calls and received calls are both 0
   * @returns {boolean}
   */
  get isTreeNodesLoadingCompleted(): boolean {
    return this.treeNodeCallsSent > 0 ? (this.treeNodeCallsSent === this.treeNodeCallsReceived) : false;
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

  public updateTreeNodeCounts() {
    this.updateTreeNodeCountsIterative(this.treeNodes);
  }

  private updateTreeNodeCountsIterative(nodes: TreeNode[]) {
    nodes.forEach((node: TreeNode) => {
      if (node['subjectCount']) {
        let tail = node['metadata'] ? ' ⓘ ' : ' ';
        node['label'] = node['name'] + tail + `(${node['subjectCount']})`;
      }
      if (node['children']) {
        this.updateTreeNodeCountsIterative(node['children']);
      }
    });
  }

  get treeNodes(): TreeNode[] {
    return this._treeNodes;
  }

  set treeNodes(value: TreeNode[]) {
    this._treeNodes = value;
  }

  get treeNodesCopy(): TreeNode[] {
    return this._treeNodesCopy;
  }

  set treeNodesCopy(value: TreeNode[]) {
    this._treeNodesCopy = value;
  }

  get validTreeNodeTypes(): string[] {
    return this._validTreeNodeTypes;
  }

  set validTreeNodeTypes(value: string[]) {
    this._validTreeNodeTypes = value;
  }

  get showObservationCounts(): boolean {
    return this._showObservationCounts;
  }

  set showObservationCounts(value: boolean) {
    this._showObservationCounts = value;
  }

}
