import {Order} from '../table-models/order';

export class TransmartTableState {
  public rowDimensions: Array<string>;
  public columnDimensions: Array<string>;
  public rowSort: Map<string, Order>;
  public columnSort: Map<string, Order>;

  constructor(rowDimensions: Array<string>,
              columnDimensions: Array<string>) {
    this.rowDimensions = rowDimensions;
    this.rowSort = new Map<string, Order>();
    for (let rowDim of rowDimensions) {
      this.rowSort.set(rowDim, Order.ASC);
    }
    this.columnDimensions = columnDimensions;
    this.columnSort = new Map<string, Order>();
    for (let colDim of columnDimensions) {
      this.columnSort.set(colDim, Order.ASC);
    }
  }

}
