import {Injectable} from '@angular/core';
import {CombinationConstraint} from "../models/constraints/combination-constraint";
import {ResourceService} from "./resource.service";
import {Constraint} from "../models/constraints/constraint";
import {TrueConstraint} from "../models/constraints/true-constraint";
import {PatientSetPostResponse} from "../models/patient-set-post-response";

@Injectable()
export class ConstraintService {

  private _patientCount: number = 0;
  private _inclusionPatientCount: number = 0;
  private _exclusionPatientCount: number = 0;
  private _patientSetPostResponse: PatientSetPostResponse;
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
    let inclusionConstraint = this.generateInclusionConstraint(this.rootInclusionConstraint);
    console.log('the new inclusion constraint: ', inclusionConstraint);
    this.resourceService.getPatients(inclusionConstraint)
      .subscribe(
        patients => {
          this.inclusionPatientCount = patients.length;
        },
        err => {
          console.error(err);
        }
      );

    let exclusionConstraint =
      this.generateExclusionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
    this.resourceService.getPatients(exclusionConstraint)
      .subscribe(
        patients => {
          this.exclusionPatientCount = patients.length;
        },
        err => {
          console.error(err);
        }
      );

    let intersectionConstraint: Constraint =
      this.generateIntersectionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
    this.resourceService.getPatients(intersectionConstraint)
      .subscribe(
        patients => {
          this.patientCount = patients.length;
        },
        err => {
          console.error(err);
        }
      );
  }

  /**
   * Generate the constraint for the intersection between
   * the inclusion constraint and the negated exclusion constraint
   * @param inclusionConstraint
   * @param exclusionConstraint
   * @returns {CombinationConstraint}
   */
  generateIntersectionConstraint(inclusionConstraint: Constraint,
                                 exclusionConstraint: Constraint): Constraint {
    if ((<CombinationConstraint>inclusionConstraint).children.length === 0) {
      inclusionConstraint = new TrueConstraint();
    }
    let newExclusionConstraint: Constraint;
    if ((<CombinationConstraint>exclusionConstraint).children.length === 0) {
      newExclusionConstraint = new TrueConstraint();
    }
    else {
      newExclusionConstraint = new CombinationConstraint();
      (<CombinationConstraint>newExclusionConstraint).isNot = true;
      (<CombinationConstraint>newExclusionConstraint).children.push(exclusionConstraint);
    }

    let combination = new CombinationConstraint();
    combination.children.push(inclusionConstraint);
    combination.children.push(newExclusionConstraint);

    return combination;
  }

  /**
   * Generate the constraint for retrieving the patients with only the inclusion criteria
   * @param inclusionConstraint
   * @returns {TrueConstraint|Constraint}
   */
  generateInclusionConstraint(inclusionConstraint: Constraint): Constraint {
    return (<CombinationConstraint>inclusionConstraint).children.length === 0 ?
      new TrueConstraint() : inclusionConstraint;
  }

  /**
   * Generate the constraint for retrieving the patients with the exclusion criteria,
   * but also in the inclusion set
   * @param inclusionConstraint
   * @param exclusionConstraint
   * @returns {CombinationConstraint}
   */
  generateExclusionConstraint(inclusionConstraint: Constraint, exclusionConstraint: Constraint): Constraint {
    let inConstraint: Constraint = inclusionConstraint;
    if ((<CombinationConstraint>inclusionConstraint).children.length === 0) {
      inConstraint = new TrueConstraint();
    }

    let exConstraint: Constraint = exclusionConstraint;
    if ((<CombinationConstraint>exclusionConstraint).children.length === 0) {
      exConstraint = new CombinationConstraint();
      (<CombinationConstraint>exConstraint).isNot = true;
      (<CombinationConstraint>exConstraint).children.push(new TrueConstraint());
    }

    let combination = new CombinationConstraint();
    combination.children.push(inConstraint);
    combination.children.push(exConstraint);
    return combination;

  }

  savePatients(patientSetName: string) {
    let intersectionConstraint =
      this.generateIntersectionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
    this.resourceService.savePatients(patientSetName, intersectionConstraint)
      .subscribe(
        result => {
          this._patientSetPostResponse = result;
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

  get patientSetPostResponse(): PatientSetPostResponse {
    return this._patientSetPostResponse;
  }

  set patientSetPostResponse(value: PatientSetPostResponse) {
    this._patientSetPostResponse = value;
  }

}
