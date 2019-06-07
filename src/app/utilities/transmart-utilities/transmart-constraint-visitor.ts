/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  TransmartAndConstraint,
  TransmartConceptConstraint,
  TransmartConstraint, TransmartFieldConstraint,
  TransmartNegationConstraint,
  TransmartNullConstraint,
  TransmartOrConstraint,
  TransmartPatientSetConstraint,
  TransmartRelationConstraint,
  TransmartStudyNameConstraint, TransmartSubSelectionConstraint, TransmartTemporalConstraint,
  TransmartTimeConstraint,
  TransmartTrueConstraint,
  TransmartValueConstraint
} from '../../models/transmart-models/transmart-constraint';

export interface TransmartConstraintVisitor<T> {

  visit(constraint: TransmartConstraint): T;

  visitTrueConstraint(constraint: TransmartTrueConstraint): T;

  visitFieldConstraint(constraint: TransmartFieldConstraint): T;

  visitConceptConstraint(constraint: TransmartConceptConstraint): T;

  visitStudyNameConstraint(constraint: TransmartStudyNameConstraint): T;

  visitNullConstraint(constraint: TransmartNullConstraint): T;

  visitValueConstraint(constraint: TransmartValueConstraint): T;

  visitTimeConstraint(constraint: TransmartTimeConstraint): T;

  visitPatientSetConstraint(constraint: TransmartPatientSetConstraint): T;

  visitNegationConstraint(constraint: TransmartNegationConstraint): T;

  visitAndConstraint(constraint: TransmartAndConstraint): T;

  visitOrConstraint(constraint: TransmartOrConstraint): T;

  visitTemporalConstraint(constraint: TransmartTemporalConstraint): T;

  visitSubSelectionConstraint(constraint: TransmartSubSelectionConstraint): T;

  visitRelationConstraint(constraint: TransmartRelationConstraint): T;

}
