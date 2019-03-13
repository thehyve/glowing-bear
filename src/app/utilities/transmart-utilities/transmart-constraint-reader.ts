import {AbstractTransmartConstraintVisitor} from './abstract-transmart-constraint-visitor';
import {Constraint} from '../../models/constraint-models/constraint';
import {
  ExtendedAndConstraint,
  ExtendedConceptConstraint, ExtendedConstraint,
  TransmartCombinationConstraint,
  TransmartFieldConstraint,
  TransmartNegationConstraint,
  TransmartNullConstraint,
  TransmartPatientSetConstraint,
  TransmartRelationConstraint,
  TransmartStudyNameConstraint,
  TransmartSubSelectionConstraint,
  TransmartTemporalConstraint,
  TransmartTimeConstraint,
  TransmartTrueConstraint,
  TransmartValueConstraint
} from '../../models/transmart-models/transmart-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {Study} from '../../models/constraint-models/study';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {DateOperatorState} from '../../models/constraint-models/date-operator-state';
import {Operator} from '../../models/constraint-models/operator';

/**
 * Deserialisation class for reading constraint objects from TranSMART API and
 * transform them into constraints that can be used in the cohort selection.
 *
 * To deserialise a constraint, use <code>new TransmartConstraintReader().visit(constraint)</code>.
 */
export class TransmartConstraintReader extends AbstractTransmartConstraintVisitor<Constraint> {

  static wrapWithCombinationConstraint(dimension: string, child: Constraint): CombinationConstraint {
    if (child.className === 'CombinationConstraint') {
      const combination = <CombinationConstraint>child;
      if (combination.dimension === dimension) {
        return combination;
      }
    }
    const constraint = new CombinationConstraint();
    constraint.addChild(child);
    constraint.dimension = dimension;
    return constraint;
  }

  static convertDateOperator(operator: string): DateOperatorState {
    switch (operator) {
      case Operator.before:
        return DateOperatorState.BEFORE;
      case Operator.after:
        return DateOperatorState.AFTER;
      case Operator.between:
        return DateOperatorState.BETWEEN;
      default:
        throw new Error(`Date operator not supported: ${operator}`);
    }
  }

  addMetadataToConcept(concept: Concept, constraintObject: ExtendedConstraint) {
    const fullName = constraintObject.fullName;
    concept.fullName = fullName;
    const tail = '\\' + constraintObject.name + '\\';
    const head = fullName ? fullName.substring(0, fullName.length - tail.length) : '';
    concept.name = constraintObject.name;
    concept.label = constraintObject.name + ' (' + head + ')';
    concept.type = constraintObject.valueType;
  }

  visitConceptConstraint(constraintObject: ExtendedConceptConstraint): Constraint {
    let concept = new Concept();
    concept.code = constraintObject.conceptCode;
    if (constraintObject.fullName) {
      this.addMetadataToConcept(concept, constraintObject);
    }
    const constraint = new ConceptConstraint();
    constraint.concept = concept;
    return constraint;
  }

  visitStudyNameConstraint(constraintObject: TransmartStudyNameConstraint): Constraint {
    let study = new Study();
    study.id = constraintObject.studyId;
    const constraint = new StudyConstraint();
    constraint.studies.push(study);
    return constraint;
  }

  /**
   * FIXME: Seriously refactor this function
   * @param constraintObject
   */
  visitCombinationConstraint(constraintObject: TransmartCombinationConstraint): Constraint {
    const operator = constraintObject.type !== 'combination' ? constraintObject.type : constraintObject.operator;
    const constraint = new CombinationConstraint();
    constraint.combinationState =
      (operator === 'and') ? CombinationState.And : CombinationState.Or;

    /*
     * sometimes a combination constraint actually corresponds to a concept constraint UI
     * which could have:
     * a) an observation date constraint and/or
     * b) a trial-visit constraint and/or
     * c) value constraints and/or
     * d) time constraints (value date for a DATE concept and/or observation date constraints)
     * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
     * sometimes a combination contains purely study constraints,
     * in which case we can reduce this combination to a single study constraint containing multiple studies
     */
    let prospectConcept: ConceptConstraint = null;
    let prospectValDate: TimeConstraint = null;
    let prospectObsDate: TimeConstraint = null;
    let prospectTrialVisit: TrialVisitConstraint = null;
    let prospectValues: ValueConstraint[] = [];
    let hasOnlyStudies = true;
    let allStudyIds = [];

    /*
     * go through each argument, construct potential sub-constraints for the concept constraint
     */
    for (let arg of constraintObject.args) {
      let child = this.visit(arg);
      if (child.className === 'ConceptConstraint') {
        prospectConcept = <ConceptConstraint>child;
        if (!prospectConcept.concept.fullName && constraintObject['fullName'] && operator === 'and') {
          this.addMetadataToConcept(prospectConcept.concept, <ExtendedAndConstraint>constraintObject);
        }
      } else if (child.className === 'TimeConstraint') {
        if (arg['isObservationDate']) {
          prospectObsDate = <TimeConstraint>child;
        } else {
          prospectValDate = <TimeConstraint>child;
        }
      } else if (child.className === 'TrialVisitConstraint') {
        prospectTrialVisit = <TrialVisitConstraint>child;
      } else if (child.className === 'ValueConstraint') {
        prospectValues.push(<ValueConstraint>child);
      } else if (child.className === 'CombinationConstraint' &&
        (<CombinationConstraint>child).combinationState === CombinationState.Or) {
        let isValues = true;
        for (let val of (<CombinationConstraint>child).children) {
          if (val.className !== 'ValueConstraint') {
            isValues = false;
          } else {
            prospectValues.push(<ValueConstraint>val);
          }
        }
        if (!isValues) {
          prospectValues = [];
        }
      }
      constraint.addChild(child);
      if (arg.type === 'study_name') {
        allStudyIds.push((<TransmartStudyNameConstraint>arg).studyId);
      } else {
        hasOnlyStudies = false;
      }
    }
    // -------------------------------- end for -------------------------------------------

    /*
     * Check conditions for a concept constraint
     */
    if (prospectConcept &&
      (prospectValDate || prospectObsDate || prospectTrialVisit || prospectValues.length > 0 || allStudyIds.length > 0)) {
      if (prospectValDate) {
        prospectConcept.applyValDateConstraint = true;
        prospectConcept.valDateConstraint = prospectValDate;
      }
      if (prospectObsDate) {
        prospectConcept.applyObsDateConstraint = true;
        prospectConcept.obsDateConstraint = prospectObsDate;
      }
      if (prospectTrialVisit) {
        prospectConcept.applyTrialVisitConstraint = true;
        prospectConcept.trialVisitConstraint = prospectTrialVisit;
      }
      if (prospectValues) {
        prospectConcept.valueConstraints = prospectValues;
      }
      return prospectConcept;
    }
    /*
     * Check conditions for a study constraint
     */
    if (operator === 'or' && hasOnlyStudies) {
      let studyConstraint = new StudyConstraint();
      studyConstraint.studies = allStudyIds.map(studyId => {
        const study = new Study();
        study.id = studyId;
        return study;
      });
      return studyConstraint;
    }
    /*
     * Flatten nested subselection constraint
     */
    if (constraint.children.every(child => child.className === 'CombinationConstraint')) {
      const dimensions = new Set(constraint.children.map((child: CombinationConstraint) => child.dimension));
      // Only flatten when all children have the same dimension
      if (dimensions.size === 1) {
        constraint.dimension = dimensions.values().next().value;
        const children: Constraint[] = [];
        constraint.children.forEach((child: CombinationConstraint) =>
          child.children.forEach(c => children.push(c))
        );
        constraint.children = children;
      }
    }
    return constraint;
  }

  visitRelationConstraint(constraintObject: TransmartRelationConstraint): Constraint {
    const constraint = new PedigreeConstraint(constraintObject.relationTypeLabel);
    constraint.biological = constraintObject.biological;
    constraint.shareHousehold = constraintObject.shareHousehold;
    const rightHandSide = this.visit(constraintObject.relatedSubjectsConstraint);
    constraint.rightHandSideConstraint.children.length = 0;
    if (rightHandSide.className === 'CombinationConstraint') {
      const combiRhs =  <CombinationConstraint>rightHandSide;
      for (let child of combiRhs.children) {
        constraint.rightHandSideConstraint.addChild(child);
      }
      constraint.rightHandSideConstraint.combinationState = combiRhs.combinationState;
    } else if (rightHandSide.className !== 'TrueConstraint') {
      constraint.rightHandSideConstraint.addChild(rightHandSide);
    } else {
      // FIXME: no restoring of other constraint types?
    }
    return constraint;
  }

  visitTimeConstraint(constraintObject: TransmartTimeConstraint): Constraint {
    const constraint = new TimeConstraint();
    constraint.dateOperator = TransmartConstraintReader.convertDateOperator(constraintObject.operator);
    switch (constraintObject.field.dimension) {
      case 'start time':
        constraint.isObservationDate = true;
        break;
      case 'value':
        constraint.isObservationDate = false;
        break;
      default:
        throw Error(`Unsupported dimension for time constraint: ${constraintObject.field.dimension}`);
    }
    constraint.date1 = new Date(constraintObject.values[0]);
    if (constraintObject.values.length === 2) {
      constraint.date2 = new Date(constraintObject.values[1]);
    }
    return constraint;
  }

  visitFieldConstraint(constraintObject: TransmartFieldConstraint): Constraint {
    if (constraintObject.field.dimension !== 'trial visit') {
      throw Error('Field not supported')
    }
    const constraint = new TrialVisitConstraint();
    for (let id of constraintObject.value as string[]) {
      let visit = new TrialVisit(id);
      constraint.trialVisits.push(visit);
    }
    return constraint;
  }

  visitValueConstraint(constraintObject: TransmartValueConstraint): Constraint {
    const constraint = new ValueConstraint();
    constraint.operator = constraintObject.operator;
    constraint.value = constraintObject.value;
    constraint.valueType = constraintObject.valueType;
    return constraint;
  }

  visitPatientSetConstraint(constraintObject: TransmartPatientSetConstraint): Constraint {
    const constraint = new SubjectSetConstraint();
    if (constraintObject.subjectIds) {
      constraint.subjectIds = constraintObject.subjectIds;
    } else if (constraintObject.patientIds) {
      constraint.patientIds = constraintObject.patientIds.map(patientId => patientId.toString());
    } else if (constraintObject.patientSetId) {
      constraint.id = constraintObject.patientSetId;
    }
    return constraint;
  }

  visitNegationConstraint(constraintObject: TransmartNegationConstraint): Constraint {
    const result = this.visit(constraintObject.arg);
    if (result.className === 'TimeConstraint' && (<TimeConstraint>result).dateOperator === DateOperatorState.BETWEEN) {
      (<TimeConstraint>result).dateOperator = DateOperatorState.NOT_BETWEEN
    } else {
      result.negated = true;
    }
    return result;
  }

  visitNullConstraint(constraintObject: TransmartNullConstraint): Constraint {
    return undefined;
  }

  visitSubSelectionConstraint(constraintObject: TransmartSubSelectionConstraint): CombinationConstraint {
    const constraint = this.visit(constraintObject.constraint);
    return TransmartConstraintReader.wrapWithCombinationConstraint(constraintObject['dimension'], constraint);
  }

  visitTemporalConstraint(constraintObject: TransmartTemporalConstraint): Constraint {
    return undefined;
  }

  visitTrueConstraint(constraintObject: TransmartTrueConstraint): Constraint {
    return new TrueConstraint();
  }

}
