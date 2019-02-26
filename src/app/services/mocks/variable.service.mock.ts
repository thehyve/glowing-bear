/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Concept} from '../../models/constraint-models/concept';
import {CategorizedVariable} from '../../models/constraint-models/categorized-variable';
import {Subject} from 'rxjs';
import {TreeNode} from 'primeng/api';
import {VariablesViewMode} from '../../models/variables-view-mode';
import {Constraint} from '../../models/constraint-models/constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';

export class VariableServiceMock {
  private _variables: Concept[] = [];
  private _categorizedVariables: Array<CategorizedVariable> = [];
  // The async subject that tells if variables are updated according to the selectedConceptCountMap
  private _variablesUpdated: Subject<Concept[]> = new Subject<Concept[]>();
  // The async subject that tells if the selection of variables is changed according to user action
  private _selectedVariablesUpdated: Subject<Concept[]> = new Subject<Concept[]>();
  // Flag indicating if the variables are being updated (gb-variables)
  private _isUpdatingVariables = false;

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

  public updateVariables() {
  }

  public importVariablesByNames(names: string[]) {
  }

  public importVariablesByPaths(paths: string[]) {
  }

  public variableConstraint(): Constraint {
    return new TrueConstraint();
  }

  public setVariableSelection(b: boolean) {
  }

  public identifyDraggedElement(): Concept {
    return new Concept();
  }

  get combination(): Constraint {
    return new TrueConstraint();
  }

  get isTreeNodesLoading(): boolean {
    return false;
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

  set selectedVariablesTree(value: TreeNode[]) {
    this._selectedVariablesTree = value;
  }
}
