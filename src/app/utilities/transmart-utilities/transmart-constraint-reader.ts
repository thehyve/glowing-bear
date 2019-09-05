import {AbstractTransmartConstraintVisitor} from './abstract-transmart-constraint-visitor';
import {Constraint} from '../../models/constraint-models/constraint';
import {
  ExtendedAndConstraint,
  ExtendedConceptConstraint,
  ExtendedConstraint,
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

  static addMetadataToConcept(concept: Concept, constraintObject: ExtendedConstraint) {
    const fullName = constraintObject.fullName;
    concept.fullName = fullName;
    const tail = '\\' + constraintObject.name + '\\';
    const head = fullName ? fullName.substring(0, fullName.length - tail.length) : '';
    concept.name = constraintObject.name;
    concept.label = constraintObject.name + ' (' + head + ')';
    concept.type = constraintObject.valueType;
  }

  static flattenNestedSubselectionConstraint(result: CombinationConstraint, combinationState: CombinationState) {
    if (result.children.every(child => child.className === 'CombinationConstraint')) {
      const dimensions = new Set(result.children.map((child: CombinationConstraint) => child.dimension));
      // Only flatten when all children have the same dimension
      if (dimensions.size === 1) {
        result.dimension = dimensions.values().next().value;
        const flattenedChildren: Constraint[] = [];
        result.children.forEach((child: CombinationConstraint) => {
            // Only flatten children that has the same combinationState as parent or if single child
            if (!child.negated && ((<CombinationConstraint>child).combinationState === combinationState || child.children.length === 1)) {
              child.children.forEach(c => {
                flattenedChildren.push(c);
              })
            } else {
              flattenedChildren.push(child);
            }
          }
        );
        result.children = flattenedChildren;
      }
    }
  }

  visitConceptConstraint(constraintObject: ExtendedConceptConstraint): Constraint {
    let concept = new Concept();
    concept.code = constraintObject.conceptCode;
    if (constraintObject.fullName) {
      TransmartConstraintReader.addMetadataToConcept(concept, constraintObject);
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
    const combinationState =
      (operator === 'and') ? CombinationState.And : CombinationState.Or;

    const children = constraintObject.args.filter(arg => arg).map(arg => this.visit(arg));

    /*
     * Check conditions for a study constraint
     */
    if (combinationState === CombinationState.Or &&
      children.every(child => child.className === 'StudyConstraint')) {
      const studyConstraint = new StudyConstraint();
      const studies: Study[] = [];
      children.forEach((child: StudyConstraint) =>
        child.studies.forEach((study: Study) => studies.push(study)));
      studyConstraint.studies = studies;
      return studyConstraint;
    }

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
    if (combinationState === CombinationState.And) {
      let prospectConcept: ConceptConstraint = null;
      let prospectValDate: TimeConstraint = null;
      let prospectObsDate: TimeConstraint = null;
      let prospectTrialVisit: TrialVisitConstraint = null;
      let prospectStudy: StudyConstraint = null;
      let prospectValues: ValueConstraint[] = [];

      /*
       * go through each argument, construct potential sub-constraints for the concept constraint
       */
      for (let child of children) {
        if (child.className === 'ConceptConstraint') {
          prospectConcept = <ConceptConstraint>child;
          if (!prospectConcept.concept.fullName && constraintObject['fullName'] && operator === 'and') {
            TransmartConstraintReader.addMetadataToConcept(prospectConcept.concept, <ExtendedAndConstraint>constraintObject);
          }
        } else if (child.className === 'TimeConstraint') {
          const timeConstraint = <TimeConstraint>child;
          if (timeConstraint.isObservationDate) {
            prospectObsDate = timeConstraint;
          } else {
            prospectValDate = timeConstraint;
          }
        } else if (child.className === 'TrialVisitConstraint') {
          prospectTrialVisit = <TrialVisitConstraint>child;
        } else if (child.className === 'StudyConstraint') {
          prospectStudy = <StudyConstraint>child;
        } else if (child.className === 'ValueConstraint') {
          prospectValues.push(<ValueConstraint>child);
        } else if (child.className === 'CombinationConstraint' &&
          (<CombinationConstraint>child).combinationState === CombinationState.Or) {
          const subChildren = (<CombinationConstraint>child).children;
          if (subChildren.every(subChild =>
            subChild.className === 'ValueConstraint')) {
            subChildren.forEach((subChild: ValueConstraint) =>
              prospectValues.push(subChild)
            );
          } else {
            // FIXME: Disjunctive children not handled
          }
        } else {
          // FIXME: Combination of concept constraint and arbitrary other constraints not handled
        }
      }
      // -------------------------------- end for -------------------------------------------

      /*
       * Check conditions for a concept constraint
       */
      if (prospectConcept &&
        (prospectValDate || prospectObsDate || prospectTrialVisit || prospectStudy || prospectValues.length > 0)) {
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
        if (prospectStudy) {
          prospectConcept.applyStudyConstraint = true;
          prospectConcept.studyConstraint = prospectStudy;
        }
        if (prospectValues) {
          prospectConcept.valueConstraints = prospectValues;
        }
        return prospectConcept;
      }
    }

    const result = new CombinationConstraint();
    result.combinationState = combinationState;
    children.forEach(child => result.addChild(child));

    TransmartConstraintReader.flattenNestedSubselectionConstraint(result, combinationState);

    return result;
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
      constraint.rightHandSideConstraint = new CombinationConstraint([rightHandSide]);
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
    } else if (result.className === 'CombinationConstraint' && (<CombinationConstraint>result).children.length === 1) {
      (<CombinationConstraint>result).children[0].negated = true;
    } else {
      result.negated = true;
    }
    return result;
  }

  visitNullConstraint(constraintObject: TransmartNullConstraint): Constraint {
    throw new Error(`Constraint type not supported: ${constraintObject.type}`);
  }

  visitSubSelectionConstraint(constraintObject: TransmartSubSelectionConstraint): CombinationConstraint {
    const constraint = this.visit(constraintObject.constraint);
    return TransmartConstraintReader.wrapWithCombinationConstraint(constraintObject['dimension'], constraint);
  }

  visitTemporalConstraint(constraintObject: TransmartTemporalConstraint): Constraint {
    throw new Error(`Constraint type not supported: ${constraintObject.type}`);
  }

  visitTrueConstraint(constraintObject: TransmartTrueConstraint): Constraint {
    return new TrueConstraint();
  }

}
