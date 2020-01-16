/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {Constraint} from '../../models/constraint-models/constraint';

export interface ConstraintVisitor<T> {

  visit(constraint: Constraint): T;

  visitTrueConstraint(constraint: TrueConstraint): T;

  visitNegationConstraint(constraint: NegationConstraint): T;

  visitCombinationConstraint(constraint: CombinationConstraint): T;

  visitConceptConstraint(constraint: ConceptConstraint): T;

  visitValueConstraint(constraint: ValueConstraint): T;

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): T;

  visitTimeConstraint(constraint: TimeConstraint): T;

}
