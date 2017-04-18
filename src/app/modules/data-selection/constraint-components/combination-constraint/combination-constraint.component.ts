import {Component, OnInit, ViewChild} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {Constraint} from "../../../shared/models/constraints/constraint";
import {
  AutoCompleteModule,
  AutoComplete
} from 'primeng/components/autocomplete/autocomplete';
import {DimensionRegistryService} from "../../../shared/services/dimension-registry.service";

@Component({
  selector: 'combination-constraint',
  templateUrl: './combination-constraint.component.html',
  styleUrls: ['./combination-constraint.component.css', '../constraint/constraint.component.css']
})
export class CombinationConstraintComponent extends ConstraintComponent implements OnInit {

  @ViewChild('autoComplete') autoComplete: AutoComplete;

  searchResults: Constraint[];

  constructor(private dimensionRegistry:DimensionRegistryService) {
    super();
  }

  ngOnInit() {
  }

  toggleAndOr() {
    let constraint:CombinationConstraint = <CombinationConstraint>this.constraint;
    constraint.switchCombinationState();
  }

  /**
   * Removes the childConstraint from the CombinationConstraint corresponding to this component.
   * @param childConstraint
   */
  onConstraintRemoved(childConstraint:Constraint) {
    (<CombinationConstraint>this.constraint).removeChildConstraint(childConstraint);
  }


  onSearch(event) {
    let results = this.dimensionRegistry.searchAllConstraints(event.query);
    this.searchResults = results;

    // Workaround for dropdown not showing properly, as described in
    // https://github.com/primefaces/primeng/issues/745
    /*this.searchResults = [];
    this.searchResults = results;
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    this.autoComplete.onDropdownFocus();
    this.autoComplete.show();*/
  }

  onDropdown(event) {
    let results = this.dimensionRegistry.searchAllConstraints('');

    // Workaround for dropdown not showing properly, as described in
    // https://github.com/primefaces/primeng/issues/745
    this.searchResults = [];
    this.searchResults = results;
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

  onSelect(selectedConstraint) {
    if (selectedConstraint != null) {
      let combinationConstraint = <CombinationConstraint>this.constraint;
      combinationConstraint.children.push(selectedConstraint);
      //this.autoComplete.selectItem(null);
    }
  }

}
