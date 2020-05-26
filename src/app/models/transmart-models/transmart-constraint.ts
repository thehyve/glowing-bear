/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ConceptType} from '../constraint-models/concept-type';
import {ValueType} from '../constraint-models/value-type';
import {Operator} from '../constraint-models/operator';

export interface TransmartConstraint {
  type: string;
}

export interface ExtendedConstraint extends TransmartConstraint {
  name?: string;
  fullName?: string;
  conceptCode?: string;
  valueType?: ConceptType;
}

export class TransmartField {
  dimension: string;
  type: ValueType;
  fieldName: string;
}

export class TransmartTrueConstraint implements TransmartConstraint {
  type = 'true';
}

export class TransmartFieldConstraint implements TransmartConstraint {
  type = 'field';
  field: TransmartField;
  operator: Operator;
  value: object;
}

export class TransmartConceptConstraint implements TransmartConstraint {
  type = 'concept';
  conceptCode?: string;
  conceptCodes?: string[];
  path?: string;
}

export class ExtendedConceptConstraint extends TransmartConceptConstraint implements ExtendedConstraint {
  name?: string;
  fullName?: string;
  conceptPath?: string;
  valueType?: ConceptType;
}

export class TransmartStudyNameConstraint implements TransmartConstraint {
  type = 'study_name';
  studyId: string;
}

export class ExtendedStudyNameConstraint extends TransmartStudyNameConstraint implements ExtendedConstraint {
  name?: string;
  fullName?: string;
  conceptPath?: string;
  valueType?: ConceptType;
}

export class TransmartNullConstraint implements TransmartConstraint {
  type = 'null';
  field: TransmartField;
}

export class TransmartValueConstraint implements TransmartConstraint {
  type = 'value';
  valueType: ValueType;
  operator: Operator;
  value: any;
}

export class TransmartTimeConstraint implements TransmartConstraint {
  type = 'time';
  field: TransmartField;
  operator: Operator;
  values: number[];
}

export class TransmartPatientSetConstraint implements TransmartConstraint {
  type = 'patient_set';
  patientSetId?: number;
  patientIds?: number[];
  subjectIds?: string[];
}

export class TransmartNegationConstraint implements TransmartConstraint {
  type = 'negation';
  arg: TransmartConstraint;

  constructor(arg: TransmartConstraint) {
    this.arg = arg;
  }
}

export class TransmartCombinationConstraint implements TransmartConstraint {
  type = 'combination';
  operator?: string;
  args: TransmartConstraint[];
}

export class TransmartAndConstraint extends TransmartCombinationConstraint {
  type = 'and';
}

export class ExtendedAndConstraint extends TransmartAndConstraint implements ExtendedConstraint {
  name?: string;
  fullName?: string;
  conceptPath?: string;
  valueType?: ConceptType;
}

export class TransmartOrConstraint extends TransmartCombinationConstraint {
  type = 'or';
}

export class TransmartTemporalConstraint implements TransmartConstraint {
  type = 'temporal';
  operator: Operator;
  eventConstraint: TransmartConstraint;
}

export class TransmartSubSelectionConstraint implements TransmartConstraint {
  type = 'subselection';
  dimension: string;
  constraint: TransmartConstraint;
}

export class TransmartRelationConstraint implements TransmartConstraint {
  type = 'relation';
  relationTypeLabel: string;
  relatedSubjectsConstraint: TransmartConstraint;
  biological?: boolean;
  shareHousehold?: boolean;
}

export class TransmartModifierConstraint implements TransmartConstraint {
  type = 'modifier';
  modifierCode?: string;
  path?: string;
  dimensionName?: string;
  values: TransmartValueConstraint;
}
