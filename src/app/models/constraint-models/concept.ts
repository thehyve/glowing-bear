export class Concept {
  private _path: string;
  private _type: string;
  // the display text
  private _label: string;
  private _aggregate: object;
  private _code: string;
  private _name: string;
  private _fullName: string;

  constructor() {
  }

  get path(): string {
    return this._path;
  }

  set path(value: string) {
    this._path = value;
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  get aggregate(): object {
    return this._aggregate;
  }

  set aggregate(value: object) {
    this._aggregate = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get code(): string {
    return this._code;
  }

  set code(value: string) {
    this._code = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get fullName(): string {
    return this._fullName;
  }

  set fullName(value: string) {
    this._fullName = value;
  }
}
