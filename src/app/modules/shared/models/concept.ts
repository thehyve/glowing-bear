import {Aggregate} from "./aggregate";

export class Concept {
  private _path: string;
  private _type: string;
  private _aggregate: Aggregate;

  constructor() {
  }

  get path(): string {
    return this._path;
  }

  set path(value: string) {
    this._path = value;
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  get aggregate(): Aggregate {
    return this._aggregate;
  }

  set aggregate(value: Aggregate) {
    this._aggregate = value;
  }
}
