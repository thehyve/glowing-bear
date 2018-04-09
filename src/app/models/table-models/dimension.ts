export class Dimension {
  private _name: string;
  // the names of the categorical values that this dimension contains
  private _valueNames: string[];

  constructor(name: string) {
    this.name = name;
    this.valueNames = [];
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get valueNames(): string[] {
    return this._valueNames;
  }

  set valueNames(value: string[]) {
    this._valueNames = value;
  }
}
