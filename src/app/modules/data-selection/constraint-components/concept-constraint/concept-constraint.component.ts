import {Component, OnInit, ViewChild} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";
import {AutoComplete} from "primeng/components/autocomplete/autocomplete";
import {Concept} from "../../../shared/models/concept";
import {DimensionRegistryService} from "../../../shared/services/dimension-registry.service";
import {ConceptConstraint} from "../../../shared/models/constraints/concept-constraint";
import {ConceptOperatorState} from "./concept-operator-state";
import {Value} from "../../../shared/models/constraints/value";

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

  constructor(private dimensionRegistry:DimensionRegistryService) {
    super();
    this.operatorState = ConceptOperatorState.EQUAL;
  }

  ngOnInit() {
  }

  get selectedConcept():Concept {
    return (<ConceptConstraint>this.constraint).concept;
  }

  set selectedConcept(value:Concept) { console.log('set selected concept: ', value);
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
    return concept.type == 'NUMERIC';
  }

  isBetween() {
    return this.operatorState === ConceptOperatorState.BETWEEN;
  }

  switchOperatorState() {
    console.log('--> ', this.minVal, this.maxVal, this.equalVal, this.isMaxEqual, this.isMinEqual);
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

  // updateConceptValues() {
  //   if(this.operatorState === ConceptOperatorState.EQUAL) {
  //     let val: Value = new Value
  //   }
  // }

}
