import {PicsureClauseField} from './picsure-clause-field';

export class PicsureClause {
  // where
  predicateName: string;

  // select, sort
  operationName: string;

  // join, process
  name: string;

  displayName: string;
  description: string;
  default: boolean;

  fields: PicsureClauseField[];
  dataTypes: string[];
  paths: string[];

  // process, visualization
  returns: PicsureClauseField[];
}
