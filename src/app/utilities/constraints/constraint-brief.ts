import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {AbstractConstraintVisitor} from './abstract-constraint-visitor';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';

export class ConstraintBrief extends AbstractConstraintVisitor<string> {

  visitTrueConstraint(constraint: TrueConstraint): string {
    return '';
  }

  visitStudyConstraint(constraint: StudyConstraint): string {
    return constraint.studies.map(study => study.studyId).join(', ');
  }

  visitConceptConstraint(constraint: ConceptConstraint): string {
    return constraint.concept.name;
  }

  visitValueConstraint(constraint: ValueConstraint): string {
    return constraint.textRepresentation;
  }

  visitNegationConstraint(constraint: NegationConstraint): string {
    return `not ${this.visit(constraint.constraint)}`;
  }

  visitCombinationConstraint(constraint: CombinationConstraint): string {
    let combination = <CombinationConstraint>constraint;
    switch (combination.combinationState) {
      case CombinationState.And:
        return combination.children.map(child => this.visit(child)).join(', ');
      case CombinationState.Or:
        return combination.children.map(child => this.visit(child)).join(' or ');
      default:
        throw new Error(`Unsupported state: ${combination.combinationState}`);
    }
  }

  visitPedigreeConstraint(constraint: PedigreeConstraint): string {
    return `${constraint.textRepresentation} ${this.visit(constraint.rightHandSideConstraint)}`;
  }

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): string {
    return constraint.textRepresentation;
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): string {
    return constraint.textRepresentation;
  }

  visitTimeConstraint(constraint: TimeConstraint): string {
    return constraint.textRepresentation;
  }

}
