import {Component, OnInit, ViewChild} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";
import {AutoComplete} from "primeng/components/autocomplete/autocomplete";
import {Concept} from "../../../shared/models/concept";
import {ConceptConstraint} from "../../../shared/models/constraints/concept-constraint";
import {ConceptOperatorState} from "./concept-operator-state";
import {ValueConstraint} from "../../../shared/models/constraints/value-constraint";
import {DateOperatorState} from "./date-operator-state";
import {TrialVisit} from "../../../shared/models/trial-visit";
import {TrialVisitConstraint} from "../../../shared/models/constraints/trial-visit-constraint";

@Component({
  selector: 'concept-constraint',
  templateUrl: './concept-constraint.component.html',
  styleUrls: ['./concept-constraint.component.css', '../constraint/constraint.component.css']
})
export class ConceptConstraintComponent extends ConstraintComponent implements OnInit {

  @ViewChild('autoComplete') autoComplete: AutoComplete;
  @ViewChild('categoricalAutoComplete') categoricalAutoComplete: AutoComplete;
  @ViewChild('trialVisitAutoComplete') trialVisitAutoComplete: AutoComplete;

  searchResults: Concept[];
  operatorState: ConceptOperatorState;
  isMinEqual: boolean;
  isMaxEqual: boolean;
  equalVal: number;
  minVal: number;
  maxVal: number;
  minLimit: number;
  maxLimit: number;

  selectedCategories: string[];
  suggestedCategories: string[];

  // date range
  private _applyDateConstraint: boolean = false;
  private _dateOperatorState: DateOperatorState = DateOperatorState.BETWEEN;
  DateOperatorState = DateOperatorState; // make enum visible in template
  static readonly dateOperatorSequence = {
    [DateOperatorState.BETWEEN]: DateOperatorState.AFTER,
    [DateOperatorState.AFTER]: DateOperatorState.BEFORE,
    [DateOperatorState.BEFORE]: DateOperatorState.NOT_BETWEEN,
    [DateOperatorState.NOT_BETWEEN]: DateOperatorState.BETWEEN
  };
  private _date1: Date;
  private _date2: Date;

  // trial visit
  private _applyTrialVisitConstraint: boolean = false;
  private _allTrialVisits: TrialVisit[];
  private _selectedTrialVisits: TrialVisit[];
  private _suggestedTrialVisits: TrialVisit[];

  //modifier
  private _applyModifierConstraint: boolean = false;


  ngOnInit() {
    this.initializeConstraints();
  }

  initializeConstraints() {
    // Initialize aggregate values
    this.isMinEqual = true;
    this.isMaxEqual = true;
    this.operatorState = ConceptOperatorState.BETWEEN;

    this.selectedCategories = [];
    this.suggestedCategories = [];

    this._dateOperatorState = DateOperatorState.BETWEEN;

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
            }
            else if (this.isCategorical()) {
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
    let date1 = constraint.timeConstraint.date1;
    this._date1 = new Date(date1.getTime() + 60000 * date1.getTimezoneOffset());
    let date2 = constraint.timeConstraint.date2;
    this._date2 = new Date(date2.getTime() + 60000 * date2.getTimezoneOffset());
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
      this.constraintService.update();
    }
  }

  get applyDateConstraint(): boolean {
    return this._applyDateConstraint;
  }

  set applyDateConstraint(value: boolean) {
    this._applyDateConstraint = value;
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyDateConstraint = this._applyDateConstraint;
    this.constraintService.update();
  }

  get date1(): Date {
    return this._date1;
  }

  set date1(value: Date) {
    // Ignore invalid values
    if (!value) {
      return;
    }

    this._date1 = value;

    // Because the date picker represents the date/time in the local timezone,
    // we need to correct the date that is actually used in the constraint.
    let correctedDate = new Date(value.getTime() - 60000 * value.getTimezoneOffset());
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.timeConstraint.date1 = correctedDate;
    this.constraintService.update();
  }

  get date2(): Date {
    return this._date2;
  }

  set date2(value: Date) {
    // Ignore invalid values
    if (!value) {
      return;
    }

    this._date2 = value;

    // Because the date picker represents the date/time in the local timezone,
    // we need to correct the date that is actually used in the constraint.
    let correctedDate = new Date(value.getTime() - 60000 * value.getTimezoneOffset());
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.timeConstraint.date2 = correctedDate;
    this.constraintService.update();
  }

  get dateOperatorState(): DateOperatorState {
    return this._dateOperatorState;
  }

  get applyTrialVisitConstraint(): boolean {
    return this._applyTrialVisitConstraint;
  }

  set applyTrialVisitConstraint(value: boolean) {
    this._applyTrialVisitConstraint = value;
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.applyTrialVisitConstraint = this.applyTrialVisitConstraint;
    this.constraintService.update();
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

  /*
   * -------------------- event handlers: concept autocomplete --------------------
   */
  /**
   * when the user searches through concept list
   * @param event
   */
  onSearch(event) {
    let query = event.query.toLowerCase();
    let concepts = this.dimensionRegistry.getConcepts();
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
    let concepts = this.dimensionRegistry.getConcepts();

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
      if (this.operatorState === ConceptOperatorState.EQUAL) {
        if (typeof this.equalVal === 'number') {
          let newVal: ValueConstraint = new ValueConstraint();
          newVal.valueType = this.selectedConcept.type;
          newVal.operator = '=';
          newVal.value = this.equalVal;
          conceptConstraint.values = [];
          conceptConstraint.values.push(newVal);
        } // else if to define a value range
      } else if (this.operatorState === ConceptOperatorState.BETWEEN) {
        conceptConstraint.values = [];
        if (typeof this.minVal === 'number') {
          let newMinVal: ValueConstraint = new ValueConstraint();
          newMinVal.valueType = this.selectedConcept.type;
          newMinVal.operator = '>';
          if (this.isMinEqual) newMinVal.operator = '>=';
          newMinVal.value = this.minVal;
          conceptConstraint.values.push(newMinVal);
        }

        if (typeof this.maxVal === 'number') {
          let newMaxVal: ValueConstraint = new ValueConstraint();
          newMaxVal.valueType = this.selectedConcept.type;
          newMaxVal.operator = '<';
          if (this.isMaxEqual) newMaxVal.operator = '<=';
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
    }

    this.constraintService.update();

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
    }
    else {
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
    // For some funny reason, the category is still in the list when this handler is invoked
    let index = this.selectedCategories.indexOf(category);
    this.selectedCategories.splice(index, 1);
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
    }
    else {
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
    this.constraintService.update();
  }

  onUnselectTrialVisit(visit) {
    let index = this.selectedTrialVisits.indexOf(visit);
    this.selectedTrialVisits.splice(index, 1);
    this.updateTrialVisitValues();
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
    return concept.type === 'CATEGORICAL_OPTION';
  }

  isBetween() {
    return this.operatorState === ConceptOperatorState.BETWEEN;
  }

  switchOperatorState() {
    if (this.isNumeric()) {
      this.operatorState =
        (this.operatorState === ConceptOperatorState.EQUAL) ?
          (this.operatorState = ConceptOperatorState.BETWEEN) :
          (this.operatorState = ConceptOperatorState.EQUAL);
    }
    this.updateConceptValues();
  }

  getOperatorButtonName() {
    let name = '';
    if (this.isNumeric()) {
      name = (this.operatorState === ConceptOperatorState.BETWEEN) ? 'between' : 'equal to';
    }
    return name;
  }

  switchDateOperatorState() {
    // Select the next state in the operator sequence
    this._dateOperatorState = ConceptConstraintComponent.dateOperatorSequence[this._dateOperatorState];

    // Update the constraint
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    conceptConstraint.timeConstraint.dateOperator = this._dateOperatorState;

    // Notify constraint service
    this.constraintService.update();
  }

}
