export class Concept {
  private _type: string;
  private _path: string;
  private _valueType: string;

  constructor() {
    this._type = 'concept';
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  get path(): string {
    return this._path;
  }

  set path(value: string) {
    this._path = value;
  }

  get valueType(): string {
    return this._valueType;
  }

  set valueType(value: string) {
    this._valueType = value;
  }
}
