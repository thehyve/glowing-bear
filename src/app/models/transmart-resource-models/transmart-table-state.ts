import {Order} from "../table-models/order";

export class TransmartTableState {
  public rowDimensions: Array<string>;
  public columnDimensions: Array<string>;
  public sorting: Map<string, Order>;

  constructor(rowDimensions: Array<string>, columsDimensions: Array<string>, sorting: Map<string, Order>){
    this.rowDimensions = rowDimensions;
    this.columnDimensions = columsDimensions;
    this.sorting = sorting;
  }

}
