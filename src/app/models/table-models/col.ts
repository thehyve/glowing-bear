export class Col {
  public static COLUMN_FIELD_PREFIX = 'col';
  private _colspan: number;
  private _header: string;
  private _field: string;

  constructor(header: string, field: string, colspan?: number) {
    this.colspan = colspan ? colspan : 1;
    this.header = header;
    this.field = field;
  }

  get colspan(): number {
    return this._colspan;
  }

  set colspan(value: number) {
    this._colspan = value;
  }

  get header(): string {
    return this._header;
  }

  set header(value: string) {
    this._header = value;
  }

  get field(): string {
    return this._field;
  }

  set field(value: string) {
    this._field = value;
  }
}
