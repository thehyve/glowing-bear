import {Order} from '../table-models/order';

export class TransmartTableState {
  public rowDimensions: Array<string>;
  public columnDimensions: Array<string>;
  public rowDimensionSorting: Map<string, Order>;
  public columnDimensionSorting: Map<string, Order>;

  constructor(rowDimensions: Array<string>,
              columnDimensions: Array<string>) {
    this.rowDimensions = rowDimensions;
    this.rowDimensionSorting = new Map<string, Order>();
    for (let rowDim of rowDimensions) {
      this.rowDimensionSorting.set(rowDim, Order.ASC);
    }
    this.columnDimensions = columnDimensions;
    this.columnDimensionSorting = new Map<string, Order>();
    for (let colDim of columnDimensions) {
      this.columnDimensionSorting.set(colDim, Order.ASC);
    }
  }

}
