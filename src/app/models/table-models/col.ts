export class Col {
  public static COLUMN_FIELD_PREFIX = 'col';
  private _field: string;
  private _header: string;

  constructor(field: string, header: string) {
    this.field = field;
    this.header = header;
  }

  get field(): string {
    return this._field;
  }

  set field(value: string) {
    this._field = value;
  }

  get header(): string {
    return this._header;
  }

  set header(value: string) {
    this._header = value;
  }
}
