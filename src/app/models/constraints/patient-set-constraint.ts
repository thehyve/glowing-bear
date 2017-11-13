import {Constraint} from './constraint';


export class PatientSetConstraint implements Constraint {

  // external subject Ids
  private _subjectIds = [];
  // internal subject Ids
  private _patientIds = [];
  // internal subject set id
  private _patientSetId = '';
  private _isPatientSelection: boolean;

  constructor() {
  }

  getClassName(): string {
    return 'PatientSetConstraint';
  }

  toPatientQueryObject(): Object {
    // Whenever using patient set constraint to query patients,
    // there is no need to wrap the constraint in subselection,
    // unlike the other constraints
    return this.toQueryObject();
  }

  toQueryObject(): Object {
    if (this.isPatientSelection) {
      return this.toPatientQueryObject();
    } else {
      const type = 'patient_set';
      if (this.subjectIds.length > 0) {
        return {
          'type': type,
          'subjectIds': this.subjectIds
        };
      } else if (this.patientIds.length > 0) {
        return {
          'type': type,
          'patientIds': this.patientIds
        };
      } else if (this.patientSetId !== '') {
        return {
          'type': type,
          'patientSetId': this.patientSetId
        };
      } else {
        return null;
      }
    }
  }

  get textRepresentation(): string {
    return 'Patient set constraint';
  }

  get subjectIds() {
    return this._subjectIds;
  }

  set subjectIds(value) {
    this._subjectIds = value;
  }

  get patientIds() {
    return this._patientIds;
  }

  set patientIds(value) {
    this._patientIds = value;
  }

  get patientSetId(): string {
    return this._patientSetId;
  }

  set patientSetId(value: string) {
    this._patientSetId = value;
  }

  get isPatientSelection(): boolean {
    return this._isPatientSelection;
  }

  set isPatientSelection(value: boolean) {
    this._isPatientSelection = value;
  }
}
