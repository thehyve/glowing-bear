import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  private _parent: Constraint;
  private _isPatientSelection: boolean;

  constructor() {
    this.parent = null;
  }

  getClassName(): string {
    return 'TrueConstraint';
  }

  toPatientQueryObject(): Object {
    return {
      'type': 'subselection',
      'dimension': 'patient',
      'constraint': {'type': 'true'}
    };
  }

  toQueryObject(): Object {
    if (this.isPatientSelection) {
      return this.toPatientQueryObject();
    } else {
      return {'type': 'true'};
    }
  }

  get textRepresentation(): string {
    return 'True';
  }

  get isPatientSelection(): boolean {
    return this._isPatientSelection;
  }

  set isPatientSelection(value: boolean) {
    this._isPatientSelection = value;
  }

  get parent(): Constraint {
    return this._parent;
  }

  set parent(value: Constraint) {
    this._parent = value;
  }
}
