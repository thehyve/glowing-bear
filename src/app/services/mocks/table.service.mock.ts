import {Dimension} from '../../models/table-models/dimension';

export class TableServiceMock {

  private _rows: Dimension[];
  private _columns: Dimension[];

  constructor() {
    this.rows = [];
    this.columns = [];

    this.rows.push(new Dimension('dimension-1'));
    this.rows.push(new Dimension('dimension-2'));
    this.rows.push(new Dimension('dimension-3'));
    this.rows.push(new Dimension('dimension-4'));
    this.rows.push(new Dimension('dimension-5'));

    this.columns.push(new Dimension('dimension-6'));
    this.columns.push(new Dimension('dimension-7'));
  }

  get rows(): Dimension[] {
    return this._rows;
  }

  set rows(value: Dimension[]) {
    this._rows = value;
  }

  get columns(): Dimension[] {
    return this._columns;
  }

  set columns(value: Dimension[]) {
    this._columns = value;
  }
}
