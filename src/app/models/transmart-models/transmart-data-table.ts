import {TransmartDimension} from './transmart-dimension';
import {TransmartRow} from 'app/models/transmart-models/transmart-row';
import {TransmartSorting} from './transmart-sorting';
import {TransmartColumnHeaders} from './transmart-column-headers';

export class TransmartDataTable {
  rows: Array<TransmartRow>;
  column_headers: Array<TransmartColumnHeaders>;
  row_dimensions: Array<TransmartDimension>;
  column_dimensions: Array<TransmartDimension>;
  sorting: TransmartSorting;
  offset: number;
  'row count': number;

}
