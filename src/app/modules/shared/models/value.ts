export class Value {
  private _type:string;
  private _valueType: string;
  private _operator: string;
  private _value: any;

  constructor() {
    this._type = 'value';
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
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
}
