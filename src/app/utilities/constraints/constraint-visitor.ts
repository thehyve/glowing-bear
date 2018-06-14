import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {Constraint} from '../../models/constraint-models/constraint';

export interface ConstraintVisitor<T> {

  visit(constraint: Constraint): T;

  visitTrueConstraint(constraint: TrueConstraint): T;

  visitNegationConstraint(constraint: NegationConstraint): T;

  visitCombinationConstraint(constraint: CombinationConstraint): T;

  visitStudyConstraint(constraint: StudyConstraint): T;

  visitConceptConstraint(constraint: ConceptConstraint): T;

  visitValueConstraint(constraint: ValueConstraint): T;

  visitPedigreeConstraint(constraint: PedigreeConstraint): T;

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): T;

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): T;

  visitTimeConstraint(constraint: TimeConstraint): T;

}
