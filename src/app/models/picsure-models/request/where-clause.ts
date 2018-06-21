export class WhereClause {
  field?: {
    pui: string;
    dataType: string;
  };

  clauseId?: number;
  predicate: string;
  logicalOperator?: string;

  fields?: object;
}
