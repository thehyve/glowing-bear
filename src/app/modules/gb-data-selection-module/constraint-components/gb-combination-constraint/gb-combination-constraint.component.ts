import {Component, OnInit, ViewChild} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {CombinationConstraint} from '../../../../models/constraints/combination-constraint';
import {Constraint} from '../../../../models/constraints/constraint';
import {
  AutoComplete
} from 'primeng/components/autocomplete/autocomplete';
import {CombinationState} from '../../../../models/constraints/combination-state';

@Component({
  selector: 'gb-combination-constraint',
  templateUrl: './gb-combination-constraint.component.html',
  styleUrls: ['./gb-combination-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbCombinationConstraintComponent extends GbConstraintComponent implements OnInit {
  CombinationState = CombinationState;

  @ViewChild('autoComplete') autoComplete: AutoComplete;

  searchResults: Constraint[];
  selectedConstraint: Constraint;

  ngOnInit() {
  }

  get isAnd(): boolean {
    return (<CombinationConstraint>this.constraint).isAnd();
  }

  get children(): Constraint[] {
    return (<CombinationConstraint>this.constraint).children;
  }

  /**
   * Removes the childConstraint from the CombinationConstraint corresponding to this component.
   * @param childConstraint
   */
  onConstraintRemoved(childConstraint: Constraint) {
    (<CombinationConstraint>this.constraint).removeChildConstraint(childConstraint);
    this.constraintService.updateCounts_1();
  }

  onSearch(event) {
    let results = this.treeNodeService.searchAllConstraints(event.query);
    this.searchResults = results;
  }

  onDropdown(event) {
    let results = this.treeNodeService.searchAllConstraints('');

    // Workaround for dropdown not showing properly, as described in
    // https://github.com/primefaces/primeng/issues/745
    this.searchResults = [];
    this.searchResults = results;
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    if (this.autoComplete.panelVisible) {
      this.autoComplete.hide();
    } else {
      this.autoComplete.show();
    }
  }

  onSelect(selectedConstraint) {
    if (this.selectedConstraint != null) {

      // Create a copy of the selected constraint
      let newConstraint: Constraint = new selectedConstraint.constructor();
      Object.assign(newConstraint, this.selectedConstraint);

      // But we don't want to copy a CombinationConstraint's children
      if (newConstraint instanceof CombinationConstraint) {
        (<CombinationConstraint>newConstraint).children = [];
      }

      // Add it as a new child
      let combinationConstraint: CombinationConstraint = <CombinationConstraint>this.constraint;
      combinationConstraint.children.push(newConstraint);

      // Clear selection (for some reason, setting the model selectedConstraint
      // to null doesn't work)
      this.autoComplete.selectItem(null);
      this.constraintService.updateCounts_1();
    }
  }

  get combinationState() {
    return (<CombinationConstraint>this.constraint).combinationState;
  }

  toggleJunction() {
    (<CombinationConstraint>this.constraint).switchCombinationState();
    this.constraintService.updateCounts_1();
  }

  get childContainerClass(): string {
    return (<CombinationConstraint>this.constraint).isRoot ? '' : 'gb-combination-constraint-child-container';
  }

}
