import {TransmartDimension} from './transmart-dimension';
import {TransmartRow} from 'app/models/transmart-models/transmart-row';
import {TransmartSorting} from './transmart-sorting';
import {TransmartColumnHeaders} from "./transmart-column-headers";

export class TransmartDataTable {
  rows: Array<TransmartRow>;
  columnHeaders: Array<TransmartColumnHeaders>;
  rowDimensions: Array<TransmartDimension>;
  columnDimensions: Array<TransmartDimension>;
  sorting: TransmartSorting;
  offset: number;
  rowCount: number;

}
