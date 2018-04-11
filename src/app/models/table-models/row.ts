import {Col} from './col';

export class Row {
  // the prefix used to refer to column fields
  private _data: object;
  private _metadata: object;
  private _length: number;

  constructor() {
    this.data = {};
    this.metadata = {};
    this.length = 0;
  }

  addDatum(value: any, metadataValue?: Map<string, string>) {
    this.length++;
    const field = Col.COLUMN_FIELD_PREFIX + this.length.toString();
    this.data[field] = value;
    if(metadataValue != null && metadataValue.size) {
      this.metadata[field] = metadataValue;
    }
  }

  get data(): Object {
    return this._data;
  }

  set data(value: Object) {
    this._data = value;
  }

  get metadata(): Object {
    return this._metadata;
  }

  set metadata(value: Object) {
    this._metadata = value;
  }

  get length(): number {
    return this._length;
  }

  set length(value: number) {
    this._length = value;
  }
}
