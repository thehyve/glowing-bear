/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TransmartConstraintVisitor} from './transmart-constraint-visitor';
import {
  TransmartAndConstraint, TransmartCombinationConstraint,
  TransmartConceptConstraint,
  TransmartConstraint, TransmartFieldConstraint,
  TransmartNegationConstraint,
  TransmartNullConstraint,
  TransmartOrConstraint,
  TransmartPatientSetConstraint,
  TransmartRelationConstraint,
  TransmartStudyNameConstraint,
  TransmartSubSelectionConstraint,
  TransmartTemporalConstraint,
  TransmartTimeConstraint,
  TransmartTrueConstraint,
  TransmartValueConstraint,
  TransmartModifierConstraint
} from '../../models/transmart-models/transmart-constraint';

export abstract class AbstractTransmartConstraintVisitor<T> implements TransmartConstraintVisitor<T> {

  visit(constraint: TransmartConstraint): T {
    if (constraint === null || constraint === undefined) {
      return null;
    }
    switch (constraint.type) {
      case 'true':
        return this.visitTrueConstraint(<TransmartTrueConstraint>constraint);
      case 'field':
        return this.visitFieldConstraint(<TransmartFieldConstraint>constraint);
      case 'concept':
        return this.visitConceptConstraint(<TransmartConceptConstraint>constraint);
      case 'study_name':
        return this.visitStudyNameConstraint(<TransmartStudyNameConstraint>constraint);
      case 'null':
        return this.visitNullConstraint(<TransmartNullConstraint>constraint);
      case 'value':
        return this.visitValueConstraint(<TransmartValueConstraint>constraint);
      case 'time':
        return this.visitTimeConstraint(<TransmartTimeConstraint>constraint);
      case 'patient_set':
        return this.visitPatientSetConstraint(<TransmartPatientSetConstraint>constraint);
      case 'negation':
        return this.visitNegationConstraint(<TransmartNegationConstraint>constraint);
      case 'and':
        return this.visitAndConstraint(<TransmartAndConstraint>constraint);
      case 'or':
        return this.visitOrConstraint(<TransmartOrConstraint>constraint);
      case 'temporal':
        return this.visitTemporalConstraint(<TransmartTemporalConstraint>constraint);
      case 'subselection':
        return this.visitSubSelectionConstraint(<TransmartSubSelectionConstraint>constraint);
      case 'relation':
        return this.visitRelationConstraint(<TransmartRelationConstraint>constraint);
      case 'modifier':
        return this.visitModifierConstraint(<TransmartModifierConstraint>constraint);
      default:
        throw new Error(`Unsupported constraint type: ${constraint.type}`);
    }
  }

  abstract visitTrueConstraint(constraint: TransmartTrueConstraint): T;

  abstract visitFieldConstraint(constraint: TransmartFieldConstraint): T;

  abstract visitConceptConstraint(constraint: TransmartConceptConstraint): T;

  abstract visitStudyNameConstraint(constraint: TransmartStudyNameConstraint): T;

  abstract visitNullConstraint(constraint: TransmartNullConstraint): T;

  abstract visitValueConstraint(constraint: TransmartValueConstraint): T;

  abstract visitTimeConstraint(constraint: TransmartTimeConstraint): T;

  abstract visitPatientSetConstraint(constraint: TransmartPatientSetConstraint): T;

  abstract visitNegationConstraint(constraint: TransmartNegationConstraint): T;

  abstract visitCombinationConstraint(constraint: TransmartCombinationConstraint): T;

  visitAndConstraint(constraint: TransmartAndConstraint): T {
    return this.visitCombinationConstraint(constraint);
  }

  visitOrConstraint(constraint: TransmartOrConstraint): T {
    return this.visitCombinationConstraint(constraint);
  }

  abstract visitTemporalConstraint(constraint: TransmartTemporalConstraint): T;

  abstract visitSubSelectionConstraint(constraint: TransmartSubSelectionConstraint): T;

  abstract visitRelationConstraint(constraint: TransmartRelationConstraint): T;

  abstract visitModifierConstraint(constraint: TransmartModifierConstraint): T;

}
