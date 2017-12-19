import {Constraint} from './constraint';

export class NegationConstraint implements Constraint {

  private _parent: Constraint;
  private _constraint: Constraint;
  private _isSubselection: boolean;

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

  toQueryObjectWithSubselection(): Object {
    return {
      'type': 'negation',
      'arg': {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': this._constraint.toQueryObject()
      }
    };
  }

  toQueryObjectWithoutSubselection(): object {
    return {
      type: 'negation',
      arg: this._constraint.toQueryObject()
    };
  }

  toQueryObject(): Object {
    if (this.isSubselection) {
      return this.toQueryObjectWithSubselection();
    } else {
      return this.toQueryObjectWithoutSubselection();
    }
  }

  get textRepresentation(): string {
    return 'Negation';
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
}
