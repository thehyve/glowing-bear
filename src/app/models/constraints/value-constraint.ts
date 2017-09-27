import {Constraint} from "./constraint";

export class ValueConstraint implements Constraint {
  private _valueType: string;
  private _operator: string;
  private _value: any;

  constructor() {
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

  toQueryObject(): Object {
    return {
      type: "value",
      valueType: this._valueType,
      operator: this._operator,
      value: this._value
    };
  }

  get textRepresentation(): string {
    return 'Value';
  }

}
