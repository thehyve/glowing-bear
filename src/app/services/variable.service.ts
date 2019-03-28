/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Injectable} from '@angular/core';
import {Concept} from '../models/constraint-models/concept';
import {Observable, Subject} from 'rxjs';
import {TreeNodeService} from './tree-node.service';
import {ConstraintService} from './constraint.service';
import {Constraint} from '../models/constraint-models/constraint';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {CountItem} from '../models/aggregate-models/count-item';
import {CountService} from './count.service';
import {GbTreeNode} from '../models/tree-node-models/gb-tree-node';

@Injectable({
  providedIn: 'root'
})
export class VariableService {

  /*
   * The list of concepts that correspond to
   * the leaf/concept tree nodes that are narrowed down
   * when user defines a cohort or a combination of cohorts.
   */
  private _variables: Concept[] = [];
  // The async subject that tells if variables are updated according to the selectedConceptCountMap
  private _variablesUpdated: Subject<Concept[]> = new Subject<Concept[]>();
  // Flag indicating if the variables are being updated (gb-variables)
  private _isUpdatingVariables = false;

  // The variables represented as tree nodes used in the tree view in gb-variables
  private _variablesTree: GbTreeNode[] = [];
  // The categorized variables (flat  list of tree node leaves) used in the category view in gb-variables
  private _categorizedVariablesTree: GbTreeNode[] = [];

  // The selected tree data in tree view in gb-variables
  private _selectedVariablesTree: GbTreeNode[] = [];
  // The async subject that tells if the selection of variables is changed according to user action
  private _selectedVariablesTreeUpdated: Subject<GbTreeNode[]> = new Subject<GbTreeNode[]>();

  // The scope identifier used by primeng for drag and drop
  // [pDraggable] in gb-variables.component
  // [pDroppable] in gb-fractalis-control.component
  // [pDroppable] in gb-cross-table.component
  public variablesDragDropScope = 'PrimeNGVariablesDragDropContext';
  /**
   *   when set to true, variable import will be additional,
   *   meaning that the previously selected variables will remain selected,
   *   when set to false, the selected variables will only be the ones imported
   */
  private isAdditionalImport = true;

  constructor(private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private countService: CountService) {
    this.subscribeToVariableChanges();
  }

  private subscribeToVariableChanges() {
    // When the selectedConceptCountMap is updated and the tree is finished loading,
    // update the corresponding variable categorised list and sub-tree
    Observable.combineLatest(
      this.countService.selectedConceptCountMapUpdated.asObservable(),
      this.treeNodeService.treeNodesUpdated.asObservable()
    ).subscribe(res => {
      const isTreeLoadingFinished = res[1];
      if (isTreeLoadingFinished) {
        this.updateVariables();
      }
    });

  }

  private updateCategorizedVariablesTree(variablesTree: GbTreeNode[]) {
    this.categorizedVariablesTree.length = 0;
    let variableNodesByType = new Map<string, GbTreeNode[]>();
    let isVariableNode = this.treeNodeService.isTreeNodeConcept;

    groupDescendantVariableNodes(variablesTree);

    new Map<string, GbTreeNode[]>([...variableNodesByType.entries()].sort())
      .forEach((nodes: GbTreeNode[], type: string) => {
        let typeNode = { name: type, children: nodes, expanded: true } as GbTreeNode;

        this.categorizedVariablesTree.push(typeNode);
    });

    function groupDescendantVariableNodes(tree: GbTreeNode[]) {
      tree.forEach((node: GbTreeNode) => {
        if (isVariableNode(node)) {
          if (!variableNodesByType.has(node.type)) {
            variableNodesByType.set(node.type, []);
          }

          variableNodesByType.get(node.type).push(node);
        }

        if (node.children) {
          groupDescendantVariableNodes(node.children);
        }

      });
    }

  }

  /**
   * when the user (un)selects / (un)checks tree nodes in the tree view,
   * update selected variables in the category view
   * @param selectedNodes
   */
  public updateSelectedVariablesWithTreeNodes(selectedNodes: GbTreeNode[]) {
    const codes = [];
    selectedNodes.forEach((n: GbTreeNode) => {
      const code = n['conceptCode'];
      if (this.treeNodeService.isVariableNode(n) && code && !codes.includes(code)) {
        codes.push(code);
      }
    });
    this.variables.forEach((v: Concept) => {
      v.selected = codes.includes(v.code);
    });
    this.selectedVariablesTreeUpdated.next(selectedNodes);
  }

  public updateVariables(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.isUpdatingVariables = true;
      if (this.isTreeNodesLoading) {
        window.setTimeout((function () {
          this.updateVariables(resolve);
        }).bind(this), 500);
      } else {
        this.variables.length = 0;
        const codes: Array<string> = Array.from(this.countService.selectedConceptCountMap.keys());
        this.constraintService.concepts.forEach((concept: Concept) => {
          if (codes.includes(concept.code)) {
            concept.counts = this.countService.selectedConceptCountMap.get(concept.code);
            this.variables.push(concept);
          }
        });
        this.variablesUpdated.next(this.variables);
        this.updateVariablesTree();
        this.updateCategorizedVariablesTree(this.variablesTree);
        this.isUpdatingVariables = false;
        resolve(true);
      }
    });
  }

  public setVariableSelection(b: boolean) {
    // check the variables for the category view in gb-variables on the left panel
    this.variables.forEach((variable: Concept) => {
      variable.selected = b;
    });
    // check the variables for the tree view in gb-variables on the left panel
    this.selectAllVariablesTree(b);
  }

  public identifyDraggedElement(): Concept {
    if (this.treeNodeService.selectedTreeNode) {
      return this.treeNodeService.getConceptFromTreeNode(this.treeNodeService.selectedTreeNode);
    }
    return null;
  }

  /**
   * Update the tree data for rendering the tree nodes in variables panel,
   * based on a given set of concept codes as filtering criteria.
   */
  public updateVariablesTree() {
    // If the tree nodes copy is empty, create it by duplicating the tree nodes
    if (this.treeNodeService.treeNodesCopy.length === 0) {
      this.treeNodeService.treeNodesCopy = this.treeNodeService.copyTreeNodes(this.treeNodeService.treeNodes);
    }
    this.variablesTree =
      this.updateVariablesTreeRecursion(this.treeNodeService.treeNodesCopy);
    this.selectAllVariablesTree(true);
  }

  private updateVariablesTreeRecursion(nodes: GbTreeNode[]) {
    let nodesWithCodes = [];
    for (let node of nodes) {
      if (this.treeNodeService.isTreeNodeLeaf(node)) { // if the tree node is a leaf node
        let countItem: CountItem = null;
        let conceptMap = this.countService.selectedStudyConceptCountMap ?
          this.countService.selectedStudyConceptCountMap.get(node['studyId']) : null;
        if (conceptMap && conceptMap.size > 0) {
          node['expanded'] = false;
          countItem = conceptMap.get(node['conceptCode']);
        } else {
          countItem = this.countService.selectedConceptCountMap ?
            this.countService.selectedConceptCountMap.get(node['conceptCode']) : null;
        }
        if (countItem && countItem.subjectCount > 0) {
          this.treeNodeService.formatNodeWithCounts(node, countItem);
          node.styleClass = '';
          nodesWithCodes.push(node);
        }
      } else if (node['children']) { // if the node is an intermediate node
        let newNodeChildren =
          this.updateVariablesTreeRecursion(node['children']);
        if (newNodeChildren.length > 0) {
          let nodeCopy = this.treeNodeService.copyTreeNodeUpward(node);
          nodeCopy['expanded'] = this.treeNodeService.depthOfTreeNode(nodeCopy) <= 2;
          nodeCopy['children'] = newNodeChildren;
          if (nodeCopy['type'] === 'STUDY') {
            const countItem = this.countService.selectedStudyCountMap ?
              this.countService.selectedStudyCountMap.get(nodeCopy['studyId']) : null;
            if (countItem && countItem.subjectCount > 0) {
              this.treeNodeService.formatNodeWithCounts(node, countItem);
              nodesWithCodes.push(nodeCopy);
            }
          } else {
            // Always add intermediate nodes
            nodesWithCodes.push(nodeCopy);
          }
        }
      }
    }
    return nodesWithCodes;
  }

  public selectAllVariablesTree(b: boolean) {
    if (b) {
      let flattenedVariablesTreeData = [];
      this.treeNodeService.flattenTreeNodes(this.variablesTree, flattenedVariablesTreeData);
      this.selectedVariablesTree = flattenedVariablesTreeData;
    } else {
      this.selectedVariablesTree = [];
    }
  }

  public selectVariablesTreeByFields(nodes: GbTreeNode[], values: string[], fields: string[]) {
    nodes.forEach((node: GbTreeNode) => {
      if (node) {
        const val = fields.length < 2 ? node[fields[0]] : (node[fields[0]] || {})[fields[1]];
        if (
          values.includes(val)
          && !this.selectedVariablesTree.includes(node)) {
          this.selectedVariablesTree.push(node);
        } else if (
          !this.isAdditionalImport
          && !values.includes(val)
          && this.treeNodeService.isVariableNode(node)
          && this.selectedVariablesTree.includes(node)
        ) {
          const index = this.selectedVariablesTree.indexOf(node);
          this.selectedVariablesTree.splice(index, 1);
        }
        if (node['children']) {
          this.selectVariablesTreeByFields(node['children'], values, fields);
        }
      }
    });
  }

  public importVariablesByNames(names: string[]) {
    // update the selected tree nodes in gb-variables
    this.selectVariablesTreeByFields(this.variablesTree, names, ['metadata', 'item_name']);
    // dispatch the event telling its subscribers that the selected tree nodes have been updated
    this.updateSelectedVariablesWithTreeNodes(this.selectedVariablesTree);
  }

  public importVariablesByPaths(paths: string[]) {
    // update the selected tree nodes in gb-variables
    this.selectVariablesTreeByFields(this.variablesTree, paths, ['fullName']);
    // dispatch the event telling its subscribers that the selected tree nodes have been updated
    this.updateSelectedVariablesWithTreeNodes(this.selectedVariablesTree);
  }

  // get the combination of cohort constraint and variable constraint
  get combination(): Constraint {
    return new CombinationConstraint(
      [this.constraintService.cohortSelectionConstraint,
        this.constraintService.variableConstraint(this.variables)],
      CombinationState.And
    );
  }

  get isTreeNodesLoading(): boolean {
    return !this.treeNodeService.isTreeNodesLoadingCompleted;
  }

  get variables(): Concept[] {
    return this._variables;
  }

  set variables(value: Concept[]) {
    this._variables = value;
  }

  get variablesUpdated(): Subject<Concept[]> {
    return this._variablesUpdated;
  }

  set variablesUpdated(value: Subject<Concept[]>) {
    this._variablesUpdated = value;
  }

  get categorizedVariablesTree(): GbTreeNode[] {
    return this._categorizedVariablesTree;
  }

  set categorizedVariablesTree(value: GbTreeNode[]) {
    this._categorizedVariablesTree = value;
  }

  get isUpdatingVariables(): boolean {
    return this._isUpdatingVariables;
  }

  set isUpdatingVariables(value: boolean) {
    this._isUpdatingVariables = value;
  }

  get variablesTree(): GbTreeNode[] {
    return this._variablesTree;
  }

  set variablesTree(value: GbTreeNode[]) {
    this._variablesTree = value;
  }

  get selectedVariablesTree(): GbTreeNode[] {
    return this._selectedVariablesTree;
  }

  // this setter is invoked each time the user clicks to (un)check a variable tree node
  set selectedVariablesTree(value: GbTreeNode[]) {
    this._selectedVariablesTree = value;
    this.updateSelectedVariablesWithTreeNodes(value);
  }

  get selectedVariablesTreeUpdated(): Subject<GbTreeNode[]> {
    return this._selectedVariablesTreeUpdated;
  }

  set selectedVariablesTreeUpdated(value: Subject<GbTreeNode[]>) {
    this._selectedVariablesTreeUpdated = value;
  }

  get selectedVariablesNumber(): number {
    return this.selectedVariablesTree.filter(node => this.treeNodeService.isTreeNodeConcept(node)).length;
  }
}
