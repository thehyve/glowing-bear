import {Injectable} from '@angular/core';
import {CombinationConstraint} from "../models/constraints/combination-constraint";
import {ResourceService} from "./resource.service";
import {Constraint} from "../models/constraints/constraint";
import {TrueConstraint} from "../models/constraints/true-constraint";
import {PatientSetPostResponse} from "../models/patient-set-post-response";

type LoadingState = "loading" | "complete";

@Injectable()
export class ConstraintService {

  private _patientCount: number = 0;
  private _inclusionPatientCount: number = 0;
  private _exclusionPatientCount: number = 0;
  private _patientSetPostResponse: PatientSetPostResponse;
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;

  loadingStateInclusion:LoadingState = "complete";
  loadingStateExclusion:LoadingState = "complete";
  loadingStateTotal:LoadingState = "complete";

  constructor(private resourceService: ResourceService) {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
  }

  update() {
    this.updatePatients();
  }

  updatePatients() {
    this.loadingStateInclusion = "loading";
    this.loadingStateExclusion = "loading";
    this.loadingStateTotal = "loading";

    let inclusionConstraint = this.generateInclusionConstraint(this.rootInclusionConstraint);
    this.resourceService.getPatients(inclusionConstraint)
      .subscribe(
        patients => {
          this.inclusionPatientCount = patients.length;
          this.loadingStateInclusion = "complete";
        },
        err => {
          console.error(err);
          this.loadingStateInclusion = "complete";
        }
      );

    let exclusionConstraint =
      this.generateExclusionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
    this.resourceService.getPatients(exclusionConstraint)
      .subscribe(
        patients => {
          this.exclusionPatientCount = patients.length;
          this.loadingStateExclusion = "complete";
        },
        err => {
          console.error(err);
          this.loadingStateExclusion = "complete";
        }
      );

    let intersectionConstraint: Constraint =
      this.generateIntersectionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
    this.resourceService.getPatients(intersectionConstraint)
      .subscribe(
        patients => {
          this.patientCount = patients.length;
          this.loadingStateTotal = "complete";
        },
        err => {
          console.error(err);
          this.loadingStateTotal = "complete";
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
    if (!(<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren()) {
      inclusionConstraint = new TrueConstraint();
    }
    let newExclusionConstraint: Constraint;
    if (!(<CombinationConstraint>exclusionConstraint).hasNonEmptyChildren()) {
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
    return !(<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren() ?
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
    if (!(<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren()) {
      inConstraint = new TrueConstraint();
    }

    let exConstraint: Constraint = exclusionConstraint;
    if (!(<CombinationConstraint>exclusionConstraint).hasNonEmptyChildren()) {
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
