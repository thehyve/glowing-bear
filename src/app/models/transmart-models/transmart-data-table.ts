import {TransmartDimension} from './transmart-dimension';
import {TransmartRow} from 'app/models/transmart-models/transmart-row';
import {TransmartSort} from './transmart-sort';
import {TransmartColumnHeaders} from './transmart-column-headers';

export class TransmartDataTable {
  rows: Array<TransmartRow>;
  columnHeaders: Array<TransmartColumnHeaders>;
  rowDimensions: Array<TransmartDimension>;
  columnDimensions: Array<TransmartDimension>;
  sort: Array<TransmartSort>;
  offset: number;
  rowCount: number;
}
