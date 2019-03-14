/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {CombinationConstraint} from '../../../../models/constraint-models/combination-constraint';
import {Constraint} from '../../../../models/constraint-models/constraint';
import {AutoComplete} from 'primeng/components/autocomplete/autocomplete';
import {CombinationState} from '../../../../models/constraint-models/combination-state';
import {PedigreeConstraint} from '../../../../models/constraint-models/pedigree-constraint';
import {SelectItem, TreeNode} from 'primeng/api';
import {UIHelper} from '../../../../utilities/ui-helper';
import {IconHelper} from '../../../../utilities/icon-helper';
import {ConceptConstraint} from '../../../../models/constraint-models/concept-constraint';

@Component({
  selector: 'gb-combination-constraint',
  templateUrl: './gb-combination-constraint.component.html',
  styleUrls: ['./gb-combination-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbCombinationConstraintComponent extends GbConstraintComponent implements OnInit, DoCheck {
  CombinationState = CombinationState;

  @ViewChild('autoComplete') autoComplete: AutoComplete;

  searchResults: Constraint[];
  selectedConstraint: Constraint;
  dimensions: SelectItem[];
  selectedDimension: string;

  private static dimensionToDimensionOption(subjectDimensions: string[]) {
    let dimensions = [];
    for (let dim of subjectDimensions) {
      let ctype: SelectItem = {
        label: dim,
        value: dim
      };
      dimensions.push(ctype);
    }
    return dimensions;
  }

  ngOnInit(): void {
    this.updateDimensionDropdownOptions();
    this.constraintService.subjectDimensionsUpdated.asObservable().subscribe(() => {
      this.updateDimensionDropdownOptions();
      }
    );
    this.selectedDimension = (<CombinationConstraint>this.constraint).dimension;
  }

  ngDoCheck(): void {
    this.selectedDimension = (<CombinationConstraint>this.constraint).dimension;
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
    this.updateDimensionDropdownOptions();
    this.update();
  }

  onSearch(event) {
    let results = this.constraintService.searchAllConstraints(event.query);
    this.searchResults = results;
  }

  onDropdown(event) {
    this.searchResults = this.constraintService.searchAllConstraints('');
    UIHelper.removePrimeNgLoaderIcon(this.element, 200);
  }

  onSelect(selectedConstraint) {
    if (selectedConstraint != null) {
      let combinationConstraint: CombinationConstraint = <CombinationConstraint>this.constraint;
      let newConstraint = this.prepareChildConstraint(selectedConstraint, combinationConstraint.dimension);

      // Add it as a new child
      combinationConstraint.addChild(newConstraint);
      this.updateDimensionDropdownOptions();

      // Clear selection (for some reason, setting the model selectedConstraint
      // to null doesn't work)
      this.autoComplete.selectItem(null);
      this.update();
    }
  }

  private prepareChildConstraint(selectedConstraint, currentDimension: string): Constraint {
    // Create a clone of the selected constraint
    let newConstraint: Constraint = selectedConstraint.clone();

    if (newConstraint.className === 'CombinationConstraint') {
      // we don't want to clone a CombinationConstraint's children
      (<CombinationConstraint>newConstraint).children = [];
    } else if (newConstraint.className === 'PedigreeConstraint') {
      // we don't want to clone a PedigreeConstraint's right-hand-side constraint
      (<PedigreeConstraint>newConstraint).rightHandSideConstraint = new CombinationConstraint();
      if ((<CombinationConstraint>this.constraint).dimension !== CombinationConstraint.TOP_LEVEL_DIMENSION) {
        return new CombinationConstraint([newConstraint]);
      }
    } else if (newConstraint.className === 'ConceptConstraint') {
      let restrictiveDimensions = (<ConceptConstraint>selectedConstraint).concept.subjectDimensions;
      if (restrictiveDimensions.length > 0 && !restrictiveDimensions.includes(currentDimension)) {
        // wrap into combination constraint if concept constraint is restricted to a different dimension
        return new CombinationConstraint([newConstraint], null, restrictiveDimensions[0]);
      }
    }
    return newConstraint;
  }



  onDrop(event) {
    event.stopPropagation();
    let selectedNode: TreeNode = this.treeNodeService.selectedTreeNode;
    this.droppedConstraint = this.treeNodeService.generateConstraintFromTreeNode(selectedNode);
    this.treeNodeService.selectedTreeNode = null;
    if (this.droppedConstraint) {
      let combinationConstraint: CombinationConstraint = <CombinationConstraint>this.constraint;
      combinationConstraint.addChild(this.droppedConstraint);
      this.updateDimensionDropdownOptions();
      this.update();
      this.droppedConstraint = null;
    }
  }

  onSelectedDimensionChange() {
    this.handleSelectedDimensionChange();
    this.update();
  }

  get combinationState() {
    return (<CombinationConstraint>this.constraint).combinationState;
  }

  toggleJunction() {
    (<CombinationConstraint>this.constraint).switchCombinationState();
    this.update();
  }

  get childContainerClass(): string {
    return (<CombinationConstraint>this.constraint).isRoot ?
      '' : 'gb-combination-constraint-child-container';
  }

  addChildCombinationConstraint() {
    (<CombinationConstraint>this.constraint).addChild(new CombinationConstraint());
  }


  handleSelectedDimensionChange() {
    (<CombinationConstraint>this.constraint).dimension = this.selectedDimension;
  }

  updateDimensionDropdownOptions() {
    let restrictiveDimensions = (<CombinationConstraint>this.constraint).restrictiveDimensions;
    if (restrictiveDimensions.length > 0) {
      this.dimensions = GbCombinationConstraintComponent.dimensionToDimensionOption(restrictiveDimensions);
    } else {
      this.dimensions = GbCombinationConstraintComponent.dimensionToDimensionOption(
        this.constraintService.subjectDimensions.map(sd => sd.name));
    }
  }

  getDimensionIcon(dimension: string): string {
    return IconHelper.getDimensionIcon(dimension);
  }

  get subjectBoxMessage(): string {
    if ((<CombinationConstraint>this.constraint).isRoot) {
      return 'Select data for';
    } else {
      let parentDimension = this.constraint.parentDimension;
      if (this.constraint.negated) {
        return `the ${parentDimension} is NOT linked to a`;
      } else {
        return `the ${parentDimension} is linked to a`;
      }
    }
  }

  get hideDimensionDropdown(): boolean {
    return !(<CombinationConstraint>this.constraint).isRoot
      && this.constraint.parentConstraint
      && this.constraint.parentConstraint.className === 'PedigreeConstraint'
  }

}
