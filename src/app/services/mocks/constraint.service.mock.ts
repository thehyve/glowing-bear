import {CombinationConstraint} from '../../models/constraints/combination-constraint';

export class ConstraintServiceMock {
  /*
   * The patient count related variables and criterion constraints
   * in the patient-selection accordion in data-selection
   */
  private _patientCount = 0;
  private _inclusionPatientCount = 0;
  private _exclusionPatientCount = 0;
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  private _selectedNode: any = null;
  private _validTreeNodeTypes: string[] = [];

  /*
   * The observation count related variables
   */
  private _observationCount = 0;
  private _conceptCount = 0;

  constructor() {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
    this._validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL_OPTION',
      'STUDY',
      'UNKNOWN'
    ];
  }

  updatePatientCounts() {}
  updateObservationCounts() {}


  get observationCount(): number {
    return this._observationCount;
  }

  set observationCount(value: number) {
    this._observationCount = value;
  }

  get patientCount(): number {
    return this._patientCount;
  }

  set patientCount(value: number) {
    this._patientCount = value;
  }

  get conceptCount(): number {
    return this._conceptCount;
  }

  set conceptCount(value: number) {
    this._conceptCount = value;
  }
}
