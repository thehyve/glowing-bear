/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Injectable} from '@angular/core';
import {VariablesViewMode} from '../models/variables-view-mode';
import {Concept} from '../models/constraint-models/concept';
import {CategorizedVariable} from '../models/constraint-models/categorized-variable';
import {Observable, Subject} from 'rxjs';
import {TreeNodeService} from './tree-node.service';
import {TreeNode} from 'primeng/api';
import {ConstraintService} from './constraint.service';
import {Constraint} from '../models/constraint-models/constraint';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {TransmartConstraintMapper} from '../utilities/transmart-utilities/transmart-constraint-mapper';
import {NegationConstraint} from '../models/constraint-models/negation-constraint';
import {ConstraintMark} from '../models/constraint-models/constraint-mark';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {CountItem} from '../models/aggregate-models/count-item';

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
  // The categorized variables used in the category view in gb-variables
  private _categorizedVariables: Array<CategorizedVariable> = [];
  // The async subject that tells if the selection of variables is changed according to user action
  private _selectedVariablesUpdated: Subject<Concept[]> = new Subject<Concept[]>();
  /*
   * The variables represented as tree nodes used in the tree view in gb-variables
   */
  private _variablesTree: TreeNode[] = [];
  // The selected tree data in tree view in gb-variables
  private _selectedVariablesTree: TreeNode[] = [];

  private _draggedVariable: Concept = null;
  // The scope identifier used by primeng for drag and drop
  // [pDraggable] in gb-variables.component
  // [pDroppable] in gb-fractalis-control.component
  // [pDroppable] in gb-cross-table.component
  public variablesDragDropScope = 'PrimeNGVariablesDragDropContext';
  private _variablesViewMode: VariablesViewMode;

  constructor(private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService) {
    this.subscribeToVariableChanges();
  }

  private subscribeToVariableChanges() {
    // When the selectedConceptCountMap is updated and the tree is finished loading,
    // update the corresponding variable categorised list and sub-tree
    Observable.combineLatest(
      this.constraintService.selectedConceptCountMapUpdated.asObservable(),
      this.treeNodeService.treeNodesUpdated.asObservable()
    ).subscribe(res => {
      const isTreeLoadingFinished = res[1];
      if (isTreeLoadingFinished) {
        this.updateVariables();
      }
    });

    // when the variables and sub-tree are updated,
    // check all variables and tree nodes, categorise the variables, be ready for visual rendering
    this.variablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        this.setVariableSelection(true);
        this.categorizeVariables();
      });

    // when the user (un)selects / (un)checks variables in the category view,
    // update the selected tree nodes in the tree view
    this.selectedVariablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        const codes = variables
          .filter((v: Concept) => {
            return v.selected;
          })
          .map((v: Concept) => {
            return v.code;
          });

        this.selectVariablesTreeByFields(this.variablesTree, codes, ['conceptCode']);
      });
  }

  private categorizeVariables() {
    this.categorizedVariables.length = 0;
    this.variables.forEach((variable: Concept) => {
      let existingVariable = this.categorizedVariables.filter(x => x.type === variable.type)[0];
      if (existingVariable) {
        existingVariable.elements.push(variable);
      } else {
        this.categorizedVariables.push({type: variable.type, elements: [variable]});
      }
    });
  }

  /**
   * when the user (un)selects / (un)checks tree nodes in the tree view,
   * update selected variables in the category view
   * @param selectedNodes
   */
  private updateSelectedVariablesWithTreeNodes(selectedNodes: TreeNode[]) {
    const codes = [];
    selectedNodes.forEach((n: TreeNode) => {
      const code = n['conceptCode'];
      if (this.treeNodeService.isVariableNode(n) && code && !codes.includes(code)) {
        codes.push(code);
      }
    });
    this.variables.forEach((v: Concept) => {
      v.selected = codes.includes(v.code);
    });
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
        const codes: Array<string> = Array.from(this.constraintService.selectedConceptCountMap.keys());
        this.constraintService.concepts.forEach((concept: Concept) => {
          if (codes.includes(concept.code)) {
            concept.counts = this.constraintService.selectedConceptCountMap.get(concept.code);
            this.variables.push(concept);
          }
        });
        this.variablesUpdated.next(this.variables);
        this.updateVariablesTree(
          this.constraintService.selectedStudyConceptCountMap,
          this.constraintService.selectedConceptCountMap,
          this.constraintService.selectedStudyCountMap);
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
    if (this.draggedVariable) {
      const draggedVariable = this.draggedVariable.copy();
      this.draggedVariable = null;
      return draggedVariable;
    } else if (this.treeNodeService.selectedTreeNode) {
      return this.treeNodeService.getConceptFromTreeNode(this.treeNodeService.selectedTreeNode);
    }
    return null;
  }

  /**
   * Update the tree data for rendering the tree nodes in variables panel,
   * based on a given set of concept codes as filtering criteria.
   * @param {Map<string, Map<string, CountItem>>} selectedStudyConceptCountMap
   * @param {Map<string, CountItem>} selectedConceptCountMap
   * @param {Map<string, CountItem>} selectedStudyCountMap
   */
  public updateVariablesTree(selectedStudyConceptCountMap: Map<string, Map<string, CountItem>>,
                             selectedConceptCountMap: Map<string, CountItem>,
                             selectedStudyCountMap: Map<string, CountItem>) {
    // If the tree nodes copy is empty, create it by duplicating the tree nodes
    if (this.treeNodeService.treeNodesCopy.length === 0) {
      this.treeNodeService.treeNodesCopy = this.treeNodeService.copyTreeNodes(this.treeNodeService.treeNodes);
    }
    this.variablesTree =
      this.updateVariablesTreeRecursion(this.treeNodeService.treeNodesCopy,
        selectedStudyConceptCountMap, selectedConceptCountMap, selectedStudyCountMap);
    this.selectAllVariablesTree(true);
  }

  private updateVariablesTreeRecursion(nodes: TreeNode[],
                                       selectedStudyConceptCountMap: Map<string, Map<string, CountItem>>,
                                       selectedConceptCountMap: Map<string, CountItem>,
                                       selectedStudyCountMap: Map<string, CountItem>) {
    let nodesWithCodes = [];
    for (let node of nodes) {
      if (this.treeNodeService.isTreeNodeLeaf(node)) { // if the tree node is a leaf node
        let countItem: CountItem = null;
        let conceptMap = selectedStudyConceptCountMap ? selectedStudyConceptCountMap.get(node['studyId']) : null;
        if (conceptMap && conceptMap.size > 0) {
          node['expanded'] = false;
          countItem = conceptMap.get(node['conceptCode']);
        } else {
          countItem = selectedConceptCountMap ? selectedConceptCountMap.get(node['conceptCode']) : null;
        }
        if (countItem && countItem.subjectCount > 0) {
          this.treeNodeService.formatNodeWithCounts(node, countItem);
          nodesWithCodes.push(node);
        }
      } else if (node['children']) { // if the node is an intermediate node
        let newNodeChildren =
          this.updateVariablesTreeRecursion(node['children'],
            selectedStudyConceptCountMap, selectedConceptCountMap, selectedStudyCountMap);
        if (newNodeChildren.length > 0) {
          let nodeCopy = this.treeNodeService.copyTreeNodeUpward(node);
          nodeCopy['expanded'] = this.treeNodeService.depthOfTreeNode(nodeCopy) <= 2;
          nodeCopy['children'] = newNodeChildren;
          if (nodeCopy['type'] === 'STUDY') {
            const countItem = selectedStudyCountMap ? selectedStudyCountMap.get(nodeCopy['studyId']) : null;
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

  public selectVariablesTreeByFields(nodes: TreeNode[], values: string[], fields: string[]) {
    nodes.forEach((node: TreeNode) => {
      if (node) {
        const val = fields.length < 2 ? node[fields[0]] : (node[fields[0]] || {})[fields[1]];
        if (values.includes(val) && !this.selectedVariablesTree.includes(node)) {
          this.selectedVariablesTree.push(node);
          console.log('apush node', node)
        } else if (!values.includes(val) && this.selectedVariablesTree.includes(node)) {
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
      [this.constraintService.cohortConstraint(),
        this.constraintService.variableConstraint(this.variables)],
      CombinationState.And,
      ConstraintMark.OBSERVATION
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

  get categorizedVariables(): Array<CategorizedVariable> {
    return this._categorizedVariables;
  }

  set categorizedVariables(value: Array<CategorizedVariable>) {
    this._categorizedVariables = value;
  }

  get isUpdatingVariables(): boolean {
    return this._isUpdatingVariables;
  }

  set isUpdatingVariables(value: boolean) {
    this._isUpdatingVariables = value;
  }

  get draggedVariable(): Concept {
    return this._draggedVariable;
  }

  set draggedVariable(value: Concept) {
    this._draggedVariable = value;
  }

  get variablesViewMode(): VariablesViewMode {
    return this._variablesViewMode;
  }

  set variablesViewMode(value: VariablesViewMode) {
    this._variablesViewMode = value;
  }

  get selectedVariablesUpdated(): Subject<Concept[]> {
    return this._selectedVariablesUpdated;
  }

  set selectedVariablesUpdated(value: Subject<Concept[]>) {
    this._selectedVariablesUpdated = value;
  }

  get variablesTree(): TreeNode[] {
    return this._variablesTree;
  }

  set variablesTree(value: TreeNode[]) {
    this._variablesTree = value;
  }

  get selectedVariablesTree(): TreeNode[] {
    return this._selectedVariablesTree;
  }

  // this setter is invoked each time the user clicks to (un)check a variable tree node
  set selectedVariablesTree(value: TreeNode[]) {
    this._selectedVariablesTree = value;
    this.updateSelectedVariablesWithTreeNodes(value);
  }
}
