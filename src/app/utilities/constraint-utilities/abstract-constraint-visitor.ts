/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ConstraintVisitor} from './constraint-visitor';
import {Constraint} from '../../models/constraint-models/constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';

export abstract class AbstractConstraintVisitor<T> implements ConstraintVisitor<T> {

  visit(constraint: Constraint): T {
    if (constraint.negated) {
      let constraintCopy = Object.create(constraint);
      constraintCopy.negated = false;
      constraintCopy.dimension = constraint.dimension;
      return this.visit(new NegationConstraint(constraintCopy));
    }
    switch (constraint.className) {
      case 'TrueConstraint':
        return this.visitTrueConstraint(<TrueConstraint>constraint);
      case 'NegationConstraint':
        return this.visitNegationConstraint(<NegationConstraint>constraint);
      case 'CombinationConstraint':
        return this.visitCombinationConstraint(<CombinationConstraint>constraint);
      case 'StudyConstraint':
        return this.visitStudyConstraint(<StudyConstraint>constraint);
      case 'ConceptConstraint':
        return this.visitConceptConstraint(<ConceptConstraint>constraint);
      case 'ValueConstraint':
        return this.visitValueConstraint(<ValueConstraint>constraint);
      case 'PedigreeConstraint':
        return this.visitPedigreeConstraint(<PedigreeConstraint>constraint);
      case 'SubjectSetConstraint':
        return this.visitSubjectSetConstraint(<SubjectSetConstraint>constraint);
      case 'TrialVisitConstraint':
        return this.visitTrialVisitConstraint(<TrialVisitConstraint>constraint);
      case 'TimeConstraint':
        return this.visitTimeConstraint(<TimeConstraint>constraint);
      default:
        throw new Error(`Unsupported constraint type: ${constraint.className}`);
    }
  }

  abstract visitTrueConstraint(constraint: TrueConstraint): T;

  abstract visitNegationConstraint(constraint: NegationConstraint): T;

  abstract visitCombinationConstraint(constraint: CombinationConstraint): T;

  abstract visitStudyConstraint(constraint: StudyConstraint): T;

  abstract visitConceptConstraint(constraint: ConceptConstraint): T;

  abstract visitValueConstraint(constraint: ValueConstraint): T;

  abstract visitPedigreeConstraint(constraint: PedigreeConstraint): T;

  abstract visitSubjectSetConstraint(constraint: SubjectSetConstraint): T;

  abstract visitTrialVisitConstraint(constraint: TrialVisitConstraint): T;

  abstract visitTimeConstraint(constraint: TimeConstraint): T;

}
