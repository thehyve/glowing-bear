import {Constraint} from './constraint';

export class ValueConstraint extends Constraint {

  private _valueType: string;
  private _operator: string;
  private _value: any;

  constructor() {
    super();
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
    this.textRepresentation = value.toString();
  }

  get className(): string {
    return 'ValueConstraint';
  }
}
