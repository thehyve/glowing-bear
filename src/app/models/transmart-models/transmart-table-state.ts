import {Order} from '../table-models/order';
import {TransmartSort} from "./transmart-sorting";

export class TransmartTableState {
  public rowDimensions: Array<string>;
  public columnDimensions: Array<string>;
  public rowSort: Array<TransmartSort>;
  public columnSort: Array<TransmartSort>;

  constructor(rowDimensions: Array<string>,
              columnDimensions: Array<string>) {
    this.rowDimensions = rowDimensions;
    this.rowSort = [];
    for (let rowDim of rowDimensions) {
      this.rowSort.push(new TransmartSort(rowDim, Order.ASC));
    }
    this.columnDimensions = columnDimensions;
    this.columnSort = [];
    for (let colDim of columnDimensions) {
      this.columnSort.push(new TransmartSort(colDim, Order.ASC));
    }
  }

}
