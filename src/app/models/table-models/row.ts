export class Row {
  // the prefix used to refer to column fields
  public static COLUMN_FIELD_PREFIX = 'col';
  private _data: object;
  private _length: number;

  constructor() {
    this.data = {};
    this.length = 0;
  }

  addDatum(value: any) {
    this.length++;
    const field = Row.COLUMN_FIELD_PREFIX + this.length.toString();
    this.data[field] = value;
  }

  get data(): Object {
    return this._data;
  }

  set data(value: Object) {
    this._data = value;
  }

  get length(): number {
    return this._length;
  }

  set length(value: number) {
    this._length = value;
  }
}
