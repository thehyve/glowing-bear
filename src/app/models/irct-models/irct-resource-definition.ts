import {IRCTClauseDef} from './irct-clause-definition';
import {IRCTFieldDef} from './irct-field-definition';
import {IRCTDataTypeDef} from './irct-data-type-definition';

export class IRCTResourceDef {
  id: number;
  name: string;
  implementation: string[];
  relationships: string[];
  logicalOperators: string[];

  predicates: IRCTClauseDef[];
  selectOperations: IRCTClauseDef[];
  selectFields: IRCTFieldDef[];
  joins: IRCTClauseDef[];
  sorts: IRCTClauseDef[];
  processes: IRCTClauseDef[];
  visualization: IRCTClauseDef[];
  dataTypes: IRCTDataTypeDef[];
}
