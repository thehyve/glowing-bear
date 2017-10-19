import {Component, OnInit, ViewChild} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {AutoComplete} from 'primeng/components/autocomplete/autocomplete';
import {Concept} from '../../../../models/concept';
import {ConceptConstraint} from '../../../../models/constraints/concept-constraint';
import {GbConceptOperatorState} from './gb-concept-operator-state';
import {ValueConstraint} from '../../../../models/constraints/value-constraint';
import {GbDateOperatorState} from './gb-date-operator-state';
import {TrialVisit} from '../../../../models/trial-visit';
import {TrialVisitConstraint} from '../../../../models/constraints/trial-visit-constraint';

@Component({
  selector: 'gb-concept-constraint',
  templateUrl: './gb-concept-constraint.component.html',
  styleUrls: ['./gb-concept-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbConceptConstraintComponent extends GbConstraintComponent implements OnInit {

  @ViewChild('autoComplete') autoComplete: AutoComplete;
  @ViewChild('categoricalAutoComplete') categoricalAutoComplete: AutoComplete;
  @ViewChild('trialVisitAutoComplete') trialVisitAutoComplete: AutoComplete;

  private _searchResults: Concept[];
  private _operatorState: GbConceptOperatorState;
  private _isMinEqual: boolean;
  private _isMaxEqual: boolean;

  /*
   * numeric value range
   */
  private _equalVal: number;
  private _minVal: number;
  private _maxVal: number;
  private _minLimit: number;
  private _maxLimit: number;

  /*
   * date value range
   */
  private _valDate1: Date;
  private _valDate2: Date;

  /*
   * categorical value range
   */
  selectedCategories: string[];
  suggestedCategories: string[];

  /*
   * observation date range (i.e. the reported date range)
   */
  private _applyObsDateConstraint = false;
  private _dateOperatorState: GbDateOperatorState = GbDateOperatorState.BETWEEN;
  DateOperatorState = GbDateOperatorState; // make enum visible in template
  static readonly dateOperatorSequence = {
    [GbDateOperatorState.BETWEEN]: GbDateOperatorState.AFTER,
    [GbDateOperatorState.AFTER]: GbDateOperatorState.BEFORE,
    [GbDateOperatorState.BEFORE]: GbDateOperatorState.NOT_BETWEEN,
    [GbDateOperatorState.NOT_BETWEEN]: GbDateOperatorState.BETWEEN
  };
  private _obsDate1: Date;
  private _obsDate2: Date;

  // trial visit
  private _applyTrialVisitConstraint = false;
  private _allTrialVisits: TrialVisit[];
  private _selectedTrialVisits: TrialVisit[];
  private _suggestedTrialVisits: TrialVisit[];

  // modifier
  private _applyModifierConstraint = false;


  ngOnInit() {
    this.initializeConstraints();
  }

  initializeConstraints() {
    // Initialize aggregate values
    this.isMinEqual = true;
    this.isMaxEqual = true;
    this.operatorState = GbConceptOperatorState.BETWEEN;

    this.selectedCategories = [];
    this.suggestedCategories = [];

    this._dateOperatorState = GbDateOperatorState.BETWEEN;

    let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    if (constraint.concept) {

      // Construct a new constraint that only has the concept as sub constraint
      // (We don't want to apply value and date constraints when getting aggregates)
      let conceptOnlyConstraint: ConceptConstraint = new ConceptConstraint();
      conceptOnlyConstraint.concept = constraint.concept;

      this.resourceService.getConceptAggregate(conceptOnlyConstraint)
        .subscribe(
          aggregate => {
            constraint.concept.aggregate = aggregate;
            if (this.isNumeric()) {
              this.minLimit = aggregate.min;
              this.maxLimit = aggregate.max;
            } else if (this.isCategorical()) {
              this.selectedCategories = aggregate.values;
              this.suggestedCategories = aggregate.values;
            }
          },
          err => {
            console.error(err);
          }
        );

      // Initialize the available trial visits of the trial visit constraint
      this.allTrialVisits = [];
      this.selectedTrialVisits = [];
      this.suggestedTrialVisits = [];
      this.resourceService.getTrialVisits(conceptOnlyConstraint)
        .subscribe(
          visits => {
            this.allTrialVisits = visits;
            this.selectedTrialVisits = visits.slice(0);
            constraint.trialVisitConstraint.trialVisits = visits.slice(0);
          }
        );
    }

    // Initialize the dates from the time constraint
    // Because the date picker represents the date/time in the local timezone,
    // we need to correct the date that is actually used in the constraint.
    let date1 = constraint.obsDateConstraint.date1;
    this.obsDate1 = new Date(date1.getTime() + 60000 * date1.getTimezoneOffset());
    let date2 = constraint.obsDateConstraint.date2;
    this.obsDate2 = new Date(date2.getTime() + 60000 * date2.getTimezoneOffset());
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
      this.constraintService.updateCounts_1();
    }
  }

  get applyObsDateConstraint(): boolean {
    return this._applyObsDateConstraint;
  }

  set applyObsDateConstraint(value: boolean) {
    this._applyObsDateConstraint = value;
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyObsDateConstraint = this._applyObsDateConstraint;
    this.constraintService.updateCounts_1();
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

  get dateOperatorState(): GbDateOperatorState {
    return this._dateOperatorState;
  }

  get applyTrialVisitConstraint(): boolean {
    return this._applyTrialVisitConstraint;
  }

  set applyTrialVisitConstraint(value: boolean) {
    this._applyTrialVisitConstraint = value;
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyTrialVisitConstraint = this.applyTrialVisitConstraint;
    this.constraintService.updateCounts_1();
  }

  get applyModifierConstraint(): boolean {
    return this._applyModifierConstraint;
  }

  set applyModifierConstraint(value: boolean) {
    this._applyModifierConstraint = value;
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

  /*
   * -------------------- event handlers: concept autocomplete --------------------
   */
  /**
   * when the user searches through concept list
   * @param event
   */
  onSearch(event) {
    let query = event.query.toLowerCase();
    let concepts = this.treeNodeService.concepts;
    if (query) {
      this.searchResults = concepts.filter((concept: Concept) => concept.path.toLowerCase().includes(query));
    } else {
      this.searchResults = concepts;
    }
  }

  /**
   * when user clicks the concept list dropdown
   * @param event
   */
  onDropdown(event) {
    let concepts = this.treeNodeService.concepts;

    // Workaround for dropdown not showing properly, as described in
    // https://github.com/primefaces/primeng/issues/745
    this.searchResults = [];
    this.searchResults = concepts;
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    if (this.autoComplete.panelVisible) {
      this.autoComplete.hide();
    } else {
      this.autoComplete.show();
    }
  }

  updateConceptValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;

    // if the concept is numeric
    if (this.isNumeric()) {
      // if to define a single value
      if (this.operatorState === GbConceptOperatorState.EQUAL) {
        if (typeof this.equalVal === 'number') {
          let newVal: ValueConstraint = new ValueConstraint();
          newVal.valueType = this.selectedConcept.type;
          newVal.operator = '=';
          newVal.value = this.equalVal;
          conceptConstraint.values = [];
          conceptConstraint.values.push(newVal);
        } // else if to define a value range
      } else if (this.operatorState === GbConceptOperatorState.BETWEEN) {
        conceptConstraint.values = [];
        if (typeof this.minVal === 'number') {
          let newMinVal: ValueConstraint = new ValueConstraint();
          newMinVal.valueType = this.selectedConcept.type;
          newMinVal.operator = '>';
          if (this.isMinEqual) {
            newMinVal.operator = '>=';
          }
          newMinVal.value = this.minVal;
          conceptConstraint.values.push(newMinVal);
        }

        if (typeof this.maxVal === 'number') {
          let newMaxVal: ValueConstraint = new ValueConstraint();
          newMaxVal.valueType = this.selectedConcept.type;
          newMaxVal.operator = '<';
          if (this.isMaxEqual) {
            newMaxVal.operator = '<=';
          }
          newMaxVal.value = this.maxVal;
          conceptConstraint.values.push(newMaxVal);
        }
      } // else if the concept is categorical
    } else if (this.isCategorical()) {
      conceptConstraint.values = [];
      for (let category of this.selectedCategories) {
        let newVal: ValueConstraint = new ValueConstraint();
        newVal.valueType = 'STRING';
        newVal.operator = '=';
        newVal.value = category;
        conceptConstraint.values.push(newVal);
      }
    } else if (this.isDate()) {
      // TODO: convert date to value, add new value object to concept
      console.log('update: ', this.valDate1, this.valDate2);
    }
    this.constraintService.updateCounts_1();
  }

  /*
   * -------------------- event handlers: category autocomplete --------------------
   */
  /**
   * when the user searches through the category list of a selected concept
   * @param event
   */
  onCategorySearch(event) {
    let query = event.query.toLowerCase().trim();

    let categories = (<ConceptConstraint>this.constraint).concept.aggregate.values;
    if (query) {
      this.suggestedCategories =
        categories.filter((category: string) => category.toLowerCase().includes(query));
    } else {
      this.suggestedCategories = categories;
    }
  }

  selectAllCategories() {
    this.selectedCategories = (<ConceptConstraint>this.constraint).concept.aggregate.values;
    this.updateConceptValues();
  }

  clearAllCategories() {
    this.selectedCategories = [];
    this.updateConceptValues();
  }

  onUnselectCategories(category) {
    this.updateConceptValues();
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
    // Workaround for dropdown not showing properly, as described in
    // https://github.com/primefaces/primeng/issues/745
    this.suggestedTrialVisits = this.allTrialVisits.slice(0);
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    if (this.trialVisitAutoComplete.panelVisible) {
      this.trialVisitAutoComplete.hide();
    } else {
      this.trialVisitAutoComplete.show();
    }
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
    this.constraintService.updateCounts_1();
  }

  onUnselectTrialVisit(visit) {
    let index = this.selectedTrialVisits.indexOf(visit);
    this.selectedTrialVisits.splice(index, 1);
    this.updateTrialVisitValues();
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
    this.constraintService.updateCounts_1();
  }

  /*
   * -------------------- state checkers --------------------
   */
  isNumeric() {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === 'NUMERIC';
  }

  isCategorical() {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === 'CATEGORICAL';
  }

  isDate() {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === 'DATE';
  }

  isBetween() {
    return this.operatorState === GbConceptOperatorState.BETWEEN;
  }

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

  switchDateOperatorState() {
    // Select the next state in the operator sequence
    this._dateOperatorState = GbConceptConstraintComponent.dateOperatorSequence[this._dateOperatorState];

    // Update the constraint
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.obsDateConstraint.dateOperator = this._dateOperatorState;

    // Notify constraint service
    this.constraintService.updateCounts_1();
  }

  get operatorState(): GbConceptOperatorState {
    return this._operatorState;
  }

  set operatorState(value: GbConceptOperatorState) {
    this._operatorState = value;
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
    return this._minVal;
  }

  set minVal(value: number) {
    this._minVal = value;
  }

  get maxVal(): number {
    return this._maxVal;
  }

  set maxVal(value: number) {
    this._maxVal = value;
  }

  get maxLimit(): number {
    return this._maxLimit;
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
    return this._equalVal;
  }

  set equalVal(value: number) {
    this._equalVal = value;
  }

  get searchResults(): Concept[] {
    return this._searchResults;
  }

  set searchResults(value: Concept[]) {
    this._searchResults = value;
  }

}
