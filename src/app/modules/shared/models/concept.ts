import {Aggregate} from "./aggregate";

export class Concept {
  private _path: string;
  private _valueType: string;
  private _aggregate: Aggregate;

  constructor() {
  }

  get path(): string {
    return this._path;
  }

  set path(value: string) {
    this._path = value;
  }

  get valueType(): string {
    return this._valueType;
  }

  set valueType(value: string) {
    this._valueType = value;
  }

  get aggregate(): Aggregate {
    return this._aggregate;
  }

  set aggregate(value: Aggregate) {
    this._aggregate = value;
  }
}
