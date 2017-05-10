import { Injectable } from '@angular/core';
import {CombinationConstraint} from "../models/constraints/combination-constraint";
import {ResourceService} from "./resource.service";

@Injectable()
export class ConstraintService {

  private _patientCount: number = 0;
  private _inclusionPatientCount: number = 0;
  private _exclusionPatientCount: number = 0;
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;

  constructor(private resourceService: ResourceService) {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
  }

  update() {
    this.updatePatients();
  }

  updatePatients() {
    this.resourceService.getInclusivePatients(this.rootInclusionConstraint)
      .subscribe(
        patients => {
          this.inclusionPatientCount = patients.length;
        },
        err => {
          console.error(err);
        }
      );
    this.resourceService.getExclusivePatientsWithInclusion(this.rootInclusionConstraint, this.rootExclusionConstraint)
      .subscribe(
        patients => {
          this.exclusionPatientCount = patients.length;
        },
        err => {
          console.error(err);
        }
      );

    this.resourceService.getAllPatients(this.rootInclusionConstraint, this.rootExclusionConstraint)
      .subscribe(
        patients => {
          this.patientCount = patients.length;
        },
        err => {
          console.error(err);
        }
      );
  }

  get patientCount(): number {
    return this._patientCount;
  }

  set patientCount(value: number) {
    this._patientCount = value;
  }

  get inclusionPatientCount(): number {
    return this._inclusionPatientCount;
  }

  set inclusionPatientCount(value: number) {
    this._inclusionPatientCount = value;
  }

  get exclusionPatientCount(): number {
    return this._exclusionPatientCount;
  }

  set exclusionPatientCount(value: number) {
    this._exclusionPatientCount = value;
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this._rootInclusionConstraint;
  }

  set rootInclusionConstraint(value: CombinationConstraint) {
    this._rootInclusionConstraint = value;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this._rootExclusionConstraint;
  }

  set rootExclusionConstraint(value: CombinationConstraint) {
    this._rootExclusionConstraint = value;
  }
}
