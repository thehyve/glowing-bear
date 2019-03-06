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
import {Concept} from '../../models/constraint-models/concept';
import {Constraint} from '../../models/constraint-models/constraint';

/**
 * A simple constraint serialisation class for debugging purposes.
 */
export class ConstraintSerialiser extends AbstractConstraintVisitor<object> {

  /**
   * Serialise a constraint to a plain (non-cyclic) object.
   * @param {Constraint} constraint
   * @return {object}
   */
  static serialise(constraint: Constraint): object {
    return new ConstraintSerialiser().visit(constraint);
  }

  /**
   * Serialises a constraint to a pretty JSON string.
   * Intended for debugging purposes, not for communication with external services.
   * @param {Constraint} constraint
   * @return {string}
   */
  static print(constraint: Constraint): string {
    return JSON.stringify(ConstraintSerialiser.serialise(constraint), null, 2);
  }

  visitCombinationConstraint(constraint: CombinationConstraint): object {
    return {
      isRoot: constraint.isRoot,
      combinationState: constraint.combinationState,
      dimension: constraint.dimension,
      children: constraint.children.map(child => this.visit(child))
    }
  }

  visitConcept(concept: Concept): object {
    return concept ? {
      name: concept.name,
      fullName: concept.fullName,
      type: concept.type,
      code: concept.code
    } : null;
  }

  visitConceptConstraint(constraint: ConceptConstraint): object {
    const result = {
      concept: this.visitConcept(constraint.concept)
    };
    if (constraint.valueConstraints) {
      result['valueConstraints'] = constraint.valueConstraints.map(child => this.visit(child));
    }
    if (constraint.applyValDateConstraint) {
      result['valDateConstraint'] = this.visit(constraint.valDateConstraint);
    }
    if (constraint.applyObsDateConstraint) {
      result['obsDateConstraint'] = this.visit(constraint.obsDateConstraint);
    }
    if (constraint.applyTrialVisitConstraint) {
      result['trialVisitConstraint'] = this.visit(constraint.trialVisitConstraint);
    }
    if (constraint.applyStudyConstraint) {
      result['studyConstraint'] = this.visit(constraint.studyConstraint);
    }
    return result;
  }

  visitNegationConstraint(constraint: NegationConstraint): object {
    const result = this.visit(constraint.constraint);
    result['negated'] = true;
    return result;
  }

  visitPedigreeConstraint(constraint: PedigreeConstraint): object {
    return {
      label: constraint.label,
      relationType: constraint.relationType,
      constraint: this.visit(constraint.rightHandSideConstraint),
      biological: constraint.biological,
      shareHousehold: constraint.shareHousehold
    }
  }

  visitStudyConstraint(constraint: StudyConstraint): object {
    return {
      studies: constraint.studies.map(study => study.id)
    };
  }

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): object {
    const result = {};
    if (constraint.id) {
      result['id'] = constraint.id;
    }
    if (constraint.patientIds) {
      result['patientIds'] = constraint.patientIds;
    }
    if (constraint.subjectIds) {
      result['subjectIds'] = constraint.subjectIds;
    }
    return result;
  }

  visitTimeConstraint(constraint: TimeConstraint): object {
    return {
      isObservationDate: constraint.isObservationDate,
      dateOperator: constraint.dateOperator,
      date1: constraint.date1,
      date2: constraint.date2
    };
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): object {
    return {
      studies: constraint.trialVisits.map(trialVisit => {
        return {
          label: trialVisit.label
        }
      })
    };
  }

  visitTrueConstraint(constraint: TrueConstraint): object {
    return {};
  }

  visitValueConstraint(constraint: ValueConstraint): object {
    return {
      studies: constraint.operator,
      valueType: constraint.valueType,
      value: constraint.value
    };
  }

  visit(constraint: Constraint): object {
    const result = super.visit(constraint);
    result['className'] = constraint.className;
    return result;
  }

}
