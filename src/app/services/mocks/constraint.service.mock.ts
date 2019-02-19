/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {Constraint} from '../../models/constraint-models/constraint';
import {TreeNode} from 'primeng/api';
import {Concept} from '../../models/constraint-models/concept';
import {Subject} from 'rxjs';
import {CountItem} from '../../models/aggregate-models/count-item';

export class ConstraintServiceMock {

  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  private _allConstraints: Constraint[] = [];
  private _studyConstraints: Constraint[] = [];
  private _validPedigreeTypes: object[] = [];
  private _concepts: Concept[] = [];
  private _conceptConstraints: Constraint[] = [];
  private _maxNumSearchResults = 100;
  private _conceptCountMap: Map<string, CountItem>;
  private _studyCountMap: Map<string, CountItem>;
  private _studyConceptCountMap: Map<string, Map<string, CountItem>>;
  private _selectedStudyConceptCountMap: Map<string, Map<string, CountItem>>;
  private _selectedStudyCountMap: Map<string, CountItem>;
  private _selectedConceptCountMap: Map<string, CountItem>;
  private _selectedConceptCountMapUpdated: Subject<Map<string, CountItem>> = new Subject<Map<string, CountItem>>();
  private _constraint: Constraint = new CombinationConstraint();

  constructor() {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
  }

  init() {
  }

  public depthOfConstraint(constraint: Constraint): number {
    return 1;
  }

  public generateInclusionConstraint(): Constraint {
    return this._constraint;
  }

  public generateExclusionConstraint(): Constraint {
    return this._constraint;
  }

  public hasExclusionConstraint(): Boolean {
    return false;
  }

  get combination(): Constraint {
    return this._constraint;
  }

  public generateConstraintFromTreeNode(selectedNode: TreeNode): Constraint {
    return this._constraint;
  }

  public searchAllConstraints(query: string): Constraint[] {
    return [];
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this._rootInclusionConstraint;
  }

  set rootInclusionConstraint(value: CombinationConstraint) {
    this._rootInclusionConstraint = value;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this._rootExclusionConstraint;
  }

  set rootExclusionConstraint(value: CombinationConstraint) {
    this._rootExclusionConstraint = value;
  }

  get allConstraints(): Constraint[] {
    return this._allConstraints;
  }

  set allConstraints(value: Constraint[]) {
    this._allConstraints = value;
  }

  get studyConstraints(): Constraint[] {
    return this._studyConstraints;
  }

  set studyConstraints(value: Constraint[]) {
    this._studyConstraints = value;
  }

  get validPedigreeTypes(): object[] {
    return this._validPedigreeTypes;
  }

  set validPedigreeTypes(value: object[]) {
    this._validPedigreeTypes = value;
  }

  get conceptConstraints(): Constraint[] {
    return this._conceptConstraints;
  }

  set conceptConstraints(value: Constraint[]) {
    this._conceptConstraints = value;
  }

  get concepts(): Concept[] {
    return this._concepts;
  }

  set concepts(value: Concept[]) {
    this._concepts = value;
  }

  get maxNumSearchResults(): number {
    return this._maxNumSearchResults;
  }

  set maxNumSearchResults(value: number) {
    this._maxNumSearchResults = value;
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

  get selectedConceptCountMap(): Map<string, CountItem> {
    return this._selectedConceptCountMap;
  }

  set selectedConceptCountMap(value: Map<string, CountItem>) {
    this._selectedConceptCountMap = value;
    this.selectedConceptCountMapUpdated.next(value);
  }

  get selectedConceptCountMapUpdated(): Subject<Map<string, CountItem>> {
    return this._selectedConceptCountMapUpdated;
  }

  set selectedConceptCountMapUpdated(value: Subject<Map<string, CountItem>>) {
    this._selectedConceptCountMapUpdated = value;
  }

  get selectedStudyCountMap(): Map<string, CountItem> {
    return this._selectedStudyCountMap;
  }

  set selectedStudyCountMap(value: Map<string, CountItem>) {
    this._selectedStudyCountMap = value;
  }

  get selectedStudyConceptCountMap(): Map<string, Map<string, CountItem>> {
    return this._selectedStudyConceptCountMap;
  }

  set selectedStudyConceptCountMap(value: Map<string, Map<string, CountItem>>) {
    this._selectedStudyConceptCountMap = value;
  }

}
