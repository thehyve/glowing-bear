import {SortOrder} from '../table-models/sort-order';

export class TransmartTableState {
  public rowDimensions: Array<string>;
  public columnDimensions: Array<string>;
  // The pivot/starting row/column dimension to sort
  public pivot: { dimension: string, order: SortOrder };

  constructor(rowDimensions: Array<string>,
              columsDimensions: Array<string>,
              pivot: { dimension: string, order: SortOrder }) {
    this.rowDimensions = rowDimensions;
    this.columnDimensions = columsDimensions;
    this.pivot = pivot;
  }

}
