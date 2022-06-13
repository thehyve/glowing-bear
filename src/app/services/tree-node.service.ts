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
import {ResourceService} from './resource.service';
import {ConstraintService} from './constraint.service';
import {ConceptType} from '../models/constraint-models/concept-type';
import {ErrorHelper} from '../utilities/error-helper';
import {MessageHelper} from '../utilities/message-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {HttpErrorResponse} from '@angular/common/http';
import {FormatHelper} from '../utilities/format-helper';
import {Subject} from 'rxjs';
import {CountService} from './count.service';
import {Constraint} from '../models/constraint-models/constraint';
import {Study} from '../models/constraint-models/study';
import {StudyConstraint} from '../models/constraint-models/study-constraint';
import {TransmartConstraintMapper} from '../utilities/transmart-utilities/transmart-constraint-mapper';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {GbTreeNode} from '../models/tree-node-models/gb-tree-node';
import {TreeNodeHelper} from '../utilities/tree-node-helper';

@Injectable({
  providedIn: 'root',
})
export class TreeNodeService {

  // the variable that holds the entire tree structure, used by the tree on the left side bar
  private _treeNodes: GbTreeNode[] = [];
  // the copy of the tree nodes that is used for constructing the tree in the variables panel
  private _treeNodesCopy: GbTreeNode[] = [];

  public treeNodeCallsSent = 0; // the number of tree-node calls sent
  public treeNodeCallsReceived = 0; // the number of tree-node calls received
  public treeNodesUpdated: Subject<boolean> = new Subject<boolean>();

  // the status indicating the when the tree is being loaded or finished loading
  private _validTreeNodeTypes: string[] = [];

  // This field holds the processed concept codes during tree loading, not used anywhere else
  private processedConceptCodes: string[] = [];

  private _selectedTreeNode: GbTreeNode = null;

  constructor(private countService: CountService,
              private resourceService: ResourceService,
              private injector: Injector) {
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
            treeNodes.forEach((function(node) {
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
  loadTreeNext(parentNode: GbTreeNode, constraintService: ConstraintService): Promise<any> {
    return new Promise((resolve, reject) => {
      this.treeNodeCallsSent++;
      let depth = 20;
      this.resourceService.getTreeNodes(parentNode.fullName, depth, false, true)
        .subscribe(
          (treeNodes: object[]) => {
            this.treeNodeCallsReceived++;
            const refNode: GbTreeNode = treeNodes && treeNodes.length > 0 ? treeNodes[0] : undefined;
            const children = refNode ? refNode.children : undefined;
            if (children) {
              parentNode.children = children;
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
  processTreeNodes(treeNodes: GbTreeNode[], constraintService: ConstraintService) {
    if (!treeNodes) {
      return;
    }
    for (let node of treeNodes) {
      this.processTreeNode(node, constraintService);
      if (node.children) {
        this.processTreeNodes(node.children, constraintService);
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
  processTreeNode(node: GbTreeNode, constraintService: ConstraintService) {
    let tail = node.metadata ? ' ⓘ' : ' ';
    node.label = node.name + tail;
    let nodeCountItem: CountItem;
    // Extract concept
    if (TreeNodeHelper.isVariableNode(node)) {
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
      if (node.constraint) {
        node.constraint.fullName = node.fullName;
        node.constraint.name = node.name;
        node.constraint.valueType = <ConceptType>node.type;
      }
      // node icon
      if (node.type === 'NUMERIC') {
        node.icon = 'icon-123';
      } else if (node.type === 'HIGH_DIMENSIONAL') {
        node.icon = 'icon-hd';
      } else if (node.type === 'CATEGORICAL') {
        node.icon = 'icon-abc';
      } else if (node.type === 'DATE') {
        node.icon = 'fa fa-calendar-o';
      } else if (node.type === 'TEXT') {
        node.icon = 'fa fa-newspaper-o';
      } else {
        node.icon = 'fa fa-file';
      }
      // node count
      if (node['studyId']) {
        let cmap = this.countService.studyConceptCountMap.get(node.studyId);
        if (cmap) {
          nodeCountItem = cmap.get(node.conceptCode);
        }
      } else {
        nodeCountItem = this.countService.conceptCountMap.get(node.conceptCode);
      }
    } else {
      if (node.type === 'UNKNOWN') {
        node.expandedIcon = 'fa fa-folder-open';
        node.collapsedIcon = 'fa fa-folder';
      } else if (node.type === 'STUDY') {
        node.expandedIcon = 'icon-folder-study-open';
        node.collapsedIcon = 'icon-folder-study';
        nodeCountItem = this.countService.studyCountMap.get(node.studyId);
      }
      node.icon = '';
    }
    node.subjectCount = nodeCountItem ? FormatHelper.formatCountNumber(nodeCountItem.subjectCount) : undefined;
  }

  /**
   * Parse a tree node and create the corresponding concept
   * @param {GbTreeNode} treeNode
   * @returns {Concept}
   */
  public getConceptFromTreeNode(treeNode: GbTreeNode): Concept {
    if (treeNode.name &&
      treeNode.fullName &&
      treeNode.conceptCode &&
      treeNode.type) {
      let concept = new Concept();
      const tail = '\\' + treeNode.name + '\\';
      const fullName = treeNode.fullName;
      let head = fullName.substring(0, fullName.length - tail.length);
      concept.label = treeNode.name + ' (' + head + ')';
      concept.type = <ConceptType>treeNode.type;
      concept.code = treeNode.conceptCode;
      concept.fullName = treeNode.fullName;
      concept.name = treeNode.name;
      if (treeNode.metadata && treeNode.metadata['subject_dimension']) {
        concept.subjectDimensions.push(treeNode.metadata['subject_dimension']);
      }
      return concept;
    } else {
      const summary = 'Cannot construct concept from the given tree node, because the tree node\'s format is incorrect ';
      MessageHelper.alert('error', summary);
      return null;
    }
  }

  /**
   * Generate a constraint instance based on a tree node
   * @param {GbTreeNode} node
   * @returns {Constraint}
   */
  public generateConstraintFromTreeNode(node: GbTreeNode): Constraint {
    if (TreeNodeHelper.isTreeNodeStudy(node)) {
      let study: Study = new Study();
      study.id = node.studyId;
      const constraint = new StudyConstraint();
      constraint.studies.push(study);
      return constraint;
    } else if (TreeNodeHelper.isVariableNode(node)) {
      const concept = this.getConceptFromTreeNode(node);
      if (node.constraint) {
        const constraint = TransmartConstraintMapper.generateConstraintFromObject(node.constraint);
        if (constraint.className === 'ConceptConstraint') {
          (<ConceptConstraint>constraint).concept = concept;
        }
        return constraint;
      } else {
        const constraint = new ConceptConstraint();
        constraint.concept = concept;
        return constraint;
      }
    } else if (node.type === 'UNKNOWN') {
      let descendants = [];
      this.getTreeNodeDescendantsWithExcludedTypes(node, ['UNKNOWN'], descendants);
      if (descendants.length < 6) {
        const constraint = new CombinationConstraint();
        constraint.combinationState = CombinationState.Or;
        for (let descendant of descendants) {
          let dConstraint = this.generateConstraintFromTreeNode(descendant);
          if (dConstraint) {
            constraint.addChild(dConstraint);
          }
        }
        if (constraint.children.length === 0) {
          return null;
        }
        return constraint;
      }
    }
  }

  /**
   * Get the descendants of a tree node up to a predefined depth
   * @param {GbTreeNode} treeNode
   * @param {number} depth
   * @param {GbTreeNode[]} descendants
   */
  public getTreeNodeDescendantsWithDepth(treeNode: GbTreeNode,
                                         depth: number,
                                         descendants: GbTreeNode[]) {
    if (treeNode) {
      if (depth === 2) {
        if (treeNode.children) {
          for (let child of treeNode.children) {
            descendants.push(child);
          }
        }
      } else if (depth > 2) {
        if (treeNode.children) {
          for (let child of treeNode.children) {
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
   * @param {GbTreeNode} treeNode
   * @param {string[]} excludedTypes
   * @param {GbTreeNode[]} descendants
   */
  public getTreeNodeDescendantsWithExcludedTypes(treeNode: GbTreeNode,
                                                 excludedTypes: string[],
                                                 descendants: GbTreeNode[]) {
    if (treeNode) {
      // If the tree node has children
      if (treeNode.children) {
        for (let child of treeNode.children) {
          if (child.children) {
            this.getTreeNodeDescendantsWithExcludedTypes(child, excludedTypes, descendants);
          } else if (excludedTypes.indexOf(child.type) === -1) {
            descendants.push(child);
          }
        }
      }
    }
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
  public convertItemsToPaths(nodes: GbTreeNode[], items: string[], paths: string[]) {
    nodes.forEach((node: GbTreeNode) => {
      if (node) {
        const itemName = (node.metadata || {})['item_name'];
        if (items.indexOf(itemName) > -1) {
          paths.push(node.fullName);
        }
        if (node.children) {
          this.convertItemsToPaths(node.children, items, paths);
        }
      }
    });
  }

  public updateTreeNodeCounts() {
    this.updateTreeNodeCountsRecursion(this.treeNodes);
  }

  private updateTreeNodeCountsRecursion(nodes: GbTreeNode[]) {
    nodes.forEach((node: GbTreeNode) => {
      if (node.subjectCount) {
        let tail = node.metadata ? ' ⓘ ' : ' ';
        node.label = node.name + tail + `(${node.subjectCount})`;
      }
      if (node.children) {
        this.updateTreeNodeCountsRecursion(node.children);
      }
    });
  }

  get treeNodes(): GbTreeNode[] {
    return this._treeNodes;
  }

  set treeNodes(value: GbTreeNode[]) {
    this._treeNodes = value;
  }

  get treeNodesCopy(): GbTreeNode[] {
    return this._treeNodesCopy;
  }

  set treeNodesCopy(value: GbTreeNode[]) {
    this._treeNodesCopy = value;
  }

  get selectedTreeNode(): GbTreeNode {
    return this._selectedTreeNode;
  }

  set selectedTreeNode(value: GbTreeNode) {
    this._selectedTreeNode = value;
  }
}
