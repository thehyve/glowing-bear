/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {SelectItem} from 'primeng/primeng';
import {Constraint} from '../../../../models/constraint-models/constraint';
import {PedigreeConstraint} from '../../../../models/constraint-models/pedigree-constraint';

type TriState = true | false | undefined;

@Component({
  selector: 'gb-pedigree-constraint',
  templateUrl: './gb-pedigree-constraint.component.html',
  styleUrls: ['./gb-pedigree-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbPedigreeConstraintComponent extends GbConstraintComponent implements OnInit {

  private _selectedPedigreeType: SelectItem;
  private _pedigreeTypes: SelectItem[];
  private _rightHandSideConstraint: Constraint;
  public triStateOptions: object[];

  ngOnInit() {
    this.pedigreeTypes = [];
    this.triStateOptions = [
      {label: 'both', value: undefined},
      {label: 'yes', value: true},
      {label: 'no', value: false}
      ];
    const relationType = (<PedigreeConstraint>this.constraint).relationType;
    for (let typeObj of this.constraintService.validPedigreeTypes) {
      this.pedigreeTypes.push({
        label: typeObj['text'],
        value: typeObj['type']
      });
      if (relationType === typeObj['type']) {
        this.selectedPedigreeType = typeObj['type'];
      }
    }
    this.rightHandSideConstraint = (<PedigreeConstraint>this.constraint).rightHandSideConstraint;
  }

  updateRelationType(event) {
    (<PedigreeConstraint>this.constraint).relationType = event.value;
    this.update();
  }

  get selectedPedigreeType(): SelectItem {
    return this._selectedPedigreeType;
  }

  set selectedPedigreeType(value: SelectItem) {
    this._selectedPedigreeType = value;
  }

  get pedigreeTypes(): SelectItem[] {
    return this._pedigreeTypes;
  }

  set pedigreeTypes(value: SelectItem[]) {
    this._pedigreeTypes = value;
  }

  get rightHandSideConstraint(): Constraint {
    return this._rightHandSideConstraint;
  }

  set rightHandSideConstraint(value: Constraint) {
    this._rightHandSideConstraint = value;
  }

  get biological(): TriState {
    return (<PedigreeConstraint>this.constraint).biological;
  }

  set biological(value: TriState) {
    (<PedigreeConstraint>this.constraint).biological = value;
    this.update();
  }

  get shareHousehold(): TriState {
    return (<PedigreeConstraint>this.constraint).shareHousehold;
  }

  set shareHousehold(value: TriState) {
    (<PedigreeConstraint>this.constraint).shareHousehold = value;
    this.update();
  }
}
