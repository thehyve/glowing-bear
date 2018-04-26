import {IRCTFieldDef} from './irct-field-definition';

export class IRCTClauseDef {
  // where
  predicateName: string;

  // select, sort
  operationName: string;

  // join, process
  name: string;

  displayName: string;
  description: string;
  default: boolean;

  fields: IRCTFieldDef[];
  dataTypes: string[];
  paths: string[];

  // process, visualization
  returns: IRCTFieldDef[];
}
