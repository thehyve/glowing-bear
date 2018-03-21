import {SortOrder} from '../table-models/sort-order';

export class TransmartTableState {
  public rowDimensions: Array<string>;
  public columnDimensions: Array<string>;
  public sorting: Map<string, SortOrder>;

  constructor(rowDimensions: Array<string>,
              columsDimensions: Array<string>,
              sorting: Map<string, SortOrder>) {
    this.rowDimensions = rowDimensions;
    this.columnDimensions = columsDimensions;
    this.sorting = sorting;
  }

}
