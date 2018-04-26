import {IRCTDataTypeDef} from './irct-data-type-definition';

export class IRCTFieldDef {
  name: string;
  path: string;
  description: string;
  required: boolean;
  dataTypes: IRCTDataTypeDef[];
  permittedValues: string[];
  relationship: string;
}
