import {Dimension} from "./dimension";

export class DefaultTableRepresentation {
  _rowDimensions: Array<Dimension>;
  _columnDimensions: Array<Dimension>;

  constructor() {
    this.rowDimensions = [];
    this.columnDimensions = [];
  }

  set rowDimensions(values: Array<Dimension>) {
    this._rowDimensions = values;
  }

  get rowDimensions(): Array<Dimension> {
    return this._rowDimensions;
  }

  set columnDimensions(values: Array<Dimension>) {
    this._columnDimensions = values;
  }

  get columnDimensions(): Array<Dimension> {
    return this._columnDimensions;
  }
}
