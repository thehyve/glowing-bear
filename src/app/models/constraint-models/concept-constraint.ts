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
import { ThrowStmt, unescapeIdentifier } from '@angular/compiler';

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
    res.applyTextOperator = this.applyTextOperator;

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
    if (this.textOperator) {
      res.textOperator = this.textOperator
    }
    if (this.textOperatorValue) {
      res.textOperatorValue = this.textOperatorValue
    }

    return res
  }

  /**
   * checkRealNumberSubset assumes the test number to be defined: not 'undefined' or 'null'.
   * checks if its current value belongs to the correct subset of real number, as it could be restricted to
   * positive and/or integer number
   */
  private checkEqualValueRealNumberSubset(testNumber: number): boolean {
    if (this.concept.isInteger && !Number.isInteger(testNumber)) {
      return false
    }
    if (this.concept.isPositive && testNumber < 0) {
      return false
    }
    return true
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

  get inputValueValidity(): boolean {
    if (!this.applyNumericalOperator && !this.applyTextOperator) {
      return true
    }

    if (this.applyNumericalOperator) {
      if (this.numericalOperator === undefined) {
        return true
      }
      switch (this.numericalOperator) {

        case NumericalOperator.EQUAL:
        case NumericalOperator.NOT_EQUAL:
        case NumericalOperator.GREATER:
        case NumericalOperator.GREATER_OR_EQUAL:
        case NumericalOperator.LOWER_OR_EQUAL:
        case NumericalOperator.LOWER:
          if ((this.numValue !== undefined) && (this.numValue !== null)) {
            return this.checkEqualValueRealNumberSubset(this.numValue)
          } else {
            return false
          }
          break;
        case NumericalOperator.BETWEEN:
          if ((this.minValue !== undefined) &&
            (this.minValue !== null) &&
            (this.maxValue !== undefined) &&
            (this.maxValue !== null)) {
            return this.checkEqualValueRealNumberSubset(this.minValue) &&
              this.checkEqualValueRealNumberSubset(this.maxValue)
          } else {
            return false
          }
        default:
          break;
      }
    }
    if (this.applyTextOperator) {
      if (this.textOperator === undefined) {
        return true
      }
      return ((this.textOperatorValue) && this.textOperatorValue !== '')
    }
  }
}
