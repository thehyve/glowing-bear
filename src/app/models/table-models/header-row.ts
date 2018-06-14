import {Col} from './col';

export class HeaderRow {
  _cols: Array<Col>;

  constructor() {
    this.cols = [];
  }

  set cols(values: Array<Col>) {
    this._cols = values;
  }

  get cols(): Array<Col> {
    return this._cols;
  }
}
