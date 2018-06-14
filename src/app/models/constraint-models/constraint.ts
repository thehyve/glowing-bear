import {ConstraintMark} from './constraint-mark';

export class Constraint {

  // The textual representation of this constraint
  protected _textRepresentation: string;
  // The enum indicating the purpose of the constraint: is it for querying subjects? Or observations?
  protected _mark: ConstraintMark;
  // The parent constraint
  protected _parent: Constraint;

  constructor() {
    this.textRepresentation = '';
    this.mark = ConstraintMark.OBSERVATION;
    this.parent = null;
  }

  get textRepresentation(): string {
    return this._textRepresentation;
  }

  set textRepresentation(value: string) {
    this._textRepresentation = value;
  }

  get mark(): ConstraintMark {
    return this._mark;
  }

  set mark(value: ConstraintMark) {
    this._mark = value;
  }

  get parent(): Constraint {
    return this._parent;
  }

  set parent(value: Constraint) {
    this._parent = value;
  }

  get className(): string {
    return 'Constraint';
  }
}
