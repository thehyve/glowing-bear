import {Dimension} from "./dimension";
import {DefaultTableRepresentation} from "./default-table-representation";

export class StudiesDimensions {
  _availableDimensions: Array<Dimension>;
  _defaultTableRepresentation: DefaultTableRepresentation;

  constructor() {
    this.availableDimensions = [];
  }

  set availableDimensions(values: Array<Dimension>) {
    this._availableDimensions = values;
  }

  get availableDimensions(): Array<Dimension> {
    return this._availableDimensions;
  }

  set defaultTableRepresentation(value: DefaultTableRepresentation) {
    this._defaultTableRepresentation = value;
  }

  get defaultTableRepresentation(): DefaultTableRepresentation {
    return this._defaultTableRepresentation;
  }
}
