import {Component, OnInit, ViewChild} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";
import {AutoComplete} from "primeng/components/autocomplete/autocomplete";
import {Concept} from "../../../shared/models/concept";
import {DimensionRegistryService} from "../../../shared/services/dimension-registry.service";
import {ConceptConstraint} from "../../../shared/models/constraints/concept-constraint";
import {ConceptOperatorState} from "./concept-operator-state";
import {Value} from "../../../shared/models/value";
import {ResourceService} from "../../../shared/services/resource.service";

@Component({
  selector: 'concept-constraint',
  templateUrl: './concept-constraint.component.html',
  styleUrls: ['./concept-constraint.component.css', '../constraint/constraint.component.css']
})
export class ConceptConstraintComponent extends ConstraintComponent implements OnInit {

  @ViewChild('autoComplete') autoComplete: AutoComplete;

  searchResults: Concept[];
  operatorState: ConceptOperatorState;
  isMinEqual: boolean;
  isMaxEqual: boolean;
  equalVal: number;
  minVal: number;
  maxVal: number;
  minLimit: number;
  maxLimit: number;

  constructor(private dimensionRegistry:DimensionRegistryService, private resourceService:ResourceService) {
    super();
    this.isMinEqual = true;
    this.isMaxEqual = true;
    this.operatorState = ConceptOperatorState.BETWEEN;
  }

  ngOnInit() {
    let constraint:ConceptConstraint = <ConceptConstraint>this.constraint;
    this.resourceService.getConceptAggregate(constraint)
      .subscribe(
        aggregate => {
          constraint.concept.aggregate = aggregate;
          if(this.isNumeric()) {
            this.minLimit = aggregate.min;
            this.maxLimit = aggregate.max;
          }
          else {
            console.log('values: ', aggregate.values);
          }
        },
        err => {
          console.error(err);
        }
      );
  }

  get selectedConcept():Concept {
    return (<ConceptConstraint>this.constraint).concept;
  }

  set selectedConcept(value:Concept) {
    (<ConceptConstraint>this.constraint).concept = value;
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
      this.autoComplete.onDropdownBlur();
      this.autoComplete.hide();
    } else {
      this.autoComplete.onDropdownFocus();
      this.autoComplete.show();
    }
  }

  isNumeric() {
    let concept:Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.valueType === 'NUMERIC';
  }

  isBetween() {
    return this.operatorState === ConceptOperatorState.BETWEEN;
  }

  switchOperatorState() {
    this.operatorState =
      (this.operatorState === ConceptOperatorState.EQUAL) ?
        (this.operatorState = ConceptOperatorState.BETWEEN) :
        (this.operatorState = ConceptOperatorState.EQUAL);
  }

  getOperatorButtonName() {
    let name = 'equal to';
    if(this.operatorState === ConceptOperatorState.BETWEEN) name = 'between';
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
    else {

    }
  }

}
