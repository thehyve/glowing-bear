import {Constraint} from './constraint';


export class SubjectSetConstraint extends Constraint {
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
    super();
    this.textRepresentation = 'Subject set constraint';
  }

  get className(): string {
    return 'SubjectSetConstraint';
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
