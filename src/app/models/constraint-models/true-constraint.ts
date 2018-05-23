import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  private _parent: Constraint;
  private _isSubselection: boolean;
  private _textRepresentation: string;

  constructor() {
    this.parent = null;
    this.textRepresentation = 'True';
  }

  getClassName(): string {
    return 'TrueConstraint';
  }

  toQueryObjectWithSubselection(): Object {
    // return {
    //   'type': 'subselection',
    //   'dimension': 'patient',
    //   'constraint': {'type': 'true'}
    // };
    return {'type': 'true'};
  }

  toQueryObjectWithoutSubselection(): object {
    return {'type': 'true'};
  }

  toQueryObject(): Object {
    if (this.isSubselection) {
      return this.toQueryObjectWithSubselection();
    } else {
      return this.toQueryObjectWithoutSubselection();
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
