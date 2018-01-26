import {Component, OnInit} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {SelectItem} from 'primeng/primeng';
import {Constraint} from '../../../../models/constraints/constraint';
import {PedigreeConstraint} from '../../../../models/constraints/pedigree-constraint';

@Component({
  selector: 'gb-pedigree-constraint',
  templateUrl: './gb-pedigree-constraint.component.html',
  styleUrls: ['./gb-pedigree-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})

export class GbPedigreeConstraintComponent extends GbConstraintComponent implements OnInit {

  private _selectedPedigreeType: SelectItem;
  private _pedigreeTypes: SelectItem[];
  private _rightHandSideConstraint: Constraint;
  private _isBiological: boolean;
  private _isShareHousehold: boolean;

  ngOnInit() {
    this.pedigreeTypes = [];
    this.isBiological = (<PedigreeConstraint>this.constraint).biological;
    this.isShareHousehold = (<PedigreeConstraint>this.constraint).shareHousehold;
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
    this.updateCounts();
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

  get isBiological(): boolean {
    return this._isBiological;
  }

  set isBiological(value: boolean) {
    this._isBiological = value;
    (<PedigreeConstraint>this.constraint).biological = value;
  }

  get isShareHousehold(): boolean {
    return this._isShareHousehold;
  }

  set isShareHousehold(value: boolean) {
    this._isShareHousehold = value;
    (<PedigreeConstraint>this.constraint).shareHousehold = value;
  }
}
