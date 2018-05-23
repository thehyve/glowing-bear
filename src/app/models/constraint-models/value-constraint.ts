import {Constraint} from './constraint';

export class ValueConstraint implements Constraint {
  private _parent: Constraint;
  private _valueType: string;
  private _operator: string;
  private _value: any;
  private _isSubselection: boolean;
  private _textRepresentation: string;

  constructor() {
    this.parent = null;
    this.textRepresentation = 'Value';
  }

  get valueType(): string {
    return this._valueType;
  }

  set valueType(value: string) {
    this._valueType = value;
  }

  get operator(): string {
    return this._operator;
  }

  set operator(value: string) {
    this._operator = value;
  }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
  }

  getClassName(): string {
    return 'ValueConstraint';
  }

  toQueryObjectWithSubselection(): Object {
    // TODO: implement the 'subselection' wrapper on a normal query object
    return null;
  }

  toQueryObjectWithoutSubselection(): object {
    return {
      type: 'value',
      valueType: this._valueType,
      operator: this._operator,
      value: this._value
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
