import {Dimension} from '../table-models/dimension';
import {TransmartTableState} from 'app/models/transmart-models/transmart-table-state';

export class TransmartStudyDimensions {
  availableDimensions: Array<Dimension> = [];
  tableState: TransmartTableState;

}
