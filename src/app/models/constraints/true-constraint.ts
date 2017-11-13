import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  private _isPatientSelection: boolean;

  constructor() {
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
}
