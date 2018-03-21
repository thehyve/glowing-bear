export class Dimension {
  private _name: string;
  // indicating if this dimension is selected in UI
  private _selected: boolean;
  // the names of the categorical values that this dimension contains
  private _valueNames: string[];

  constructor(name: string) {
    this.name = name;
    this.selected = true;
    this.valueNames = [];
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
  }

  get valueNames(): string[] {
    return this._valueNames;
  }

  set valueNames(value: string[]) {
    this._valueNames = value;
  }
}
