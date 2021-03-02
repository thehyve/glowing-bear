/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {AutoComplete} from 'primeng/components/autocomplete/autocomplete';
import {Concept} from '../../../../models/constraint-models/concept';
import {ConceptConstraint} from '../../../../models/constraint-models/concept-constraint';
import {ValueConstraint} from '../../../../models/constraint-models/value-constraint';
import {UIHelper} from '../../../../utilities/ui-helper';
import {DateOperatorState} from '../../../../models/constraint-models/date-operator-state';
import {CategoricalAggregate} from '../../../../models/aggregate-models/categorical-aggregate';
import {ValueType} from '../../../../models/constraint-models/value-type';
import {Aggregate} from '../../../../models/aggregate-models/aggregate';
import {SelectItem} from 'primeng/api';
import {MessageHelper} from '../../../../utilities/message-helper';
import {NumericalAggregate} from '../../../../models/aggregate-models/numerical-aggregate';
import {TreeNode} from '../../../../models/tree-models/tree-node';
import {TextOperator} from '../../../../models/constraint-models/text-operator';
import {NumericalOperator} from '../../../../models/constraint-models/numerical-operator';

@Component({
  selector: 'gb-concept-constraint',
  templateUrl: './gb-concept-constraint.component.html',
  styleUrls: ['./gb-concept-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbConceptConstraintComponent extends GbConstraintComponent implements OnInit {
  static readonly valDateOperatorSequence = {
    [DateOperatorState.BETWEEN]: DateOperatorState.AFTER,
    [DateOperatorState.AFTER]: DateOperatorState.BEFORE,
    [DateOperatorState.BEFORE]: DateOperatorState.NOT_BETWEEN,
    [DateOperatorState.NOT_BETWEEN]: DateOperatorState.BETWEEN
  };
  static readonly obsDateOperatorSequence = {
    [DateOperatorState.BETWEEN]: DateOperatorState.AFTER,
    [DateOperatorState.AFTER]: DateOperatorState.BEFORE,
    [DateOperatorState.BEFORE]: DateOperatorState.NOT_BETWEEN,
    [DateOperatorState.NOT_BETWEEN]: DateOperatorState.BETWEEN
  };
  @ViewChild('autoComplete', { static: true }) autoComplete: AutoComplete;
  @ViewChild('categoricalAutoComplete', { static: true }) categoricalAutoComplete: AutoComplete;
  @ViewChild('trialVisitAutoComplete', { static: true }) trialVisitAutoComplete: AutoComplete;

  ValueType = ValueType;

  private _searchResults: Concept[];
  private _isMinEqual: boolean;
  private _isMaxEqual: boolean;

  /*
   * numeric value range
   */
  private _numericalOperatorState: NumericalOperator = null;

  /*
   * text value
   */
  private _textOperatorState: TextOperator = null;


  private _numericalOperation: SelectItem[] = [
    { label: 'any', value: null },
    { label: 'greater than', value: NumericalOperator.GREATER },
    { label: 'equal to or greater than', value: NumericalOperator.GREATER_OR_EQUAL },
    { label: 'lower than', value: NumericalOperator.LOWER },
    { label: 'equal to or lower than', value: NumericalOperator.LOWER_OR_EQUAL },
    { label: 'equal to', value: NumericalOperator.EQUAL },
    { label: 'different from', value: NumericalOperator.NOT_EQUAL },
    { label: 'between', value: NumericalOperator.BETWEEN }
  ]


  private _minLimit: number;
  private _maxLimit: number;

  private _textOperation: SelectItem[] = [
    { label: 'any', value: null },
    { label: 'exactly matches', value: TextOperator.LIKE_EXACT },
    { label: 'in', value: TextOperator.IN },
    { label: 'begins with', value: TextOperator.LIKE_BEGIN },
    { label: 'contains', value: TextOperator.LIKE_CONTAINS },
    { label: 'ends with', value: TextOperator.LIKE_END }
  ]


  /*
   * date value range
   */
  private _valDateOperatorState: DateOperatorState = DateOperatorState.BETWEEN;
  public ValDateOperatorStateEnum = DateOperatorState; // make enum visible in template
  private _valDate1: Date;
  private _valDate2: Date;

  /*
   * categorical value range
   */
  selectedCategories: string[];
  suggestedCategories: SelectItem[];

  // ------ more options ------
  /*
   * flag indicating if to show more options
   */
  private _showMoreOptions = false;

  /*
   * observation date range (i.e. the reported date range)
   */
  private _applyObsDateConstraint = false;
  private _obsDateOperatorState: DateOperatorState = DateOperatorState.BETWEEN;
  public ObsDateOperatorStateEnum = DateOperatorState; // make enum visible in template
  private _obsDate1: Date;
  private _obsDate2: Date;

  private _sensitive: boolean;

  ngOnInit() {
    this.initializeConstraints();
  }

  initializeConstraints(): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      let constraint = (<ConceptConstraint>this.constraint);
      // Initialize aggregate values
      this.isMinEqual = true;
      this.isMaxEqual = true;
      this.numericalOperatorState = null;
      if (constraint.concept.isText) {
        constraint.applyTextOperator = true;
      }


      // if constraints comes from restoration

      if (constraint.applyTextOperator) {
        if (constraint.textOperator) {
          this.textOperatorState = constraint.textOperator
          this.textValue = constraint.textOperatorValue
        }
      }

      if (constraint.applyNumericalOperator) {
        if (constraint.numericalOperator) {
          this.numericalOperatorState = constraint.numericalOperator
          if (this.numericalOperatorState === NumericalOperator.BETWEEN) {
            this.minVal = constraint.minValue
            this.maxVal = constraint.maxValue
          } else {
            this.equalVal = constraint.numValue
          }

        }
      }



      this.selectedCategories = [];
      this.suggestedCategories = [];

      this._obsDateOperatorState = DateOperatorState.BETWEEN;

      if (constraint.concept) {
        // Construct a new constraint that only has the concept as sub constraint
        // (We don't want to apply value and date constraints when getting aggregates)
        let conceptOnlyConstraint: ConceptConstraint = new ConceptConstraint(constraint.treeNode);
        conceptOnlyConstraint.concept = constraint.concept;

        // todo: this initializes the aggregate values, not supported for now
        // this.resourceService.getAggregate(conceptOnlyConstraint)
        //   .subscribe((responseAggregate: Aggregate) => {
        //     console.log(`Processing aggregate of ${constraint.concept.name}, type ${constraint.concept.type.toString()}`);
        //     if (!responseAggregate) {
        //       return;
        //     }
        //
        //     constraint.concept.aggregate = responseAggregate;
        //     switch (constraint.concept.type) {
        //       case ValueType.NUMERICAL:
        //         this.handleNumericAggregate(responseAggregate);
        //         break;
        //       case ValueType.CATEGORICAL:
        //         this.handleCategoricalAggregate(responseAggregate);
        //         break;
        //       case ValueType.DATE:
        //         this.handleDateAggregate(responseAggregate);
        //         break;
        //       default:
        //         console.log(`Concept type ${constraint.concept.type.toString()} does not need processing`);
        //         break;
        //     }
        //     resolve(true);
        //   },
        //     (err: HttpErrorResponse) => {
        //       ErrorHelper.handleError(err);
        //       reject(err.message);
        //     }
        //   );

        // Initialize the dates from the time constraint
        // Because the date picker represents the date/time in the local timezone,
        // we need to correct the date that is actually used in the constraint.
        this.applyObsDateConstraint = constraint.applyObsDateConstraint;
        let date1 = constraint.obsDateConstraint.date1;
        this.obsDate1 = new Date(date1.getTime() + 60000 * date1.getTimezoneOffset());
        let date2 = constraint.obsDateConstraint.date2;
        this.obsDate2 = new Date(date2.getTime() + 60000 * date2.getTimezoneOffset());
        this.obsDateOperatorState = constraint.obsDateConstraint.dateOperator;

        // Initialize flags
        this.showMoreOptions = this.applyObsDateConstraint;
      }
    });
  }

  handleNumericAggregate(responseAggregate: Aggregate) {
    let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    let numAggregate = responseAggregate as NumericalAggregate;
    this.minLimit = numAggregate.min;
    this.maxLimit = numAggregate.max;
    // if there is existing numeric values
    // fill their values in
    if (constraint.valueConstraints.length > 0) {
      for (let val of constraint.valueConstraints) {
        if (val.operator.includes('>')) {
          this.minVal = val.value;
        } else if (val.operator.includes('<')) {
          this.maxVal = val.value;
        } else if (val.operator === '=') {
          this.equalVal = val.value;
          this.numericalOperatorState = NumericalOperator.EQUAL;
        } else {
          console.warn(`Unknown operator: ${val.operator}`)
        }
      }
    }
  }

  handleCategoricalAggregate(responseAggregate: Aggregate) {
    let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    constraint.concept.aggregate = responseAggregate;
    let suggestedValues: string[] = (<CategoricalAggregate>constraint.concept.aggregate).values;
    let selectedValues: string[] = suggestedValues;
    let valueCounts = (<CategoricalAggregate>constraint.concept.aggregate).valueCounts;
    // if there is existing value constraints
    // use their values as selected categories
    if (constraint.valueConstraints.length > 0) {
      selectedValues = [];
      for (let val of constraint.valueConstraints) {
        selectedValues.push(val.value);
      }
    }
    this.suggestedCategories = this.generateCategoricalValueItems(valueCounts, suggestedValues);
    this.selectedCategories = selectedValues;
  }

  handleDateAggregate(responseAggregate: Aggregate) {
    let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    let dateAggregate = responseAggregate as NumericalAggregate;
    let date1 = constraint.valDateConstraint.date1;
    let date2 = constraint.valDateConstraint.date2;
    if (Math.abs(date1.getTime() - date2.getTime()) < 1000) {
      this.valDate1 = new Date(dateAggregate.min);
      this.valDate2 = new Date(dateAggregate.max);
    } else {
      this.valDate1 = new Date(date1.getTime() + 60000 * date1.getTimezoneOffset());
      this.valDate2 = new Date(date2.getTime() + 60000 * date2.getTimezoneOffset());
    }
    this.valDateOperatorState = constraint.valDateConstraint.dateOperator;
  }

  generateCategoricalValueItems(valueCounts: Map<string, number>, targetValues: string[]): SelectItem[] {
    let items = [];
    targetValues.forEach((target) => {
      if (valueCounts.has(target)) {
        const count = valueCounts.get(target);
        items.push({
          label: target + ' (' + count + ')',
          value: target
        });
      }
    });
    return items;
  }

  /*
   * -------------------- getters and setters --------------------
   */
  get selectedConcept(): Concept {
    return (<ConceptConstraint>this.constraint).concept;
  }

  set selectedConcept(value: Concept) {
    (<ConceptConstraint>this.constraint).concept = value;
    this.initializeConstraints();
    this.update();
  }

  get applyObsDateConstraint(): boolean {
    return this._applyObsDateConstraint;
  }

  set applyObsDateConstraint(value: boolean) {
    this._applyObsDateConstraint = value;
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyObsDateConstraint = this._applyObsDateConstraint;
    if (conceptConstraint.applyObsDateConstraint) {
      this.update();
    }
  }

  set sensitive(val: boolean) {
    this._sensitive = val
  }

  get sensitive(): boolean {
    return this._sensitive
  }

  get obsDate1(): Date {
    return this._obsDate1;
  }

  set obsDate1(value: Date) {
    // Ignore invalid values
    if (!value) {
      return;
    }
    this._obsDate1 = value;
  }

  get obsDate2(): Date {
    return this._obsDate2;
  }

  set obsDate2(value: Date) {
    // Ignore invalid values
    if (!value) {
      return;
    }
    this._obsDate2 = value;
  }

  get obsDateOperatorState(): DateOperatorState {
    return this._obsDateOperatorState;
  }

  set obsDateOperatorState(value: DateOperatorState) {
    this._obsDateOperatorState = value;
  }

  get valDate1(): Date {
    return this._valDate1;
  }

  set valDate1(value: Date) {
    this._valDate1 = value;
  }

  get valDate2(): Date {
    return this._valDate2;
  }

  set valDate2(value: Date) {
    this._valDate2 = value;
  }

  get valDateOperatorState(): DateOperatorState {
    return this._valDateOperatorState;
  }

  set valDateOperatorState(value: DateOperatorState) {
    this._valDateOperatorState = value;
  }

  /*
   * -------------------- event handlers: concept autocomplete --------------------
   */
  /**
   * when the user searches through concept list
   * @param event
   */
  onSearch(event) {
    let results = this.constraintService.searchAllConstraints(event.query);
    this.searchResults = results
      .filter(constraint => constraint instanceof ConceptConstraint)
      .map(constraint => (constraint as ConceptConstraint).concept);
  }

  /**
   * when user clicks the concept list dropdown
   * @param event
   */
  onDropdown(event) {
    this.searchResults = this.constraintService.concepts;
    UIHelper.removePrimeNgLoaderIcon(this.element, 200);
  }

  // todo: missing types (TEXT)
  updateConceptValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    if (conceptConstraint.concept.type === ValueType.NUMERICAL) { // if the concept is numeric
      this.updateNumericConceptValues();
    } else if (conceptConstraint.concept.type === ValueType.CATEGORICAL) {// else if the concept is categorical
      this.updateCategoricalConceptValues();
    } else if (conceptConstraint.concept.type === ValueType.DATE) {
      this.updateDateConceptValues();
    }
    this.update();
  }

  updateNumericConceptValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    // if to define a single value
    if (this.numericalOperatorState === NumericalOperator.EQUAL) {
      let newVal: ValueConstraint = new ValueConstraint();
      newVal.operator = '=';
      newVal.value = this.equalVal;
      conceptConstraint.valueConstraints = [];
      conceptConstraint.valueConstraints.push(newVal);
      // else if to define a value range
    } else if (this.numericalOperatorState === NumericalOperator.BETWEEN) {
      conceptConstraint.valueConstraints = [];

      let newMinVal: ValueConstraint = new ValueConstraint();
      newMinVal.operator = '>';
      if (this.isMinEqual) {
        newMinVal.operator = '>=';
      }
      newMinVal.value = this.minVal;
      conceptConstraint.valueConstraints.push(newMinVal);

      let newMaxVal: ValueConstraint = new ValueConstraint();
      newMaxVal.operator = '<';
      if (this.isMaxEqual) {
        newMaxVal.operator = '<=';
      }
      newMaxVal.value = this.maxVal;
      conceptConstraint.valueConstraints.push(newMaxVal);
    }
  }

  updateCategoricalConceptValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.valueConstraints = [];
    for (let category of this.selectedCategories) {
      let newVal: ValueConstraint = new ValueConstraint();
      newVal.operator = '=';
      newVal.value = category;
      conceptConstraint.valueConstraints.push(newVal);
    }
  }

  updateDateConceptValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyValDateConstraint = true;
    const val1 = this.valDate1;
    if (val1) {
      let correctedDate1 = new Date(val1.getTime() - 60000 * val1.getTimezoneOffset());
      conceptConstraint.valDateConstraint.date1 = correctedDate1;
    }
    const val2 = this.valDate2;
    if (val2) {
      let correctedDate2 = new Date(val2.getTime() - 60000 * val2.getTimezoneOffset());
      conceptConstraint.valDateConstraint.date2 = correctedDate2;
    }
  }

  /*
   * -------------------- event handlers: observation-date --------------------
   */
  updateObservationDateValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    // Because the date picker represents the date/time in the local timezone,
    // we need to correct the date that is actually used in the constraint.
    const val1 = this.obsDate1;
    let correctedDate1 = new Date(val1.getTime() - 60000 * val1.getTimezoneOffset());
    conceptConstraint.obsDateConstraint.date1 = correctedDate1;
    const val2 = this.obsDate2;
    let correctedDate2 = new Date(val2.getTime() - 60000 * val2.getTimezoneOffset());
    conceptConstraint.obsDateConstraint.date2 = correctedDate2;
    this.update();
  }

  /*
   * -------------------- event handlers: numerical-operator --------------------
   */

  changeNumericalOperator(event) {
    if (event.value === null) {
      (<ConceptConstraint>this.constraint).applyNumericalOperator = false;
    } else {
      (<ConceptConstraint>this.constraint).applyNumericalOperator = true;
      (<ConceptConstraint>this.constraint).numericalOperator = event.value;
    }

  }

  /**
   * -------------------- event handlers: text-operator --------------------
   */

  changeTextOperator(event) {
    if (event.value === null) {
      (<ConceptConstraint>this.constraint).applyTextOperator = false;
    } else {
      (<ConceptConstraint>this.constraint).applyTextOperator = true;
      (<ConceptConstraint>this.constraint).textOperator = event.value;
    }
  }

  /*
   * -------------------- state checkers --------------------
   */

  get constraintConcept(): Concept {
    return (<ConceptConstraint>this.constraint).concept;
  }

  isBetween() {
    return this.numericalOperatorState === NumericalOperator.BETWEEN;
  }

  /**
   * Switch the operator state of the current NUMERIC constraint
   */
  switchOperatorState() {
    if (this.selectedConcept.type === ValueType.NUMERICAL) {
      this.numericalOperatorState =
        (this.numericalOperatorState === NumericalOperator.EQUAL) ?
          (this.numericalOperatorState = NumericalOperator.BETWEEN) :
          (this.numericalOperatorState = NumericalOperator.EQUAL);
    }
    this.updateConceptValues();
  }

  getOperatorButtonName() {
    let name = '';
    if (this.selectedConcept.type === ValueType.NUMERICAL || this.selectedConcept.type === ValueType.DATE) {
      name = (this.numericalOperatorState === NumericalOperator.BETWEEN) ? 'between' : 'equal to';
    }
    return name;
  }

  /**
   * Switch the operator state of the observation date constraint of the current constraint
   */
  switchObsDateOperatorState() {
    // Select the next state in the operator sequence
    this.obsDateOperatorState =
      GbConceptConstraintComponent.obsDateOperatorSequence[this.obsDateOperatorState];
    // Update the constraint
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.obsDateConstraint.dateOperator = this.obsDateOperatorState;
    conceptConstraint.obsDateConstraint.isNegated =
      (this.obsDateOperatorState === DateOperatorState.NOT_BETWEEN);
    // Notify constraint service
    this.update();
  }

  /**
   * Switch the operator state of the current DATE constraint
   */
  switchValDateOperatorState() {
    // Select the next state in the operator sequence
    this.valDateOperatorState =
      GbConceptConstraintComponent.valDateOperatorSequence[this.valDateOperatorState];
    // Update the constraint
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.valDateConstraint.dateOperator = this.valDateOperatorState;
    conceptConstraint.valDateConstraint.isNegated =
      (this.valDateOperatorState === DateOperatorState.NOT_BETWEEN);
    this.updateConceptValues();
  }

  /**
   * Toggle the 'more options' panel
   */
  toggleMoreOptions() {
    this.showMoreOptions = !this.showMoreOptions;
  }

  onDrop(event: DragEvent) {
    event.stopPropagation();

    let selectedNode: TreeNode = this.treeNodeService.selectedTreeNode;
    this.droppedConstraint =
      this.constraintService.generateConstraintFromTreeNode(selectedNode, selectedNode ? selectedNode.dropMode : null);

    if (this.droppedConstraint && this.droppedConstraint.className === 'ConceptConstraint') {
      (<ConceptConstraint>this.constraint).concept = (<ConceptConstraint>this.droppedConstraint).concept;
      this.initializeConstraints()
        .then(() => {
          this.update();
        });
    } else {
      const summary = `Dropped a ${this.droppedConstraint.className}, incompatible with ConceptConstraint.`;
      MessageHelper.alert('error', summary);
    }
    this.treeNodeService.selectedTreeNode = null;
    this.droppedConstraint = null;
  }

  get numericalOperatorState(): NumericalOperator {
    return this._numericalOperatorState;
  }

  set numericalOperatorState(value: NumericalOperator) {
    this._numericalOperatorState = value;
  }

  get textOperatorState(): TextOperator {
    return this._textOperatorState;
  }

  set textOperatorState(value: TextOperator) {
    this._textOperatorState = value;
  }

  get numericalOperation(): SelectItem[] {
    return this._numericalOperation
  }

  get textOperation(): SelectItem[] {
    return this._textOperation
  }

  set textValue(val: string) {
    (<ConceptConstraint>this.constraint).textOperatorValue = val
  }

  get textValue(): string {
    return (<ConceptConstraint>this.constraint).textOperatorValue
  }

  get isMinEqual(): boolean {
    return this._isMinEqual;
  }

  set isMinEqual(value: boolean) {
    this._isMinEqual = value;
  }

  get isMaxEqual(): boolean {
    return this._isMaxEqual;
  }

  set isMaxEqual(value: boolean) {
    this._isMaxEqual = value;
  }

  get minVal(): number {
    return (<ConceptConstraint>this.constraint).minValue;
  }

  set minVal(value: number) {
    (<ConceptConstraint>this.constraint).minValue = value;
  }

  get maxVal(): number {
    return (<ConceptConstraint>this.constraint).maxValue;
  }

  set maxVal(value: number) {
    (<ConceptConstraint>this.constraint).maxValue = value;
  }

  set maxLimit(value: number) {
    this._maxLimit = value;
  }

  get minLimit(): number {
    return this._minLimit;
  }

  set minLimit(value: number) {
    this._minLimit = value;
  }

  get equalVal(): number {
    return (<ConceptConstraint>this.constraint).numValue;
  }

  set equalVal(value: number) {
    (<ConceptConstraint>this.constraint).numValue = value;
  }

  get searchResults(): Concept[] {
    return this._searchResults;
  }

  set searchResults(value: Concept[]) {
    this._searchResults = value;
  }

  get showMoreOptions(): boolean {
    return this._showMoreOptions;
  }

  set showMoreOptions(value: boolean) {
    this._showMoreOptions = value;
  }
  get unit(): string {
    let concept = (this.constraint as ConceptConstraint).concept
    return (concept.unit) ? concept.unit : ''

  }
  get integerOrFloatStep(): string {
    let concept = (this.constraint as ConceptConstraint).concept
    return concept.isInteger ? '1' : 'any'
  }
  get positive(): string {
    let concept = (this.constraint as ConceptConstraint).concept
    return concept.isPositive ? '0' : ''
  }
}
