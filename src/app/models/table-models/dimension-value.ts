export class DimensionValue {
  private _name: string;
  private _metadata: Map<string, string>;

  constructor(name: string, metadata?: Map<string, string>) {
    if (metadata != null && metadata.size) {
      this.name = name + ' ⓘ';
      this.metadata = metadata;
    } else {
      this.name = name;
      this.metadata = new Map()
    }
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get metadata():  Map<string, string> {
    return this._metadata;
  }

  set metadata(map: Map<string, string>) {
    this._metadata = map;
  }
}
