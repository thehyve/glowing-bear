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
import {CohortService} from './cohort.service';
import {TreeNodeHelper} from '../utilities/tree-node-helper';
import {FormatHelper} from '../utilities/format-helper';

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

  constructor(private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private cohortService: CohortService,
              private countService: CountService) {
    this.subscribeToVariableChanges();
  }

  private subscribeToVariableChanges() {
    // When the selectedConceptCountMap is updated and the tree is finished loading,
    // update the corresponding variable categorised list and sub-tree
    Observable.combineLatest(
      this.countService.selectedConceptCountMapUpdated.asObservable(),
      this.treeNodeService.treeNodesUpdated.asObservable()
    ).subscribe(() => {
      this.updateVariables();
    });
  }

  private updateCategorizedVariablesTree(variablesTree: GbTreeNode[]) {
    this.categorizedVariablesTree = [];
    let variableNodesByType = new Map<string, GbTreeNode[]>();
    let isVariableNode = TreeNodeHelper.isVariableNode;

    groupDescendantVariableNodes(variablesTree);

    new Map<string, GbTreeNode[]>([...variableNodesByType.entries()].sort())
      .forEach((nodes: GbTreeNode[], type: string) => {
        let typeNode = {name: type, children: nodes, expanded: true} as GbTreeNode;

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
    selectedNodes.forEach((node: GbTreeNode) => {
      const code = node.conceptCode;
      if (TreeNodeHelper.isVariableNode(node) && code && !codes.includes(code)) {
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
      this.treeNodeService.treeNodesCopy = TreeNodeHelper.copyTreeNodes(this.treeNodeService.treeNodes);
    }
    this.variablesTree = this.updateVariablesTreeRecursion(this.treeNodeService.treeNodesCopy);
    this.selectAllVariablesTree(true);
  }

  public updateChartVariablesTree(): GbTreeNode[] {
    // If the tree nodes copy is empty, create it by duplicating the tree nodes
    let treeNodesCopy = TreeNodeHelper.copyTreeNodes(this.treeNodeService.treeNodes);
    return this.updateChartVariablesTreeRecursion(treeNodesCopy, 'NUMERIC');
  }

  private formatNodeWithCounts(node: GbTreeNode, countItem: CountItem) {
    let subjectCount = FormatHelper.formatCountNumber(countItem.subjectCount);
    let countsText = `sub: ${subjectCount}`;
    if (this.countService.showObservationCounts) {
      countsText += `, obs: ${FormatHelper.formatCountNumber(countItem.observationCount)}`;
    }
    node.subjectCount = subjectCount;
    node.label = `${node.name} (${countsText})`;
  }

  /**
   * Fetch variable counts for a variable tree node for the currently selected data.
   * If the node is a study specific node and study specific counts are available,
   * there will be returned, if it is a generic concept node, concept counts are returned.
   * If no counts are available for the node, null is returned.
   *
   * @param node the variable node.
   */
  private getVariableCounts(node: GbTreeNode,
                            studyConceptCountMap:  Map<string, Map<string, CountItem>>,
                            conceptCountMap:  Map<string, CountItem>): CountItem {
    let conceptMap = node.studyId && studyConceptCountMap ? studyConceptCountMap.get(node.studyId) : null;
    if (conceptMap && conceptMap.size > 0) {
      return conceptMap.get(node.conceptCode);
    } else {
      return conceptCountMap ?
        conceptCountMap.get(node.conceptCode) : null;
    }
  }

  /**
   * Update the variable tree with node counts for the current data selection,
   * filtering for nodes with positive counts (data is in the current data selection).
   * The first two levels are the tree are expanded by default.
   *
   * @param nodes
   */
  private updateVariablesTreeRecursion(nodes: GbTreeNode[]): GbTreeNode[] {
    let result = [];
    for (let node of nodes) {
      if (node.children && node.children.length > 0) { // if the node is an intermediate node
        let children = this.updateVariablesTreeRecursion(node.children);
        node = TreeNodeHelper.copyTreeNodeUpward(node);
        node.expanded = TreeNodeHelper.depthOfTreeNode(node) <= 2;
        node.children = children;
      }
      let hasPositiveSubjectCount = false;
      if (TreeNodeHelper.isTreeNodeStudy(node)) {
        // if the tree node is a study node, fetch subject counts for the study
        // only include the node if there are observations for the study
        const countItem = this.countService.selectedStudyCountMap ?
          this.countService.selectedStudyCountMap.get(node.studyId) : null;
        if (countItem && countItem.subjectCount > 0) {
          this.formatNodeWithCounts(node, countItem);
          hasPositiveSubjectCount = true;
        }
      } else if (TreeNodeHelper.isVariableNode(node)) {
        // if the tree node is a variable node, fetch subject counts for the variable
        // only include the node if there are observations for the variable
        const countItem = this.getVariableCounts(node, this.countService.selectedStudyConceptCountMap,
          this.countService.selectedConceptCountMap);
        if (countItem && countItem.subjectCount > 0) {
          this.formatNodeWithCounts(node, countItem);
          if (!('expanded' in node)) {
            node.expanded = false;
          }
          node.styleClass = '';
          hasPositiveSubjectCount = true;
        }
      }
      if (hasPositiveSubjectCount || (node.children && node.children.length > 0)) {
        // Include nodes with positive counts and intermediate nodes
        result.push(node);
      }
    }
    return result;
  }

  private updateChartVariablesTreeRecursion(nodes: GbTreeNode[], variableNodeFilter: string = null): GbTreeNode[] {
    let result = [];
    for (let node of nodes) {
      if (node.children && node.children.length > 0) { // if the node is an intermediate node
        let children = this.updateChartVariablesTreeRecursion(node.children, variableNodeFilter);
        node = TreeNodeHelper.copyTreeNodeUpward(node);
        node.expanded = true;
        node.children = children;
        node.selectable = false;
      }
      let hasPositiveSubjectCount = false;
      if (TreeNodeHelper.isTreeNodeStudy(node)) {
        // if the tree node is a study node, fetch subject counts for the study
        // only include the node if there are observations for the study
        const countItem =
          this.countService.analysisStudyCountMap ?  this.countService.analysisStudyCountMap.get(node.studyId) : null;
        if (countItem && countItem.subjectCount > 0) {
          hasPositiveSubjectCount = true;
        }
      } else if (TreeNodeHelper.isVariableNode(node)) {
        // if the tree node is a variable node, fetch subject counts for the variable
        // only include the node if there are observations for the variable
        const countItem = this.getVariableCounts(node,
          this.countService.analysisStudyConceptCountMap,
          this.countService.analysisStudyCountMap);
        if (countItem && countItem.subjectCount > 0) {
          node.styleClass = '';
          hasPositiveSubjectCount = true;
        }
      }
      if ((hasPositiveSubjectCount && node.type === variableNodeFilter) || (node.children && node.children.length > 0)) {
        // Include nodes with positive counts and intermediate nodes
        node.label = node.name;
        result.push(node);
      }
    }
    return result;
  }

  public selectAllVariablesTree(b: boolean) {
    if (b) {
      let flattenedVariablesTreeData = [];
      TreeNodeHelper.flattenTreeNodes(this.variablesTree, flattenedVariablesTreeData);
      this.selectedVariablesTree = flattenedVariablesTreeData;
    } else {
      this.selectedVariablesTree = [];
    }
  }

  public updateVariableSelection(changedNode: GbTreeNode, isChecked: boolean) {
    let variableNodes: GbTreeNode[] = [];
    TreeNodeHelper.getAllVariablesFromTreeNode(changedNode, variableNodes);
    if (isChecked) {
      this.selectVariablesTreeByFields(this.variablesTree, variableNodes.map(vn => vn.conceptCode),
        ['conceptCode']);
    } else {
      this.unselectVariablesTreeByFields(this.variablesTree, variableNodes.map(vn => vn.conceptCode),
        ['conceptCode']);
    }
    this.updateSelectedVariablesWithTreeNodes(this.selectedVariablesTree);
  }

  public selectVariablesTreeByFields(nodes: GbTreeNode[], values: string[], fields: string[]) {
    nodes.forEach((node: GbTreeNode) => {
      if (node) {
        const val = fields.length < 2 ? node[fields[0]] : (node[fields[0]] || {})[fields[1]];
        if (values.includes(val) && !this.selectedVariablesTree.includes(node)) {
          TreeNodeHelper.addNodeToSelectedNodes(node, this.selectedVariablesTree);
          TreeNodeHelper.updateParentNodesSelectionRecursively(node.parent, this.selectedVariablesTree);
        }
        if (node.children) {
          TreeNodeHelper.updateParentForAllChildren(node);
          this.selectVariablesTreeByFields(node.children, values, fields);
        }
      }
    });
  }

  public unselectVariablesTreeByFields(nodes: GbTreeNode[], values: string[], fields: string[]) {
    nodes.forEach((node: GbTreeNode) => {
      if (node) {
        const val = fields.length < 2 ? node[fields[0]] : (node[fields[0]] || {})[fields[1]];
        if (values.includes(val) && this.selectedVariablesTree.includes(node)) {
          TreeNodeHelper.removeNodeFromSelectedNodes(node, this.selectedVariablesTree);
          TreeNodeHelper.updateParentNodesSelectionRecursively(node.parent, this.selectedVariablesTree);
        }
        if (node.children) {
          TreeNodeHelper.updateParentForAllChildren(node);
          this.unselectVariablesTreeByFields(node.children, values, fields);
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
      [this.cohortService.allSelectedCohortsConstraint,
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

  get numSelectedVariables(): number {
    return this.variables.filter((variable: Concept) => {
      return variable.selected;
    }).length
  }
}
