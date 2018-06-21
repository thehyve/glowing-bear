import {PicsureClause} from './picsure-clause';
import {PicsureClauseField} from './picsure-clause-field';
import {PicsureDataType} from './picsure-data-type';

export class PicsureResource {
  id: number;
  name: string;
  implementation: string[];
  relationships: string[];
  logicalOperators: string[];

  predicates: PicsureClause[];
  selectOperations: PicsureClause[];
  selectFields: PicsureClauseField[];
  joins: PicsureClause[];
  sorts: PicsureClause[];
  processes: PicsureClause[];
  visualization: PicsureClause[];
  dataTypes: PicsureDataType[];
}
