/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Constraint } from './constraint';
import { Concept } from './concept';
import { ValueConstraint } from './value-constraint';
import { TimeConstraint } from './time-constraint';
import { FormatHelper } from '../../utilities/format-helper';
import { NumericalOperator } from './numerical-operator';
import { TreeNode } from '../tree-models/tree-node';
import { TextOperator } from './text-operator';

export class ConceptConstraint extends Constraint {

  private _concept: Concept;
  // the treeNode it has been generated from
  private _treeNode: TreeNode;
  // the value constraints used for numeric or categorical values of this concept
  private _valueConstraints: ValueConstraint[];
  // the time constraint used for date type constraint of this concept
  private _valDateConstraint: TimeConstraint;
  private _applyValDateConstraint = false;

  // numerical operator
  private _applyNumericalOperator = false;
  private _numericalOperator: NumericalOperator;
  private _numValue: number;
  private _minValue: number;
  private _maxValue: number;

  // text operator
  private _applyTextOperator = false;
  private _textOperator: TextOperator;
  private _textOperatorValue: string;

  // observation date range
  private _applyObsDateConstraint = false;
  private _obsDateConstraint: TimeConstraint;

  constructor(treeNode: TreeNode) {
    super();
    this._treeNode = treeNode;
    this.valueConstraints = [];
    this.valDateConstraint = new TimeConstraint();
    this.valDateConstraint.isObservationDate = false;
    this.obsDateConstraint = new TimeConstraint();
    this.obsDateConstraint.isObservationDate = true;
    this.textRepresentation = 'Concept';
  }

  clone(): ConceptConstraint {
    let res = new ConceptConstraint(this._treeNode.clone())
    res.textRepresentation = this.textRepresentation
    res.parentConstraint = this.parentConstraint
    res.concept = this.concept.clone()
    res.applyNumericalOperator = this.applyNumericalOperator
    if (this.numericalOperator) {
      res.numericalOperator = this.numericalOperator
    }
    if (this.numValue) {
      res.numValue = this.numValue
    }
    if (this.minValue) {
      res.minValue = this.minValue
    }
    if (this.maxValue) {
      res.maxValue = this.maxValue
    }
    return res
  }

  get concept(): Concept {
    return this._concept;
  }

  set concept(concept: Concept) {
    this._concept = concept;
    this.textRepresentation = concept ? `Ontology concept: ${concept.label}` : FormatHelper.nullValuePlaceholder;
  }

  get valueConstraints(): ValueConstraint[] {
    return this._valueConstraints;
  }

  set valueConstraints(value: ValueConstraint[]) {
    this._valueConstraints = value;
  }

  get className(): string {
    return 'ConceptConstraint';
  }

  get treeNode(): TreeNode {
    return this._treeNode
  }

  get valDateConstraint(): TimeConstraint {
    return this._valDateConstraint;
  }

  set valDateConstraint(value: TimeConstraint) {
    this._valDateConstraint = value;
  }

  get applyObsDateConstraint(): boolean {
    return this._applyObsDateConstraint;
  }

  set applyObsDateConstraint(value: boolean) {
    this._applyObsDateConstraint = value;
  }

  get obsDateConstraint(): TimeConstraint {
    return this._obsDateConstraint;
  }

  set obsDateConstraint(value: TimeConstraint) {
    this._obsDateConstraint = value;
  }

  get applyValDateConstraint(): boolean {
    return this._applyValDateConstraint;
  }

  set applyValDateConstraint(value: boolean) {
    this._applyValDateConstraint = value;
  }

  set applyNumericalOperator(val: boolean) {
    this._applyNumericalOperator = val
  }

  get applyNumericalOperator(): boolean {
    return this._applyNumericalOperator
  }

  set numericalOperator(val: NumericalOperator) {
    this._numericalOperator = val
  }

  get numericalOperator(): NumericalOperator {
    return this._numericalOperator

  }

  set numValue(val: number) {
    this._numValue = val
  }

  get numValue(): number {
    return this._numValue
  }

  set minValue(val: number) {
    this._minValue = val
  }

  get minValue(): number {
    return this._minValue

  }
  set maxValue(val: number) {
    this._maxValue = val
  }

  get maxValue(): number {
    return this._maxValue

  }

  set applyTextOperator(val: boolean) {
    this._applyTextOperator = val
  }

  get applyTextOperator(): boolean {
    return this._applyTextOperator
  }

  set textOperator(val: TextOperator) {
    this._textOperator = val
  }

  get textOperator(): TextOperator {
    return this._textOperator
  }

  set textOperatorValue(val: string) {
    this._textOperatorValue = val
  }

  get textOperatorValue(): string {
    return this._textOperatorValue
  }


}
