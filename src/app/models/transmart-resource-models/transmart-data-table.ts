import {TransmartDimension} from "./transmart-dimension";
import {TransmartRow} from "app/models/transmart-resource-models/transmart-row";
import {TransmartSorting} from "./transmart-sorting";

export class TransmartDataTable {
  rows: Array<TransmartRow>;
  rowDimensions: Array<TransmartDimension>;
  columnDimensions: Array<TransmartDimension>;;
  sorting: TransmartSorting;
  offset: number;
  rowCount: number;

}
