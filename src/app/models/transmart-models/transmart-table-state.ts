import {TransmartSort} from './transmart-sort';

export class TransmartTableState {
  public rowDimensions: string[] = [];
  public columnDimensions: string[] = [];
  public rowSort: TransmartSort[] = [];
  public columnSort: TransmartSort[] = [];

  constructor(rowDimensions: string[], columnDimensions: string[]) {
    this.rowDimensions = rowDimensions;
    this.rowSort = [];
    this.columnDimensions = columnDimensions;
    this.columnSort = [];
  }

}
