/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2018 - 2019  LDS EPFL
 * Copyright 2020  CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector} from '@angular/core';
import {Concept} from '../models/constraint-models/concept';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {TreeNode} from '../models/tree-models/tree-node';
import {ConstraintService} from './constraint.service';
import {ValueType} from '../models/constraint-models/value-type';
import {ErrorHelper} from '../utilities/error-helper';
import {TreeNodeType} from '../models/tree-models/tree-node-type';
import {AppConfig} from '../config/app.config';
import {GenomicAnnotation} from '../models/constraint-models/genomic-annotation';
import {ExploreSearchService} from './api/medco-node/explore-search.service';
import {Observable} from 'rxjs';
import {Modifier} from 'app/models/constraint-models/modifier';
import {ApiValueMetadata, DataType} from 'app/models/api-response-models/medco-node/api-value-metadata';


@Injectable()
export class TreeNodeService {

  // the variable that holds the entire tree structure, used by the tree on the left side bar
  private _rootTreeNodes: TreeNode[] = [];
  // the selected tree node in the side-panel by dragging
  private _selectedTreeNode: TreeNode = null;
  // true if a call is currently being executed
  private _isLoading = false;

  private config: AppConfig;
  private exploreSearchService: ExploreSearchService;
  private constraintService: ConstraintService;

  constructor(private injector: Injector) { }

  /**
   * Reset and load the root tree nodes for rendering the tree on the left side panel.
   */
  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.config = this.injector.get(AppConfig);
      this.exploreSearchService = this.injector.get(ExploreSearchService);
      this.constraintService = this.injector.get(ConstraintService);

      this.constraintService.conceptLabels = [];

      // retrieve root tree nodes and extract the concepts
      this._isLoading = true;
      this.exploreSearchService.exploreSearchConceptChildren('/').subscribe(
        (treeNodes: TreeNode[]) => {

          // reset concepts and concept constraints
          this.constraintService.concepts = [];
          this.constraintService.conceptConstraints = [];

          this.processTreeNodes(treeNodes, this.constraintService);
          treeNodes.forEach((node) => this.rootTreeNodes.push(node));
          this._isLoading = false;
          resolve();
        },
        (err) => {
          ErrorHelper.handleError('Error during initial tree loading', err);
          this._isLoading = false;
          reject(err);
        });
    });
  }

  /**
   * Loads children of a node (if they were not already loaded).
   * Meant to be used by the UI for the node-per-node browsing.
   * @param {TreeNode} parentNode
   * @param {ConstraintService} constraintService
   */
  public loadChildrenNodes(parentNode: TreeNode, constraintService: ConstraintService) {
    if (parentNode.leaf || parentNode.childrenAttached) {
      return
    }

    this._isLoading = true;
    let resultObservable: Observable<TreeNode[]> = parentNode.isModifier() ?
      this.exploreSearchService.exploreSearchModifierChildren(parentNode.path, parentNode.appliedPath, parentNode.appliedConcept.path) :
      this.exploreSearchService.exploreSearchConceptChildren(parentNode.path)

    resultObservable.subscribe(
      (treeNodes: TreeNode[]) => {
        parentNode.attachChildTree(treeNodes);
        parentNode.attachModifierData(treeNodes);
        this.processTreeNodes(parentNode.children, constraintService);
        this._isLoading = false;
      },
      (err) => {
        ErrorHelper.handleError('Error during tree children loading', err);
        this._isLoading = false;
      }
    );

  }

  /**
   * Extracts concepts (and later possibly other dimensions) from the
   *  provided TreeNode array and their children.
   *  And augment tree nodes with PrimeNG tree-ui specifications
   * @param treeNodes
   * @param constraintService
   */
  processTreeNodes(treeNodes: TreeNode[], constraintService: ConstraintService) {
    if (!treeNodes) {
      return;
    }
    for (let node of treeNodes) {
      this.processTreeNode(node, constraintService);
      if (node.hasChildren()) {
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
  processTreeNode(node: TreeNode, constraintService: ConstraintService) {

    // generate label
    node.label = node.displayName;
    if (node.subjectCount) {
      node.label = node.label + ` (${node.subjectCount})`;
    }
    if (node.metadata) {
      node.label = node.label + ` ⓘ`;
    }


    node.icon = '';
    node.expandedIcon = 'fa fa-folder-open';
    node.collapsedIcon = 'fa fa-folder';

    // extract concept
    switch (node.nodeType) {
      case TreeNodeType.CONCEPT:
        let concept = this.getConceptFromTreeNode(node);
        if (constraintService.conceptLabels.indexOf(concept.label) === -1) {
          constraintService.concepts.push(concept);
          constraintService.conceptLabels.push(concept.label);
          let constraint = new ConceptConstraint(node);
          constraint.concept = concept;
          constraintService.conceptConstraints.push(constraint);
          constraintService.allConstraints.push(constraint);
        }
        switch (node.valueType) {
          case ValueType.NUMERICAL:
            node.icon = 'icon-123';
            break;
          case ValueType.CATEGORICAL:
            node.icon = 'icon-abc';
            break;
          case ValueType.DATE:
            node.icon = 'fa fa-calendar';
            break;
          case ValueType.TEXT:
            node.icon = 'fa fa-newspaper-o';
            break;
          case ValueType.SIMPLE:
          default:
            node.icon = 'fa fa-file';
        }
        break;
      case TreeNodeType.GENOMIC_ANNOTATION:
        if (constraintService.genomicAnnotations.filter(
          (annotation: GenomicAnnotation) => annotation.name === node.name).length === 0) {
          constraintService.genomicAnnotations.push(new GenomicAnnotation(node.name, node.displayName, node.path));
        }
        break;
      case TreeNodeType.MODIFIER:
        let sourceConcept = this.getConceptFromModifierTreeNode(node);
        constraintService.concepts.push(sourceConcept);
        let constraintFromModifier = new ConceptConstraint(node);
        constraintFromModifier.concept = sourceConcept;
        constraintService.conceptConstraints.push(constraintFromModifier);
        constraintService.allConstraints.push(constraintFromModifier);
        node.icon = 'fa fa-file-o';
        break;
      case TreeNodeType.MODIFIER_FOLDER:
        node.icon = '';
        node.expandedIcon = 'fa fa-folder-open-o';
        node.collapsedIcon = 'fa fa-folder-o';
        break;
      case TreeNodeType.UNKNOWN:
      case TreeNodeType.CONTAINER:
      default:
        break;
    }
    console.log(`Processed tree node ${node.name} of type ${node.nodeType}`, node)
  }

  /**
   * Parse a tree node and create the corresponding concept
   * @param {TreeNode} treeNode
   * @returns {Concept}
   */
  public getConceptFromTreeNode(treeNode: TreeNode): Concept {
    let concept = new Concept();
    concept.label = `${treeNode.displayName} (${treeNode.path})`;
    concept.path = treeNode.path;
    concept.type = treeNode.valueType;
    if (treeNode.metadata) {
      this.processMetadata(concept, treeNode.metadata)
    }


    concept.code = treeNode.conceptCode;
    concept.fullName = treeNode.path;
    concept.name = treeNode.name;
    concept.encryptionDescriptor = treeNode.encryptionDescriptor;
    return concept;
  }

  private processMetadata(target: Concept, metadata: ApiValueMetadata) {
    if (metadata.ValueMetadata.UnitValues) {
      target.unit = metadata.ValueMetadata.UnitValues.NormalUnits
    }
    if (metadata.ValueMetadata.DataType) {
      switch (metadata.ValueMetadata.DataType) {
        case DataType.POS_INTEGER:
          target.isInteger = true;
          target.isPositive = true;
          break;
        case DataType.POS_FLOAT:
          target.isInteger = false;
          target.isPositive = true;
          break;
        case DataType.INTEGER:
          target.isInteger = true;
          target.isPositive = false;
          break;
        case DataType.FLOAT:
          target.isInteger = false;
          target.isPositive = false;
          break;
        default:
          break;
      }
    }

  }



  /**
   * Parse a tree node and create the corresponding concept with a modifier.
   * In left panel selection tree, a modifier is a child of a concept.
   * In the selection panel for explore/analysis function, the tree is processed back
   * until the concept. The concept has the the modifier in its fields.
   * @param {TreeNode} treeNode
   * @returns {Concept}
   */
  public getConceptFromModifierTreeNode(treeNode: TreeNode): Concept {
    if (treeNode.nodeType !== TreeNodeType.MODIFIER) {
      throw ErrorHelper.handleNewError('Unexpected error. A tree node that is not a modifier cannot be passed' +
        'to getConceptModifierTreeNode')
    }
    // this is not the same object of the node if it happens to be here, so it is safe
    // to modify its fields
    let concept = this.getConceptFromTreeNode(treeNode.appliedConcept)

    let modifier = new Modifier(treeNode.path, treeNode.appliedPath, treeNode.appliedConcept.path)
    let modifierPathSplit = (modifier.path.length > 0 && modifier.path.startsWith('/')) ?
      modifier.path.substring(1).split('/') :
      modifier.path.split('/')
    modifierPathSplit.shift()
    let modifierPath = modifierPathSplit.join('/')

    // override the fields

    concept.path = `${concept.path}${modifierPath}`
    concept.label = `${treeNode.displayName} (${concept.path})`
    concept.modifier = modifier
    concept.type = treeNode.valueType
    if (treeNode.metadata) {
      this.processMetadata(concept, treeNode.metadata)
    }
    return concept
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
      if (depth === 2 && treeNode.hasChildren()) {
        for (let child of treeNode.children) {
          descendants.push(child);
        }
      } else if (depth > 2 && treeNode.hasChildren()) {
        for (let child of treeNode.children) {
          let newDepth = depth - 1;
          this.getTreeNodeDescendantsWithDepth(child, newDepth, descendants);
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
    excludedTypes: TreeNodeType[],
    descendants: TreeNode[]) {
    if (treeNode) {
      // If the tree node has children
      if (treeNode.children) {
        for (let child of treeNode.children) {
          if (child.children) {
            this.getTreeNodeDescendantsWithExcludedTypes(child, excludedTypes, descendants);
          } else if (excludedTypes.indexOf(child.nodeType) === -1) {
            descendants.push(child);
          }
        }
      }
    }
  }

  // copyTreeNodes(nodes: TreeNode[]): TreeNode[] {
  //   let nodesCopy = [];
  //   for (let node of nodes) {
  //     let parent = node.parent;
  //     let children = node.children;
  //     node.parent = null;
  //     node.children = null;
  //     let nodeCopy = node.clone();
  //     if (children) {
  //       let childrenCopy = this.copyTreeNodes(children);
  //       nodeCopy.children = childrenCopy;
  //     }
  //     nodesCopy.push(nodeCopy);
  //     node.parent = parent;
  //     node.children = children;
  //   }
  //   return nodesCopy;
  // }

  // copySelectedTreeNodes(nodes: TreeNode[]): TreeNode[] {
  //   let nodesCopy = [];
  //   for (let node of nodes) {
  //     // if the node has been partially selected
  //     let selected = node.partialSelected;
  //     // if the node has been selected
  //     selected = selected ? true : this.selectedProjectionTreeData.includes(node);
  //     if (selected) {
  //       let parent = node['parent'];
  //       let children = node['children'];
  //       node['parent'] = null;
  //       node['children'] = null;
  //       let nodeCopy = JSON.parse(JSON.stringify(node));
  //       if (children) {
  //         let childrenCopy = this.copySelectedTreeNodes(children);
  //         nodeCopy['children'] = childrenCopy;
  //       }
  //       nodesCopy.push(nodeCopy);
  //       node['parent'] = parent;
  //       node['children'] = children;
  //     }
  //   }
  //   return nodesCopy;
  // }

  /**
   * Copy the given treenode upward, i.e. excluding its children
   * @param {TreeNode} node
   * @returns {TreeNode}
   */
  // copyTreeNodeUpward(node: TreeNode): TreeNode {
  //   let nodeCopy = new TreeNode();
  //   let parentCopy = null;
  //   for (let key in node) {
  //     if (key === 'parent') {
  //       parentCopy = this.copyTreeNodeUpward(node[key]);
  //     } else if (key !== 'children') {
  //       nodeCopy[key] = JSON.parse(JSON.stringify(node[key]));
  //     }
  //   }
  //   if (parentCopy) {
  //     nodeCopy.parent = parentCopy;
  //   }
  //   return nodeCopy;
  // }

  // updateProjectionTreeDataIterative(nodes: TreeNode[]) {
  //   let nodesWithCodes = [];
  //   for (let node of nodes) {
  //     if (node.leaf) {
  //       let conceptMap = this.selectedStudyConceptCountMap.get(node.studyId);
  //       if (conceptMap && conceptMap.size > 0) {
  //         let nodeCopy = node;
  //         nodeCopy.expanded = false;
  //         let item: CountItem = conceptMap.get(nodeCopy.conceptCode);
  //         if (item) {
  //           nodeCopy.label = nodeCopy.name + ` (sub: ${item.globalCount}, obs: ${item.observationCount})`;
  //           nodesWithCodes.push(nodeCopy);
  //         }
  //       }
  //     } else if (node.hasChildren()) {
  //       let newNodeChildren =
  //         this.updateProjectionTreeDataIterative(node.children);
  //       if (newNodeChildren.length > 0) {
  //         let nodeCopy = this.copyTreeNodeUpward(node);
  //         nodeCopy.expanded = nodeCopy.depth <= 2;
  //         nodeCopy.children = newNodeChildren;
  //         nodesWithCodes.push(nodeCopy);
  //       }
  //     }
  //   }
  //   return nodesWithCodes;
  // }

  // checkProjectionTreeDataIterative(nodes: TreeNode[], checklist?: Array<string>) {
  //   for (let node of nodes) {
  //     if (checklist && checklist.includes(node.path)) {
  //       this.selectedProjectionTreeData.push(node);
  //     }
  //     if (node.hasChildren()) {
  //       this.checkProjectionTreeDataIterative(node.children, checklist);
  //     }
  //   }
  // }

  // public checkAllProjectionTreeDataIterative(nodes: TreeNode[]) {
  //   for (let node of nodes) {
  //     this.selectedProjectionTreeData.push(node);
  //     if (node.hasChildren()) {
  //       this.checkAllProjectionTreeDataIterative(node.children);
  //     }
  //   }
  // }

  /**
   * Givena tree node path, find the parent tree node paths
   * @param {string} path - taking the form of '\a\tree\node\path\' or '/a/tree/node/path/'
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

  // public expandProjectionTreeDataIterative(nodes: TreeNode[], value: boolean) {
  //   for (let node of nodes) {
  //     node.expanded = value;
  //     if (node.children) {
  //       if (value) { // If it is expansion, expand it gradually.
  //         window.setTimeout((function () {
  //           this.expandProjectionTreeDataIterative(node.children, value);
  //         }).bind(this), 100);
  //       } else { // If it is collapse, collapse it immediately
  //         this.expandProjectionTreeDataIterative(node.children, value);
  //       }
  //     }
  //   }
  // }

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
  // public getTopTreeNodes(treeNodes: TreeNode[]): TreeNode[] {
  //   let candidates = [];
  //   let result = [];
  //   for (let node of treeNodes) {
  //     const path = node.path;
  //     let isPathUsed = false;
  //     for (let candidate of candidates) {
  //       if (path.indexOf(candidate) > -1) {
  //         // if the candidate is part of the path
  //         isPathUsed = true;
  //         break;
  //       } else if (candidate.indexOf(path) > -1) {
  //         // if the path is part of the candidate
  //         // remove the candidate, replace it with the path
  //         const index = candidates.indexOf(candidate);
  //         candidates.splice(index, 1);
  //         candidates.push(path);
  //         result.splice(index, 1);
  //         result.push(node);
  //         isPathUsed = true;
  //         break;
  //       }
  //     }
  //     if (!isPathUsed) {
  //       candidates.push(path);
  //       result.push(node);
  //     }
  //   }
  //   return result;
  // }

  /**
   * Find the tree nodes that have the fullNames (i.e. tree paths) in the given paths
   * @param {TreeNode[]} nodes
   * @param {string[]} paths
   * @param {TreeNode[]} foundNodes
   */
  // public findTreeNodesByPaths(nodes: TreeNode[], paths: string[], foundNodes: TreeNode[]) {
  //   for (let node of nodes) {
  //     if (paths.includes(node.path)) {
  //       foundNodes.push(node);
  //     }
  //     if (node.children) {
  //       this.findTreeNodesByPaths(node.children, paths, foundNodes);
  //     }
  //   }
  // }

  /**
   * Convert item names to treenode paths
   * @param {TreeNode[]} nodes
   * @param {string[]} items
   * @param {string[]} paths
   */
  // public convertItemsToPaths(nodes: TreeNode[], items: string[], paths: string[]) {
  //   nodes.forEach((node: TreeNode) => {
  //     if (node) {
  //       const itemName = (node['metadata'] || {})['item_name'];
  //       if (items.indexOf(itemName) > -1) {
  //         paths.push(node.path);
  //       }
  //       if (node.children) {
  //         this.convertItemsToPaths(node.children, items, paths);
  //       }
  //     }
  //   });
  // }

  get rootTreeNodes(): TreeNode[] {
    return this._rootTreeNodes;
  }

  get selectedTreeNode(): TreeNode {
    return this._selectedTreeNode;
  }

  set selectedTreeNode(value: TreeNode) {
    this._selectedTreeNode = value;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}
