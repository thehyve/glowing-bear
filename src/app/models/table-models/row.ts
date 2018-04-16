import {Col} from './col';
import {FormatHelper} from '../../utilities/FormatHelper';

export class Row {
  // the prefix used to refer to column fields
  private _data: object;
  private _metadata: Map<string, Map<string, string>>;
  private _metadataText: Map<string, string>;
  private _length: number;

  constructor() {
    this.data = {};
    this.metadata = new Map<string, Map<string, string>>();
    this.metadataText = new Map<string, string>();
    this.length = 0;
  }

  addDatum(value: any, metadataValue?: Map<string, string>) {
    this.length++;
    const field = Col.COLUMN_FIELD_PREFIX + this.length.toString();
    this.data[field] = value;
    if (metadataValue != null && metadataValue.size) {
      this.metadata[field] = metadataValue;
      this.metadataText[field] = FormatHelper.formatMetadata(metadataValue);
    }
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

  get metadata(): Map<string, Map<string, string>> {
    return this._metadata;
  }

  set metadata(value: Map<string, Map<string, string>>) {
    value.forEach((map, field) => {
      this.metadataText[field] = FormatHelper.formatMetadata(map);
    });
    this._metadata = value;
  }

  get metadataText(): Map<string, string> {
    return this._metadataText;
  }

  set metadataText(value: Map<string, string>) {
    this._metadataText = value;
  }
}
