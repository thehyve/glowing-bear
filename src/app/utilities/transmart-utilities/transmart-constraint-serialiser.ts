/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {DateOperatorState} from '../../models/constraint-models/date-operator-state';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {AbstractConstraintVisitor} from '../constraint-utilities/abstract-constraint-visitor';
import {
  ExtendedConstraint,
  TransmartCombinationConstraint,
  TransmartConceptConstraint,
  TransmartConstraint,
  TransmartFieldConstraint,
  TransmartNegationConstraint,
  TransmartPatientSetConstraint,
  TransmartRelationConstraint,
  TransmartSubSelectionConstraint,
  TransmartTimeConstraint,
  TransmartTrueConstraint,
  TransmartValueConstraint
} from '../../models/transmart-models/transmart-constraint';
import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartConstraintRewriter} from './transmart-constraint-rewriter';
import {Operator, OperatorValues} from '../../models/constraint-models/operator';
import {ValueType} from '../../models/constraint-models/value-type';
import {ConceptType} from '../../models/constraint-models/concept-type';

/**
 * Serialisation class for serialising constraint objects for use in the TranSMART API.
 * There are two modes:
 * - default: generating objects with only the fields allowed by the API;
 *   (Create with <code>let serialiser = new TransmartConstraintSerialiser(false)</code>)
 * - full: decorating concept constraints with extra information, to be used when saving
 *   queries to be later restored.
 *   (Create with <code>let serialiser = new TransmartConstraintSerialiser(true)</code>)
 *
 * To serialise a constraint, use <code>serialiser.visit(constraint)</code>.
 */
export class TransmartConstraintSerialiser extends AbstractConstraintVisitor<TransmartConstraint> {

  private readonly _full: boolean;

  /**
   * This method is used to unwrap nested combination constraint
   * with single child
   * @param {TransmartConstraint} constraint
   * @returns {TransmartConstraint}
   */
  static unWrapNestedQueryObject(constraint: TransmartConstraint): TransmartConstraint {
    // If the query object is a combination constraint
    if ((constraint.type === 'and' || constraint.type === 'or') && constraint['args'].length === 1) {
      return this.unWrapNestedQueryObject(constraint['args'][0]);
    }
    return constraint;

  }

  /**
   * Wrap a given query object with subselection clause
   * @param {string} dimension
   * @param {TransmartConstraint} constraint
   * @returns {TransmartConstraint}
   */
  static wrapWithSubselection(dimension: string, constraint: TransmartConstraint): TransmartConstraint {
    const queryConstraint: TransmartConstraint = this.unWrapNestedQueryObject(constraint);
    if (queryConstraint.type === 'true' && dimension === 'patient') {
      return {'type': 'true'};
    }
    if (queryConstraint.type === 'negation') {
      const arg = this.wrapWithSubselection(dimension, (<TransmartNegationConstraint>queryConstraint).arg);
      if (arg.type === 'subselection') {
        return {
          type: 'subselection',
          dimension: dimension,
          constraint: new TransmartNegationConstraint(arg)
        } as TransmartSubSelectionConstraint;
      } else {
        return new TransmartNegationConstraint(arg);
      }
    } else {
      return {
        type: 'subselection',
        dimension: dimension,
        constraint: queryConstraint
      } as TransmartSubSelectionConstraint;
    }
  }

  static convertOperator(operator: string): Operator {
    if ((OperatorValues as string[]).includes(operator)) {
      return <Operator>operator;
    }
    throw new Error(`Unknown operator: ${operator}`);
  }

  constructor(full: boolean) {
    super();
    this._full = full;
  }

  visitValueConstraint(constraint: ValueConstraint): TransmartValueConstraint {
    return {
      type: 'value',
      valueType: constraint.valueType,
      operator: TransmartConstraintSerialiser.convertOperator(constraint.operator),
      value: constraint.value
    }
  }

  visitTrueConstraint(constraint: TrueConstraint): TransmartTrueConstraint {
    return {type: 'true'};
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): TransmartFieldConstraint {
    const trialVisitIds = constraint.trialVisits.map(trialVisit => Number(trialVisit.id));
    return {
      type: 'field',
      field: {
        dimension: 'trial visit',
        fieldName: 'id',
        type: ValueType.numeric
      },
      operator: Operator.in,
      value: trialVisitIds
    };
  }

  visitTimeConstraint(constraint: TimeConstraint): TransmartConstraint {
    // Operator
    const operator: Operator = {
      [DateOperatorState.BETWEEN]: Operator.between,
      [DateOperatorState.NOT_BETWEEN]: Operator.between, // we'll negate it later
      [DateOperatorState.BEFORE]: Operator.before,
      [DateOperatorState.AFTER]: Operator.after
    }[constraint.dateOperator];
    // Values (dates)
    let values = [constraint.date1.getTime()];
    if (constraint.dateOperator === DateOperatorState.BETWEEN ||
      constraint.dateOperator === DateOperatorState.NOT_BETWEEN) {
      values.push(constraint.date2.getTime());
    }
    // Construct the date constraint
    // if it is observation date, then the dimension is 'start time', otherwise 'value'
    // the 'start time' dimension applies to the observations with observed date values
    // the 'value' dimension applies to the observations with actual date values
    let dimension = constraint.isObservationDate ? 'start time' : 'value';
    let fieldName = constraint.isObservationDate ? 'startDate' : 'numberValue';
    const result: TransmartTimeConstraint = {
      type: 'time',
      field: {
        dimension: dimension,
        fieldName: fieldName,
        type: ValueType.date
      },
      operator: operator,
      values: values
    };
    // Wrap date constraint in a negation if required
    if (constraint.dateOperator === DateOperatorState.NOT_BETWEEN) {
      return new TransmartNegationConstraint(result);
    }
    return result;
  }

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): TransmartPatientSetConstraint {
    let result = null;
    const type = 'patient_set';
    if (constraint.subjectIds.length > 0) {
      result = {
        type: type,
        subjectIds: constraint.subjectIds
      };
    } else if (constraint.patientIds.length > 0) {
      result = {
        type: type,
        patientIds: constraint.patientIds
      };
    } else if (constraint.id) {
      result = {
        type: type,
        patientSetId: constraint.id
      };
    }
    return result;
  }

  visitStudyConstraint(constraint: StudyConstraint): TransmartConstraint {
    let result = null;
    if (constraint.studies.length !== 0) {
      // Construct query objects for all studies
      let childQueryObjects: Object[] = [];
      for (let study of constraint.studies) {
        childQueryObjects.push({
          type: 'study_name',
          studyId: study.id
        });
      }
      if (childQueryObjects.length === 1) {
        // Don't wrap in 'or' if we only have one study
        result = childQueryObjects[0];
      } else {
        // Wrap study query objects in 'or' constraint
        result = {
          type: 'or',
          args: childQueryObjects
        };
      }
    }
    return result;
  }

  visitPedigreeConstraint(constraint: PedigreeConstraint): TransmartRelationConstraint {
    const result: TransmartRelationConstraint = {
      type: 'relation',
      relatedSubjectsConstraint: this.visit(constraint.rightHandSideConstraint),
      relationTypeLabel: constraint.label
    };
    if (constraint.biological !== undefined) {
      result.biological = constraint.biological;
    }
    if (constraint.shareHousehold !== undefined) {
      result.shareHousehold = constraint.shareHousehold;
    }
    return result;
  }

  visitNegationConstraint(constraint: NegationConstraint): TransmartNegationConstraint {
    return {
      type: 'negation',
      arg: this.visit(constraint.constraint)
    }
  }

  /**
   * Map a concept constraint to its object form,
   * the full param is a flag indicating if the four attributes: name, fullName, conceptPath and valueType
   * should be included in the final object.
   * These four attributes are needed for saving and restoring a query, otherwise not needed.
   * @param {ConceptConstraint} constraint
   * @returns {object}
   */
  visitConceptConstraint(constraint: ConceptConstraint): TransmartConstraint {
    let result = null;
    if (!constraint.concept) {
      throw new Error('Cannot serialise concept constraint without concept');
    }
    const args = [];
    const conceptConstraint: TransmartConceptConstraint = {
      type: 'concept',
      conceptCode: constraint.concept.code,
    };
    args.push(conceptConstraint);

    if (constraint.valueConstraints.length > 0) {
      if (constraint.concept.type === ConceptType.NUMERICAL) {
        // Add numerical values directly to the main constraint
        for (let val of constraint.valueConstraints) {
          args.push(this.visit(val));
        }
      } else if (constraint.concept.type === ConceptType.CATEGORICAL) {
        // Wrap categorical values in an OR constraint
        let categorical = {
          type: 'or',
          args: constraint.valueConstraints.map((val: ValueConstraint) => this.visit(val))
        };
        if (categorical.args.length === 1) {
          args.push(categorical.args[0]);
        } else {
          args.push(categorical);
        }
      } else {
        throw new Error(`Concept type not supported: ${constraint.concept.type}`);
      }
    }
    if (constraint.applyValDateConstraint) {
      args.push(this.visit(constraint.valDateConstraint));
    }
    if (constraint.applyObsDateConstraint) {
      args.push(this.visit(constraint.obsDateConstraint));
    }
    if (constraint.applyTrialVisitConstraint && constraint.trialVisitConstraint.trialVisits.length > 0) {
      args.push(this.visit(constraint.trialVisitConstraint));
    }
    if (constraint.applyStudyConstraint && constraint.studyConstraint.studies.length > 0) {
      args.push(this.visit(constraint.studyConstraint));
    }
    if (args.length === 1) {
      result = args[0];
    } else {
      result = {
        type: 'and',
        args: args
      };
    }
    if (this._full) {
      const fullConstraint = <ExtendedConstraint>result;
      fullConstraint.name = constraint.concept.name;
      fullConstraint.fullName = constraint.concept.fullName;
      fullConstraint.valueType = constraint.concept.type;
      result = fullConstraint;
    }
    return result;
  }

  /*
   * --------------------- combination constraint related methods ---------------------
   */

  /**
   * Collects all non-empty query objects of a combination constraint
   * @param {CombinationConstraint} constraint
   * @returns {TransmartConstraint[]}
   */
  private getNonEmptyChildObjectsWithSubselection(combination: CombinationConstraint): TransmartConstraint[] {
    const nonEmptyChildren = combination.children.reduce((result: TransmartConstraint[], child: Constraint) => {
      const queryObject: TransmartConstraint = this.visit(child);
      if (!queryObject) {
        return result;
      }
      if (combination.combinationState === CombinationState.And && queryObject.type === 'true') {
        // skip 'true' for conjunctive constraints
        return result;
      }
      if (combination.combinationState === CombinationState.Or && queryObject.type === 'negation') {
        const negatedConstraint = (<TransmartNegationConstraint>queryObject).arg;
        if (negatedConstraint.type === 'true') {
          // skip 'false' for disjunctive constraints
          return result;
        }
      }
      result.push(this.getChildObjectsWithSubselection(queryObject, combination, child));
      return result;
    }, []);

    if (nonEmptyChildren.length === 1 && nonEmptyChildren[0].type === 'subselection') {
      const childConstraint = (<TransmartSubSelectionConstraint>nonEmptyChildren[0]).constraint;
      if (combination.dimension === 'patient' && childConstraint.type !== 'subselection' &&
          (combination.isRoot ||
            (combination.parentConstraint && combination.parentConstraint.className === 'PedigreeConstraint'))) {
        // Subselection not required for singleton patient-level combinations at the top level,
        // unless ensuring patient level constraint
        return [childConstraint];
      }
    } else if (nonEmptyChildren.length === 0 && combination.dimension !== 'patient') {
      // When using subject dimension constraints, e.g., patients are linked to samples, empty subconstraints are relevant.
      // I.e., there is a difference between all patients with a sample and all patients.
      return [ TransmartConstraintSerialiser.wrapWithSubselection(
        combination.dimension, {'type': 'true'} as TransmartTrueConstraint)
      ];
    }
    return nonEmptyChildren;
  }

  /**
   * Wraps query objects with subselection if needed.
   * To be used in with Array.reduce.
   *
   * @param {TransmartConstraint} queryObject: the serialised child node
   * @param {CombinationConstraint} combination: the original combination constraint
   * @param {Constraint} child: the original child constraint node
   * @returns {TransmartConstraint} the resulting serialised constraints, possibly wrapped in a subselection.
   */
  private getChildObjectsWithSubselection(queryObject: TransmartConstraint,
                                          combination: CombinationConstraint,
                                          child: Constraint): TransmartConstraint {
    if (combination.dimension === 'patient' && (
      child.className === 'SubjectSetConstraint' || child.className === 'PedigreeConstraint')) {
      // Subselection not required for patient set constraints if the dimension is 'patient'
      return queryObject;
    }
    if (queryObject.type === 'subselection' && combination.parentDimension === combination.dimension) {
      // Subselection not required if the dimension equals the parent dimension and the child is a subselection
      return queryObject;
    } else if (combination.dimension === 'observation'
      || (child.className === 'CombinationConstraint' && (<CombinationConstraint>child).dimension === 'observation')) {
      // Subselection not required if the dimension equals 'observation'
      return queryObject;
    } else {
      return TransmartConstraintSerialiser.wrapWithSubselection(combination.dimension, queryObject);
    }
  }

  visitCombinationConstraint(constraint: CombinationConstraint): TransmartConstraint {
    // Collect children query objects
    const children = this.getNonEmptyChildObjectsWithSubselection(constraint);
    if (children.length === 1) {
      return children[0];
    }
    const result = {
      type: constraint.combinationState === CombinationState.And ? 'and' : 'or',
      args: children
    } as TransmartCombinationConstraint;
    return new TransmartConstraintRewriter().visit(result);
  }

}
