import {AbstractConstraintVisitor} from './abstract-constraint-visitor';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {Constraint} from '../../models/constraint-models/constraint';

/**
 * Constraint copy class, for creating a copy of a constraint that can be
 * edited independently.
 */
export class ConstraintCopier extends AbstractConstraintVisitor<Constraint> {

  /**
   * Creates a deep clone of the constraint.
   *
   * @param {T} constraint
   * @return {T}
   */
  static copy<T extends Constraint>(constraint: T): T {
    return <T>new ConstraintCopier().visit(constraint);
  }

  visitCombinationConstraint(constraint: CombinationConstraint): CombinationConstraint {
    return new CombinationConstraint(
      constraint.children.map(child => this.visit(child)),
      constraint.combinationState,
      constraint.dimension
    )
  }

  visitConceptConstraint(constraint: ConceptConstraint): ConceptConstraint {
    const result = new ConceptConstraint();
    if (constraint.concept) {
      result.concept = constraint.concept.copy();
    }
    result.valueConstraints = constraint.valueConstraints.map(child => this.visitValueConstraint(child));
    result.applyValDateConstraint = constraint.applyValDateConstraint;
    result.valDateConstraint = this.visitTimeConstraint(constraint.valDateConstraint);
    result.applyObsDateConstraint = constraint.applyObsDateConstraint;
    result.obsDateConstraint = this.visitTimeConstraint(constraint.obsDateConstraint);
    result.applyTrialVisitConstraint = constraint.applyTrialVisitConstraint;
    result.trialVisitConstraint = this.visitTrialVisitConstraint(constraint.trialVisitConstraint);
    return result;
  }

  visitNegationConstraint(constraint: NegationConstraint): Constraint {
    const result = this.visit(constraint.constraint)
    result.negated = true;
    return result;
  }

  visitPedigreeConstraint(constraint: PedigreeConstraint): PedigreeConstraint {
    const result = new PedigreeConstraint(constraint.label);
    result.relationType = constraint.relationType;
    result.rightHandSideConstraint = constraint.rightHandSideConstraint;
    result.biological = constraint.biological;
    result.shareHousehold = constraint.shareHousehold;
    return result;
  }

  visitStudyConstraint(constraint: StudyConstraint): StudyConstraint {
    const result = new StudyConstraint();
    result.studies = constraint.studies;
    return result;
  }

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): SubjectSetConstraint {
    const result = new SubjectSetConstraint();
    result.id = constraint.id;
    result.patientIds = constraint.patientIds;
    result.subjectIds = constraint.subjectIds;
    return result;
  }

  visitTimeConstraint(constraint: TimeConstraint): TimeConstraint {
    const result = new TimeConstraint();
    result.dateOperator = constraint.dateOperator;
    result.date1 = constraint.date1;
    result.date2 = constraint.date2;
    result.isObservationDate = constraint.isObservationDate;
    return result;
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): TrialVisitConstraint {
    const result = new TrialVisitConstraint();
    result.trialVisits = [].concat(constraint.trialVisits);
    return result;
  }

  visitTrueConstraint(constraint: TrueConstraint): TrueConstraint {
    return new TrueConstraint();
  }

  visitValueConstraint(constraint: ValueConstraint): ValueConstraint {
    const result = new ValueConstraint();
    result.valueType = constraint.valueType;
    result.operator = constraint.operator;
    if (constraint.value) {
      result.value = constraint.value;
    }
    return result;
  }

}
