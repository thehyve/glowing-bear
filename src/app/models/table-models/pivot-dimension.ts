import {Dimension} from './dimension';
import {Order} from './order';

export class PivotDimension {
  private _dimension: Dimension;
  private _order: Order;

  constructor(dimension: Dimension, order: Order) {
    this.dimension = dimension;
    this.order = order;
  }

  get dimension(): Dimension {
    return this._dimension;
  }

  set dimension(value: Dimension) {
    this._dimension = value;
  }

  get order(): Order {
    return this._order;
  }

  set order(value: Order) {
    this._order = value;
  }
}
