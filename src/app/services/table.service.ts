import {Injectable} from '@angular/core';
import {Dimension} from '../models/table-models/dimension';

@Injectable()
export class TableService {

  private _candidates: Dimension[];
  private _rows: Dimension[];
  private _columns: Dimension[];

  constructor() {
    this.rows = [];
    this.columns = [];
    this.candidates = [];
    this.candidates.push(new Dimension('d1'));
    this.candidates.push(new Dimension('d2'));
    this.candidates.push(new Dimension('d3'));
  }


  get candidates(): Dimension[] {
    return this._candidates;
  }

  set candidates(value: Dimension[]) {
    this._candidates = value;
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
