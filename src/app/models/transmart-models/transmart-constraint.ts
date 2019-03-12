import {ConceptType} from '../constraint-models/concept-type';

export enum TransmartType {
  id = 'id',
  numeric = 'numeric',
  date = 'date',
  string = 'string',
  text = 'text',
  event = 'event',
  object = 'object',
  collection = 'collection',
  constraint = 'constraint',
  none = 'none'
}

export enum TransmartOperator {
  lt = '<',
  gt = '>',
  eq = '=',
  neq = '!=',
  leq = '<=',
  geq = '>=',
  like = 'like',
  contains = 'contains',
  in = 'in',
  before = '<-',
  after = '->',
  between = '<-->',
  and = 'and',
  or = 'or',
  not = 'not',
  exists = 'exists',
  intersect = 'intersect',
  union = 'union',
  none = 'none'
}
export const TransmartOperatorValues = [
  TransmartOperator.lt,
  TransmartOperator.gt,
  TransmartOperator.eq,
  TransmartOperator.neq,
  TransmartOperator.leq,
  TransmartOperator.geq,
  TransmartOperator.like,
  TransmartOperator.contains,
  TransmartOperator.in,
  TransmartOperator.before,
  TransmartOperator.after,
  TransmartOperator.between,
  TransmartOperator.and,
  TransmartOperator.or,
  TransmartOperator.not,
  TransmartOperator.exists,
  TransmartOperator.intersect,
  TransmartOperator.union,
  TransmartOperator.none
];

export class TransmartField {
  dimension: string;
  type: TransmartType;
  fieldName: string;
}

export class TransmartConstraint {
  type: string;
}

export class TransmartTrueConstraint extends TransmartConstraint {
  type = 'true';
}

export class TransmartFieldConstraint extends TransmartConstraint {
  type = 'field';
  field: TransmartField;
  operator: TransmartOperator;
  value: object;
}

export class TransmartConceptConstraint extends TransmartConstraint {
  type = 'concept';
  conceptCode?: string;
  conceptCodes?: string[];
  path?: string;
}

export class ExtendedConceptConstraint extends TransmartConceptConstraint {
  name?: string;
  fullName?: string;
  conceptPath?: string;
  valueType?: ConceptType;
}

export class TransmartStudyNameConstraint extends TransmartConstraint {
  type = 'study_name';
  studyId: string;
}

export class TransmartNullConstraint extends TransmartConstraint {
  type = 'null';
  field: TransmartField;
}

export class TransmartValueConstraint extends TransmartConstraint {
  type = 'value';
  valueType: TransmartType;
  operator: TransmartOperator;
  value: object;
}

export class TransmartTimeConstraint extends TransmartConstraint {
  type = 'time';
  field: TransmartField;
  operator: TransmartOperator;
  values: number[];
}

export class TransmartPatientSetConstraint extends TransmartConstraint {
  type = 'patient_set';
  patientSetId?: number;
  patientIds?: number[];
  subjectIds?: string[];
}

export class TransmartNegationConstraint extends TransmartConstraint {
  type = 'negation';
  arg: TransmartConstraint;

  constructor(arg: TransmartConstraint) {
    super();
    this.arg = arg;
  }
}

export class TransmartCombinationConstraint extends TransmartConstraint {
  type = 'combination';
  operator?: string;
  args: TransmartConstraint[];
}

export class TransmartAndConstraint extends TransmartCombinationConstraint {
  type = 'and';
}

export class TransmartOrConstraint extends TransmartCombinationConstraint {
  type = 'or';
}

export class TransmartTemporalConstraint extends TransmartConstraint {
  type = 'temporal';
  operator: TransmartOperator;
  eventConstraint: TransmartConstraint;
}

export class TransmartSubSelectionConstraint extends TransmartConstraint {
  type = 'subselection';
  dimension: string;
  constraint: TransmartConstraint;
}

export class TransmartRelationConstraint extends TransmartConstraint {
  type = 'relation';
  relationTypeLabel: string;
  relatedSubjectsConstraint: TransmartConstraint;
  biological?: boolean;
  shareHousehold?: boolean;
}
