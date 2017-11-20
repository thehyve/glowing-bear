import {Constraint} from './constraint';

export class NegationConstraint implements Constraint {

  private _parent: Constraint;
  private _constraint: Constraint;
  private _isPatientSelection: boolean;

  constructor(constraint: Constraint) {
    this._constraint = constraint;
    this.parent = null;
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }

  getClassName(): string {
    return 'NegationConstraint';
  }

  toPatientQueryObject(): Object {
    return {
      'type': 'negation',
      'arg': {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': this._constraint.toQueryObject()
      }
    };
  }

  toQueryObject(): Object {
    if (this.isPatientSelection) {
      return this.toPatientQueryObject();
    } else {
      return {
        type: 'negation',
        arg: this._constraint.toQueryObject()
      };
    }
  }

  get textRepresentation(): string {
    return 'Negation';
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
