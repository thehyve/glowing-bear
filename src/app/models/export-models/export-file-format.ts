export class ExportFileFormat {
  private _name: string;
  private _checked: boolean;

  constructor(name: string, checked: boolean) {
    this.name = name;
    this.checked = checked;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    this._checked = value;
  }
}
