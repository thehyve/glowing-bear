import {CombinationConstraint} from '../../models/constraints/combination-constraint';

export class ConstraintServiceMock {
  private _patientCount = 0;
  private _inclusionPatientCount = 0;
  private _exclusionPatientCount = 0;
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  private _selectedNode: any = null;
  private _validTreeNodeTypes: string[] = [];

  constructor() {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
    this._validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL_OPTION',
      'STUDY'
    ];
  }

  update() {
  }
}
