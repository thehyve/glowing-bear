import {Constraint} from './constraint';

export class NegationConstraint implements Constraint {

  private _parent: Constraint;
  private _constraint: Constraint;
  private _isSubselection: boolean;
  private _textRepresentation: string;

  constructor(constraint: Constraint) {
    this.constraint = constraint;
    this.parent = null;
    this.textRepresentation = 'Negation';
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

  toQueryObjectWithSubselection(full?: boolean): Object {
    return {
      'type': 'negation',
      'arg': {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': this._constraint.toQueryObject(full)
      }
    };
  }

  toQueryObjectWithoutSubselection(full?: boolean): object {
    return {
      type: 'negation',
      arg: this._constraint.toQueryObject(full)
    };
  }

  toQueryObject(full?: boolean): Object {
    if (this.isSubselection) {
      return this.toQueryObjectWithSubselection(full);
    } else {
      return this.toQueryObjectWithoutSubselection(full);
    }
  }

  get textRepresentation(): string {
    return this._textRepresentation;
  }

  set textRepresentation(value: string) {
    this._textRepresentation = value;
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
