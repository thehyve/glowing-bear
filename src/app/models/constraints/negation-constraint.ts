import {Constraint} from './constraint';

export class NegationConstraint implements Constraint {

  private _constraint: Constraint;

  constructor(constraint: Constraint) {
    this._constraint = constraint;
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
    return {
      type: 'negation',
      arg: this._constraint.toQueryObject()
    };
  }

  get textRepresentation(): string {
    return 'Negation';
  }
}
