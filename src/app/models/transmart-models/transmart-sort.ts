import {Order} from '../table-models/order';

export class TransmartSort {
  dimension: string;
  sortOrder: Order;
  'user_requested': boolean;

  constructor(dimension: string, order: Order){
    this.dimension = dimension;
    this.sortOrder = order;
  }
}
