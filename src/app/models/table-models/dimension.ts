export class Dimension {
  private _name: string;
  private _selected: boolean;

  constructor(name: string) {
    this.name = name;
    this.selected = false;
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
}
