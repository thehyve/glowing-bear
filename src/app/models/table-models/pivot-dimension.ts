import {Dimension} from './dimension';
import {SortOrder} from './sort-order';

export class PivotDimension {
  private _dimension: Dimension;
  private _order: SortOrder;

  constructor(dimension: Dimension, order: SortOrder) {
    this.dimension = dimension;
    this.order = order;
  }

  get dimension(): Dimension {
    return this._dimension;
  }

  set dimension(value: Dimension) {
    this._dimension = value;
  }

  get order(): SortOrder {
    return this._order;
  }

  set order(value: SortOrder) {
    this._order = value;
  }
}
