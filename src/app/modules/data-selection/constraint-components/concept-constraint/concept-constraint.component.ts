import {Component, OnInit, ViewChild} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";
import {AutoComplete} from "primeng/components/autocomplete/autocomplete";
import {Concept} from "../../../shared/models/concept";
import {DimensionRegistryService} from "../../../shared/services/dimension-registry.service";
import {ConceptConstraint} from "../../../shared/models/constraints/concept-constraint";
import {ConceptOperatorState} from "./concept-operator-state";
import {Value} from "../../../shared/models/value";
import {ResourceService} from "../../../shared/services/resource.service";
import {ConstraintService} from "../../../shared/services/constraint.service";

@Component({
  selector: 'concept-constraint',
  templateUrl: './concept-constraint.component.html',
  styleUrls: ['./concept-constraint.component.css', '../constraint/constraint.component.css']
})
export class ConceptConstraintComponent extends ConstraintComponent implements OnInit {

  @ViewChild('autoComplete') autoComplete: AutoComplete;
  @ViewChild('categoricalAutoComplete') categoricalAutoComplete: AutoComplete;

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

  constructor(private dimensionRegistry:DimensionRegistryService,
              private resourceService:ResourceService,
              private constraintService: ConstraintService) {
    super();
    this.isMinEqual = true;
    this.isMaxEqual = true;
    this.operatorState = ConceptOperatorState.BETWEEN;

    this.selectedCategories = [];
    this.suggestedCategories = [];
  }

  ngOnInit() {
    this.initializeAggregates();
  }

  initializeAggregates() {
    let constraint:ConceptConstraint = <ConceptConstraint>this.constraint;
    if (constraint.concept) {
      this.resourceService.getConceptAggregate(constraint)
        .subscribe(
          aggregate => {
            constraint.concept.aggregate = aggregate;
            if (this.isNumeric()) {
              this.minLimit = aggregate.min;
              this.maxLimit = aggregate.max;
            }
            else if(this.isCategorical()) {
              this.selectedCategories = aggregate.values;
              this.suggestedCategories = aggregate.values;
            }
          },
          err => {
            console.error(err);
          }
        );
    }
  }

  get selectedConcept():Concept {
    return (<ConceptConstraint>this.constraint).concept;
  }

  set selectedConcept(value:Concept) {
    (<ConceptConstraint>this.constraint).concept = value;
    this.initializeAggregates();
  }

  onSearch(event) {
    let query = event.query.toLowerCase();
    let concepts = this.dimensionRegistry.getConcepts();
    if (query) {
      this.searchResults = concepts.filter((concept: Concept) => concept.path.toLowerCase().includes(query));
    }
    else {
      this.searchResults = concepts;
    }
  }

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

  isNumeric() {
    let concept:Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.valueType === 'NUMERIC';
  }

  isCategorical() {
    let concept:Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.valueType === 'CATEGORICAL_OPTION';
  }

  isBetween() {
    return this.operatorState === ConceptOperatorState.BETWEEN;
  }

  switchOperatorState() {
    if(this.isNumeric()) {
      this.operatorState =
        (this.operatorState === ConceptOperatorState.EQUAL) ?
          (this.operatorState = ConceptOperatorState.BETWEEN) :
          (this.operatorState = ConceptOperatorState.EQUAL);
    }
  }

  selectAll() {
    this.selectedCategories = (<ConceptConstraint>this.constraint).concept.aggregate.values;
  }
  selectNone() {
    this.selectedCategories = [];
  }

  getOperatorButtonName() {
    let name = '';
    if(this.isNumeric()) {
      name = (this.operatorState === ConceptOperatorState.BETWEEN) ? 'between' : 'equal to';
    }
    return name;
  }

  updateConceptValues() {
    let conceptConstraint:ConceptConstraint = <ConceptConstraint>this.constraint;

    //if the concept is numeric
    if(this.isNumeric()) {
      //if to define a single value
      if(this.operatorState === ConceptOperatorState.EQUAL) {
        if(typeof this.equalVal === 'number') {
          let newVal: Value = new Value();
          newVal.valueType = this.selectedConcept.valueType;
          newVal.operator = '=';
          newVal.value = this.equalVal;
          conceptConstraint.values = [];
          conceptConstraint.values.push(newVal);
        }
      }

      //else if to define a value range
      else if(this.operatorState === ConceptOperatorState.BETWEEN) {
        conceptConstraint.values = [];
        if(typeof this.minVal === 'number') {
          let newMinVal: Value = new Value();
          newMinVal.valueType = this.selectedConcept.valueType;
          newMinVal.operator = '>';
          if(this.isMinEqual) newMinVal.operator = '>=';
          newMinVal.value = this.minVal;
          conceptConstraint.values.push(newMinVal);
        }

        if(typeof this.maxVal === 'number') {
          let newMaxVal: Value = new Value();
          newMaxVal.valueType = this.selectedConcept.valueType;
          newMaxVal.operator = '<';
          if(this.isMaxEqual) newMaxVal.operator = '<=';
          newMaxVal.value = this.maxVal;
          conceptConstraint.values.push(newMaxVal);
        }
      }
    }
    //else if the concept is categorical
    else if(this.isCategorical()){
      conceptConstraint.values = [];
      for(let category of this.selectedCategories) {
        let newVal: Value = new Value();
        newVal.valueType = 'STRING';
        newVal.operator = 'contains';
        newVal.value = category;
        conceptConstraint.values.push(newVal);
      }
    }

    this.constraintService.update();

  }

}
