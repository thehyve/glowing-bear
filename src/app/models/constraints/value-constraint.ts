import {Constraint} from './constraint';

export class ValueConstraint implements Constraint {
  private _parent: Constraint;
  private _valueType: string;
  private _operator: string;
  private _value: any;
  private _isPatientSelection: boolean;

  constructor() {
    this.parent = null;
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

  toPatientQueryObject(): Object {
    // TODO: implement the 'subselection' wrapper on a normal query object
    return null;
  }

  toQueryObject(): Object {
    if (this.isPatientSelection) {
      return this.toPatientQueryObject();
    } else {
      return {
        type: 'value',
        valueType: this._valueType,
        operator: this._operator,
        value: this._value
      };
    }
  }

  get textRepresentation(): string {
    return 'Value';
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
