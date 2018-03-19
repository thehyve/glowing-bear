import {Order} from "./order";

export class DataTableState {
  public rowDimensions: Array<string>;
  public columnDimensions: Array<string>;
  public sorting: Map<string, Order>;

  constructor(rowDimensions: Array<string>, columsDimensions: Array<string>, sorting: Map<string, Order>){
    this.rowDimensions = rowDimensions;
    this.columnDimensions = columsDimensions;
    this.sorting = sorting;
  }

}
