import {PicsureDataType} from './picsure-data-type';

export class PicsureClauseField {
  name: string;
  path: string;
  description: string;
  required: boolean;
  dataTypes: PicsureDataType[];
  permittedValues: string[];
  relationship: string;
}
