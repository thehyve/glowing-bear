import {Constraint} from './constraint';


export class PatientSetConstraint implements Constraint {

  private _parent: Constraint;
  private _isSubselection: boolean;
  // external subject Ids
  private _subjectIds = [];
  // internal subject Ids
  private _patientIds = [];
  private _setSize: number;
  private _status: string;
  private _id: number;
  private _description: string;
  private _errorMessage: string;
  private _requestConstraints: string;

  constructor() {
    this.parent = null;
  }

  getClassName(): string {
    return 'PatientSetConstraint';
  }

  toQueryObjectWithSubselection(): Object {
    // Whenever using patient set constraint to query patients,
    // there is no need to wrap the constraint in subselection,
    // unlike the other constraints
    return this.toQueryObject();
  }

  toQueryObjectWithoutSubselection(): object {
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
    } else if (this.id) {
      return {
        'type': type,
        'patientSetId': this.id
      };
    } else {
      return null;
    }
  }

  toQueryObject(): Object {
    if (this.isSubselection) {
      return this.toQueryObjectWithSubselection();
    } else {
      return this.toQueryObjectWithoutSubselection();
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

  get isSubselection(): boolean {
    return this._isSubselection;
  }

  set isSubselection(value: boolean) {
    this._isSubselection = value;
  }

  get parent(): Constraint {
    return this._parent;
  }

  set parent(value: Constraint) {
    this._parent = value;
  }

  get setSize(): number {
    return this._setSize;
  }

  set setSize(value: number) {
    this._setSize = value;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  set errorMessage(value: string) {
    this._errorMessage = value;
  }

  get requestConstraints(): string {
    return this._requestConstraints;
  }

  set requestConstraints(value: string) {
    this._requestConstraints = value;
  }
}
