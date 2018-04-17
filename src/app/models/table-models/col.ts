import {FormatHelper} from '../../utilities/FormatHelper';

export class Col {
  public static COLUMN_FIELD_PREFIX = 'col';
  private _colspan: number;
  private _header: string;
  private _field: string;
  private _metadata: Map<string, string>;
  private _metadataText: string;

  constructor(header: string, field: string,
              metadata?: Map<string, string>,
              colspan?: number) {
    this.colspan = colspan ? colspan : 1;
    this.header = header;
    this.field = field;
    if (metadata != null && metadata.size) {
      this.metadata = metadata;
      this.header += ' ⓘ';
    }
    else {
      this.metadata = new Map();
    }
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

  get metadata():  Map<string, string> {
    return this._metadata;
  }

  set metadata(map: Map<string, string>) {
    this._metadata = map;
    this.metadataText = FormatHelper.formatMetadata(this.metadata);
  }

  get metadataText(): string {
    return this._metadataText;
  }

  set metadataText(value: string) {
    this._metadataText = value;
  }
}
