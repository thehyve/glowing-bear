import {Injectable} from '@angular/core';
import {CombinationConstraint} from "../models/constraints/combination-constraint";
import {ResourceService} from "./resource.service";
import {Constraint} from "../models/constraints/constraint";
import {TrueConstraint} from "../models/constraints/true-constraint";
import {PatientSetPostResponse} from "../models/patient-set-post-response";
type LoadingState = "loading" | "complete";

@Injectable()
export class ConstraintService {

  /*
   * The patient count variables and criterion constraints
   * in the patient-selection accordion in data-selection
   */
  private _patientCount: number = 0;
  private _inclusionPatientCount: number = 0;
  private _exclusionPatientCount: number = 0;
  private _patientSetPostResponse: PatientSetPostResponse;
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;

  loadingStateInclusion:LoadingState = "complete";
  loadingStateExclusion:LoadingState = "complete";
  loadingStateTotal:LoadingState = "complete";

  /*
   * The selected tree node in the tree on the side-panel
   */
  private _selectedTreeNode: any = null;
  private _validTreeNodeTypes: string[] = [];


  constructor(private resourceService: ResourceService) {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
    this._validTreeNodeTypes = ['NUMERIC', 'CATEGORICAL_OPTION'];
  }

  update() {
    this.updatePatients();
  }

  updatePatients() {
    this.loadingStateInclusion = "loading";
    this.loadingStateExclusion = "loading";
    this.loadingStateTotal = "loading";

    let inclusionConstraint = this.generateInclusionConstraint(this.rootInclusionConstraint);
    this.resourceService.getPatients(inclusionConstraint, "Inclusion")
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

    // Only execute the exclusion constraint if it has non-empty children
    if ((<CombinationConstraint>this.rootExclusionConstraint).hasNonEmptyChildren()) {
      let exclusionConstraint =
        this.generateExclusionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
      this.resourceService.getPatients(exclusionConstraint, "Exclusion")
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
    }
    else {
      this.exclusionPatientCount = 0;
      this.loadingStateExclusion = "complete";
    }

    let intersectionConstraint: Constraint =
      this.generateIntersectionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
    this.resourceService.getPatients(intersectionConstraint, "Intersection")
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

    // Inclusion part
    if (!(<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren()) {
      inclusionConstraint = new TrueConstraint();
    }

    // Only use exclusion if there's something there
    if ((<CombinationConstraint>exclusionConstraint).hasNonEmptyChildren()) {
      // Wrap in negation
      //TODO: it might be clearer to create a separate NegationConstraint for this
      let newExclusionConstraint = new CombinationConstraint();
      (<CombinationConstraint>newExclusionConstraint).isNot = true;
      (<CombinationConstraint>newExclusionConstraint).children.push(exclusionConstraint);

      let combination = new CombinationConstraint();
      combination.children.push(inclusionConstraint);
      combination.children.push(newExclusionConstraint);
      return combination;
    }
    else {
      // Otherwise just return the inclusion part
      return inclusionConstraint;
    }
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
    // Inclusion part, which is what the exclusion count is calculated from
    inclusionConstraint = this.generateInclusionConstraint(inclusionConstraint);

    let combination = new CombinationConstraint();
    combination.children.push(inclusionConstraint);
    combination.children.push(exclusionConstraint);
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

  get selectedTreeNode(): any {
    return this._selectedTreeNode;
  }

  set selectedTreeNode(value: any) {
    this._selectedTreeNode = value;
  }

  get validTreeNodeTypes(): string[] {
    return this._validTreeNodeTypes;
  }

  set validTreeNodeTypes(value: string[]) {
    this._validTreeNodeTypes = value;
  }
}
