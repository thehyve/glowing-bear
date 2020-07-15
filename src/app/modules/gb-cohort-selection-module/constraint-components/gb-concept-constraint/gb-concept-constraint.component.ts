/**
 * Copyright 2017 - 2018  The Hyve B.V.
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
import {GbConceptOperatorState} from './gb-concept-operator-state';
import {ValueConstraint} from '../../../../models/constraint-models/value-constraint';
import {TrialVisit} from '../../../../models/constraint-models/trial-visit';
import {TrialVisitConstraint} from '../../../../models/constraint-models/trial-visit-constraint';
import {UIHelper} from '../../../../utilities/ui-helper';
import {DateOperatorState} from '../../../../models/constraint-models/date-operator-state';
import {CategoricalAggregate} from '../../../../models/aggregate-models/categorical-aggregate';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {Aggregate} from '../../../../models/aggregate-models/aggregate';
import {SelectItem} from 'primeng/api';
import {ErrorHelper} from '../../../../utilities/error-helper';
import {HttpErrorResponse} from '@angular/common/http';
import {FormatHelper} from '../../../../utilities/format-helper';
import {AccessLevel} from '../../../../services/authentication/access-level';
import {ValueType} from '../../../../models/constraint-models/value-type';
import {Operator} from '../../../../models/constraint-models/operator';
import {StudyConstraint} from '../../../../models/constraint-models/study-constraint';
import {Study} from '../../../../models/constraint-models/study';
import {GbTreeNode} from '../../../../models/tree-node-models/gb-tree-node';
import { Modifier } from 'app/models/constraint-models/modifier';
import { Observable, Subject } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { ModifierConstraint } from 'app/models/constraint-models/modifier-constraint';

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
  @ViewChild('autoComplete') autoComplete: AutoComplete;
  @ViewChild('categoricalAutoComplete') categoricalAutoComplete: AutoComplete;
  @ViewChild('trialVisitAutoComplete') trialVisitAutoComplete: AutoComplete;

  searchResults: Concept[];
  operatorState: GbConceptOperatorState;
  isMinEqual: boolean;
  isMaxEqual: boolean;

  /*
   * numeric value range
   */
  equalVal: number;
  minVal: number;
  maxVal: number;
  minLimit: number;
  maxLimit: number;

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
  showMoreOptions = false;

  /*
   * observation date range (i.e. the reported date range)
   */
  private _applyObsDateConstraint = false;
  private _obsDateOperatorState: DateOperatorState = DateOperatorState.BETWEEN;
  public ObsDateOperatorStateEnum = DateOperatorState; // make enum visible in template
  private _obsDate1: Date;
  private _obsDate2: Date;

  // trial visit
  private _applyTrialVisitConstraint = false;
  private _allTrialVisits: TrialVisit[];
  private _selectedTrialVisits: TrialVisit[];
  private _suggestedTrialVisits: TrialVisit[];

  // modifier
  private _applyModifierConstraint = false;
  private _allModifiers: Modifier[];
  private _selectedModifiers: Modifier[];

  // modifier elements
  private _allModifierElements: SelectItem[];
  private _selectedModifierElements: string[];
  private selectedModifierSubject;


  private _applyStudyConstraint = false;

  ngOnInit() {
    this.initializeConstraints().then();
  }

  initializeConstraints() {
    return new Promise<any>((resolve, reject) => {
      // Initialize aggregate values
      this.isMinEqual = true;
      this.isMaxEqual = true;
      this.operatorState = GbConceptOperatorState.BETWEEN;

      this.selectedCategories = [];
      this.suggestedCategories = [];

      this._obsDateOperatorState = DateOperatorState.BETWEEN;

      let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
      if (constraint.concept) {
        // Construct a new constraint that only has the concept as sub constraint
        // (We don't want to apply value and date constraints when getting aggregates)
        let conceptOnlyConstraint: ConceptConstraint = new ConceptConstraint();
        conceptOnlyConstraint.concept = constraint.concept;
        if (this.isCategorical()) { // ------------------------> If it's CATEGORICAL
          this.resourceService.getCategoricalAggregate(conceptOnlyConstraint)
            .subscribe(
              (responseAggregate: CategoricalAggregate) => {
                this.handleCategoricalAggregate(responseAggregate);
                resolve(true);
              },
              (err: HttpErrorResponse) => {
                ErrorHelper.handleError(err);
                reject(err.message);
              }
            );
        } else {
          this.authService.accessLevel.asObservable()
            .subscribe((level: AccessLevel) => {
              if (level === AccessLevel.Full) {
                this.resourceService.getAggregate(conceptOnlyConstraint)
                  .subscribe(
                    (responseAggregate: Aggregate) => {
                      if (this.isNumeric()) { // --------------------------------------> If it's NUMERIC
                        this.handleNumericAggregate(responseAggregate);
                      } else if (this.isDate()) { // -------------------------------------> If it's DATE
                        this.handleDateAggregate(responseAggregate);
                      }
                      resolve(true);
                    },
                    (err: HttpErrorResponse) => {
                      ErrorHelper.handleError(err);
                      reject(err.message);
                    }
                  );
              }
            });
        }

        // Initialize the dates from the time constraint
        // Because the date picker represents the date/time in the local timezone,
        // we need to correct the date that is actually used in the constraint.
        this.applyObsDateConstraint = constraint.applyObsDateConstraint;
        let date1 = constraint.obsDateConstraint.date1;
        this.obsDate1 = new Date(date1.getTime() + 60000 * date1.getTimezoneOffset());
        let date2 = constraint.obsDateConstraint.date2;
        this.obsDate2 = new Date(date2.getTime() + 60000 * date2.getTimezoneOffset());
        this.obsDateOperatorState = constraint.obsDateConstraint.dateOperator;

        // Initialize the available trial visits of the trial visit constraint
        this.applyTrialVisitConstraint = constraint.applyTrialVisitConstraint;
        this.allTrialVisits = [];
        this.selectedTrialVisits = [];
        this.suggestedTrialVisits = [];
        this.studyService.existsTrialVisitDimension.subscribe(existsTrialVisitDimension => {
          if (existsTrialVisitDimension) {
            this.resourceService.getTrialVisits(conceptOnlyConstraint)
              .subscribe(
                visits => {
                  this.handleTrialVisits(visits);
                },
                err => ErrorHelper.handleError(err)
              );
          }
        });

        // Initialize available modifiers for the given concept
        this.applyModifierConstraint = constraint.applyModifierConstraint;
        this.allModifiers = [];
        this.allModifierElements = [];
        this.resourceService.getModifiers(constraint.concept)
          .pipe(
              flatMap((modifierNames: string[]) => {
                return Observable.from(modifierNames)
              }),
              map((modifierName: string) => {
                const mod = new Modifier(modifierName);
                this.allModifiers = [...this.allModifiers, mod];
                return mod;
              }),
              flatMap((modifier: Modifier) => {
                return this.resourceService.getModifierElements(modifier.name)
                  .map((elements: string[]) => {
                    modifier.elements = elements;
                    return modifier;
                  });
              })
          ).subscribe();

        this.selectedModifierSubject = new Subject();
        this._selectedModifiers = [];
        this.selectedModifierSubject.subscribe(x => {
          if (x.modifier.elements === undefined) {
            return;
          }
          switch(x.type) {
            case 'set':
              const newElements = x.modifier.elements.map(element => { return { label: element, value: element }; })
              this.allModifierElements = [...this.allModifierElements, ...newElements];
              break;
            case 'delete':
              this.allModifierElements = this.allModifierElements.filter(element => !x.modifier.elements.includes(element.label));
              // remove all children from selectedModifierElements and update the constraint
              this.selectedModifierElements = this.selectedModifierElements.filter(element => !x.modifier.elements.includes(element))
              this.onModifierElementClick();
              break;
          }
        })

        // Initialize flags
        this.showMoreOptions = this.applyObsDateConstraint || this.applyTrialVisitConstraint || this.applyStudyConstraint || this.applyModifierConstraint;
      }
    });
  }

  handleNumericAggregate(responseAggregate: Aggregate) {
    let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    constraint.concept.aggregate = responseAggregate;
    this.minLimit = responseAggregate['min'];
    this.maxLimit = responseAggregate['max'];
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
          this.operatorState = GbConceptOperatorState.EQUAL;
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
    // sort the suggested categories
    this.onCategoricalValuePanelHide();
  }

  handleDateAggregate(responseAggregate: Aggregate) {
    let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    constraint.concept.aggregate = responseAggregate;
    let date1 = constraint.valDateConstraint.date1;
    let date2 = constraint.valDateConstraint.date2;
    if (Math.abs(date1.getTime() - date2.getTime()) < 1000) {
      this.valDate1 = new Date(responseAggregate['min']);
      this.valDate2 = new Date(responseAggregate['max']);
    } else {
      this.valDate1 = new Date(date1.getTime() + 60000 * date1.getTimezoneOffset());
      this.valDate2 = new Date(date2.getTime() + 60000 * date2.getTimezoneOffset());
    }
    this.valDateOperatorState = constraint.valDateConstraint.dateOperator;
  }

  handleTrialVisits(visits) {
    let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    this.allTrialVisits = visits;
    this.selectedTrialVisits = visits.slice(0); // new array of visits
    constraint.trialVisitConstraint.trialVisits = visits.slice(0); // new array of visits
  }

  generateCategoricalValueItems(valueCounts: Map<string, number>, targetValues: string[]): SelectItem[] {
    let items = [];
    targetValues.forEach((target) => {
      if (valueCounts.has(target)) {
        const count = FormatHelper.formatCountNumber(valueCounts.get(target));
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
    if (value instanceof Concept) {
      (<ConceptConstraint>this.constraint).concept = value;
      this.initializeConstraints();
      this.update();
    }
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

  get applyTrialVisitConstraint(): boolean {
    return this._applyTrialVisitConstraint;
  }

  set applyTrialVisitConstraint(value: boolean) {
    this._applyTrialVisitConstraint = value;
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyTrialVisitConstraint = this.applyTrialVisitConstraint;
    if (conceptConstraint.applyTrialVisitConstraint) {
      this.update();
    }
  }

  get studyConstraint() {
    return (<ConceptConstraint>this.constraint).studyConstraint;
  }

  get applyStudyConstraint(): boolean {
    return this._applyStudyConstraint;
  }

  set applyStudyConstraint(value: boolean) {
    this._applyStudyConstraint = value;
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyStudyConstraint = this.applyStudyConstraint;
    if (conceptConstraint.applyStudyConstraint) {
      this.update();
    }
  }

  get allTrialVisits(): TrialVisit[] {
    return this._allTrialVisits;
  }

  set allTrialVisits(value: TrialVisit[]) {
    this._allTrialVisits = value;
  }

  get selectedTrialVisits(): TrialVisit[] {
    return this._selectedTrialVisits;
  }

  set selectedTrialVisits(value: TrialVisit[]) {
    this._selectedTrialVisits = value;
  }

  get suggestedTrialVisits(): TrialVisit[] {
    return this._suggestedTrialVisits;
  }

  set suggestedTrialVisits(value: TrialVisit[]) {
    this._suggestedTrialVisits = value;
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

  get applyModifierConstraint() {
    return this._applyModifierConstraint;
  }

  set applyModifierConstraint(value) {
    this._applyModifierConstraint = value;
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyModifierConstraint = this._applyModifierConstraint;
    if (!conceptConstraint.applyModifierConstraint) {
      (<ConceptConstraint>this.constraint).modifierConstraints.length = 0;
    }
    this.update();
  }

  get allModifiers(): Modifier[] {
    return this._allModifiers;
  }

  set allModifiers(value: Modifier[]) {
    this._allModifiers = value;
  }

  get selectedModifiers(): Modifier[] {
    return this._selectedModifiers;
  }

  // This operation is O(N)
  set selectedModifiers(value: Modifier[]) {
    if (value.length > 0 &&
        this._selectedModifiers.find(modifier => modifier.name === value[value.length-1].name) === undefined) {
      // modifier has been added
      this.selectedModifierSubject.next({type: 'set', modifier: value[value.length-1]});
    } else {
      // modifier has been removed
      const currentModifierNames = new Set(value.map(v => v.name))
      const removedElement = this._selectedModifiers.filter(selectedModifier => !currentModifierNames.has(selectedModifier.name))
      if (removedElement.length == 1) {
        this.selectedModifierSubject.next({type: 'delete', modifier: removedElement[0]});
      }
    }
    this._selectedModifiers = value;
  }

  get allModifierElements(): SelectItem[] {
    return this._allModifierElements;
  }

  set allModifierElements(value: SelectItem[]) {
    this._allModifierElements = value;
  }

  get selectedModifierElements(): string[] {
    return this._selectedModifierElements;
  }

  set selectedModifierElements(value: string[]) {
    this._selectedModifierElements = value;
  }


  /*
   * -------------------- event handlers: concept autocomplete --------------------
   */
  /**
   * when the user searches through concept list
   * @param event
   */
  onSearch(event) {
    let query = event.query.toLowerCase();
    let concepts = this.constraintService.concepts;
    if (query) {
      this.searchResults = concepts.filter((concept: Concept) =>
        concept.fullName && concept.fullName.toLowerCase().includes(query));
    } else {
      this.searchResults = concepts;
    }
  }

  /**
   * when user clicks the concept list dropdown
   * @param event
   */
  onDropdown(event) {
    this.searchResults = this.constraintService.concepts.slice(0);
    UIHelper.removePrimeNgLoaderIcon(this.element, 200);
  }

  updateConceptValues() {
    if (this.isNumeric()) { // if the concept is numeric
      this.updateNumericConceptValues();
    } else if (this.isCategorical()) {// else if the concept is categorical
      this.updateCategoricalConceptValues();
    } else if (this.isDate()) {
      this.updateDateConceptValues();
    }
    this.update();
  }

  updateNumericConceptValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    // if to define a single value
    if (this.operatorState === GbConceptOperatorState.EQUAL) {
      if (typeof this.equalVal === 'number') {
        let newVal: ValueConstraint = new ValueConstraint();
        newVal.valueType = ValueType.numeric;
        newVal.operator = <Operator>'=';
        newVal.value = this.equalVal;
        conceptConstraint.valueConstraints = [];
        conceptConstraint.valueConstraints.push(newVal);
      } // else if to define a value range
    } else if (this.operatorState === GbConceptOperatorState.BETWEEN) {
      conceptConstraint.valueConstraints = [];
      if (typeof this.minVal === 'number') {
        let newMinVal: ValueConstraint = new ValueConstraint();
        newMinVal.valueType = ValueType.numeric;
        newMinVal.operator = <Operator>'>';
        if (this.isMinEqual) {
          newMinVal.operator = <Operator>'>=';
        }
        newMinVal.value = this.minVal;
        conceptConstraint.valueConstraints.push(newMinVal);
      }

      if (typeof this.maxVal === 'number') {
        let newMaxVal: ValueConstraint = new ValueConstraint();
        newMaxVal.valueType = ValueType.numeric;
        newMaxVal.operator = <Operator>'<';
        if (this.isMaxEqual) {
          newMaxVal.operator = <Operator>'<=';
        }
        newMaxVal.value = this.maxVal;
        conceptConstraint.valueConstraints.push(newMaxVal);
      }
    }
  }

  updateCategoricalConceptValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.valueConstraints = [];
    for (let category of this.selectedCategories) {
      let newVal: ValueConstraint = new ValueConstraint();
      newVal.valueType = ValueType.string;
      newVal.operator = <Operator>'=';
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
   * -------------------- event handlers: trial-visit autocomplete --------------------
   */
  /**
   * when the user searches through the trial-visit list of a selected concept
   * @param event
   */
  onTrialVisitSearch(event) {
    let query = event.query.toLowerCase().trim();
    let trialVisits = this.allTrialVisits;
    if (query) {
      this.suggestedTrialVisits =
        trialVisits.filter((category: TrialVisit) => category.relTimeLabel.toLowerCase().includes(query));
    } else {
      this.suggestedTrialVisits = trialVisits;
    }
  }

  onTrialVisitDropdown(event) {
    this.suggestedTrialVisits = this.allTrialVisits.slice(0);
    UIHelper.removePrimeNgLoaderIcon(this.element, 200);
  }

  selectAllTrialVisits() {
    this.selectedTrialVisits = this.allTrialVisits.slice(0);
    this.updateTrialVisitValues();
  }

  clearAllTrialVisits() {
    this.selectedTrialVisits = [];
    this.updateTrialVisitValues();
  }

  updateTrialVisitValues() {
    let trialVisitConstraint: TrialVisitConstraint = (<ConceptConstraint>this.constraint).trialVisitConstraint;
    trialVisitConstraint.trialVisits = this.selectedTrialVisits.slice(0);
    this.update();
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
   * -------------------- event handlers: modifier-elements --------------------
   */

   onModifierElementClick() {
     // O(|SelectedModifiers| * |Children| * |SelectedE|)
     // Unfortunately, PrimeNG 6.x doesn't emit an event with the value of the
     // item clicked so the only way is to iterate over all of them to figure
     // out the modifications
     let modifierConstraints: ModifierConstraint[] = (<ConceptConstraint>this.constraint).modifierConstraints;

     // Empty the array without changing the reference
     modifierConstraints.length = 0;
     this.selectedModifiers.forEach((modifier) => {
       let modifierConstraint = new ModifierConstraint();
       modifierConstraint.dimensionName = modifier.name;
       modifier.elements.forEach((element) => {
         if (this.selectedModifierElements.find(el => el === element) !== undefined) {
           const valueConstraint = new ValueConstraint();
           valueConstraint.value = element;
           valueConstraint.operator = Operator.eq;
           valueConstraint.valueType = ValueType.string;
           modifierConstraint.values.push(valueConstraint);
         }
       });
       if (modifierConstraint.values.length > 0) {
         modifierConstraints.push(modifierConstraint);
       }
     });
     this.update();
   }

  /*
   * -------------------- state checkers --------------------
   */
  isNumeric(): boolean {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === ConceptType.NUMERICAL;
  }

  isCategorical(): boolean {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === ConceptType.CATEGORICAL;
  }

  isDate(): boolean {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === ConceptType.DATE;
  }

  isBetween(): boolean {
    return this.operatorState === GbConceptOperatorState.BETWEEN;
  }

  /**
   * Switch the operator state of the current NUMERIC constraint
   */
  switchOperatorState() {
    if (this.isNumeric()) {
      this.operatorState =
        (this.operatorState === GbConceptOperatorState.EQUAL) ?
          (this.operatorState = GbConceptOperatorState.BETWEEN) :
          (this.operatorState = GbConceptOperatorState.EQUAL);
    }
    this.updateConceptValues();
  }

  getOperatorButtonName() {
    let name = '';
    if (this.isNumeric() || this.isDate()) {
      name = (this.operatorState === GbConceptOperatorState.BETWEEN) ? 'between' : 'equal to';
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
    this.updateConceptValues();
  }

  /**
   * Toggle the 'more options' panel
   */
  toggleMoreOptions() {
    this.showMoreOptions = !this.showMoreOptions;
  }

  /**
   * Add studies to the current concept constraint, if not already present.
   * @param studies
   */
  addStudies(studies: Study[]) {
    const conceptConstraint = (<ConceptConstraint>this.constraint);
    const currentStudyIds = conceptConstraint.studyConstraint.studies.map(study => study.id);
    const newStudies = studies.filter(study =>
      !currentStudyIds.includes(study.id)
    );
    newStudies.forEach(study => conceptConstraint.studyConstraint.studies.push(study));
    if (conceptConstraint.studyConstraint.studies.length > 0) {
      conceptConstraint.applyStudyConstraint = true;
    }
  }

  onDrop(event: DragEvent) {
    const selectedNode: GbTreeNode = this.treeNodeService.selectedTreeNode;
    if (selectedNode && selectedNode.type === 'STUDY') {
      const droppedConstraint = this.treeNodeService.generateConstraintFromTreeNode(selectedNode);
      if (droppedConstraint && droppedConstraint.className === 'StudyConstraint') {
        this.addStudies((<StudyConstraint>droppedConstraint).studies);
        this.initializeConstraints().then(() => {
          this.update();
        });
        this.treeNodeService.selectedTreeNode = null;
        event.stopPropagation();
      }
    }
  }

  /**
   * sort the suggested categorical values so that the selected ones go on top,
   * then sort alphabetically
   */
  onCategoricalValuePanelHide() {
    // put selected categories on top, then sort alphabetically
    this.suggestedCategories.sort((a: SelectItem, b: SelectItem) => {
      if (this.selectedCategories.includes(a.value) && this.selectedCategories.includes(b.value)) {
        if (a.value > b.value) {
          return 1;
        } else {
          return -1;
        }
      } else if (this.selectedCategories.includes(a.value)) {
        return -1;
      } else if (this.selectedCategories.includes(b.value)) {
        return 1;
      } else {
        if (a.value > b.value) {
          return 1;
        } else {
          return -1;
        }
      }
    });
  }

}
